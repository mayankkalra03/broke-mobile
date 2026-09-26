import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Trash2 } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { colors, typography, spacing, borderRadius } from '../../theme/tokens';
import { MoneyInput } from '../../components/ui/MoneyInput';
import { AccountSelector } from '../../components/ui/AccountSelector';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { formatMoney, parseMoneyInput } from '../../utils/money';
import { formatDateHeader, formatTime } from '../../utils/date';
import { triggerHaptic } from '../../utils/haptics';

export default function TransactionDetailModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const {
    transactions,
    accounts,
    updateTransaction,
    deleteTransaction,
    getAccountBalance,
    showToast,
  } = useStore();

  const transaction = transactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, padding: spacing.xl }]}>
        <Text style={styles.notFoundText}>Transaction not found</Text>
        <Button title="Go back" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
      </View>
    );
  }

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [amountStr, setAmountStr] = useState(
    (transaction.amount / 100).toString()
  );
  const [accountId, setAccountId] = useState(transaction.accountId || activeAccounts[0]?.id);
  const [note, setNote] = useState(transaction.note || '');
  const [category, setCategory] = useState(transaction.category || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const getAccountName = (accId?: string) => {
    if (!accId) return 'None';
    const acc = accounts.find((a) => a.id === accId);
    return acc ? acc.name : 'Unknown';
  };

  const handleSaveEdit = async () => {
    const parsed = parseMoneyInput(amountStr);
    if (!parsed.success) {
      setError(parsed.error);
      triggerHaptic.notificationWarning();
      return;
    }

    setIsSaving(true);
    try {
      await updateTransaction({
        ...transaction,
        amount: parsed.paise,
        accountId: transaction.type === 'transfer' ? undefined : accountId,
        note: note.trim() || undefined,
        category: category.trim() || undefined,
      });

      triggerHaptic.notificationSuccess();
      showToast('Transaction updated');
      setIsEditing(false);
      setIsSaving(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to update transaction');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    await deleteTransaction(transaction.id);
    triggerHaptic.notificationWarning();
    showToast('Transaction deleted');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {transaction.type.toUpperCase()}
        </Text>
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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isEditing ? (
          // EDIT MODE
          <View>
            <MoneyInput
              value={amountStr}
              onChangeText={(val) => {
                setAmountStr(val);
                setError(undefined);
              }}
              autoFocus={true}
              error={error}
            />

            {transaction.type !== 'transfer' ? (
              <AccountSelector
                accounts={activeAccounts}
                selectedAccountId={accountId}
                onSelectAccount={setAccountId}
                getBalance={getAccountBalance}
                label="Account"
              />
            ) : null}

            <Input
              label="Note"
              placeholder="e.g. Lunch, Groceries"
              value={note}
              onChangeText={setNote}
            />

            <Input
              label="Category"
              placeholder="e.g. Food, Transport"
              value={category}
              onChangeText={setCategory}
            />

            <View style={styles.editButtonRow}>
              <Button
                title="Cancel"
                variant="secondary"
                size="md"
                onPress={() => setIsEditing(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Changes"
                variant="primary"
                size="md"
                onPress={handleSaveEdit}
                loading={isSaving}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : (
          // VIEW MODE
          <View>
            <View style={styles.viewHero}>
              <Text style={styles.heroAmount}>
                {transaction.type === 'income'
                  ? `+${formatMoney(transaction.amount)}`
                  : transaction.type === 'adjustment' && transaction.adjustmentDelta
                  ? formatMoney(transaction.adjustmentDelta, '₹', { showPlus: true })
                  : formatMoney(transaction.amount)}
              </Text>
              <Text style={styles.heroDate}>
                {formatDateHeader(transaction.createdAt)} at {formatTime(transaction.createdAt)}
              </Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>
                  {transaction.type === 'income'
                    ? 'Money In'
                    : transaction.type === 'expense'
                    ? 'Expense'
                    : transaction.type === 'transfer'
                    ? 'Transfer'
                    : 'Reconciliation'}
                </Text>
              </View>

              <View style={styles.divider} />

              {transaction.type === 'transfer' ? (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>From</Text>
                    <Text style={styles.detailValue}>
                      {getAccountName(transaction.fromAccountId)}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>To</Text>
                    <Text style={styles.detailValue}>
                      {getAccountName(transaction.toAccountId)}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account</Text>
                  <Text style={styles.detailValue}>
                    {getAccountName(transaction.accountId)}
                  </Text>
                </View>
              )}

              {transaction.note ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Note</Text>
                    <Text style={styles.detailValue}>{transaction.note}</Text>
                  </View>
                </>
              ) : null}

              {transaction.category ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{transaction.category}</Text>
                  </View>
                </>
              ) : null}
            </View>

            <View style={styles.actionButtonsContainer}>
              <Button
                title="Edit Transaction"
                variant="secondary"
                size="md"
                onPress={() => setIsEditing(true)}
              />

              <TouchableOpacity
                onPress={() => setShowDeleteModal(true)}
                style={styles.deleteButton}
              >
                <Trash2 size={16} color={colors.destructive} />
                <Text style={styles.deleteText}>Delete Transaction</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Transaction?"
        message="This will permanently delete this record and recalculate your account balances."
        confirmTitle="Delete"
        cancelTitle="Cancel"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
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
    ...typography.micro,
    color: colors.textSecondary,
    letterSpacing: 0.8,
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
  viewHero: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  heroAmount: {
    ...typography.hero,
    fontSize: 40,
    color: colors.textPrimary,
  },
  heroDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.headline,
    fontSize: 15,
    color: colors.textPrimary,
  },
  actionButtonsContainer: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  editButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.md,
  },
  deleteText: {
    ...typography.headline,
    fontSize: 14,
    color: colors.destructive,
  },
});
