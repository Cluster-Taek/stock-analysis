export interface IInvestor {
  id: string;
  name: string;
  initialCapital: number;
  portfolio: IPortfolioItem[];
}

export interface IPortfolioItem {
  symbol: string;
  type: PortfolioType;
  quantity: number;
  strategy?: PortfolioStrategy;
  subPortfolio?: IPortfolioItem[];
}

export type PortfolioType = 'STOCK' | 'DIVIDEND';
export const PORTFOLIO_TYPES = ['STOCK', 'DIVIDEND'];
export const getPortfolioTypeLabel = (type: PortfolioType) => {
  return type === 'STOCK' ? '일반주' : '배당주';
};

export type PortfolioStrategy = 'HOLD' | 'REINVESTMENT_STOCK' | 'REINVESTMENT_DIVIDEND';
export const PORTFOLIO_STATEGYS = ['HOLD', 'REINVESTMENT_STOCK', 'REINVESTMENT_DIVIDEND'];
export const getPortfolioStrategyLabel = (strategy: PortfolioStrategy) => {
  return strategy === 'HOLD' ? '보유' : strategy === 'REINVESTMENT_STOCK' ? '일반주에 재투자' : '배당주에 재투자';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IBacktestingParams extends Record<string, any> {
  initialCapital: number;
  portfolio: IPortfolioItem[];
  startDate: string;
  endDate: string;
  interval: '1d' | '1wk' | '1mo';
}

export interface IBacktestingSnapshot {
  capital: number;
  profit: number;
  profitRate: number; // 수익률
  profitRatePerYear: number; // 연간 수익률
  profitRatePerMonth: number; // 월별 수익률
  profitRatePerWeek: number; // 주별 수익률
  profitRatePerDay: number; // 일별 수익률
}

export interface IBacktestingResult {
  investor: IInvestor;
  startDate: string;
  endDate: string;
  interval: '1d' | '1wk' | '1mo';
  result: IBacktestingSnapshot[];
}
