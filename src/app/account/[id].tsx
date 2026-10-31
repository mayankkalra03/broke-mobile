import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Archive, ArchiveRestore } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { colors, typography, spacing, borderRadius } from '../../theme/tokens';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Account, AccountType } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

export default function EditAccountModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { accounts, updateAccount, archiveAccount, transactions, showToast } = useStore();

  const account = accounts.find((a) => a.id === id);
  const lastAccountRef = useRef<Account | undefined>(account);
  if (account) {
    lastAccountRef.current = account;
  }
  const currentAccount = account || lastAccountRef.current;

  // Form states - registered unconditionally at top level
  const [name, setName] = useState(currentAccount?.name || '');
  const [type, setType] = useState<AccountType>(currentAccount?.type || 'bank');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isProcessingRef = useRef(false);

  if (!currentAccount) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, padding: spacing.xl }]}>
        <Text style={styles.notFoundText}>Account not found</Text>
        <Button title="Go back" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
      </View>
    );
  }

  // Check if account has transactions
  const hasTransactions = transactions.some(
    (t) =>
      t.accountId === currentAccount.id ||
      t.fromAccountId === currentAccount.id ||
      t.toAccountId === currentAccount.id
  );

  const handleSave = async () => {
    if (!name.trim() || !currentAccount || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsSubmitting(true);
    await updateAccount({
      ...currentAccount,
      name: name.trim(),
      type,
    });
    triggerHaptic.notificationSuccess();
    showToast('Account updated');
    router.back();
  };

  const handleToggleArchive = async () => {
    if (!currentAccount || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setShowArchiveModal(false);
    router.back();
    await updateAccount({
      ...currentAccount,
      isArchived: !currentAccount.isArchived,
    });
    triggerHaptic.notificationWarning();
    showToast(currentAccount.isArchived ? 'Account restored' : 'Account archived');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Account</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <X size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.massive + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Account Name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.infoText}>
          Type: {currentAccount.type.toUpperCase()} • Initial: ₹{Math.floor(currentAccount.initialBalance / 100)}
        </Text>

        <View style={styles.footer}>
          <Button
            title="Save Changes"
            variant="primary"
            size="lg"
            onPress={handleSave}
            loading={isSubmitting}
          />

          <TouchableOpacity
            style={styles.archiveButton}
            onPress={() => setShowArchiveModal(true)}
          >
            {currentAccount.isArchived ? (
              <ArchiveRestore size={16} color={colors.textSecondary} />
            ) : (
              <Archive size={16} color={colors.textSecondary} />
            )}
            <Text style={styles.archiveText}>
              {currentAccount.isArchived ? 'Restore Account' : 'Archive Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showArchiveModal}
        title={currentAccount.isArchived ? 'Restore Account?' : 'Archive Account?'}
        message={
          currentAccount.isArchived
            ? 'This will make the account visible again across the app.'
            : hasTransactions
            ? 'This account has transactions in history. Archiving will hide it from new entries while preserving all previous records and ledger history.'
            : 'Archiving hides the account from new entries.'
        }
        confirmTitle={currentAccount.isArchived ? 'Restore' : 'Archive'}
        cancelTitle="Cancel"
        isDestructive={!currentAccount.isArchived}
        onConfirm={handleToggleArchive}
        onCancel={() => setShowArchiveModal(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    ...typography.headline,
    fontSize: 17,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.massive,
  },
  notFoundText: {
    ...typography.headline,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginVertical: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.md,
  },
  archiveText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
});
