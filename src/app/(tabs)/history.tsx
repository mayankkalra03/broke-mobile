import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { colors, typography, spacing, borderRadius } from '../../theme/tokens';
import { groupTransactionsByDate } from '../../utils/date';
import { TransactionRow } from '../../components/ui/TransactionRow';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { TransactionType } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

type FilterType = 'all' | TransactionType;

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { transactions, accounts } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((tx) => tx.type === filter);
  }, [transactions, filter]);

  const grouped = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Expenses', value: 'expense' },
    { label: 'Money In', value: 'income' },
    { label: 'Transfers', value: 'transfer' },
    { label: 'Adjustments', value: 'adjustment' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.countText}>{filteredTransactions.length} movements</Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterOptions.map((opt) => {
            const isSelected = filter === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic.impactLight();
                  setFilter(opt.value);
                }}
                style={[
                  styles.filterChip,
                  isSelected ? styles.filterChipSelected : styles.filterChipUnselected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected
                      ? styles.filterChipTextSelected
                      : styles.filterChipTextUnselected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grouped Chronological SectionList */}
      {grouped.length === 0 ? (
        <EmptyState
          title={filter === 'all' ? 'No transactions recorded' : 'No matching transactions'}
          description="Your transaction ledger will appear here grouped by day."
          actionTitle={filter === 'all' ? '+ Add expense' : undefined}
          onAction={filter === 'all' ? () => router.push('/expense') : undefined}
        />
      ) : (
        <SectionList
          sections={grouped}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <SectionHeader title={title} />
          )}
          renderItem={({ item, index, section }) => (
            <TransactionRow
              transaction={item}
              accounts={accounts}
              onPress={(tx) => router.push(`/transaction/${tx.id}`)}
              showDivider={index < section.data.length - 1}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  countText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filtersWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xs + 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  filterChipUnselected: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: 'transparent',
  },
  filterChipText: {
    ...typography.captionMedium,
  },
  filterChipTextSelected: {
    color: colors.textInverse,
  },
  filterChipTextUnselected: {
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.massive,
  },
});
