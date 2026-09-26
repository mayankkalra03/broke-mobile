export type AccountType = 'bank' | 'cash' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number; // In minor units (paise)
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment';

export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Health'
  | 'Salary'
  | 'Gift'
  | 'Refund'
  | 'General'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // In minor units (paise). Always positive integer.
  accountId?: string; // For income, expense, adjustment
  fromAccountId?: string; // For transfer
  toAccountId?: string; // For transfer
  adjustmentDelta?: number; // In minor units (paise). Can be positive or negative for adjustment.
  note?: string;
  category?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ReminderConfig {
  enabled: boolean;
  hour: number; // 0-23, default 21 (9 PM)
  minute: number; // 0-59, default 0
}

export interface AppSettings {
  currencySymbol: string;
  currencyCode: string;
  reminder: ReminderConfig;
  hasCompletedOnboarding: boolean;
}

export interface AppExportData {
  version: number;
  exportedAt: string;
  accounts: Account[];
  transactions: Transaction[];
  settings: AppSettings;
}

export interface AccountBalanceInfo {
  account: Account;
  balance: number; // In paise
}
