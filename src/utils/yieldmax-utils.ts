import { YIELDMAX_SYMBOLS } from '@/constants/yieldmax-constants';

export const isYieldmaxSymbol = (symbol: string) => {
  return YIELDMAX_SYMBOLS.some((item) => item.symbol === symbol);
};
