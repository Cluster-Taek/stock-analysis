import { ITradeExecution, ITradingRule } from '@/types/investor';

// ============================================
// Trigger Evaluation Functions
// ============================================

/**
 * 날짜 기반 트리거 체크
 */
function checkDateTrigger(rule: ITradingRule, currentDate: string): boolean {
  if (!rule.triggerConfig.date) return false;
  return rule.triggerConfig.date === currentDate;
}

/**
 * 주기 기반 트리거 체크
 */
function checkIntervalTrigger(rule: ITradingRule, currentDate: string): boolean {
  const { intervalType, dayOfWeek, dayOfMonth } = rule.triggerConfig;
  if (!intervalType) return false;

  const date = new Date(currentDate);

  switch (intervalType) {
    case 'DAILY':
      return true; // 매일 실행

    case 'WEEKLY':
      if (dayOfWeek === undefined) return false;
      return date.getDay() === dayOfWeek;

    case 'MONTHLY':
      if (!dayOfMonth) return false;
      // 해당 월의 일자가 dayOfMonth와 일치하는지 확인
      // 예: 31일을 설정했는데 2월인 경우는 마지막 날에 실행
      const currentDay = date.getDate();
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

      if (dayOfMonth > lastDayOfMonth) {
        // 설정한 일자가 해당 월의 마지막 날보다 크면 마지막 날에 실행
        return currentDay === lastDayOfMonth;
      }

      return currentDay === dayOfMonth;

    default:
      return false;
  }
}

/**
 * 가격 조건 기반 트리거 체크
 */
function checkPriceTrigger(
  rule: ITradingRule,
  currentPrices: Record<string, number>
): boolean {
  const { priceCondition } = rule.triggerConfig;
  if (!priceCondition) return false;

  const currentPrice = currentPrices[priceCondition.symbol];
  if (!currentPrice) return false;

  switch (priceCondition.operator) {
    case '>':
      return currentPrice > priceCondition.targetPrice;
    case '<':
      return currentPrice < priceCondition.targetPrice;
    case '>=':
      return currentPrice >= priceCondition.targetPrice;
    case '<=':
      return currentPrice <= priceCondition.targetPrice;
    default:
      return false;
  }
}

/**
 * 평균 매수가 기준 트리거 체크
 */
function checkCostBasisTrigger(
  rule: ITradingRule,
  currentPrices: Record<string, number>,
  costBasis: Record<string, number>
): boolean {
  const { costBasisCondition } = rule.triggerConfig;
  if (!costBasisCondition) return false;

  const currentPrice = currentPrices[costBasisCondition.symbol];
  const avgCostBasis = costBasis[costBasisCondition.symbol];

  // 가격 정보나 평균 매수가가 없으면 false
  if (!currentPrice || !avgCostBasis || avgCostBasis <= 0) return false;

  // 차이값 계산
  let difference = 0;
  if (costBasisCondition.differenceType === 'PERCENTAGE') {
    // 비율: (현재가 - 평균매수가) / 평균매수가 * 100
    difference = ((currentPrice - avgCostBasis) / avgCostBasis) * 100;
  } else {
    // 절대값: 현재가 - 평균매수가
    difference = currentPrice - avgCostBasis;
  }

  // 연산자에 따라 비교
  switch (costBasisCondition.operator) {
    case '>':
      return difference > costBasisCondition.differenceValue;
    case '<':
      return difference < costBasisCondition.differenceValue;
    case '>=':
      return difference >= costBasisCondition.differenceValue;
    case '<=':
      return difference <= costBasisCondition.differenceValue;
    default:
      return false;
  }
}

/**
 * 트리거 체커 맵 (확장 가능한 구조)
 * 새로운 트리거 타입 추가 시 여기에 함수만 추가하면 됨
 */
type TriggerChecker = (
  rule: ITradingRule,
  currentDate: string,
  currentPrices: Record<string, number>,
  costBasis: Record<string, number>
) => boolean;

const TRIGGER_CHECKERS: Record<string, TriggerChecker> = {
  DATE: (rule, currentDate) => checkDateTrigger(rule, currentDate),
  INTERVAL: (rule, currentDate) => checkIntervalTrigger(rule, currentDate),
  PRICE: (rule, currentDate, currentPrices) => checkPriceTrigger(rule, currentPrices),
  COST_BASIS: (rule, currentDate, currentPrices, costBasis) => checkCostBasisTrigger(rule, currentPrices, costBasis),
};

/**
 * 트리거 조건 체크 (통합 함수)
 */
export function checkTrigger(
  rule: ITradingRule,
  currentDate: string,
  currentPrices: Record<string, number>,
  costBasis: Record<string, number> = {}
): boolean {
  const checker = TRIGGER_CHECKERS[rule.triggerType];
  if (!checker) {
    console.warn(`Unknown trigger type: ${rule.triggerType}`);
    return false;
  }

  return checker(rule, currentDate, currentPrices, costBasis);
}

// ============================================
// Fee Calculation
// ============================================

/**
 * 수수료 계산
 * @param amount 거래 금액
 * @param feeRate 수수료율 (%)
 * @returns 수수료 금액
 */
export function calculateFee(amount: number, feeRate: number = 0): number {
  return (amount * feeRate) / 100;
}

// ============================================
// Trade Execution Functions
// ============================================

interface ITradeContext {
  currentDate: string;
  currentPrice: number;
  cash: number;
  shares: number;
  feeRate: number;
}

interface ITradeResult {
  success: boolean;
  execution?: ITradeExecution;
  newCash: number;
  newShares: number;
  errorMessage?: string;
}

/**
 * 매수 실행
 */
export function executeBuy(
  rule: ITradingRule,
  context: ITradeContext
): ITradeResult {
  const { currentDate, currentPrice, cash, shares, feeRate } = context;

  // 매수할 금액 계산
  let buyAmount = 0;
  if (rule.amountType === 'FIXED') {
    buyAmount = rule.amount;
  } else {
    // PERCENTAGE - 현금의 일정 비율
    buyAmount = (cash * rule.amount) / 100;
  }

  // 사용 가능한 금액 체크
  if (buyAmount > cash) {
    return {
      success: false,
      newCash: cash,
      newShares: shares,
      errorMessage: `Insufficient cash: required $${buyAmount.toFixed(2)}, available $${cash.toFixed(2)}`,
    };
  }

  // 수수료 계산
  const fee = calculateFee(buyAmount, feeRate);
  const totalCost = buyAmount + fee;

  // 다시 한번 체크
  if (totalCost > cash) {
    return {
      success: false,
      newCash: cash,
      newShares: shares,
      errorMessage: `Insufficient cash including fee: required $${totalCost.toFixed(2)}, available $${cash.toFixed(2)}`,
    };
  }

  // 매수 가능한 주식 수 계산
  const sharesToBuy = buyAmount / currentPrice;

  const execution: ITradeExecution = {
    date: currentDate,
    ruleId: rule.id,
    action: 'BUY',
    symbol: rule.symbol,
    shares: sharesToBuy,
    price: currentPrice,
    totalAmount: buyAmount,
    fee: fee,
  };

  return {
    success: true,
    execution,
    newCash: cash - totalCost,
    newShares: shares + sharesToBuy,
  };
}

/**
 * 매도 실행
 */
export function executeSell(
  rule: ITradingRule,
  context: ITradeContext
): ITradeResult {
  const { currentDate, currentPrice, cash, shares, feeRate } = context;

  // 보유 주식 체크
  if (shares <= 0) {
    return {
      success: false,
      newCash: cash,
      newShares: shares,
      errorMessage: `No shares to sell for ${rule.symbol}`,
    };
  }

  // 매도할 주식 수 계산
  let sharesToSell = 0;
  if (rule.amountType === 'FIXED') {
    // FIXED - 금액 기준으로 매도할 주식 수 계산
    sharesToSell = rule.amount / currentPrice;
  } else {
    // PERCENTAGE - 보유 주식의 일정 비율
    sharesToSell = (shares * rule.amount) / 100;
  }

  // 보유 주식보다 많이 매도하려는 경우 보유 주식만 매도
  if (sharesToSell > shares) {
    sharesToSell = shares;
  }

  // 매도 금액 계산
  const sellAmount = sharesToSell * currentPrice;
  const fee = calculateFee(sellAmount, feeRate);
  const netProceeds = sellAmount - fee;

  const execution: ITradeExecution = {
    date: currentDate,
    ruleId: rule.id,
    action: 'SELL',
    symbol: rule.symbol,
    shares: sharesToSell,
    price: currentPrice,
    totalAmount: sellAmount,
    fee: fee,
  };

  return {
    success: true,
    execution,
    newCash: cash + netProceeds,
    newShares: shares - sharesToSell,
  };
}

/**
 * 거래 실행 (통합 함수)
 */
export function executeTrade(
  rule: ITradingRule,
  context: ITradeContext
): ITradeResult {
  if (rule.action === 'BUY') {
    return executeBuy(rule, context);
  } else {
    return executeSell(rule, context);
  }
}

// ============================================
// Validation Functions
// ============================================

/**
 * 거래 규칙 유효성 검증
 */
export function validateTradingRule(rule: ITradingRule): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!rule.symbol) {
    errors.push('Symbol is required');
  }

  if (rule.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (rule.triggerType === 'DATE' && !rule.triggerConfig.date) {
    errors.push('Date is required for DATE trigger');
  }

  if (rule.triggerType === 'INTERVAL') {
    if (!rule.triggerConfig.intervalType) {
      errors.push('Interval type is required for INTERVAL trigger');
    }
    if (rule.triggerConfig.intervalType === 'WEEKLY' && rule.triggerConfig.dayOfWeek === undefined) {
      errors.push('Day of week is required for WEEKLY interval');
    }
    if (rule.triggerConfig.intervalType === 'MONTHLY' && !rule.triggerConfig.dayOfMonth) {
      errors.push('Day of month is required for MONTHLY interval');
    }
  }

  if (rule.triggerType === 'PRICE') {
    if (!rule.triggerConfig.priceCondition) {
      errors.push('Price condition is required for PRICE trigger');
    } else {
      if (!rule.triggerConfig.priceCondition.symbol) {
        errors.push('Symbol is required for PRICE trigger');
      }
      if (!rule.triggerConfig.priceCondition.operator) {
        errors.push('Operator is required for PRICE trigger');
      }
      if (rule.triggerConfig.priceCondition.targetPrice <= 0) {
        errors.push('Target price must be greater than 0 for PRICE trigger');
      }
    }
  }

  if (rule.triggerType === 'COST_BASIS') {
    if (!rule.triggerConfig.costBasisCondition) {
      errors.push('Cost basis condition is required for COST_BASIS trigger');
    } else {
      if (!rule.triggerConfig.costBasisCondition.symbol) {
        errors.push('Symbol is required for COST_BASIS trigger');
      }
      if (!rule.triggerConfig.costBasisCondition.operator) {
        errors.push('Operator is required for COST_BASIS trigger');
      }
      if (!rule.triggerConfig.costBasisCondition.differenceType) {
        errors.push('Difference type is required for COST_BASIS trigger');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
