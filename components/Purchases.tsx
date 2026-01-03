import React, { useState } from 'react';
import { ERPData, TransactionType } from '../types';
import { PlusCircle, Search, Filter, X } from 'lucide-react';
import { Language, translations } from '../translations';

interface PurchasesProps {
  data: ERPData;
  onPurchase: (productName: string, sku: string, quantity: number, unitCost: number, supplier: string) => void;
  language: Language;
  currency: string;
}

const Purchases: React.FC<PurchasesProps> = ({ data, onPurchase, language, currency }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ productName: '', sku: '', quantity: 1, unitCost: 0, supplier: '' });
  const t = translations[language];
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPurchase(form.productName, form.sku, Number(form.quantity), Number(form.unitCost), form.supplier);
    setIsModalOpen(false);
    setForm({ productName: '', sku: '', quantity: 1, unitCost: 0, supplier: '' });
  };

  const formatCurrency = (val: number) => val.toLocaleString(language, { style: 'currency', currency: currency });

  const purchases = data.transactions
    .filter(t => t.type === TransactionType.PURCHASE)
    .filter(t => {
      const matchesSearch = t.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSupplier = supplierFilter ? t.party.toLowerCase().includes(supplierFilter.toLowerCase()) : true;
      const matchesDate = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate + 'T23:59:59');
      return matchesSearch && matchesSupplier && matchesDate;
    })
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get unique suppliers for filter dropdown
  const suppliers = Array.from(new Set(data.transactions.filter(t => t.type === TransactionType.PURCHASE).map(t => t.party)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t.procurement}</h2>
          <p className="text-slate-500 text-sm">{t.manageStock}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          {t.newPurchase}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder={t.searchPurchases}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                />
            </div>
            
            <div className="flex gap-2">
              <select 
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              >
                <option value="">{t.allSuppliers}</option>
                {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              />
              <span className="self-center text-slate-400">-</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              />
              
              {(searchTerm || supplierFilter || startDate || endDate) && (
                 <button 
                   onClick={() => { setSearchTerm(''); setSupplierFilter(''); setStartDate(''); setEndDate(''); }}
                   className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                   title="Clear Filters"
                 >
                   <X size={18} />
                 </button>
              )}
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">{t.date}</th>
                <th className="px-6 py-4">{t.product}</th>
                <th className="px-6 py-4">{t.supplier}</th>
                <th className="px-6 py-4 text-right">{t.quantity}</th>
                <th className="px-6 py-4 text-right">{t.unitCost}</th>
                <th className="px-6 py-4 text-right">{t.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">{t.noData}</td></tr>
              ) : (
                purchases.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{t.productName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">{t.party}</span>
                    </td>
                    <td className="px-6 py-4 text-right">{t.quantity}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(t.unitPrice)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">{formatCurrency(t.totalAmount)}</td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{t.newPurchase}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.product}</label>
                <input 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={form.productName} 
                  onChange={e => setForm({...form, productName: e.target.value})}
                  placeholder="e.g. Office Chair"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.sku}</label>
                    <input 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={form.sku} 
                    onChange={e => setForm({...form, sku: e.target.value})}
                    placeholder="e.g. OC-001"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.supplier}</label>
                    <input 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={form.supplier} 
                    onChange={e => setForm({...form, supplier: e.target.value})}
                    placeholder="Supplier Name"
                    />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.quantity}</label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={form.quantity} 
                    onChange={e => setForm({...form, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.unitCost} ({currency})</label>
                  <input 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={form.unitCost} 
                    onChange={e => setForm({...form, unitCost: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">{t.cancel}</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-200">{t.confirm}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;