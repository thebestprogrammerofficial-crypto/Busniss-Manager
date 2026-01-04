export enum TransactionType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
}

export enum LedgerType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  averageCost: number; // Weighted average cost
  sellingPrice: number; // Latest selling price
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  party: string; // Supplier for Purchase, Customer for Sale
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  date: string;
  description: string;
  account: string; // e.g., 'Inventory', 'Cash', 'Sales Revenue', 'COGS'
  debit: number;
  credit: number;
}

export interface UserProfile {
  name: string;
  businessName: string;
  location: string;
  role?: string;
  industry?: string;
}

export interface ERPData {
  userProfile?: UserProfile;
  products: Product[];
  transactions: Transaction[];
  ledger: LedgerEntry[];
}

export interface AIAnalysisResponse {
  summary: string;
  insights: string[];
  recommendation: string;
}