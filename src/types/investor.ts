import { ISODateString } from './common';

export interface IPortfolioItem {
  symbol: string;
  type: PortfolioType;
  amount: number; // 수량에서 금액으로 변경
  strategy?: PortfolioStrategy;
  reinvestmentTarget?: string; // REINVESTMENT 전략일 때 배당금을 재투자할 종목 심볼
}

export type PortfolioType = 'STOCK' | 'DIVIDEND';
export const PORTFOLIO_TYPES = ['STOCK', 'DIVIDEND'];
export const getPortfolioTypeLabel = (type: PortfolioType) => {
  return type === 'STOCK' ? '일반주' : '배당주';
};

export type PortfolioStrategy = 'HOLD' | 'REINVESTMENT';
export const PORTFOLIO_STATEGYS = ['HOLD', 'REINVESTMENT'];
export const getPortfolioStrategyLabel = (strategy: PortfolioStrategy) => {
  return strategy === 'HOLD' ? '보유' : '재투자';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IBacktestingParams extends Record<string, any> {
  portfolio: IPortfolioItem[];
  startDate: ISODateString;
  endDate: ISODateString;
  interval: '1d' | '1wk' | '1mo';
}

export interface IBacktestingSnapshot {
  date: ISODateString;
  capital: number;
  profit: number;
  profitRate: number; // 수익률
  profitRatePerYear: number; // 연간 수익률
  profitRatePerMonth: number; // 월별 수익률
  profitRatePerWeek: number; // 주별 수익률
  profitRatePerDay: number; // 일별 수익률
}

export interface IBacktestingResult {
  result: IBacktestingSnapshot[];
}

export interface IPendingDividend {
  symbol: string;
  amount: number;
  payableDate: ISODateString;
  reinvestmentTarget?: string;
  strategy: PortfolioStrategy;
}
