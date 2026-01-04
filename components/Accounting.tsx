import React, { useState } from 'react';
import { ERPData } from '../types';
import { PlusCircle, X } from './CustomIcons';
import { Language, translations } from '../translations';

interface AccountingProps {
  data: ERPData;
  onManualEntry?: (debitAccount: string, creditAccount: string, amount: number, description: string) => void;
  language: Language;
  currency: string;
}

const Accounting: React.FC<AccountingProps> = ({ data, onManualEntry, language, currency }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ debitAccount: '', creditAccount: '', amount: 0, description: '' });
  const t = translations[language];

  const ledger = [...data.ledger].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const formatCurrency = (val: number) => val.toLocaleString(language, { style: 'currency', currency: currency });

  // Calculate Trial Balance (Summary)
  const accountBalances: Record<string, { debit: number, credit: number }> = {};
  
  ledger.forEach(entry => {
    if (!accountBalances[entry.account]) {
        accountBalances[entry.account] = { debit: 0, credit: 0 };
    }
    accountBalances[entry.account].debit += entry.debit;
    accountBalances[entry.account].credit += entry.credit;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onManualEntry && form.amount > 0) {
        onManualEntry(form.debitAccount, form.creditAccount, form.amount, form.description);
        setIsModalOpen(false);
        setForm({ debitAccount: '', creditAccount: '', amount: 0, description: '' });
    }
  };

  const predefinedAccounts = [
    'Cash / Bank',
    'Inventory (Asset)',
    'Accounts Receivable',
    'Accounts Payable',
    'Sales Revenue',
    'Cost of Goods Sold (Expense)',
    'Operating Expenses',
    'Capital / Equity'
  ];

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t.financialAccounting}</h2>
          <p className="text-slate-500 text-sm">{t.generalLedger}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          {t.newJournalEntry}
        </button>
      </div>

      {/* Trial Balance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
                {t.accountBalances}
             </div>
             <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                {Object.keys(accountBalances).length === 0 && <p className="text-sm text-slate-400 text-center py-4">{t.noData}</p>}
                {Object.entries(accountBalances).map(([account, bal]) => (
                    <div key={account} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                        <span className="font-medium text-slate-700">{account}</span>
                        <div className="text-right">
                           <div className="text-emerald-600 text-xs">{t.debit}: {formatCurrency(bal.debit)}</div>
                           <div className="text-red-600 text-xs">{t.credit}: {formatCurrency(bal.credit)}</div>
                           <div className="font-bold text-slate-800 mt-1">
                               Net: {formatCurrency(Math.abs(bal.debit - bal.credit))} {bal.debit > bal.credit ? 'Dr' : 'Cr'}
                           </div>
                        </div>
                    </div>
                ))}
             </div>
        </div>

        {/* General Ledger Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px]">
           <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
                {t.generalLedger}
             </div>
            <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-slate-800 font-semibold uppercase text-xs tracking-wider sticky top-0 z-10 shadow-sm">
                <tr>
                    <th className="px-6 py-4 bg-slate-50">{t.date}</th>
                    <th className="px-6 py-4 bg-slate-50">{t.account}</th>
                    <th className="px-6 py-4 bg-slate-50">{t.description}</th>
                    <th className="px-6 py-4 text-right text-emerald-700 bg-slate-50">{t.debit}</th>
                    <th className="px-6 py-4 text-right text-red-700 bg-slate-50">{t.credit}</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {ledger.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">{t.noData}</td></tr>
                ) : (
                    ledger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap text-xs">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-6 py-3 font-medium text-slate-800">{entry.account}</td>
                        <td className="px-6 py-3 text-slate-500 text-xs">{entry.description}</td>
                        <td className="px-6 py-3 text-right font-medium text-emerald-700">
                            {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-red-700">
                            {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                        </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
        </div>
      </div>

       {/* Manual Entry Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">{t.manualEntry}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.description}</label>
                  <input 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="e.g. Monthly Rent Payment"
                  />
               </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.debit} {t.account}</label>
                    <div className="relative">
                        <input 
                            list="accounts"
                            required 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={form.debitAccount} 
                            onChange={e => setForm({...form, debitAccount: e.target.value})}
                            placeholder="Select Account"
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.credit} {t.account}</label>
                     <div className="relative">
                        <input 
                            list="accounts"
                            required 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={form.creditAccount} 
                            onChange={e => setForm({...form, creditAccount: e.target.value})}
                            placeholder="Select Account"
                        />
                    </div>
                 </div>
              </div>
              <datalist id="accounts">
                {predefinedAccounts.map(acc => <option key={acc} value={acc} />)}
                {Object.keys(accountBalances).map(acc => <option key={acc} value={acc} />)}
              </datalist>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.total} ({currency})</label>
                  <input 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    required 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={form.amount} 
                    onChange={e => setForm({...form, amount: Number(e.target.value)})}
                  />
                </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">{t.cancel}</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium">{t.postEntry}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Accounting;