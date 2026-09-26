import React, { useState, useEffect } from 'react';
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
import { X } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { colors, typography, spacing, borderRadius } from '../theme/tokens';
import { AccountSelector } from '../components/ui/AccountSelector';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { formatMoney, parseMoneyInput } from '../utils/money';
import { triggerHaptic } from '../utils/haptics';

export default function AdjustBalanceModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ accountId?: string }>();
  const insets = useSafeAreaInsets();
  const { accounts, getAccountBalance, createAdjustment, showToast } = useStore();

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const initialAccountId = params.accountId || activeAccounts[0]?.id || '';

  const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId);
  const [actualBalanceStr, setActualBalanceStr] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentAppBalance = getAccountBalance(selectedAccountId);

  useEffect(() => {
    // Prefill with current balance in rupees
    if (currentAppBalance !== undefined) {
      const rupees = Math.abs(currentAppBalance / 100);
      setActualBalanceStr(rupees.toString());
    }
  }, [selectedAccountId]);

  // Calculate delta
  const parsedActual = parseMoneyInput(actualBalanceStr || '0');
  const actualPaise = parsedActual.success ? parsedActual.paise : currentAppBalance;
  const deltaPaise = actualPaise - currentAppBalance;

  const handleSave = async () => {
    if (!parsedActual.success) {
      setError(parsedActual.error);
      triggerHaptic.notificationWarning();
      return;
    }

    if (deltaPaise === 0) {
      setError('App balance already matches actual balance.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAdjustment({
        accountId: selectedAccountId,
        adjustmentDelta: deltaPaise,
        note: reason.trim() || 'Balance reconciliation',
      });

      triggerHaptic.notificationSuccess();
      showToast(`✓ Balance adjusted (${formatMoney(deltaPaise, '₹', { showPlus: true })})`);
      router.back();
    } catch (e: any) {
      setError(e?.message || 'Failed to adjust balance');
      setIsSubmitting(false);
    }
  };

  const selectedAccount = activeAccounts.find((a) => a.id === selectedAccountId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reconcile Balance</Text>
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
        <Text style={styles.instruction}>
          Adjust when your real-world balance differs from the app. A balance correction will be recorded in your history.
        </Text>

        {/* Account Selector */}
        <AccountSelector
          accounts={activeAccounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={(id) => {
            setSelectedAccountId(id);
            setError(undefined);
          }}
          getBalance={getAccountBalance}
          label="Account to reconcile"
        />

        {/* Comparison card */}
        <View style={styles.comparisonCard}>
          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Current app balance</Text>
            <Text style={styles.compValue}>{formatMoney(currentAppBalance)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.compRow}>
            <Text style={styles.compLabel}>Adjustment</Text>
            <Text
              style={[
                styles.compValue,
                {
                  color:
                    deltaPaise > 0
                      ? colors.income
                      : deltaPaise < 0
                      ? colors.destructive
                      : colors.textSecondary,
                },
              ]}
            >
              {deltaPaise === 0
                ? '₹0'
                : formatMoney(deltaPaise, '₹', { showPlus: true })}
            </Text>
          </View>
        </View>

        {/* Actual balance input */}
        <Input
          label="Actual real-world balance (₹)"
          placeholder="0"
          value={actualBalanceStr}
          onChangeText={(val) => {
            setActualBalanceStr(val);
            if (error) setError(undefined);
          }}
          keyboardType="decimal-pad"
          error={error}
        />

        {/* Reason / Note */}
        <Input
          label="Reason (Optional)"
          placeholder="e.g. Missing cash, Found notes, etc."
          value={reason}
          onChangeText={setReason}
        />

        {/* Save */}
        <View style={styles.footer}>
          <Button
            title="Save adjustment"
            variant="primary"
            size="lg"
            onPress={handleSave}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.massive,
  },
  instruction: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  comparisonCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.sm,
  },
  compLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  compValue: {
    ...typography.headline,
    fontSize: 16,
    color: colors.textPrimary,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
