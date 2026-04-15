export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly';
  effect: {
    lanternCost?: number;
    startingRelics?: number;
    damageMultiplier?: number;
  };
  reward: {
    lorePoints: number;
    achievement?: string;
  };
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'double-lantern',
    name: 'Lantern Crisis',
    description: 'Lantern charge depletes twice as fast.',
    type: 'daily',
    effect: { lanternCost: 2 },
    reward: { lorePoints: 25 },
  },
  {
    id: 'extra-relic',
    name: 'Generous Veil',
    description: 'Start with an extra random relic.',
    type: 'daily',
    effect: { startingRelics: 1 },
    reward: { lorePoints: 30 },
  },
  {
    id: 'fragile',
    name: 'Fragile Existence',
    description: 'All damage is increased by 50%.',
    type: 'weekly',
    effect: { damageMultiplier: 1.5 },
    reward: { lorePoints: 100, achievement: 'veil-challenger' },
  },
  {
    id: 'minimalist',
    name: 'Minimalist Journey',
    description: 'Start with only 50 lantern charge.',
    type: 'weekly',
    effect: { lanternCost: 1 }, // But modify initial lantern
    reward: { lorePoints: 75 },
  },
];

export function getActiveChallenges(): Challenge[] {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const weekOfYear = Math.floor(dayOfYear / 7);

  const dailyIndex = dayOfYear % CHALLENGES.filter(c => c.type === 'daily').length;
  const weeklyIndex = weekOfYear % CHALLENGES.filter(c => c.type === 'weekly').length;

  return [
    CHALLENGES.filter(c => c.type === 'daily')[dailyIndex],
    CHALLENGES.filter(c => c.type === 'weekly')[weeklyIndex],
  ].filter(Boolean);
}