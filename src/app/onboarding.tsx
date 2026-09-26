import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { colors, typography, spacing, borderRadius } from '../theme/tokens';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { parseMoneyInput } from '../utils/money';
import { triggerHaptic } from '../utils/haptics';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding, showToast } = useStore();

  const [bankBalanceStr, setBankBalanceStr] = useState('');
  const [cashBalanceStr, setCashBalanceStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    // Parse inputs (defaults to 0 if empty or 0)
    const bankParsed = bankBalanceStr.trim()
      ? parseMoneyInput(bankBalanceStr)
      : { success: true, paise: 0 };
    const cashParsed = cashBalanceStr.trim()
      ? parseMoneyInput(cashBalanceStr)
      : { success: true, paise: 0 };

    if (!bankParsed.success || !cashParsed.success) {
      triggerHaptic.notificationWarning();
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding(bankParsed.paise, cashParsed.paise);
      triggerHaptic.notificationSuccess();
      showToast('Welcome to your personal tracker');
      router.replace('/(tabs)');
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topSection}>
          <Text style={styles.title}>Where's your money?</Text>
          <Text style={styles.subtitle}>
            Enter your current balances to get started. You can update or adjust these at any time.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Input
            label="Bank Balance (₹)"
            placeholder="0"
            value={bankBalanceStr}
            onChangeText={setBankBalanceStr}
            keyboardType="decimal-pad"
            autoFocus={true}
          />

          <Input
            label="Physical Cash (₹)"
            placeholder="0"
            value={cashBalanceStr}
            onChangeText={setCashBalanceStr}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.bottomSection}>
          <Button
            title="Continue"
            variant="primary"
            size="lg"
            onPress={handleContinue}
            loading={isSubmitting}
          />

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleContinue}
            disabled={isSubmitting}
          >
            <Text style={styles.skipText}>Start with ₹0 balances</Text>
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  topSection: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.hero,
    fontSize: 34,
    lineHeight: 42,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  bottomSection: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
});
