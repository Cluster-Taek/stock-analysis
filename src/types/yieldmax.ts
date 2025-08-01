export type YieldmaxGroup = 'WEEKLY' | 'A' | 'B' | 'C' | 'D';

export const YIELDMAX_GROUP_MAP: Record<YieldmaxGroup, string> = {
  WEEKLY: 'Weekly Payers',
  A: 'Group A ETFs',
  B: 'Group B ETFs',
  C: 'Group C ETFs',
  D: 'Group D ETFs',
};

export interface IYieldmax {
  symbol: string;
  group: YieldmaxGroup;
}
