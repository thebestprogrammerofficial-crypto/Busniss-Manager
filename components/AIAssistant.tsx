import React, { useState, useRef, useEffect } from 'react';
import { ERPData } from '../types';
import { analyzeERPData } from '../services/geminiService';
import { Bot, Send, Sparkles, Loader2, X } from 'lucide-react';
import { Language, translations } from '../translations';

interface AIAssistantProps {
  data: ERPData;
  language: Language;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ data, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[language];
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t.aiGreeting }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update greeting when language changes if chat is empty or only has greeting
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
        setMessages([{ role: 'assistant', content: t.aiGreeting }]);
    }
  }, [language, t.aiGreeting]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await analyzeERPData(data, userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error analyzing your data." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 z-50 flex items-center gap-2"
      >
        <Sparkles size={24} />
        <span className="font-semibold hidden md:inline">{t.askAI}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-up border border-slate-200">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
                 <Bot size={20} />
            </div>
            <div>
                <h3 className="font-bold text-sm">Business Manager {t.aiAnalyst}</h3>
                <p className="text-xs text-blue-100">Powered by Gemini 3.0</p>
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-xs text-slate-500">{t.analyzing}</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
        <div className="flex gap-2">
          <input 
            className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t.typeMessage}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !query.trim()}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;