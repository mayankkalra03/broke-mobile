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
import {
  Plus,
  ArrowDownLeft,
  ArrowLeftRight,
  SlidersHorizontal,
  Landmark,
  Banknote,
  Wallet,
  Sparkles,
  Scale,
  Flame,
  Ghost,
} from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { colors, typography, spacing, borderRadius } from '../../theme/tokens';
import { formatMoney } from '../../utils/money';
import { getBrokeStatus, getWittyGreeting, BrokeStatusIcon } from '../../utils/status';
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
  const greeting = getWittyGreeting();
  const brokeStatus = getBrokeStatus(totalBalance);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Landmark size={15} color={colors.textSecondary} />;
      case 'cash':
        return <Banknote size={15} color={colors.textSecondary} />;
      default:
        return <Wallet size={15} color={colors.textSecondary} />;
    }
  };

  const renderStatusIcon = (icon: BrokeStatusIcon, color: string) => {
    switch (icon) {
      case 'sparkles':
        return <Sparkles size={11} color={color} strokeWidth={2.4} />;
      case 'scale':
        return <Scale size={11} color={color} strokeWidth={2.4} />;
      case 'flame':
        return <Flame size={11} color={color} strokeWidth={2.4} />;
      case 'ghost':
        return <Ghost size={11} color={color} strokeWidth={2.4} />;
    }
  };

  const getAccountBadgeStyle = (_type: string) => {
    return { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle };
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting & Broke Status */}
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>{greeting}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: brokeStatus.bg, borderColor: brokeStatus.border },
              ]}
            >
              {renderStatusIcon(brokeStatus.icon, brokeStatus.color)}
              <Text style={[styles.statusText, { color: brokeStatus.color }]}>
                {brokeStatus.label}
              </Text>
            </View>
          </View>

          {/* Hero Total Balance */}
          <View style={styles.balanceContainer}>
            <Text
              style={styles.totalBalance}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatMoney(totalBalance)}
            </Text>
            <Text style={styles.balanceLabel}>Total available</Text>
          </View>
        </View>

        {/* Account Balances Breakdown */}
        <View style={styles.accountsSection}>
          {activeAccounts.map((account, index) => {
            const balance = getAccountBalance(account.id);
            const isLast = index === activeAccounts.length - 1;
            const badgeStyle = getAccountBadgeStyle(account.type);

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
                  <View style={[styles.accountPill, badgeStyle]}>
                    {getAccountIcon(account.type)}
                    <Text style={styles.accountName}>{account.name}</Text>
                  </View>
                </View>
                <View style={styles.accountBalanceCol}>
                  <Text style={styles.accountBalance}>{formatMoney(balance)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Primary Actions: + Spent & + Received */}
        <View style={styles.primaryActionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic.impactLight();
              router.push('/expense');
            }}
            style={[styles.primaryButton, styles.expenseButton]}
            accessibilityRole="button"
            accessibilityLabel="Record expense"
          >
            <Plus size={18} color={colors.buttonPrimaryText} strokeWidth={2.5} />
            <Text style={styles.expenseButtonText}>Spent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic.impactLight();
              router.push('/income');
            }}
            style={[styles.primaryButton, styles.incomeButton]}
            accessibilityRole="button"
            accessibilityLabel="Record money in"
          >
            <ArrowDownLeft size={18} color={colors.textPrimary} strokeWidth={2.5} />
            <Text style={styles.incomeButtonText}>Received</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions: Move & Reality check */}
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
            <Text style={styles.secondaryActionText}>Move money</Text>
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
            accessibilityLabel="Reality check balance adjustment"
          >
            <SlidersHorizontal size={14} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.secondaryActionText}>Reality check</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent movements</Text>
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
              title="Zero damage today."
              description="Your wallet is currently at peace. Tap Spent when you buy something."
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
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  greeting: {
    ...typography.subhead,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3.5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 4.5,
  },
  statusText: {
    ...typography.captionMedium,
    fontSize: 11,
    fontWeight: '600',
  },
  balanceContainer: {
    marginTop: spacing.xs,
  },
  totalBalance: {
    ...typography.hero,
    color: colors.textPrimary,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '700',
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
    paddingVertical: spacing.md - 2,
  },
  accountDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  accountNameCol: {
    flex: 1,
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  accountName: {
    ...typography.headline,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  accountBalanceCol: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    ...typography.headline,
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: colors.buttonPrimaryBg,
  },
  expenseButtonText: {
    ...typography.headline,
    fontSize: 15,
    color: colors.buttonPrimaryText,
  },
  incomeButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  incomeButtonText: {
    ...typography.headline,
    fontSize: 15,
    color: colors.textPrimary,
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
