import { Account, Transaction } from '../types';

/**
 * Format paise (minor units) to human-readable currency string.
 * Example:
 * 150000 -> "₹1,500"
 * 10050  -> "₹100.50"
 * 0      -> "₹0"
 * -3000  -> "-₹30"
 */
export function formatMoney(
  paise: number,
  symbol: string = '₹',
  options: { forceDecimals?: boolean; showPlus?: boolean } = {}
): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(Math.round(paise));
  const rupees = Math.floor(absPaise / 100);
  const remainingPaise = absPaise % 100;

  // Format integer rupees with Indian number grouping (e.g. 1,00,000 or standard 1,000)
  const rupeesFormatted = new Intl.NumberFormat('en-IN').format(rupees);

  let formattedNumber = rupeesFormatted;
  if (options.forceDecimals || remainingPaise > 0) {
    formattedNumber += `.${remainingPaise.toString().padStart(2, '0')}`;
  }

  const prefix = isNegative ? `-${symbol}` : options.showPlus && paise > 0 ? `+${symbol}` : symbol;
  return `${prefix}${formattedNumber}`;
}

/**
 * Parse user input string (e.g. "250", "1,000", "50.50") into paise.
 * Rejects invalid, negative or NaN numbers.
 */
export function parseMoneyInput(input: string): { success: boolean; paise: number; error?: string } {
  if (!input || input.trim() === '') {
    return { success: false, paise: 0, error: 'Amount is required' };
  }

  // Remove currency symbols, spaces, and commas
  const cleaned = input.replace(/[₹$,\s]/g, '').trim();

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return { success: false, paise: 0, error: 'Enter a valid amount (e.g. 150 or 150.50)' };
  }

  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) {
    return { success: false, paise: 0, error: 'Amount must be greater than zero' };
  }

  // Cap at 100 Crore to prevent overflow
  if (num > 1000000000) {
    return { success: false, paise: 0, error: 'Amount exceeds maximum limit' };
  }

  const paise = Math.round(num * 100);
  return { success: true, paise };
}

/**
 * Calculate single account balance strictly derived from initial balance and transaction ledger.
 */
export function calculateAccountBalance(
  account: Account,
  transactions: Transaction[]
): number {
  let balance = account.initialBalance;

  for (const tx of transactions) {
    switch (tx.type) {
      case 'income':
        if (tx.accountId === account.id) {
          balance += tx.amount;
        }
        break;

      case 'expense':
        if (tx.accountId === account.id) {
          balance -= tx.amount;
        }
        break;

      case 'transfer':
        if (tx.fromAccountId === account.id) {
          balance -= tx.amount;
        }
        if (tx.toAccountId === account.id) {
          balance += tx.amount;
        }
        break;

      case 'adjustment':
        if (tx.accountId === account.id) {
          // If adjustmentDelta is provided, apply it; otherwise fallback to tx.amount
          balance += tx.adjustmentDelta ?? tx.amount;
        }
        break;
    }
  }

  return balance;
}

/**
 * Calculate total available money across all active (non-archived) accounts.
 */
export function calculateTotalBalance(
  accounts: Account[],
  transactions: Transaction[]
): number {
  const activeAccounts = accounts.filter((acc) => !acc.isArchived);
  return activeAccounts.reduce((total, acc) => {
    return total + calculateAccountBalance(acc, transactions);
  }, 0);
}
