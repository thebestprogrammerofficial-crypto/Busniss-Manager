import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Purchases from './components/Purchases';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Accounting from './components/Accounting';
import AIAssistant from './components/AIAssistant';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import { ERPData, Product, Transaction, LedgerEntry, TransactionType, LedgerType } from './types';
import { translations, Language } from './translations';

// Mock Initial Data if empty
const INITIAL_DATA: ERPData = {
    userProfile: {
      name: '',
      businessName: '',
      location: '',
      role: '',
      industry: ''
    },
    products: [],
    transactions: [],
    ledger: []
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState('USD');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [data, setData] = useState<ERPData>(() => {
    const saved = localStorage.getItem('nexus_erp_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('nexus_erp_data', JSON.stringify(data));
  }, [data]);

  // Check for first launch / onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('nexus_onboarded');
    if (!hasOnboarded) {
        setShowAuthModal(true);
    }
  }, []);

  const handleUpdateProfile = (name: string, businessName: string, location: string, apiKey: string, role?: string, industry?: string) => {
    setData(prev => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        name,
        businessName,
        location,
        role: role || prev.userProfile?.role,
        industry: industry || prev.userProfile?.industry
      }
    }));

    if (apiKey !== undefined) {
      localStorage.setItem('nexus_api_key', apiKey);
    }
  };

  const handleAuthComplete = (apiKey: string, name: string, businessName: string, location: string, role: string, industry: string) => {
    localStorage.setItem('nexus_onboarded', 'true');
    handleUpdateProfile(name, businessName, location, apiKey, role, industry);
    setShowAuthModal(false);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Data Import Handler
  const handleImportData = (newData: ERPData) => {
    setData(newData);
    setIsSettingsOpen(false);
  };

  // CORE LOGIC: Purchase Flow
  const handlePurchase = (productName: string, sku: string, quantity: number, unitCost: number, supplier: string) => {
    const transactionId = generateId();
    const productId = data.products.find(p => p.sku === sku)?.id || generateId();
    const date = new Date().toISOString();
    const totalAmount = quantity * unitCost;

    const newTransaction: Transaction = {
        id: transactionId,
        type: TransactionType.PURCHASE,
        date,
        productId,
        productName,
        quantity,
        unitPrice: unitCost,
        totalAmount,
        party: supplier
    };

    let updatedProducts = [...data.products];
    const existingProductIndex = updatedProducts.findIndex(p => p.sku === sku);

    if (existingProductIndex >= 0) {
        const existing = updatedProducts[existingProductIndex];
        const oldTotalValue = existing.quantity * existing.averageCost;
        const newTotalValue = oldTotalValue + totalAmount;
        const newTotalQty = existing.quantity + quantity;
        
        updatedProducts[existingProductIndex] = {
            ...existing,
            quantity: newTotalQty,
            averageCost: newTotalQty > 0 ? newTotalValue / newTotalQty : 0
        };
    } else {
        updatedProducts.push({
            id: productId,
            name: productName,
            sku,
            quantity,
            averageCost: unitCost,
            sellingPrice: unitCost * 1.5 
        });
    }

    const ledgerEntries: LedgerEntry[] = [
        {
            id: generateId(),
            transactionId,
            date,
            description: `Purchase of ${productName} from ${supplier}`,
            account: 'Inventory (Asset)',
            debit: totalAmount,
            credit: 0
        },
        {
            id: generateId(),
            transactionId,
            date,
            description: `Payment to ${supplier}`,
            account: 'Cash / Bank',
            debit: 0,
            credit: totalAmount
        }
    ];

    setData(prev => ({
        products: updatedProducts,
        transactions: [...prev.transactions, newTransaction],
        ledger: [...prev.ledger, ...ledgerEntries]
    }));
  };

  // CORE LOGIC: Sales Flow
  const handleSale = (productId: string, quantity: number, unitPrice: number, customer: string) => {
    const transactionId = generateId();
    const product = data.products.find(p => p.id === productId);
    if (!product) return; 

    const date = new Date().toISOString();
    const totalRevenue = quantity * unitPrice;
    const costOfGoodsSold = quantity * product.averageCost;

    const newTransaction: Transaction = {
        id: transactionId,
        type: TransactionType.SALE,
        date,
        productId,
        productName: product.name,
        quantity,
        unitPrice,
        totalAmount: totalRevenue,
        party: customer
    };

    const updatedProducts = data.products.map(p => {
        if (p.id === productId) {
            return { ...p, quantity: p.quantity - quantity };
        }
        return p;
    });

    const revenueEntries: LedgerEntry[] = [
        {
            id: generateId(),
            transactionId,
            date,
            description: `Sale of ${product.name} to ${customer}`,
            account: 'Cash / Bank',
            debit: totalRevenue,
            credit: 0
        },
        {
            id: generateId(),
            transactionId,
            date,
            description: `Revenue from ${product.name}`,
            account: 'Sales Revenue',
            debit: 0,
            credit: totalRevenue
        }
    ];

    const cogsEntries: LedgerEntry[] = [
        {
            id: generateId(),
            transactionId,
            date,
            description: `Cost of goods for ${product.name} sale`,
            account: 'Cost of Goods Sold (Expense)',
            debit: costOfGoodsSold,
            credit: 0
        },
        {
            id: generateId(),
            transactionId,
            date,
            description: `Inventory reduction for ${product.name}`,
            account: 'Inventory (Asset)',
            debit: 0,
            credit: costOfGoodsSold
        }
    ];

    setData(prev => ({
        products: updatedProducts,
        transactions: [...prev.transactions, newTransaction],
        ledger: [...prev.ledger, ...revenueEntries, ...cogsEntries]
    }));
  };

  // Manual Journal Entry
  const handleManualJournalEntry = (debitAccount: string, creditAccount: string, amount: number, description: string) => {
    const transactionId = generateId();
    const date = new Date().toISOString();

    const debitEntry: LedgerEntry = {
        id: generateId(),
        transactionId,
        date,
        description,
        account: debitAccount,
        debit: amount,
        credit: 0
    };

    const creditEntry: LedgerEntry = {
        id: generateId(),
        transactionId,
        date,
        description,
        account: creditAccount,
        debit: 0,
        credit: amount
    };

    setData(prev => ({
        ...prev,
        ledger: [...prev.ledger, debitEntry, creditEntry]
    }));
  };


  const renderView = () => {
    switch(currentView) {
        case 'dashboard': return <Dashboard data={data} language={language} currency={currency} />;
        case 'purchases': return <Purchases data={data} onPurchase={handlePurchase} language={language} currency={currency} />;
        case 'sales': return <Sales data={data} onSale={handleSale} language={language} currency={currency} />;
        case 'inventory': return <Inventory data={data} language={language} currency={currency} />;
        case 'accounting': return <Accounting data={data} onManualEntry={handleManualJournalEntry} language={language} currency={currency} />;
        default: return <Dashboard data={data} language={language} currency={currency} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        language={language}
        userProfile={data.userProfile}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 pb-24 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
      
      <AIAssistant data={data} language={language} />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        data={data}
        onImport={handleImportData}
        onUpdateProfile={handleUpdateProfile}
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
      />

      <AuthModal 
        isOpen={showAuthModal}
        onComplete={handleAuthComplete}
        language={language}
      />
    </div>
  );
};

export default App;