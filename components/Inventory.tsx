import React from 'react';
import { ERPData } from '../types';
import { Language, translations } from '../translations';

interface InventoryProps {
  data: ERPData;
  language: Language;
  currency: string;
}

const Inventory: React.FC<InventoryProps> = ({ data, language, currency }) => {
  const t = translations[language];
  const sortedProducts = [...data.products].sort((a,b) => b.quantity * b.averageCost - a.quantity * a.averageCost);
  const formatCurrency = (val: number) => val.toLocaleString(language, { style: 'currency', currency: currency });

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t.stockStatus}</h2>
          <p className="text-slate-500 text-sm">{t.realTimeStock}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">{t.sku}</th>
                <th className="px-6 py-4">{t.product}</th>
                <th className="px-6 py-4 text-right">{t.inStock}</th>
                <th className="px-6 py-4 text-right">{t.avgCost}</th>
                <th className="px-6 py-4 text-right">{t.totalValue}</th>
                <th className="px-6 py-4 text-center">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedProducts.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">{t.noData}</td></tr>
              ) : (
                sortedProducts.map((p) => {
                    const totalValue = p.quantity * p.averageCost;
                    let statusColor = 'bg-emerald-100 text-emerald-700';
                    let statusText = 'In Stock';
                    if (p.quantity === 0) {
                        statusColor = 'bg-slate-100 text-slate-500';
                        statusText = 'Out of Stock';
                    } else if (p.quantity < 5) {
                        statusColor = 'bg-amber-100 text-amber-700';
                        statusText = 'Low Stock';
                    }

                    return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{p.sku}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                        <td className="px-6 py-4 text-right font-medium">{p.quantity}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(p.averageCost)}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(totalValue)}</td>
                        <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                                {statusText}
                            </span>
                        </td>
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;