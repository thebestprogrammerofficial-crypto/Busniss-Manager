import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, X, User, Building2, MapPin, Key, Save, ShieldCheck } from './CustomIcons';
import { ERPData } from '../types';
import { Language, translations } from '../translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ERPData;
  onImport: (data: ERPData) => void;
  onUpdateProfile: (name: string, businessName: string, location: string, apiKey: string, role?: string, industry?: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: string;
  setCurrency: (currency: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  onImport, 
  onUpdateProfile,
  language, 
  setLanguage, 
  currency, 
  setCurrency 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  
  // Local state for profile fields
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [apiKey, setApiKey] = useState('');

  const t = translations[language];

  // Initialize local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(data.userProfile?.name || '');
      setBusinessName(data.userProfile?.businessName || '');
      setLocation(data.userProfile?.location || '');
      setRole(data.userProfile?.role || '');
      setIndustry(data.userProfile?.industry || '');
      setApiKey(localStorage.getItem('nexus_api_key') || '');
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `business_manager_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData.products && importedData.transactions && importedData.ledger) {
          onImport(importedData);
          setImportStatus('Data imported successfully!');
          setTimeout(() => setImportStatus(''), 3000);
        } else {
          setImportStatus('Error: Invalid file format.');
        }
      } catch (err) {
        setImportStatus('Error: Could not parse JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    onUpdateProfile(name, businessName, location, apiKey, role, industry);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {t.systemSettings}
          </h2>
          <button onClick={onClose} className="hover:bg-slate-800 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto">
          
          {/* Profile Section */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.profileSetup}</h3>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.yourName}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your Role</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. CEO"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.businessName}</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                  <div className="relative">
                     <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Retail"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
               </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.location}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.enterApiKey}</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
             </div>
          </div>

          <hr className="border-slate-100" />

          {/* General Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.preferences}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.currency}</label>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="MAD">MAD (DH)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.language}</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.importData} / {t.exportData}</h3>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                <Download size={16} />
                {t.exportData} (JSON)
              </button>

              <div className="relative">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  <Upload size={16} />
                  {t.importData}
                </button>
              </div>
              
              {importStatus && (
                <div className={`text-sm text-center p-2 rounded-lg ${importStatus.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {importStatus}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
           <button onClick={onClose} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
             {t.cancel}
           </button>
           <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200">
             <Save size={18} />
             {t.save}
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;