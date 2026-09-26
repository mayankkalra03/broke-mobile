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
import { X } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { colors, typography, spacing } from '../theme/tokens';
import { MoneyInput } from '../components/ui/MoneyInput';
import { AccountSelector } from '../components/ui/AccountSelector';
import { CategorySelector } from '../components/ui/CategorySelector';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { parseMoneyInput, formatMoney } from '../utils/money';
import { triggerHaptic } from '../utils/haptics';

const INCOME_CATEGORIES = [
  'Salary',
  'Refund',
  'Gift',
  'Transfer from someone',
  'Other',
];

export default function AddMoneyModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accounts, createIncome, getAccountBalance, showToast } = useStore();

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const defaultAccountId = activeAccounts[0]?.id || '';

  const [amountStr, setAmountStr] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccountId);
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const parsed = parseMoneyInput(amountStr);
    if (!parsed.success) {
      setError(parsed.error);
      triggerHaptic.notificationWarning();
      return;
    }

    if (!selectedAccountId) {
      setError('Please select an account');
      return;
    }

    setIsSubmitting(true);
    try {
      await createIncome({
        amount: parsed.paise,
        accountId: selectedAccountId,
        note: note.trim() || undefined,
        category,
      });

      triggerHaptic.notificationSuccess();
      showToast(`✓ +${formatMoney(parsed.paise)} added`);
      router.back();
    } catch (e: any) {
      setError(e?.message || 'Failed to record incoming money');
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Money In</Text>
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
        {/* Visual Hero Amount Input */}
        <MoneyInput
          value={amountStr}
          onChangeText={(val) => {
            setAmountStr(val);
            if (error) setError(undefined);
          }}
          autoFocus={true}
          error={error}
        />

        {/* Deposit Account Selection */}
        <AccountSelector
          accounts={activeAccounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
          getBalance={getAccountBalance}
          label="Into Account"
        />

        {/* Optional Note */}
        <Input
          label="Note (Optional)"
          placeholder="e.g. Received from Rahul, Freelance, Gift"
          value={note}
          onChangeText={setNote}
          returnKeyType="done"
        />

        {/* Optional Category */}
        <CategorySelector
          categories={INCOME_CATEGORIES}
          selectedCategory={category}
          onSelectCategory={setCategory}
        />

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title="Add money"
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
  footer: {
    marginTop: spacing.xl,
  },
});
