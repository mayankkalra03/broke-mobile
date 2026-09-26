import { Platform } from 'react-native';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AppExportData, Account, Transaction, AppSettings } from '../../types';

export const exportService = {
  /**
   * Generate complete export payload.
   */
  createExportPayload(
    accounts: Account[],
    transactions: Transaction[],
    settings: AppSettings
  ): AppExportData {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts,
      transactions,
      settings,
    };
  },

  /**
   * Export JSON data to file and share/download.
   */
  async exportData(data: AppExportData): Promise<{ success: boolean; message?: string }> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const filename = `expense_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;

      if (Platform.OS === 'web') {
        // Web download
        if (typeof document !== 'undefined') {
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return { success: true, message: 'Backup downloaded successfully.' };
        }
        return { success: true, message: 'Web environment export completed.' };
      } else {
        // Native Expo SDK 57 File System API
        const file = new File(Paths.cache, filename);
        await file.write(jsonString);

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Expense Tracker Data',
            UTI: 'public.json',
          });
          return { success: true };
        } else {
          return {
            success: true,
            message: `Backup saved to ${file.uri}`,
          };
        }
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      return { success: false, message: error?.message || 'Failed to export data' };
    }
  },

  /**
   * Validate imported JSON string.
   */
  validateImport(jsonString: string): { valid: boolean; data?: AppExportData; error?: string } {
    try {
      if (!jsonString || typeof jsonString !== 'string') {
        return { valid: false, error: 'File content is empty or invalid.' };
      }

      const parsed = JSON.parse(jsonString);

      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'Invalid JSON format.' };
      }

      if (!Array.isArray(parsed.accounts)) {
        return { valid: false, error: 'Backup is missing accounts data.' };
      }

      if (!Array.isArray(parsed.transactions)) {
        return { valid: false, error: 'Backup is missing transactions data.' };
      }

      // Validate account shapes
      for (const acc of parsed.accounts) {
        if (!acc.id || !acc.name || typeof acc.initialBalance !== 'number') {
          return { valid: false, error: `Invalid account record: ${acc.name || 'unnamed'}` };
        }
      }

      // Validate transaction shapes
      for (const tx of parsed.transactions) {
        if (!tx.id || !tx.type || typeof tx.amount !== 'number') {
          return { valid: false, error: 'Invalid transaction record found in backup.' };
        }
      }

      return {
        valid: true,
        data: {
          version: parsed.version || 1,
          exportedAt: parsed.exportedAt || new Date().toISOString(),
          accounts: parsed.accounts,
          transactions: parsed.transactions,
          settings: parsed.settings,
        },
      };
    } catch (e: any) {
      return { valid: false, error: 'Failed to parse JSON: ' + (e?.message || 'Syntax error') };
    }
  },
};
