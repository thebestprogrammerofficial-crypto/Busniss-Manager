import React from 'react';
import { LayoutDashboard, ShoppingCart, TrendingUp, Package, BookOpen, Bot, Settings } from 'lucide-react';
import { Language, translations } from '../translations';
import { UserProfile } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  onOpenSettings: () => void;
  language: Language;
  userProfile?: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onOpenSettings, language, userProfile }) => {
  const t = translations[language];

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'purchases', label: t.purchases, icon: ShoppingCart },
    { id: 'sales', label: t.sales, icon: TrendingUp },
    { id: 'inventory', label: t.inventory, icon: Package },
    { id: 'accounting', label: t.accounting, icon: BookOpen },
    { id: 'ai-analyst', label: t.aiAnalyst, icon: Bot },
  ];

  const businessName = userProfile?.businessName || 'Business Manager';
  const userName = userProfile?.name || t.adminUser;
  const location = userProfile?.location || '';

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 break-words">
          {businessName}
        </h1>
        <p className="text-xs text-slate-400 mt-1">Enterprise Management</p>
        {location && <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">📍 {location}</p>}
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-md bg-slate-800/50">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs shrink-0">
                {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">Admin</p>
            </div>
          </div>
          <button 
            onClick={onOpenSettings}
            className="text-slate-400 hover:text-white hover:bg-slate-700 p-1.5 rounded-md transition-colors"
            title={t.settings}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;