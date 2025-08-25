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
  name: string;
  portfolio: IPortfolioItem[];
  id?: string;
}

export interface IBacktestingConfig {
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
  cash: number; // 현금 잔고
  holdings: Record<string, number>; // 종목별 보유 주식 수 (symbol -> shares)
}

export interface IBacktestingResult {
  result: IBacktestingSnapshot[];
  portfolioId: string;
  portfolioName: string;
}

export interface IMultipleBacktestingResults {
  results: IBacktestingResult[];
}

export interface IPendingDividend {
  symbol: string;
  amount: number;
  payableDate: ISODateString;
  reinvestmentTarget?: string;
  strategy: PortfolioStrategy;
}

export interface DividendData {
  date: number;
  amount: number;
  exDate?: string;
  payableDate?: string;
}

export interface HistoricalData {
  symbol: string;
  data: Array<{
    date: string;
    close: number;
  }>;
}

export interface DividendResponse {
  symbol: string;
  data: DividendData[];
}
