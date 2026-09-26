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
import { useStore } from '../../store/useStore';
import { colors, typography, spacing, borderRadius } from '../../theme/tokens';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { parseMoneyInput } from '../../utils/money';
import { AccountType } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

export default function NewAccountModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createAccount, showToast } = useStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [initialBalanceStr, setInitialBalanceStr] = useState('0');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountTypes: { label: string; value: AccountType }[] = [
    { label: 'Bank Account', value: 'bank' },
    { label: 'Physical Cash', value: 'cash' },
    { label: 'Other', value: 'other' },
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Account name is required');
      triggerHaptic.notificationWarning();
      return;
    }

    const parsed = parseMoneyInput(initialBalanceStr || '0');
    const initialPaise = initialBalanceStr === '0' || !initialBalanceStr ? 0 : parsed.paise;

    setIsSubmitting(true);
    try {
      await createAccount({
        name: name.trim(),
        type,
        initialBalance: initialPaise,
      });

      triggerHaptic.notificationSuccess();
      showToast(`Account "${name.trim()}" created`);
      router.back();
    } catch (e: any) {
      setError(e?.message || 'Failed to create account');
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Account</Text>
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
        <Input
          label="Account Name"
          placeholder="e.g. HDFC Bank, Wallet, Savings"
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (error) setError(undefined);
          }}
          autoFocus={true}
          error={error}
        />

        <Text style={styles.label}>Account Type</Text>
        <View style={styles.typeRow}>
          {accountTypes.map((t) => {
            const isSelected = type === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                onPress={() => setType(t.value)}
                style={[
                  styles.typeChip,
                  isSelected ? styles.typeChipSelected : styles.typeChipUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    isSelected ? styles.typeChipTextSelected : styles.typeChipTextUnselected,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Initial Balance (₹)"
          placeholder="0"
          value={initialBalanceStr}
          onChangeText={setInitialBalanceStr}
          keyboardType="decimal-pad"
        />

        <View style={styles.footer}>
          <Button
            title="Create Account"
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.massive,
  },
  label: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  typeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  typeChipUnselected: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderSubtle,
  },
  typeChipText: {
    ...typography.captionMedium,
  },
  typeChipTextSelected: {
    color: colors.textInverse,
  },
  typeChipTextUnselected: {
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
