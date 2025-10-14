import { AmountType, IntervalType, TradingAction, TriggerType } from '@/types/investor';

export const BACKTESTING_CONSTANTS = {
  DIVIDEND_COMPARISON_TOLERANCE: 0.001,
  MILLISECONDS_PER_YEAR: 31536000000,
  DEFAULT_BUY_FEE_RATE: 0.1, // 0.1%
  DEFAULT_SELL_FEE_RATE: 0.1, // 0.1%
} as const;

// Trading Rule Constants
export const TRIGGER_TYPES: TriggerType[] = ['DATE', 'INTERVAL', 'PRICE'];
export const TRADING_ACTIONS: TradingAction[] = ['BUY', 'SELL'];
export const AMOUNT_TYPES: AmountType[] = ['FIXED', 'PERCENTAGE'];
export const INTERVAL_TYPES: IntervalType[] = ['DAILY', 'WEEKLY', 'MONTHLY'];

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  DATE: '특정 날짜',
  INTERVAL: '주기적',
  PRICE: '가격 조건',
};

export const TRADING_ACTION_LABELS: Record<TradingAction, string> = {
  BUY: '매수',
  SELL: '매도',
};

export const AMOUNT_TYPE_LABELS: Record<AmountType, string> = {
  FIXED: '고정 금액',
  PERCENTAGE: '비율',
};

export const INTERVAL_TYPE_LABELS: Record<IntervalType, string> = {
  DAILY: '매일',
  WEEKLY: '매주',
  MONTHLY: '매월',
};

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: '일요일',
  1: '월요일',
  2: '화요일',
  3: '수요일',
  4: '목요일',
  5: '금요일',
  6: '토요일',
};