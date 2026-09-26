import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, ArrowDownLeft, ArrowLeftRight, SlidersHorizontal } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { colors, typography, spacing, borderRadius } from '../../theme/tokens';
import { formatMoney } from '../../utils/money';
import { getGreeting } from '../../utils/date';
import { TransactionRow } from '../../components/ui/TransactionRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { triggerHaptic } from '../../utils/haptics';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    accounts,
    transactions,
    getTotalBalance,
    getAccountBalance,
  } = useStore();

  const totalBalance = getTotalBalance();
  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const recentTransactions = transactions.slice(0, 7);
  const greeting = getGreeting();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting & Total Balance */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <View style={styles.balanceContainer}>
            <Text
              style={styles.totalBalance}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatMoney(totalBalance)}
            </Text>
            <Text style={styles.balanceLabel}>Total balance</Text>
          </View>
        </View>

        {/* Account Balances Breakdown */}
        <View style={styles.accountsSection}>
          {activeAccounts.map((account, index) => {
            const balance = getAccountBalance(account.id);
            const isLast = index === activeAccounts.length - 1;

            return (
              <TouchableOpacity
                key={account.id}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic.impactLight();
                  router.push(`/adjust?accountId=${account.id}`);
                }}
                style={[styles.accountRow, !isLast && styles.accountDivider]}
                accessibilityLabel={`${account.name} balance ${formatMoney(balance)}. Tap to adjust.`}
              >
                <View style={styles.accountNameCol}>
                  <Text style={styles.accountName}>{account.name}</Text>
                </View>
                <View style={styles.accountBalanceCol}>
                  <Text style={styles.accountBalance}>{formatMoney(balance)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Primary Actions: + Expense & + Money */}
        <View style={styles.primaryActionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic.impactLight();
              router.push('/expense');
            }}
            style={[styles.primaryButton, styles.expenseButton]}
            accessibilityRole="button"
            accessibilityLabel="Add Expense"
          >
            <Plus size={18} color={colors.textPrimary} strokeWidth={2.5} />
            <Text style={styles.expenseButtonText}>Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic.impactLight();
              router.push('/income');
            }}
            style={[styles.primaryButton, styles.incomeButton]}
            accessibilityRole="button"
            accessibilityLabel="Add Money In"
          >
            <ArrowDownLeft size={18} color={colors.textInverse} strokeWidth={2.5} />
            <Text style={styles.incomeButtonText}>Money In</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions: Transfer & Adjust */}
        <View style={styles.secondaryActionRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic.impactLight();
              router.push('/transfer');
            }}
            style={styles.secondaryAction}
            accessibilityRole="button"
            accessibilityLabel="Transfer money between accounts"
          >
            <ArrowLeftRight size={14} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.secondaryActionText}>Transfer</Text>
          </TouchableOpacity>

          <View style={styles.secondaryDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic.impactLight();
              router.push('/adjust');
            }}
            style={styles.secondaryAction}
            accessibilityRole="button"
            accessibilityLabel="Adjust balance"
          >
            <SlidersHorizontal size={14} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.secondaryActionText}>Reconcile</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            {transactions.length > 7 ? (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/history')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyState
              title="No transactions yet."
              description="Your money activity will appear here."
              actionTitle="+ Record an expense"
              onAction={() => router.push('/expense')}
            />
          ) : (
            recentTransactions.map((tx, index) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                accounts={accounts}
                onPress={(item) => router.push(`/transaction/${item.id}`)}
                showDivider={index < recentTransactions.length - 1}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.massive,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  greeting: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceContainer: {
    marginTop: spacing.xs,
  },
  totalBalance: {
    ...typography.hero,
    color: colors.textPrimary,
    fontSize: 44,
    lineHeight: 52,
  },
  balanceLabel: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accountsSection: {
    marginBottom: spacing.xxl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.xs,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  accountDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  accountNameCol: {
    flex: 1,
  },
  accountName: {
    ...typography.headline,
    fontSize: 16,
    color: colors.textPrimary,
  },
  accountBalanceCol: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    ...typography.headline,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  primaryActionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    minHeight: 50,
  },
  expenseButton: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  expenseButtonText: {
    ...typography.headline,
    fontSize: 15,
    color: colors.textPrimary,
  },
  incomeButton: {
    backgroundColor: colors.textPrimary,
  },
  incomeButtonText: {
    ...typography.headline,
    fontSize: 15,
    color: colors.textInverse,
  },
  secondaryActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
    paddingVertical: spacing.xs,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  secondaryActionText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },
  secondaryDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.borderSubtle,
  },
  activitySection: {
    marginTop: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.headline,
    fontSize: 17,
    color: colors.textPrimary,
  },
  seeAllText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },
});
