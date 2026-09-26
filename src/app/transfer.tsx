import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ArrowDown } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { colors, typography, spacing, borderRadius } from '../theme/tokens';
import { MoneyInput } from '../components/ui/MoneyInput';
import { AccountSelector } from '../components/ui/AccountSelector';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { parseMoneyInput, formatMoney } from '../utils/money';
import { triggerHaptic } from '../utils/haptics';

export default function TransferModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accounts, createTransfer, getAccountBalance, showToast } = useStore();

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  const [fromAccountId, setFromAccountId] = useState(activeAccounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(activeAccounts[1]?.id || activeAccounts[0]?.id || '');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransfer = async () => {
    if (fromAccountId === toAccountId) {
      setError('Source and destination accounts must be different');
      triggerHaptic.notificationWarning();
      return;
    }

    const parsed = parseMoneyInput(amountStr);
    if (!parsed.success) {
      setError(parsed.error);
      triggerHaptic.notificationWarning();
      return;
    }

    setIsSubmitting(true);
    try {
      await createTransfer({
        amount: parsed.paise,
        fromAccountId,
        toAccountId,
        note: note.trim() || undefined,
      });

      triggerHaptic.notificationSuccess();
      showToast(`✓ ${formatMoney(parsed.paise)} transferred`);
      router.back();
    } catch (e: any) {
      setError(e?.message || 'Transfer failed');
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transfer</Text>
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
        {/* Transfer Amount */}
        <MoneyInput
          value={amountStr}
          onChangeText={(val) => {
            setAmountStr(val);
            if (error) setError(undefined);
          }}
          autoFocus={true}
          error={error}
        />

        {/* Direction Section: From -> To */}
        <View style={styles.directionSection}>
          <AccountSelector
            accounts={activeAccounts}
            selectedAccountId={fromAccountId}
            onSelectAccount={(id) => {
              setFromAccountId(id);
              if (error) setError(undefined);
            }}
            getBalance={getAccountBalance}
            label="From"
          />

          <View style={styles.arrowRow}>
            <View style={styles.arrowCircle}>
              <ArrowDown size={16} color={colors.textSecondary} />
            </View>
          </View>

          <AccountSelector
            accounts={activeAccounts}
            selectedAccountId={toAccountId}
            onSelectAccount={(id) => {
              setToAccountId(id);
              if (error) setError(undefined);
            }}
            getBalance={getAccountBalance}
            label="To"
          />
        </View>

        {/* Optional Note */}
        <Input
          label="Note (Optional)"
          placeholder="e.g. ATM withdrawal, Bank transfer"
          value={note}
          onChangeText={setNote}
          returnKeyType="done"
        />

        {/* Submit */}
        <View style={styles.footer}>
          <Button
            title="Transfer"
            variant="primary"
            size="lg"
            onPress={handleTransfer}
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
  directionSection: {
    marginBottom: spacing.md,
  },
  arrowRow: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: spacing.xl,
  },
});
