export const colors = {
  // Backgrounds
  background: '#F9F9F7', // Warm neutral background
  surface: '#FFFFFF',    // Crisp clean surface
  surfaceSubtle: '#F2F2EE', // Subtle inset or secondary surface
  surfaceHover: '#EBEBE6',

  // Text
  textPrimary: '#141413',   // Near-black primary text
  textSecondary: '#6E6D68', // Muted slate-gray
  textTertiary: '#9E9D97',  // Soft tertiary text
  textInverse: '#FFFFFF',

  // Borders & Dividers
  borderSubtle: '#E8E7E1',
  borderDefault: '#DCDAD3',
  borderFocus: '#141413',

  // Semantic Accents
  income: '#15803D',       // Calm natural green
  incomeBg: '#F0FDF4',     // Soft green tint
  expense: '#141413',      // Neutral primary for expenses (not shouty red!)
  expenseMuted: '#6E6D68',
  transfer: '#2563EB',     // Focused subtle blue for transfer
  transferBg: '#EFF6FF',
  adjustment: '#D97706',   // Warm amber for reconciliation
  adjustmentBg: '#FFFBEB',

  // Destructive (only used where genuinely necessary)
  destructive: '#DC2626',
  destructiveBg: '#FEF2F2',

  // Interactive buttons
  buttonPrimaryBg: '#141413',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#ECEBE6',
  buttonSecondaryText: '#141413',
  buttonMutedBg: 'transparent',
  buttonMutedText: '#6E6D68',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  hero: {
    fontSize: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.75,
    lineHeight: 48,
  },
  title1: {
    fontSize: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  title2: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  subhead: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  micro: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    lineHeight: 14,
  },
};
