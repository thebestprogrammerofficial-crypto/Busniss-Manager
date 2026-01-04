import React from 'react';
import { ERPData, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Package, TrendingDown, TrendingUp } from './CustomIcons';
import { Language, translations } from '../translations';

interface DashboardProps {
  data: ERPData;
  language: Language;
  currency: string;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend?: string; color: string }> = ({ title, value, icon, trend, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {trend && <p className="text-xs text-emerald-600 mt-2 flex items-center">{trend}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color} text-white`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ data, language, currency }) => {
  const t = translations[language];

  const formatCurrency = (val: number) => val.toLocaleString(language, { style: 'currency', currency: currency });

  // Calculate Metrics
  const totalStockValue = data.products.reduce((acc, p) => acc + (p.quantity * p.averageCost), 0);
  const totalSales = data.transactions
    .filter(t => t.type === TransactionType.SALE)
    .reduce((acc, t) => acc + t.totalAmount, 0);
  const totalPurchases = data.transactions
    .filter(t => t.type === TransactionType.PURCHASE)
    .reduce((acc, t) => acc + t.totalAmount, 0);
  
  const netCashFlow = totalSales - totalPurchases;

  // Prepare Chart Data (Group by Product for simple viz)
  const stockData = data.products.map(p => ({
    name: p.name,
    value: p.quantity * p.averageCost,
    quantity: p.quantity
  }));

  // Prepare recent sales trend
  const salesTrend = data.transactions
    .filter(t => t.type === TransactionType.SALE)
    .slice(-7)
    .map(t => ({
      date: new Date(t.date).toLocaleDateString(),
      amount: t.totalAmount
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">{t.execOverview}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t.totalStockValue}
          value={formatCurrency(totalStockValue)}
          icon={<Package size={24} />}
          color="bg-blue-500"
        />
        <StatCard 
          title={t.totalRevenue}
          value={formatCurrency(totalSales)}
          icon={<TrendingUp size={24} />}
          color="bg-emerald-500"
        />
        <StatCard 
          title={t.totalExpenses}
          value={formatCurrency(totalPurchases)}
          icon={<TrendingDown size={24} />}
          color="bg-amber-500"
        />
        <StatCard 
          title={t.netCashFlow}
          value={formatCurrency(netCashFlow)}
          icon={<DollarSign size={24} />}
          color={netCashFlow >= 0 ? "bg-indigo-500" : "bg-red-500"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.inventoryValuation}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [formatCurrency(value), "Value"]}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.recentSales}</h3>
          <div className="h-64">
            {salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                     contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                     formatter={(value: number) => [formatCurrency(value), "Amount"]}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                {t.noData}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;