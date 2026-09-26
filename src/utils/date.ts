import { Transaction } from '../types';

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDateHeader(isoString: string): string {
  const date = new Date(isoString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  const currentYear = new Date().getFullYear();
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== currentYear ? { year: 'numeric' } : {}),
  };

  return date.toLocaleDateString('en-US', formatOptions);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export interface GroupedTransactions {
  title: string;
  dateKey: string;
  data: Transaction[];
}

/**
 * Group transactions chronologically descending (newest first).
 */
export function groupTransactionsByDate(transactions: Transaction[]): GroupedTransactions[] {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groups: { [key: string]: { title: string; dateKey: string; data: Transaction[] } } = {};

  for (const tx of sorted) {
    const d = new Date(tx.createdAt);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;

    if (!groups[dateKey]) {
      groups[dateKey] = {
        title: formatDateHeader(tx.createdAt),
        dateKey,
        data: [],
      };
    }
    groups[dateKey].data.push(tx);
  }

  return Object.values(groups);
}

/**
 * Check if the user has recorded any expense today.
 * Used for smart notification suppression.
 */
export function hasRecordedExpenseToday(transactions: Transaction[]): boolean {
  const today = new Date();
  return transactions.some(
    (tx) => tx.type === 'expense' && isSameDay(new Date(tx.createdAt), today)
  );
}
