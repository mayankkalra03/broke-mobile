import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Account } from '../../types';
import { colors, borderRadius, typography, spacing } from '../../theme/tokens';
import { formatMoney } from '../../utils/money';
import { triggerHaptic } from '../../utils/haptics';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  getBalance?: (id: string) => number;
  label?: string;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  getBalance,
  label = 'Account',
}) => {
  const activeAccounts = accounts.filter((a) => !a.isArchived);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {activeAccounts.map((account) => {
          const isSelected = account.id === selectedAccountId;
          const balance = getBalance ? getBalance(account.id) : null;

          return (
            <TouchableOpacity
              key={account.id}
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic.impactLight();
                onSelectAccount(account.id);
              }}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${account.name}${
                balance !== null ? `, balance ${formatMoney(balance)}` : ''
              }`}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {account.name}
              </Text>
              {balance !== null ? (
                <Text
                  style={[
                    styles.balanceText,
                    isSelected ? styles.balanceTextSelected : styles.balanceTextUnselected,
                  ]}
                >
                  {formatMoney(balance)}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  scrollList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 48,
    minWidth: 104,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.buttonPrimaryBg,
    borderColor: colors.buttonPrimaryBg,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderDefault,
  },
  chipText: {
    ...typography.headline,
    fontSize: 14,
  },
  chipTextSelected: {
    color: colors.textInverse,
  },
  chipTextUnselected: {
    color: colors.textPrimary,
  },
  balanceText: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 1,
  },
  balanceTextSelected: {
    color: colors.textTertiary,
  },
  balanceTextUnselected: {
    color: colors.textSecondary,
  },
});
