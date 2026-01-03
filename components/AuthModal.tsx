import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Key, User, Building2, MapPin } from 'lucide-react';
import { Language, translations } from '../translations';

interface AuthModalProps {
  isOpen: boolean;
  onComplete: (apiKey: string, name: string, businessName: string, location: string) => void;
  language: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onComplete, language }) => {
  const [apiKey, setApiKey] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  
  const t = translations[language];

  if (!isOpen) return null;

  const isFormValid = apiKey.trim() !== '' && name.trim() !== '' && businessName.trim() !== '';

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 p-6 text-center border-b border-slate-100 shrink-0">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
             <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.welcome}</h2>
          <p className="text-slate-500 text-sm">{t.setupDescription}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">{t.yourName}</label>
             <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">{t.businessName}</label>
             <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">{t.location}</label>
             <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, USA"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                />
             </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
             <label className="block text-sm font-medium text-slate-700 mb-2">{t.enterApiKey}</label>
             <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                />
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-0 shrink-0">
          <button 
            onClick={() => onComplete(apiKey, name, businessName, location)}
            disabled={!isFormValid}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            {t.getStarted}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;