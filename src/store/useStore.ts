import { create } from 'zustand';
import { Account, Transaction, AppSettings, AppExportData, AccountType } from '../types';
import { database, DEFAULT_SETTINGS } from '../services/db/database';
import { calculateAccountBalance, calculateTotalBalance } from '../utils/money';
import { notificationService } from '../services/notifications/reminder';

interface AppState {
  // State
  accounts: Account[];
  transactions: Transaction[];
  settings: AppSettings;
  isLoading: boolean;
  toastMessage: string | null;

  // Actions
  init: () => Promise<void>;
  showToast: (msg: string) => void;
  hideToast: () => void;

  // Domain Transaction actions
  createExpense: (params: {
    amount: number;
    accountId: string;
    note?: string;
    category?: string;
  }) => Promise<Transaction>;

  createIncome: (params: {
    amount: number;
    accountId: string;
    note?: string;
    category?: string;
  }) => Promise<Transaction>;

  createTransfer: (params: {
    amount: number;
    fromAccountId: string;
    toAccountId: string;
    note?: string;
  }) => Promise<Transaction>;

  createAdjustment: (params: {
    accountId: string;
    adjustmentDelta: number;
    note?: string;
  }) => Promise<Transaction>;

  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Domain Account actions
  createAccount: (params: {
    name: string;
    type: AccountType;
    initialBalance: number;
  }) => Promise<Account>;
  updateAccount: (account: Account) => Promise<void>;
  archiveAccount: (id: string) => Promise<void>;

  // Settings & System actions
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  completeOnboarding: (bankInitial: number, cashInitial: number) => Promise<void>;
  resetAllData: () => Promise<void>;
  restoreBackup: (data: AppExportData) => Promise<void>;

  // Getters
  getTotalBalance: () => number;
  getAccountBalance: (accountId: string) => number;
}

export const useStore = create<AppState>((set, get) => ({
  accounts: [],
  transactions: [],
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  toastMessage: null,

  showToast: (msg: string) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 2800);
  },

  hideToast: () => set({ toastMessage: null }),

  init: async () => {
    set({ isLoading: true });
    try {
      await database.init();
      const [accounts, transactions, settings] = await Promise.all([
        database.getAccounts(),
        database.getTransactions(),
        database.getSettings(),
      ]);

      set({ accounts, transactions, settings, isLoading: false });

      // If reminder enabled, ensure notification is scheduled
      if (settings.reminder?.enabled) {
        notificationService.scheduleDailyReminder(settings.reminder);
      }
    } catch (e) {
      console.error('Failed to initialize app state:', e);
      set({ isLoading: false });
    }
  },

  createExpense: async ({ amount, accountId, note, category }) => {
    const tx: Transaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: 'expense',
      amount,
      accountId,
      note: note?.trim() || undefined,
      category: category?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await database.saveTransaction(tx);
    const updated = await database.getTransactions();
    set({ transactions: updated });
    return tx;
  },

  createIncome: async ({ amount, accountId, note, category }) => {
    const tx: Transaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: 'income',
      amount,
      accountId,
      note: note?.trim() || undefined,
      category: category?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await database.saveTransaction(tx);
    const updated = await database.getTransactions();
    set({ transactions: updated });
    return tx;
  },

  createTransfer: async ({ amount, fromAccountId, toAccountId, note }) => {
    if (fromAccountId === toAccountId) {
      throw new Error('Cannot transfer to the same account');
    }

    const tx: Transaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: 'transfer',
      amount,
      fromAccountId,
      toAccountId,
      note: note?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await database.saveTransaction(tx);
    const updated = await database.getTransactions();
    set({ transactions: updated });
    return tx;
  },

  createAdjustment: async ({ accountId, adjustmentDelta, note }) => {
    const tx: Transaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: 'adjustment',
      amount: Math.abs(adjustmentDelta),
      adjustmentDelta,
      accountId,
      note: note?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await database.saveTransaction(tx);
    const updated = await database.getTransactions();
    set({ transactions: updated });
    return tx;
  },

  updateTransaction: async (tx: Transaction) => {
    const updatedTx = {
      ...tx,
      updatedAt: new Date().toISOString(),
    };
    await database.saveTransaction(updatedTx);
    const transactions = await database.getTransactions();
    set({ transactions });
  },

  deleteTransaction: async (id: string) => {
    await database.deleteTransaction(id);
    const transactions = await database.getTransactions();
    set({ transactions });
  },

  createAccount: async ({ name, type, initialBalance }) => {
    const newAccount: Account = {
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      type,
      initialBalance,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await database.saveAccount(newAccount);
    const accounts = await database.getAccounts();
    set({ accounts });
    return newAccount;
  },

  updateAccount: async (account: Account) => {
    await database.updateAccount({
      ...account,
      updatedAt: new Date().toISOString(),
    });
    const accounts = await database.getAccounts();
    set({ accounts });
  },

  archiveAccount: async (id: string) => {
    const accounts = get().accounts;
    const account = accounts.find((a) => a.id === id);
    if (!account) return;

    await database.updateAccount({
      ...account,
      isArchived: true,
      updatedAt: new Date().toISOString(),
    });
    const updated = await database.getAccounts();
    set({ accounts: updated });
  },

  updateSettings: async (partialSettings: Partial<AppSettings>) => {
    const current = get().settings;
    const updated = {
      ...current,
      ...partialSettings,
      reminder: {
        ...current.reminder,
        ...(partialSettings.reminder || {}),
      },
    };

    await database.saveSettings(updated);
    set({ settings: updated });

    if (updated.reminder?.enabled) {
      await notificationService.scheduleDailyReminder(updated.reminder);
    } else {
      await notificationService.cancelReminder();
    }
  },

  completeOnboarding: async (bankInitial: number, cashInitial: number) => {
    const accounts = await database.getAccounts();
    const bank = accounts.find((a) => a.id === 'acc_bank' || a.name.toLowerCase() === 'bank');
    const cash = accounts.find((a) => a.id === 'acc_cash' || a.name.toLowerCase() === 'cash');

    if (bank) {
      bank.initialBalance = bankInitial;
      await database.saveAccount(bank);
    }
    if (cash) {
      cash.initialBalance = cashInitial;
      await database.saveAccount(cash);
    }

    const currentSettings = get().settings;
    const updatedSettings = {
      ...currentSettings,
      hasCompletedOnboarding: true,
    };
    await database.saveSettings(updatedSettings);

    const freshAccounts = await database.getAccounts();
    set({
      accounts: freshAccounts,
      settings: updatedSettings,
    });
  },

  resetAllData: async () => {
    await database.resetDatabase();
    await notificationService.cancelReminder();
    const accounts = await database.getAccounts();
    const transactions = await database.getTransactions();
    const settings = await database.getSettings();
    set({ accounts, transactions, settings });
  },

  restoreBackup: async (data: AppExportData) => {
    await database.restoreFromBackup(data);
    const accounts = await database.getAccounts();
    const transactions = await database.getTransactions();
    const settings = await database.getSettings();
    set({ accounts, transactions, settings });
  },

  getTotalBalance: () => {
    const { accounts, transactions } = get();
    return calculateTotalBalance(accounts, transactions);
  },

  getAccountBalance: (accountId: string) => {
    const { accounts, transactions } = get();
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return 0;
    return calculateAccountBalance(account, transactions);
  },
}));
