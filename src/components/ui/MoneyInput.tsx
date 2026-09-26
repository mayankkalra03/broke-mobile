import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, typography, spacing } from '../../theme/tokens';

interface MoneyInputProps {
  value: string;
  onChangeText: (text: string) => void;
  currencySymbol?: string;
  autoFocus?: boolean;
  placeholder?: string;
  error?: string;
  accessibilityLabel?: string;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChangeText,
  currencySymbol = '₹',
  autoFocus = true,
  placeholder = '0',
  error,
  accessibilityLabel = 'Amount in Rupees',
}) => {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      // Small timeout ensures modal transition completes before keyboard focuses
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, Platform.OS === 'ios' ? 100 : 200);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleChangeText = (text: string) => {
    // Only allow digits and at most one decimal point
    const sanitized = text.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return; // Max 2 decimal places (paise)
    onChangeText(sanitized);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
      style={styles.container}
    >
      <View style={styles.inputRow}>
        <Text style={styles.symbol}>{currencySymbol}</Text>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          selectionColor={colors.textPrimary}
          accessibilityLabel={accessibilityLabel}
          autoFocus={autoFocus}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    ...typography.hero,
    fontSize: 36,
    color: colors.textPrimary,
    marginRight: 4,
    fontWeight: '600',
  },
  input: {
    ...typography.hero,
    fontSize: 44,
    color: colors.textPrimary,
    minWidth: 80,
    textAlign: 'left',
    padding: 0,
    margin: 0,
  },
  errorText: {
    ...typography.caption,
    color: colors.destructive,
    marginTop: spacing.xs,
  },
});
