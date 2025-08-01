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

// TODO: Distribution API에서 사용할 데이터 타입
export interface DistributionData {
  symbol: string;
  distributionRate: number;
  secYield: number;
  lastDistribution: {
    date: string;
    amount: number;
    returnOfCapital: number;
    income: number;
  };
  // TODO: 추가 필요한 필드들 (예: historicalDistributions, nextPaymentDate 등)
}
