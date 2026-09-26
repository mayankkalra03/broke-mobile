import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';

interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  accessibilityLabel: string;
  variant?: 'subtle' | 'ghost' | 'contrast';
  size?: number;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  icon,
  accessibilityLabel,
  variant = 'ghost',
  size = 44,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        triggerHaptic.impactLight();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        variant === 'subtle' && styles.subtle,
        variant === 'contrast' && styles.contrast,
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtle: {
    backgroundColor: colors.surfaceSubtle,
  },
  contrast: {
    backgroundColor: colors.textPrimary,
  },
});
