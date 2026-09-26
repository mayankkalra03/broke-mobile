import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, Transaction, AppSettings, AppExportData } from '../../types';

export const DEFAULT_SETTINGS: AppSettings = {
  currencySymbol: '₹',
  currencyCode: 'INR',
  reminder: {
    enabled: true,
    hour: 21,
    minute: 0,
  },
  hasCompletedOnboarding: false,
};

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc_bank',
    name: 'Bank',
    type: 'bank',
    initialBalance: 0,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc_cash',
    name: 'Cash',
    type: 'cash',
    initialBalance: 0,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const ASYNC_KEYS = {
  ACCOUNTS: '@expense_tracker_accounts_v1',
  TRANSACTIONS: '@expense_tracker_transactions_v1',
  SETTINGS: '@expense_tracker_settings_v1',
};

import { getNativeSqlite } from './nativeDriver';

async function getSqliteDb() {
  return await getNativeSqlite();
}

export const database = {
  async init(): Promise<void> {
    const db = await getSqliteDb();
    if (!db) {
      // Ensure AsyncStorage keys initialized
      const accountsJson = await AsyncStorage.getItem(ASYNC_KEYS.ACCOUNTS);
      if (!accountsJson) {
        await AsyncStorage.setItem(ASYNC_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      }
      const settingsJson = await AsyncStorage.getItem(ASYNC_KEYS.SETTINGS);
      if (!settingsJson) {
        await AsyncStorage.setItem(ASYNC_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
      const txJson = await AsyncStorage.getItem(ASYNC_KEYS.TRANSACTIONS);
      if (!txJson) {
        await AsyncStorage.setItem(ASYNC_KEYS.TRANSACTIONS, JSON.stringify([]));
      }
    } else {
      // Check if accounts exist in SQLite
      const existing = db.getAllSync('SELECT id FROM accounts LIMIT 1');
      if (existing.length === 0) {
        for (const acc of DEFAULT_ACCOUNTS) {
          db.runSync(
            'INSERT INTO accounts (id, name, type, initialBalance, isArchived, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [acc.id, acc.name, acc.type, acc.initialBalance, 0, acc.createdAt, acc.updatedAt]
          );
        }
      }
    }
  },

  async getAccounts(): Promise<Account[]> {
    const db = await getSqliteDb();
    if (db) {
      try {
        const rows = db.getAllSync('SELECT * FROM accounts ORDER BY createdAt ASC');
        return rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          initialBalance: Number(r.initialBalance),
          isArchived: Boolean(r.isArchived),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }));
      } catch (e) {
        console.warn('SQLite getAccounts failed, fallback', e);
      }
    }
    const json = await AsyncStorage.getItem(ASYNC_KEYS.ACCOUNTS);
    return json ? JSON.parse(json) : DEFAULT_ACCOUNTS;
  },

  async saveAccount(account: Account): Promise<void> {
    const db = await getSqliteDb();
    if (db) {
      db.runSync(
        `INSERT OR REPLACE INTO accounts (id, name, type, initialBalance, isArchived, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          account.id,
          account.name,
          account.type,
          account.initialBalance,
          account.isArchived ? 1 : 0,
          account.createdAt,
          account.updatedAt,
        ]
      );
    }
    const accounts = await this.getAccounts();
    const idx = accounts.findIndex((a) => a.id === account.id);
    if (idx >= 0) {
      accounts[idx] = account;
    } else {
      accounts.push(account);
    }
    await AsyncStorage.setItem(ASYNC_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  async updateAccount(account: Account): Promise<void> {
    await this.saveAccount(account);
  },

  async getTransactions(): Promise<Transaction[]> {
    const db = await getSqliteDb();
    if (db) {
      try {
        const rows = db.getAllSync('SELECT * FROM transactions ORDER BY createdAt DESC');
        return rows.map((r: any) => ({
          id: r.id,
          type: r.type,
          amount: Number(r.amount),
          accountId: r.accountId || undefined,
          fromAccountId: r.fromAccountId || undefined,
          toAccountId: r.toAccountId || undefined,
          adjustmentDelta: r.adjustmentDelta !== null ? Number(r.adjustmentDelta) : undefined,
          note: r.note || undefined,
          category: r.category || undefined,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }));
      } catch (e) {
        console.warn('SQLite getTransactions failed, fallback', e);
      }
    }
    const json = await AsyncStorage.getItem(ASYNC_KEYS.TRANSACTIONS);
    return json ? JSON.parse(json) : [];
  },

  async saveTransaction(tx: Transaction): Promise<void> {
    const db = await getSqliteDb();
    if (db) {
      db.runSync(
        `INSERT OR REPLACE INTO transactions (id, type, amount, accountId, fromAccountId, toAccountId, adjustmentDelta, note, category, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tx.id,
          tx.type,
          tx.amount,
          tx.accountId ?? null,
          tx.fromAccountId ?? null,
          tx.toAccountId ?? null,
          tx.adjustmentDelta ?? null,
          tx.note ?? null,
          tx.category ?? null,
          tx.createdAt,
          tx.updatedAt,
        ]
      );
    }
    const txs = await this.getTransactions();
    const idx = txs.findIndex((t) => t.id === tx.id);
    if (idx >= 0) {
      txs[idx] = tx;
    } else {
      txs.unshift(tx);
    }
    await AsyncStorage.setItem(ASYNC_KEYS.TRANSACTIONS, JSON.stringify(txs));
  },

  async deleteTransaction(txId: string): Promise<void> {
    const db = await getSqliteDb();
    if (db) {
      db.runSync('DELETE FROM transactions WHERE id = ?', [txId]);
    }
    const txs = await this.getTransactions();
    const filtered = txs.filter((t) => t.id !== txId);
    await AsyncStorage.setItem(ASYNC_KEYS.TRANSACTIONS, JSON.stringify(filtered));
  },

  async getSettings(): Promise<AppSettings> {
    const db = await getSqliteDb();
    if (db) {
      try {
        const row = db.getFirstSync('SELECT value FROM settings WHERE key = ?', ['app_settings']);
        if (row && (row as any).value) {
          return JSON.parse((row as any).value);
        }
      } catch (e) {
        console.warn('SQLite getSettings failed', e);
      }
    }
    const json = await AsyncStorage.getItem(ASYNC_KEYS.SETTINGS);
    return json ? JSON.parse(json) : DEFAULT_SETTINGS;
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    const db = await getSqliteDb();
    const json = JSON.stringify(settings);
    if (db) {
      db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['app_settings', json]);
    }
    await AsyncStorage.setItem(ASYNC_KEYS.SETTINGS, json);
  },

  async resetDatabase(): Promise<void> {
    const db = await getSqliteDb();
    if (db) {
      db.runSync('DELETE FROM transactions');
      db.runSync('DELETE FROM accounts');
      db.runSync('DELETE FROM settings');
    }
    await AsyncStorage.removeItem(ASYNC_KEYS.TRANSACTIONS);
    await AsyncStorage.removeItem(ASYNC_KEYS.ACCOUNTS);
    await AsyncStorage.removeItem(ASYNC_KEYS.SETTINGS);
    await this.init();
  },

  async restoreFromBackup(data: AppExportData): Promise<void> {
    const db = await getSqliteDb();
    if (db) {
      db.runSync('DELETE FROM transactions');
      db.runSync('DELETE FROM accounts');
    }
    // Save accounts
    for (const acc of data.accounts) {
      await this.saveAccount(acc);
    }
    // Save transactions
    for (const tx of data.transactions) {
      await this.saveTransaction(tx);
    }
    // Save settings
    if (data.settings) {
      await this.saveSettings(data.settings);
    }
  },
};
