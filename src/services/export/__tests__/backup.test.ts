import { exportService } from '../backup';
import { Account, Transaction, AppSettings } from '../../../types';

describe('Export and Import Service Tests', () => {
  const accounts: Account[] = [
    {
      id: 'acc_bank',
      name: 'Bank',
      type: 'bank',
      initialBalance: 100000,
      createdAt: '2026-09-26T10:00:00Z',
      updatedAt: '2026-09-26T10:00:00Z',
    },
    {
      id: 'acc_cash',
      name: 'Cash',
      type: 'cash',
      initialBalance: 50000,
      createdAt: '2026-09-26T10:00:00Z',
      updatedAt: '2026-09-26T10:00:00Z',
    },
  ];

  const transactions: Transaction[] = [
    {
      id: 'tx_1',
      type: 'expense',
      amount: 15000,
      accountId: 'acc_cash',
      note: 'Lunch',
      category: 'Food',
      createdAt: '2026-09-26T12:00:00Z',
      updatedAt: '2026-09-26T12:00:00Z',
    },
  ];

  const settings: AppSettings = {
    currencySymbol: '₹',
    currencyCode: 'INR',
    reminder: { enabled: true, hour: 21, minute: 0 },
    hasCompletedOnboarding: true,
  };

  test('Creates complete and valid export payload', () => {
    const payload = exportService.createExportPayload(accounts, transactions, settings);
    expect(payload.version).toBe(1);
    expect(payload.accounts).toHaveLength(2);
    expect(payload.transactions).toHaveLength(1);
    expect(payload.settings.reminder.enabled).toBe(true);

    const json = JSON.stringify(payload);
    const validation = exportService.validateImport(json);
    expect(validation.valid).toBe(true);
    expect(validation.data?.accounts[0].name).toBe('Bank');
  });

  test('Rejects invalid or corrupted JSON payloads', () => {
    expect(exportService.validateImport('')).toEqual({
      valid: false,
      error: 'File content is empty or invalid.',
    });

    expect(exportService.validateImport('{"invalid": true}')).toEqual({
      valid: false,
      error: 'Backup is missing accounts data.',
    });

    expect(exportService.validateImport('{"accounts": "not an array"}')).toEqual({
      valid: false,
      error: 'Backup is missing accounts data.',
    });

    expect(exportService.validateImport('invalid json string')).toEqual(
      expect.objectContaining({ valid: false })
    );
  });
});
