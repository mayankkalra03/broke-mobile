import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, borderRadius, typography, spacing } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';

interface CategorySelectorProps {
  categories: string[];
  selectedCategory?: string;
  onSelectCategory: (cat?: string) => void;
  label?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  label = 'Category (Optional)',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {categories.map((cat) => {
          const isSelected = cat === selectedCategory;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic.impactLight();
                // Toggle off if already selected
                onSelectCategory(isSelected ? undefined : cat);
              }}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`Category ${cat}`}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {cat}
              </Text>
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
    gap: spacing.xs + 2,
    paddingVertical: 2,
  },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.textPrimary,
  },
  chipUnselected: {
    backgroundColor: 'transparent',
    borderColor: colors.borderSubtle,
  },
  chipText: {
    ...typography.captionMedium,
  },
  chipTextSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chipTextUnselected: {
    color: colors.textSecondary,
  },
});
