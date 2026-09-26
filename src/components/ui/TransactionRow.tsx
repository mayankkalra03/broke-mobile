import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transaction, Account } from '../../types';
import { colors, typography, spacing } from '../../theme/tokens';
import { formatMoney } from '../../utils/money';
import { formatTime } from '../../utils/date';
import { triggerHaptic } from '../../utils/haptics';

interface TransactionRowProps {
  transaction: Transaction;
  accounts: Account[];
  onPress: (transaction: Transaction) => void;
  showDivider?: boolean;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  accounts,
  onPress,
  showDivider = true,
}) => {
  const getAccountName = (id?: string) => {
    if (!id) return '';
    const acc = accounts.find((a) => a.id === id);
    return acc ? acc.name : 'Account';
  };

  const renderDescription = () => {
    switch (transaction.type) {
      case 'transfer': {
        const from = getAccountName(transaction.fromAccountId);
        const to = getAccountName(transaction.toAccountId);
        return transaction.note || `${from} → ${to}`;
      }
      case 'adjustment':
        return transaction.note || 'Balance adjustment';
      case 'income':
        return transaction.note || 'Money received';
      case 'expense':
      default:
        return transaction.note || transaction.category || 'Expense';
    }
  };

  const renderSubtitle = () => {
    const time = formatTime(transaction.createdAt);
    const parts: string[] = [];

    if (transaction.type === 'transfer') {
      const from = getAccountName(transaction.fromAccountId);
      const to = getAccountName(transaction.toAccountId);
      parts.push(`${from} → ${to}`);
      parts.push('Transfer');
    } else {
      const accName = getAccountName(transaction.accountId);
      if (accName) parts.push(accName);
      if (transaction.category) parts.push(transaction.category);
    }

    parts.push(time);
    return parts.join(' • ');
  };

  const renderAmount = () => {
    switch (transaction.type) {
      case 'income':
        return {
          text: formatMoney(transaction.amount, '₹', { showPlus: true }),
          color: colors.income,
        };
      case 'adjustment': {
        const delta = transaction.adjustmentDelta ?? transaction.amount;
        return {
          text: formatMoney(delta, '₹', { showPlus: delta > 0 }),
          color: delta >= 0 ? colors.income : colors.textPrimary,
        };
      }
      case 'transfer':
        return {
          text: formatMoney(transaction.amount),
          color: colors.textSecondary,
        };
      case 'expense':
      default:
        return {
          text: formatMoney(transaction.amount),
          color: colors.textPrimary,
        };
    }
  };

  const amountStyle = renderAmount();

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={() => {
        triggerHaptic.impactLight();
        onPress(transaction);
      }}
      style={[styles.container, showDivider && styles.divider]}
      accessibilityRole="button"
      accessibilityLabel={`${renderDescription()}, ${amountStyle.text}, ${renderSubtitle()}`}
    >
      <View style={styles.leftColumn}>
        <Text style={styles.title} numberOfLines={1}>
          {renderDescription()}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {renderSubtitle()}
        </Text>
      </View>

      <View style={styles.rightColumn}>
        <Text style={[styles.amount, { color: amountStyle.color }]}>
          {amountStyle.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    backgroundColor: 'transparent',
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  leftColumn: {
    flex: 1,
    paddingRight: spacing.md,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    ...typography.headline,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  amount: {
    ...typography.headline,
    fontSize: 16,
    fontWeight: '600',
  },
});
