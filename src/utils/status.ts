export type BrokeStatusIcon = 'sparkles' | 'scale' | 'flame' | 'ghost';

export interface BrokeStatus {
  label: string;
  icon: BrokeStatusIcon;
  color: string;
  bg: string;
  border: string;
}

/**
 * Returns witty status badge depending on current total money.
 * Uses restrained warm stone palette matching the parchment aesthetic.
 */
export function getBrokeStatus(totalPaise: number): BrokeStatus {
  const rupees = totalPaise / 100;

  if (rupees >= 15000) {
    return {
      label: "We're chilling",
      icon: 'sparkles',
      color: '#262320',
      bg: '#ECE7DE',
      border: '#DDD7CC',
    };
  }

  if (rupees >= 5000) {
    return {
      label: 'Holding on',
      icon: 'scale',
      color: '#5E564D',
      bg: '#ECE7DE',
      border: '#DDD7CC',
    };
  }

  if (rupees >= 1000) {
    return {
      label: 'Down bad',
      icon: 'flame',
      color: '#8C3B1E',
      bg: '#F5ECE6',
      border: '#E8D5CB',
    };
  }

  return {
    label: 'Officially broke',
    icon: 'ghost',
    color: '#7A2621',
    bg: '#F4E9E8',
    border: '#E4CDCB',
  };
}

/**
 * Returns contextual witty greetings.
 */
export function getWittyGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Rise & grind';
  if (hour >= 12 && hour < 17) return 'Still surviving';
  if (hour >= 17 && hour < 22) return "What's the damage tonight?";
  return 'Late night spending?';
}
