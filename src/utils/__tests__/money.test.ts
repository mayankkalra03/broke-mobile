import {
  formatMoney,
  parseMoneyInput,
  calculateAccountBalance,
  calculateTotalBalance,
} from '../money';
import { Account, Transaction } from '../../types';

describe('Personal Money Tracker Core Calculation Tests', () => {
  const bankAccount: Account = {
    id: 'acc_bank',
    name: 'Bank',
    type: 'bank',
    initialBalance: 100000, // ₹1,000
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const cashAccount: Account = {
    id: 'acc_cash',
    name: 'Cash',
    type: 'cash',
    initialBalance: 50000, // ₹500
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const accounts = [bankAccount, cashAccount];

  test('Initial State: Bank = ₹1,000, Cash = ₹500, Total = ₹1,500', () => {
    const transactions: Transaction[] = [];

    const bankBalance = calculateAccountBalance(bankAccount, transactions);
    const cashBalance = calculateAccountBalance(cashAccount, transactions);
    const totalBalance = calculateTotalBalance(accounts, transactions);

    expect(bankBalance).toBe(100000);
    expect(cashBalance).toBe(50000);
    expect(totalBalance).toBe(150000);

    expect(formatMoney(bankBalance)).toBe('₹1,000');
    expect(formatMoney(cashBalance)).toBe('₹500');
    expect(formatMoney(totalBalance)).toBe('₹1,500');
  });

  test('Step 1 — Money In: Receive ₹1,000 → Bank', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx_1',
        type: 'income',
        amount: 100000, // ₹1,000
        accountId: 'acc_bank',
        note: 'Income from client',
        createdAt: '2026-09-26T10:00:00Z',
        updatedAt: '2026-09-26T10:00:00Z',
      },
    ];

    const bankBalance = calculateAccountBalance(bankAccount, transactions);
    const cashBalance = calculateAccountBalance(cashAccount, transactions);
    const totalBalance = calculateTotalBalance(accounts, transactions);

    expect(bankBalance).toBe(200000); // ₹2,000
    expect(cashBalance).toBe(50000);  // ₹500
    expect(totalBalance).toBe(250000); // ₹2,500

    expect(formatMoney(bankBalance)).toBe('₹2,000');
    expect(formatMoney(cashBalance)).toBe('₹500');
    expect(formatMoney(totalBalance)).toBe('₹2,500');
  });

  test('Step 2 — Expense: Spend ₹200 → Bank', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx_1',
        type: 'income',
        amount: 100000, // ₹1,000
        accountId: 'acc_bank',
        createdAt: '2026-09-26T10:00:00Z',
        updatedAt: '2026-09-26T10:00:00Z',
      },
      {
        id: 'tx_2',
        type: 'expense',
        amount: 20000, // ₹200
        accountId: 'acc_bank',
        note: 'Utility bill',
        createdAt: '2026-09-26T11:00:00Z',
        updatedAt: '2026-09-26T11:00:00Z',
      },
    ];

    const bankBalance = calculateAccountBalance(bankAccount, transactions);
    const cashBalance = calculateAccountBalance(cashAccount, transactions);
    const totalBalance = calculateTotalBalance(accounts, transactions);

    expect(bankBalance).toBe(180000); // ₹1,800
    expect(cashBalance).toBe(50000);  // ₹500
    expect(totalBalance).toBe(230000); // ₹2,300

    expect(formatMoney(bankBalance)).toBe('₹1,800');
    expect(formatMoney(cashBalance)).toBe('₹500');
    expect(formatMoney(totalBalance)).toBe('₹2,300');
  });

  test('Step 3 — Transfer: ₹500 Bank → Cash', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx_1',
        type: 'income',
        amount: 100000,
        accountId: 'acc_bank',
        createdAt: '2026-09-26T10:00:00Z',
        updatedAt: '2026-09-26T10:00:00Z',
      },
      {
        id: 'tx_2',
        type: 'expense',
        amount: 20000,
        accountId: 'acc_bank',
        createdAt: '2026-09-26T11:00:00Z',
        updatedAt: '2026-09-26T11:00:00Z',
      },
      {
        id: 'tx_3',
        type: 'transfer',
        amount: 50000, // ₹500
        fromAccountId: 'acc_bank',
        toAccountId: 'acc_cash',
        note: 'ATM withdrawal',
        createdAt: '2026-09-26T12:00:00Z',
        updatedAt: '2026-09-26T12:00:00Z',
      },
    ];

    const bankBalance = calculateAccountBalance(bankAccount, transactions);
    const cashBalance = calculateAccountBalance(cashAccount, transactions);
    const totalBalance = calculateTotalBalance(accounts, transactions);

    expect(bankBalance).toBe(130000); // ₹1,300
    expect(cashBalance).toBe(100000); // ₹1,000
    expect(totalBalance).toBe(230000); // Total remains ₹2,300!

    expect(formatMoney(bankBalance)).toBe('₹1,300');
    expect(formatMoney(cashBalance)).toBe('₹1,000');
    expect(formatMoney(totalBalance)).toBe('₹2,300');
  });

  test('Step 4 — Cash Expense: Spend ₹150 → Cash', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx_1',
        type: 'income',
        amount: 100000,
        accountId: 'acc_bank',
        createdAt: '2026-09-26T10:00:00Z',
        updatedAt: '2026-09-26T10:00:00Z',
      },
      {
        id: 'tx_2',
        type: 'expense',
        amount: 20000,
        accountId: 'acc_bank',
        createdAt: '2026-09-26T11:00:00Z',
        updatedAt: '2026-09-26T11:00:00Z',
      },
      {
        id: 'tx_3',
        type: 'transfer',
        amount: 50000,
        fromAccountId: 'acc_bank',
        toAccountId: 'acc_cash',
        createdAt: '2026-09-26T12:00:00Z',
        updatedAt: '2026-09-26T12:00:00Z',
      },
      {
        id: 'tx_4',
        type: 'expense',
        amount: 15000, // ₹150
        accountId: 'acc_cash',
        note: 'Lunch',
        category: 'Food',
        createdAt: '2026-09-26T13:00:00Z',
        updatedAt: '2026-09-26T13:00:00Z',
      },
    ];

    const bankBalance = calculateAccountBalance(bankAccount, transactions);
    const cashBalance = calculateAccountBalance(cashAccount, transactions);
    const totalBalance = calculateTotalBalance(accounts, transactions);

    expect(bankBalance).toBe(130000); // ₹1,300
    expect(cashBalance).toBe(85000);  // ₹850
    expect(totalBalance).toBe(215000); // ₹2,150

    expect(formatMoney(bankBalance)).toBe('₹1,300');
    expect(formatMoney(cashBalance)).toBe('₹850');
    expect(formatMoney(totalBalance)).toBe('₹2,150');
  });

  test('Step 5 — Adjustment: Cash adjustment -₹30 (missing cash)', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx_1',
        type: 'adjustment',
        amount: 3000,
        adjustmentDelta: -3000, // -₹30
        accountId: 'acc_cash',
        note: 'Missing cash',
        createdAt: '2026-09-26T14:00:00Z',
        updatedAt: '2026-09-26T14:00:00Z',
      },
    ];

    // cash started with 50000, -3000 = 47000 (₹470)
    const cashBalance = calculateAccountBalance(cashAccount, transactions);
    expect(cashBalance).toBe(47000);
    expect(formatMoney(cashBalance)).toBe('₹470');
  });

  test('Money Input Parsing and Validation', () => {
    expect(parseMoneyInput('250')).toEqual({ success: true, paise: 25000 });
    expect(parseMoneyInput('1,000')).toEqual({ success: true, paise: 100000 });
    expect(parseMoneyInput('100.50')).toEqual({ success: true, paise: 10050 });
    expect(parseMoneyInput('₹500')).toEqual({ success: true, paise: 50000 });

    expect(parseMoneyInput('')).toEqual({ success: false, paise: 0, error: 'Amount is required' });
    expect(parseMoneyInput('0')).toEqual({ success: false, paise: 0, error: 'Amount must be greater than zero' });
    expect(parseMoneyInput('-50')).toEqual({ success: false, paise: 0, error: 'Enter a valid amount (e.g. 150 or 150.50)' });
    expect(parseMoneyInput('abc')).toEqual({ success: false, paise: 0, error: 'Enter a valid amount (e.g. 150 or 150.50)' });
  });
});
