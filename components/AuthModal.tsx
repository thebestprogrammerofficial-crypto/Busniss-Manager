import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Key, User, Building2, MapPin, Sparkles, Loader2 } from './CustomIcons';
import { Language, translations } from '../translations';

interface AuthModalProps {
  isOpen: boolean;
  onComplete: (apiKey: string, name: string, businessName: string, location: string, role: string, industry: string) => void;
  language: Language;
}

type Step = 'INTRO' | 'INDUSTRY' | 'BUSINESS_NAME' | 'ROLE' | 'WELCOME';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onComplete, language }) => {
  const [step, setStep] = useState<Step>('INTRO');
  
  // Form Data
  const [apiKey, setApiKey] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [role, setRole] = useState('');
  
  const t = translations[language];

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 'INTRO') {
        if (name && apiKey) setStep('INDUSTRY');
    } else if (step === 'INDUSTRY') {
        if (industry) setStep('BUSINESS_NAME');
    } else if (step === 'BUSINESS_NAME') {
        if (businessName) setStep('ROLE');
    } else if (step === 'ROLE') {
        if (role) {
            setStep('WELCOME');
            setTimeout(() => {
                const finalIndustry = industry === 'Other' ? customIndustry : industry;
                onComplete(apiKey, name, businessName, location, role, finalIndustry);
            }, 2500); // Wait for welcome animation
        }
    }
  };

  const commonIndustries = [
    'Technology', 'Retail', 'Consulting', 'Manufacturing', 'Healthcare', 'E-commerce'
  ];

  const renderIntro = () => (
    <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-white/20 mb-4 backdrop-blur-sm">
                <ShieldCheck size={48} className="text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">{t.welcome}</h2>
            <p className="text-blue-100 text-lg">Let's set up your intelligent workspace.</p>
        </div>

        <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 flex items-center">
                <User className="text-white ml-3 mr-3" size={20} />
                <input 
                    type="text" 
                    placeholder={t.yourName} 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-none text-white placeholder-blue-200 focus:outline-none w-full h-10"
                />
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 flex items-center">
                <MapPin className="text-white ml-3 mr-3" size={20} />
                <input 
                    type="text" 
                    placeholder={`${t.location} (Optional)`}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-transparent border-none text-white placeholder-blue-200 focus:outline-none w-full h-10"
                />
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 flex items-center">
                <Key className="text-white ml-3 mr-3" size={20} />
                <input 
                    type="password" 
                    placeholder="Gemini API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-transparent border-none text-white placeholder-blue-200 focus:outline-none w-full h-10"
                />
            </div>
            <div className="text-center">
                 <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-100 hover:text-white underline decoration-blue-200/50"
                 >
                    Don't have an API Key? Get one here.
                 </a>
            </div>
        </div>

        <button 
            onClick={handleNext}
            disabled={!name || !apiKey}
            className="w-full bg-white text-blue-600 font-bold py-4 rounded-xl shadow-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
            Continue <ArrowRight size={20} />
        </button>
    </div>
  );

  const renderIndustry = () => (
    <div className="space-y-6 animate-fade-in-up text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Hello, {name}!</h2>
        <p className="text-xl text-blue-100 mb-8">What type of company do you work in?</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
            {commonIndustries.map((ind) => (
                <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`p-4 rounded-xl border transition-all font-medium ${
                        industry === ind 
                        ? 'bg-white text-blue-600 border-white shadow-lg' 
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                >
                    {ind}
                </button>
            ))}
        </div>
        
        <button
             onClick={() => setIndustry('Other')}
             className={`w-full p-4 rounded-xl border transition-all font-medium ${
                industry === 'Other' 
                ? 'bg-white text-blue-600 border-white shadow-lg' 
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
        >
            Other / Custom
        </button>

        {industry === 'Other' && (
            <div className="animate-fade-in-up mt-4">
                <input 
                    autoFocus
                    type="text"
                    placeholder="Type your industry..."
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-md rounded-xl p-4 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:bg-white/30"
                />
            </div>
        )}

        <button 
            onClick={handleNext}
            disabled={!industry || (industry === 'Other' && !customIndustry)}
            className="w-full bg-blue-900/40 hover:bg-blue-900/60 text-white font-bold py-4 rounded-xl shadow-lg backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
        >
            Next <ArrowRight size={20} />
        </button>
    </div>
  );

  const renderBusinessName = () => (
    <div className="space-y-6 animate-fade-in-up text-center">
        <div className="inline-block p-4 rounded-full bg-white/20 mb-2">
            <Building2 size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-8">What is the name of your business?</h2>
        
        <input 
            autoFocus
            type="text"
            placeholder="e.g. Nexus Innovations"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-md rounded-xl p-5 text-xl text-center text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:bg-white/30 focus:border-white transition-all"
        />

        <button 
            onClick={handleNext}
            disabled={!businessName}
            className="w-full bg-white text-blue-600 font-bold py-4 rounded-xl shadow-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
        >
            Next <ArrowRight size={20} />
        </button>
    </div>
  );

  const renderRole = () => (
    <div className="space-y-6 animate-fade-in-up text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Almost done.</h2>
        <p className="text-xl text-blue-100 mb-8">What is your role at {businessName}?</p>
        
        <input 
            autoFocus
            type="text"
            placeholder="e.g. CEO, Manager, Accountant"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-md rounded-xl p-5 text-xl text-center text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:bg-white/30 focus:border-white transition-all"
        />

        <button 
            onClick={handleNext}
            disabled={!role}
            className="w-full bg-white text-blue-600 font-bold py-4 rounded-xl shadow-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
        >
            Complete Setup <Sparkles size={20} />
        </button>
    </div>
  );

  const renderWelcome = () => (
    <div className="text-center animate-fade-in-up flex flex-col items-center justify-center h-full">
        <div className="mb-6 relative">
            <div className="absolute inset-0 bg-white blur-xl opacity-20 rounded-full animate-pulse"></div>
            <Sparkles size={64} className="text-white relative z-10" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Welcome aboard!</h2>
        <p className="text-xl text-blue-100 max-w-xs mx-auto">
            Preparing your dashboard for <span className="font-bold text-white">{businessName}</span>...
        </p>
        <div className="mt-8">
            <Loader2 className="animate-spin text-white/50" size={32} />
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 gradient-bg overflow-hidden font-sans">
      <div className="w-full max-w-md relative z-10">
        
        {/* Progress Dots */}
        {step !== 'WELCOME' && (
            <div className="flex justify-center gap-2 mb-8">
                {['INTRO', 'INDUSTRY', 'BUSINESS_NAME', 'ROLE'].map((s, i) => {
                    const steps = ['INTRO', 'INDUSTRY', 'BUSINESS_NAME', 'ROLE'];
                    const currentIdx = steps.indexOf(step);
                    const isActive = i <= currentIdx;
                    return (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${isActive ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
                    );
                })}
            </div>
        )}

        <div className="min-h-[400px] flex flex-col justify-center">
            {step === 'INTRO' && renderIntro()}
            {step === 'INDUSTRY' && renderIndustry()}
            {step === 'BUSINESS_NAME' && renderBusinessName()}
            {step === 'ROLE' && renderRole()}
            {step === 'WELCOME' && renderWelcome()}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;