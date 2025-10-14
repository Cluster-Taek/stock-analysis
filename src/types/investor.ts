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
  tradingRules?: ITradingRule[];
  initialCash?: number; // 거래 규칙에서 사용할 초기 현금
  id?: string;
}

export interface IBacktestingConfig {
  startDate: ISODateString;
  endDate: ISODateString;
  interval: '1d' | '1wk' | '1mo';
  buyFeeRate?: number; // 매수 수수료율 (%, 기본값: 0.1)
  sellFeeRate?: number; // 매도 수수료율 (%, 기본값: 0.1)
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
  currentPrices?: Record<string, number>; // 종목별 현재가 (symbol -> price)
  dividendsReceived?: Record<string, number>; // 종목별 당일 받은 배당금 (symbol -> dividend amount)
  trades?: ITradeExecution[]; // 당일 실행된 거래 내역
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
  date: string;
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

// Trading Rule Types
export type TriggerType = 'DATE' | 'INTERVAL' | 'PRICE' | 'COST_BASIS';
export type TradingAction = 'BUY' | 'SELL';
export type AmountType = 'FIXED' | 'PERCENTAGE';
export type IntervalType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type DifferenceType = 'PERCENTAGE' | 'ABSOLUTE';

export interface ITriggerConfig {
  // DATE trigger
  date?: ISODateString;

  // INTERVAL trigger
  intervalType?: IntervalType;
  dayOfWeek?: number; // 0-6 (일요일=0)
  dayOfMonth?: number; // 1-31

  // PRICE trigger
  priceCondition?: {
    symbol: string;
    operator: '>' | '<' | '>=' | '<=';
    targetPrice: number;
  };

  // COST_BASIS trigger (평균 매수가 기준)
  costBasisCondition?: {
    symbol: string;
    operator: '>' | '<' | '>=' | '<=';
    differenceType: DifferenceType;
    differenceValue: number; // 비율(%) 또는 절대값($)
  };
}

export interface ITradingRule {
  id: string;
  triggerType: TriggerType;
  triggerConfig: ITriggerConfig;
  action: TradingAction;
  symbol: string;
  amountType: AmountType;
  amount: number; // 고정 금액($) 또는 비율(%)
}

export interface ITradeExecution {
  date: ISODateString;
  ruleId: string;
  action: TradingAction;
  symbol: string;
  shares: number;
  price: number;
  totalAmount: number;
  fee: number;
}
