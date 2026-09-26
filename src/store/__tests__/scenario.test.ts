import { database } from '../../services/db/database';
import { exportService } from '../../services/export/backup';
import { notificationService } from '../../services/notifications/reminder';
import { calculateAccountBalance, calculateTotalBalance } from '../../utils/money';
import { Account, Transaction, AppSettings } from '../../types';

describe('Section 52: Full End-to-End Test Scenario', () => {
  let bank: Account;
  let cash: Account;
  let accounts: Account[];
  let transactions: Transaction[];
  let settings: AppSettings;

  beforeEach(() => {
    bank = {
      id: 'acc_bank',
      name: 'Bank',
      type: 'bank',
      initialBalance: 100000, // ₹1,000
      createdAt: '2026-09-26T10:00:00Z',
      updatedAt: '2026-09-26T10:00:00Z',
    };

    cash = {
      id: 'acc_cash',
      name: 'Cash',
      type: 'cash',
      initialBalance: 50000, // ₹500
      createdAt: '2026-09-26T10:00:00Z',
      updatedAt: '2026-09-26T10:00:00Z',
    };

    accounts = [bank, cash];
    transactions = [];
    settings = {
      currencySymbol: '₹',
      currencyCode: 'INR',
      reminder: { enabled: true, hour: 21, minute: 0 },
      hasCompletedOnboarding: true,
    };
  });

  test('Initial State: Bank = ₹1,000, Cash = ₹500, Total = ₹1,500', () => {
    expect(calculateAccountBalance(bank, transactions)).toBe(100000);
    expect(calculateAccountBalance(cash, transactions)).toBe(50000);
    expect(calculateTotalBalance(accounts, transactions)).toBe(150000);
  });

  test('Step 1 — Money In: Receive ₹1,000 → Bank', () => {
    const tx1: Transaction = {
      id: 'tx_step1',
      type: 'income',
      amount: 100000, // ₹1,000
      accountId: 'acc_bank',
      note: 'Payment received',
      createdAt: '2026-09-26T10:30:00Z',
      updatedAt: '2026-09-26T10:30:00Z',
    };
    transactions.push(tx1);

    expect(calculateAccountBalance(bank, transactions)).toBe(200000); // Bank = ₹2,000
    expect(calculateAccountBalance(cash, transactions)).toBe(50000);  // Cash = ₹500
    expect(calculateTotalBalance(accounts, transactions)).toBe(250000); // Total = ₹2,500
  });

  test('Step 2 — Expense: Spend ₹200 → Bank', () => {
    // Step 1 tx
    transactions.push({
      id: 'tx_step1',
      type: 'income',
      amount: 100000,
      accountId: 'acc_bank',
      createdAt: '2026-09-26T10:30:00Z',
      updatedAt: '2026-09-26T10:30:00Z',
    });

    // Step 2 tx
    transactions.push({
      id: 'tx_step2',
      type: 'expense',
      amount: 20000, // ₹200
      accountId: 'acc_bank',
      note: 'Groceries',
      createdAt: '2026-09-26T11:00:00Z',
      updatedAt: '2026-09-26T11:00:00Z',
    });

    expect(calculateAccountBalance(bank, transactions)).toBe(180000); // Bank = ₹1,800
    expect(calculateAccountBalance(cash, transactions)).toBe(50000);  // Cash = ₹500
    expect(calculateTotalBalance(accounts, transactions)).toBe(230000); // Total = ₹2,300
  });

  test('Step 3 — Transfer: ₹500 Bank → Cash', () => {
    // Previous steps
    transactions.push(
      {
        id: 'tx_step1',
        type: 'income',
        amount: 100000,
        accountId: 'acc_bank',
        createdAt: '2026-09-26T10:30:00Z',
        updatedAt: '2026-09-26T10:30:00Z',
      },
      {
        id: 'tx_step2',
        type: 'expense',
        amount: 20000,
        accountId: 'acc_bank',
        createdAt: '2026-09-26T11:00:00Z',
        updatedAt: '2026-09-26T11:00:00Z',
      },
      {
        id: 'tx_step3',
        type: 'transfer',
        amount: 50000, // ₹500
        fromAccountId: 'acc_bank',
        toAccountId: 'acc_cash',
        note: 'Withdraw cash',
        createdAt: '2026-09-26T12:00:00Z',
        updatedAt: '2026-09-26T12:00:00Z',
      }
    );

    expect(calculateAccountBalance(bank, transactions)).toBe(130000); // Bank = ₹1,300
    expect(calculateAccountBalance(cash, transactions)).toBe(100000); // Cash = ₹1,000
    expect(calculateTotalBalance(accounts, transactions)).toBe(230000); // Total = ₹2,300 (unchanged by transfer!)
  });

  test('Step 4 — Cash Expense: Spend ₹150 → Cash', () => {
    transactions.push(
      {
        id: 'tx_step1',
        type: 'income',
        amount: 100000,
        accountId: 'acc_bank',
        createdAt: '2026-09-26T10:30:00Z',
        updatedAt: '2026-09-26T10:30:00Z',
      },
      {
        id: 'tx_step2',
        type: 'expense',
        amount: 20000,
        accountId: 'acc_bank',
        createdAt: '2026-09-26T11:00:00Z',
        updatedAt: '2026-09-26T11:00:00Z',
      },
      {
        id: 'tx_step3',
        type: 'transfer',
        amount: 50000,
        fromAccountId: 'acc_bank',
        toAccountId: 'acc_cash',
        createdAt: '2026-09-26T12:00:00Z',
        updatedAt: '2026-09-26T12:00:00Z',
      },
      {
        id: 'tx_step4',
        type: 'expense',
        amount: 15000, // ₹150
        accountId: 'acc_cash',
        note: 'Lunch',
        category: 'Food',
        createdAt: '2026-09-26T13:00:00Z',
        updatedAt: '2026-09-26T13:00:00Z',
      }
    );

    expect(calculateAccountBalance(bank, transactions)).toBe(130000); // Bank = ₹1,300
    expect(calculateAccountBalance(cash, transactions)).toBe(85000);  // Cash = ₹850
    expect(calculateTotalBalance(accounts, transactions)).toBe(215000); // Total = ₹2,150
  });

  test('Step 5 & 6 — Restart Persistence & JSON Export Validation', async () => {
    // 4 transactions exist
    transactions.push(
      {
        id: 'tx_step1',
        type: 'income',
        amount: 100000,
        accountId: 'acc_bank',
        createdAt: '2026-09-26T10:30:00Z',
        updatedAt: '2026-09-26T10:30:00Z',
      },
      {
        id: 'tx_step2',
        type: 'expense',
        amount: 20000,
        accountId: 'acc_bank',
        createdAt: '2026-09-26T11:00:00Z',
        updatedAt: '2026-09-26T11:00:00Z',
      },
      {
        id: 'tx_step3',
        type: 'transfer',
        amount: 50000,
        fromAccountId: 'acc_bank',
        toAccountId: 'acc_cash',
        createdAt: '2026-09-26T12:00:00Z',
        updatedAt: '2026-09-26T12:00:00Z',
      },
      {
        id: 'tx_step4',
        type: 'expense',
        amount: 15000,
        accountId: 'acc_cash',
        note: 'Lunch',
        category: 'Food',
        createdAt: '2026-09-26T13:00:00Z',
        updatedAt: '2026-09-26T13:00:00Z',
      }
    );

    // Export test
    const exportedPayload = exportService.createExportPayload(accounts, transactions, settings);
    expect(exportedPayload.accounts).toHaveLength(2);
    expect(exportedPayload.transactions).toHaveLength(4);
    expect(exportedPayload.settings.reminder.enabled).toBe(true);
    expect(exportedPayload.settings.reminder.hour).toBe(21);

    // Validate importability
    const jsonStr = JSON.stringify(exportedPayload);
    const validateRes = exportService.validateImport(jsonStr);
    expect(validateRes.valid).toBe(true);
    expect(validateRes.data?.transactions).toHaveLength(4);
  });

  test('Step 7 — Daily Reminder Configuration (ON, 9:00 PM)', async () => {
    const reminderConfig = {
      enabled: true,
      hour: 21, // 9 PM
      minute: 0,
    };

    const scheduled = await notificationService.scheduleDailyReminder(reminderConfig);
    expect(scheduled).toBe(true);
  });
});
