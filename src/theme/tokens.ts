export const colors = {
  // Backgrounds - Warm & Tactile Parchment (No pure white, no harshness)
  background: '#F5F2EB',    // Warm organic parchment
  surface: '#FAF8F4',       // Soft warm cream (replaces pure #FFFFFF)
  surfaceSubtle: '#ECE7DE', // Warm stone subtle surface
  surfaceHover: '#E3DDD3',

  // Text (No pure black, no stark white)
  textPrimary: '#262320',   // Warm roast espresso / deep umber
  textSecondary: '#787066', // Warm stone secondary
  textTertiary: '#A39B91',  // Soft parchment stone
  textInverse: '#F5F2EB',   // Soft warm cream text for dark buttons

  // Borders & Dividers
  borderSubtle: '#E8E2D7',  // Soft linen border
  borderDefault: '#DDD7CC',  // Tactile warm boundary
  borderFocus: '#262320',

  // Account Personality Accents - Unified warm stone palette (no loud blue/yellow)
  bank: '#262320',          // Warm espresso
  bankBg: '#ECE7DE',        // Harmonious warm stone pill
  bankBorder: '#DDD7CC',
  cash: '#262320',          // Warm espresso
  cashBg: '#ECE7DE',        // Harmonious warm stone pill
  cashBorder: '#DDD7CC',

  // Semantic Accents - Restrained, warm, zero neon green
  income: '#7A4C22',        // Warm Antique Cognac (natural warm wealth accent, zero green)
  incomeBg: '#F2EAE0',      // Soft warm cognac parchment tint
  incomeBorder: '#DFD2C2',  // Natural warm boundary
  expense: '#262320',
  expenseAccent: '#8C3B1E', // Warm terracotta (subtle, muted)
  expenseBg: '#F5ECE6',
  expenseBorder: '#E8D5CB',
  transfer: '#4D443B',      // Warm charcoal stone
  transferBg: '#ECE7DE',
  adjustment: '#7A4C22',    // Warm cognac
  adjustmentBg: '#F2EAE0',

  // Destructive
  destructive: '#991B1B',   // Muted deep wine / garnet
  destructiveBg: '#F5ECEB',

  // Interactive buttons
  buttonPrimaryBg: '#262320',    // Warm espresso solid
  buttonPrimaryText: '#F5F2EB',  // Warm cream text
  buttonSecondaryBg: '#ECE7DE',  // Warm stone surface
  buttonSecondaryText: '#262320',
  buttonMutedBg: 'transparent',
  buttonMutedText: '#787066',
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
