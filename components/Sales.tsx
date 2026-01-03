import React, { useState } from 'react';
import { ERPData, TransactionType } from '../types';
import { PlusCircle, AlertCircle, Search, X } from 'lucide-react';
import { Language, translations } from '../translations';

interface SalesProps {
  data: ERPData;
  onSale: (productId: string, quantity: number, unitPrice: number, customer: string) => void;
  language: Language;
  currency: string;
}

const Sales: React.FC<SalesProps> = ({ data, onSale, language, currency }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ productId: '', quantity: 1, unitPrice: 0, customer: '' });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations[language];

  const availableProducts = data.products.filter(p => p.quantity > 0);

  const formatCurrency = (val: number) => val.toLocaleString(language, { style: 'currency', currency: currency });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = data.products.find(p => p.id === form.productId);
    if (!product) return;
    
    if (form.quantity > product.quantity) {
        setError(`Insufficient stock. Only ${product.quantity} available.`);
        return;
    }
    
    setError('');
    onSale(form.productId, Number(form.quantity), Number(form.unitPrice), form.customer);
    setIsModalOpen(false);
    setForm({ productId: '', quantity: 1, unitPrice: 0, customer: '' });
  };

  const sales = data.transactions
    .filter(t => t.type === TransactionType.SALE)
    .filter(t => 
        t.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.party.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t.sales}</h2>
          <p className="text-slate-500 text-sm">{t.trackRevenue}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={availableProducts.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          {t.recordSale}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchSales}
                  className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" 
                />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">{t.date}</th>
                <th className="px-6 py-4">{t.product}</th>
                <th className="px-6 py-4">{t.customer}</th>
                <th className="px-6 py-4 text-right">{t.quantity}</th>
                <th className="px-6 py-4 text-right">{t.unitPrice}</th>
                <th className="px-6 py-4 text-right">{t.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {sales.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">{t.noData}</td></tr>
              ) : (
                sales.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{t.productName}</td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">{t.party}</span>
                    </td>
                    <td className="px-6 py-4 text-right">{t.quantity}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(t.unitPrice)}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">+{formatCurrency(t.totalAmount)}</td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{t.recordSale}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            {error && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.product}</label>
                <select 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={form.productId} 
                  onChange={e => setForm({...form, productId: e.target.value})}
                >
                    <option value="" className="text-slate-400">-- Choose Item --</option>
                    {availableProducts.map(p => (
                        <option key={p.id} value={p.id} className="text-slate-900">
                           {p.name} (Stock: {p.quantity})
                        </option>
                    ))}
                </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.customer}</label>
                  <input 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={form.customer} 
                  onChange={e => setForm({...form, customer: e.target.value})}
                  placeholder="e.g. John Doe"
                  />
               </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.quantity}</label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={form.quantity} 
                    onChange={e => setForm({...form, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.unitPrice} ({currency})</label>
                  <input 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={form.unitPrice} 
                    onChange={e => setForm({...form, unitPrice: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">{t.cancel}</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-200">{t.confirm}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;