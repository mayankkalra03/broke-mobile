import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Download,
  Upload,
  RotateCcw,
  Plus,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { colors, typography, spacing, borderRadius } from '../../theme/tokens';
import { exportService } from '../../services/export/backup';
import { notificationService } from '../../services/notifications/reminder';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { triggerHaptic } from '../../utils/haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    settings,
    accounts,
    transactions,
    updateSettings,
    resetAllData,
    restoreBackup,
    showToast,
  } = useStore();

  const [showResetModal, setShowResetModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleReminderToggle = async (val: boolean) => {
    triggerHaptic.impactLight();
    if (val) {
      const granted = await notificationService.requestPermission();
      if (!granted && Platform.OS !== 'web') {
        Alert.alert(
          'Notification Permission',
          'Please enable notifications in device settings to receive your daily expense reminder.'
        );
        return;
      }
    }
    await updateSettings({
      reminder: {
        ...settings.reminder,
        enabled: val,
      },
    });
  };

  const reminderTimes = [
    { label: '8:00 PM', hour: 20, minute: 0 },
    { label: '8:30 PM', hour: 20, minute: 30 },
    { label: '9:00 PM', hour: 21, minute: 0 },
    { label: '9:30 PM', hour: 21, minute: 30 },
    { label: '10:00 PM', hour: 22, minute: 0 },
  ];

  const handleSelectTime = async (hour: number, minute: number) => {
    triggerHaptic.impactLight();
    await updateSettings({
      reminder: {
        ...settings.reminder,
        hour,
        minute,
      },
    });
    showToast('Reminder time updated');
  };

  const handleExport = async () => {
    setIsExporting(true);
    triggerHaptic.impactLight();
    const payload = exportService.createExportPayload(accounts, transactions, settings);
    const result = await exportService.exportData(payload);
    setIsExporting(false);
    if (result.success) {
      showToast('Data exported successfully');
    } else {
      Alert.alert('Export Failed', result.message || 'Could not export data');
    }
  };

  const handleImportWeb = () => {
    // If on web, use prompt or file input
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const text = await file.text();
          const validation = exportService.validateImport(text);
          if (validation.valid && validation.data) {
            await restoreBackup(validation.data);
            showToast('Backup restored successfully');
          } else {
            Alert.alert('Import Error', validation.error || 'Invalid backup file');
          }
        }
      };
      input.click();
    } else {
      Alert.alert(
        'Import Backup',
        'To restore a backup, place your JSON export file in the device or import from your file explorer.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleConfirmReset = async () => {
    setShowResetModal(false);
    await resetAllData();
    triggerHaptic.notificationWarning();
    showToast('App reset complete');
    router.replace('/onboarding');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Reminders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Daily Reminder</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLabelContainer}>
                <Text style={styles.rowTitle}>Evening expense prompt</Text>
                <Text style={styles.rowSubtitle}>
                  {settings.reminder.enabled
                    ? `Notifies at ${settings.reminder.hour % 12 || 12}:${String(
                        settings.reminder.minute
                      ).padStart(2, '0')} ${settings.reminder.hour >= 12 ? 'PM' : 'AM'}`
                    : 'Reminders are turned off'}
                </Text>
              </View>
              <Switch
                value={settings.reminder.enabled}
                onValueChange={handleReminderToggle}
                trackColor={{ false: colors.surfaceSubtle, true: colors.textPrimary }}
                thumbColor={colors.surface}
              />
            </View>

            {settings.reminder.enabled ? (
              <View style={styles.timeSelectorRow}>
                {reminderTimes.map((t) => {
                  const isSelected =
                    settings.reminder.hour === t.hour &&
                    settings.reminder.minute === t.minute;
                  return (
                    <TouchableOpacity
                      key={t.label}
                      onPress={() => handleSelectTime(t.hour, t.minute)}
                      style={[
                        styles.timeChip,
                        isSelected ? styles.timeChipSelected : styles.timeChipUnselected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          isSelected ? styles.timeChipTextSelected : styles.timeChipTextUnselected,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {settings.reminder.enabled ? (
              <TouchableOpacity
                style={[styles.actionRow, styles.topDivider]}
                onPress={async () => {
                  triggerHaptic.impactLight();
                  const res = await notificationService.sendTestNotificationNow();
                  Alert.alert(
                    res.success ? 'Notification Test' : 'Test Error',
                    res.message || 'Notification test completed.'
                  );
                }}
              >
                <View style={styles.actionLeft}>
                  <Bell size={16} color={colors.textPrimary} />
                  <Text style={styles.actionTitle}>Send test notification now</Text>
                </View>
                <ChevronRight size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Accounts Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithAction}>
            <Text style={styles.sectionHeader}>Accounts</Text>
            <TouchableOpacity
              onPress={() => router.push('/account/new')}
              style={styles.addAccountButton}
            >
              <Plus size={14} color={colors.textPrimary} strokeWidth={2.5} />
              <Text style={styles.addAccountText}>Add account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {accounts.map((acc, idx) => (
              <TouchableOpacity
                key={acc.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/account/${acc.id}`)}
                style={[
                  styles.accountRow,
                  idx < accounts.length - 1 && styles.rowDivider,
                ]}
              >
                <View>
                  <Text style={styles.accountName}>
                    {acc.name} {acc.isArchived ? '(Archived)' : ''}
                  </Text>
                  <Text style={styles.accountType}>
                    {acc.type.toUpperCase()} • Initial: ₹{Math.floor(acc.initialBalance / 100)}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Currency */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Currency</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>Active Currency</Text>
                <Text style={styles.rowSubtitle}>Indian Rupee (₹)</Text>
              </View>
              <Text style={styles.currencyBadge}>INR</Text>
            </View>
          </View>
        </View>

        {/* Data & Backup */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Data & Privacy</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.actionRow, styles.rowDivider]}
              onPress={handleExport}
              disabled={isExporting}
            >
              <View style={styles.actionLeft}>
                <Download size={18} color={colors.textPrimary} />
                <View>
                  <Text style={styles.actionTitle}>Export Data</Text>
                  <Text style={styles.actionSubtitle}>Save JSON backup file</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleImportWeb}>
              <View style={styles.actionLeft}>
                <Upload size={18} color={colors.textPrimary} />
                <View>
                  <Text style={styles.actionTitle}>Import Data</Text>
                  <Text style={styles.actionSubtitle}>Restore from JSON file</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset App */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setShowResetModal(true)}
          >
            <RotateCcw size={16} color={colors.destructive} />
            <Text style={styles.resetButtonText}>Reset All Data</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Broke? • 100% Offline & Private
        </Text>
      </ScrollView>

      {/* Reset Confirmation Dialog */}
      <ConfirmationModal
        visible={showResetModal}
        title="Reset All Data?"
        message="This will erase all accounts and transactions from your device. This action cannot be undone."
        confirmTitle="Reset Everything"
        cancelTitle="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.massive,
  },
  title: {
    ...typography.title1,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    ...typography.micro,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addAccountText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  rowLabelContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  rowTitle: {
    ...typography.headline,
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  timeChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  timeChipSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  timeChipUnselected: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: 'transparent',
  },
  timeChipText: {
    ...typography.captionMedium,
    fontSize: 12,
  },
  timeChipTextSelected: {
    color: colors.textInverse,
  },
  timeChipTextUnselected: {
    color: colors.textSecondary,
  },
  currencyBadge: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  accountName: {
    ...typography.headline,
    fontSize: 15,
    color: colors.textPrimary,
  },
  accountType: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionTitle: {
    ...typography.headline,
    fontSize: 15,
    color: colors.textPrimary,
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  topDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: colors.destructiveBg,
  },
  resetButtonText: {
    ...typography.headline,
    fontSize: 14,
    color: colors.destructive,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
