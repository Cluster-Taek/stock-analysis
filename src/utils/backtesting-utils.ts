import { BACKTESTING_CONSTANTS } from '@/constants/backtesting';
import { DividendData, DividendResponse, HistoricalData, IBacktestingParams, IPendingDividend } from '@/types/investor';
import { ApiResponse, HistoricalDataResponse } from '@/types/yahoo-finance';
import { parseValidDate, toDateString } from './utils';
import { isYieldmaxSymbol } from './yieldmax-utils';

export async function fetchHistoricalData(
  symbols: string[],
  params: Pick<IBacktestingParams, 'startDate' | 'endDate' | 'interval'>
): Promise<HistoricalData[]> {
  const dataPromises = symbols.map((symbol) => {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      interval: params.interval,
    });
    return fetch(`/api/stock/historical/${symbol}?${queryParams}`).then(async (res) => {
      if (!res.ok) throw new Error(`[${symbol}] 데이터를 가져오지 못했습니다: ${res.statusText}`);
      const apiResponse: ApiResponse<HistoricalDataResponse> = await res.json();
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(`[${symbol}] API 오류: ${apiResponse.error || '데이터가 없습니다.'}`);
      }
      return { symbol, data: apiResponse.data };
    });
  });

  return Promise.all(dataPromises);
}

export async function fetchDividendData(symbols: string[]): Promise<DividendResponse[]> {
  const dividendsPromises = symbols
    .filter((symbol) => isYieldmaxSymbol(symbol))
    .map(async (symbol) => {
      const response = await fetch(`/api/stock/${symbol}/distribution`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      return { symbol, data: (await response.json()).data.distributionHistory };
    });

  return Promise.all(dividendsPromises);
}

export function createDividendMaps(fetchedDividends: DividendResponse[]): {
  dividendMapBySymbolAndDate: Map<string, Map<string, number>>;
  payableDividendMapBySymbolAndDate: Map<string, Map<string, number>>;
} {
  const dividendMapBySymbolAndDate = new Map<string, Map<string, number>>();
  const payableDividendMapBySymbolAndDate = new Map<string, Map<string, number>>();

  for (const { symbol, data: dividends } of fetchedDividends) {
    const exDateMap = new Map<string, number>();
    const payableDateMap = new Map<string, number>();
    
    dividends.forEach((div: DividendData) => {
      const baseDateStr = toDateString(div.date);
      
      const exDateStr = parseValidDate(div.exDate, baseDateStr);
      exDateMap.set(exDateStr, div.amount);
      
      const payableDateStr = parseValidDate(div.payableDate, exDateStr);
      payableDateMap.set(payableDateStr, div.amount);
    });
    
    dividendMapBySymbolAndDate.set(symbol, exDateMap);
    payableDividendMapBySymbolAndDate.set(symbol, payableDateMap);
  }

  return { dividendMapBySymbolAndDate, payableDividendMapBySymbolAndDate };
}

export function buildTimelineData(
  fetchedResults: HistoricalData[],
  dividendMapBySymbolAndDate: Map<string, Map<string, number>>
): Map<string, Map<string, { close: number; dividend: number }>> {
  const timelineData = new Map<string, Map<string, { close: number; dividend: number }>>();

  for (const { symbol, data } of fetchedResults) {
    for (const item of data) {
      if (item.date && item.close != null) {
        const dateStr = item.date; // 이미 YYYY-MM-DD 형식
        if (!timelineData.has(dateStr)) timelineData.set(dateStr, new Map());

        const dividendAmount = dividendMapBySymbolAndDate.get(symbol)?.get(dateStr) || 0;

        timelineData.get(dateStr)!.set(symbol, {
          close: item.close,
          dividend: dividendAmount,
        });
      }
    }
  }

  return timelineData;
}

export function findPayableDate(
  date: string,
  symbol: string,
  dividendAmount: number,
  payableDividendMapBySymbolAndDate: Map<string, Map<string, number>>
): string {
  const payableDateMap = payableDividendMapBySymbolAndDate.get(symbol);
  let payableDate = date;
  
  if (payableDateMap) {
    const entries = Array.from(payableDateMap.entries());
    const exactMatch = entries.find(([, amount]) => 
      Math.abs(amount - dividendAmount) < BACKTESTING_CONSTANTS.DIVIDEND_COMPARISON_TOLERANCE
    );
    
    if (exactMatch && exactMatch[0] >= date) {
      payableDate = exactMatch[0];
    } else {
      const futurePayments = entries.filter(([pDate]) => pDate >= date);
      if (futurePayments.length > 0) {
        futurePayments.sort(([a], [b]) => a.localeCompare(b));
        payableDate = futurePayments[0][0];
      }
    }
  }
  
  return payableDate;
}

export function processDividendPayment(
  dividend: IPendingDividend,
  dailyData: Map<string, { close: number; dividend: number }>,
  lastKnownPrices: Record<string, number>,
  portfolioState: Record<string, { shares: number }>
): number {
  let cashGenerated = 0;

  if (dividend.strategy === 'REINVESTMENT' && dividend.reinvestmentTarget) {
    const targetSymbol = dividend.reinvestmentTarget;
    const targetPrice = dailyData.get(targetSymbol)?.close || lastKnownPrices[targetSymbol];
    if (targetPrice > 0) {
      const newShares = dividend.amount / targetPrice;
      portfolioState[targetSymbol].shares += newShares;
    } else {
      cashGenerated = dividend.amount;
    }
  } else {
    cashGenerated = dividend.amount;
  }

  return cashGenerated;
}

export function calculateCAGR(
  initialCapital: number,
  finalCapital: number,
  startDate: string,
  endDate: string
): number {
  const years = (new Date(endDate).getTime() - new Date(startDate).getTime()) / BACKTESTING_CONSTANTS.MILLISECONDS_PER_YEAR;
  if (years <= 0) return 0;
  return Math.pow(finalCapital / initialCapital, 1 / years) - 1;
}

export function runBacktestingSimulation(
  params: IBacktestingParams,
  timelineData: Map<string, Map<string, { close: number; dividend: number }>>,
  payableDividendMapBySymbolAndDate: Map<string, Map<string, number>>,
  uniqueSymbols: string[],
  actualStartDate: string,
  simulationDates: string[]
) {
  const initialCapital = params.portfolio.reduce((sum, item) => sum + item.amount, 0);
  const portfolioState: Record<string, { shares: number }> = {};
  const lastKnownPrices: Record<string, number> = {};
  const pendingDividends: IPendingDividend[] = [];
  let cash = 0;

  // Initialize portfolio state
  uniqueSymbols.forEach((symbol) => {
    portfolioState[symbol] = { shares: 0 };
  });

  const initialPrices = timelineData.get(actualStartDate)!;
  for (const item of params.portfolio) {
    const priceData = initialPrices.get(item.symbol);
    if (!priceData?.close) {
      throw new Error(`${item.symbol}의 시작일(${actualStartDate}) 가격을 찾을 수 없습니다.`);
    }
    portfolioState[item.symbol] = {
      shares: (portfolioState[item.symbol]?.shares || 0) + item.amount / priceData.close,
    };
  }

  // Initialize last known prices
  uniqueSymbols.forEach((s) => {
    lastKnownPrices[s] = timelineData.get(actualStartDate)?.get(s)?.close || 0;
  });

  const snapshots = [];

  for (const date of simulationDates) {
    const dailyData = timelineData.get(date)!;
    let marketValue = 0;

    // Update market value and last known prices
    for (const symbol of uniqueSymbols) {
      const price = dailyData.get(symbol)?.close || lastKnownPrices[symbol];
      lastKnownPrices[symbol] = price;
      marketValue += (portfolioState[symbol]?.shares || 0) * price;
    }

    // Process dividend ex-dates for all held stocks
    for (const symbol of uniqueSymbols) {
      const shares = portfolioState[symbol]?.shares || 0;
      if (shares > 0) {
        const priceData = dailyData.get(symbol);
        if (priceData && priceData.dividend > 0) {
          const dividendReceived = shares * priceData.dividend;
          const payableDate = findPayableDate(date, symbol, priceData.dividend, payableDividendMapBySymbolAndDate);
          
          // Find the original portfolio item or reinvestment target configuration
          const originalItem = params.portfolio.find(item => item.symbol === symbol);
          const reinvestmentTarget = originalItem?.reinvestmentTarget || symbol; // Default to same symbol for reinvestment targets
          const strategy = originalItem?.strategy || 'REINVESTMENT'; // Default reinvestment for dividend stocks
          
          pendingDividends.push({
            symbol: symbol,
            amount: dividendReceived,
            payableDate,
            reinvestmentTarget: reinvestmentTarget,
            strategy: strategy
          });
        }
      }
    }

    // Process dividend payments
    const dividendsToExecute = pendingDividends.filter(dividend => dividend.payableDate === date);
    const remainingDividends = pendingDividends.filter(dividend => dividend.payableDate !== date);
    
    for (const dividend of dividendsToExecute) {
      cash += processDividendPayment(dividend, dailyData, lastKnownPrices, portfolioState);
    }
    
    // Update pending dividends queue
    pendingDividends.length = 0;
    pendingDividends.push(...remainingDividends);

    const capital = marketValue + cash;
    const profit = capital - initialCapital;
    const profitRate = initialCapital > 0 ? profit / initialCapital : 0;

    const currentHoldings: Record<string, number> = {};
    const currentPrices: Record<string, number> = {};
    Object.entries(portfolioState).forEach(([symbol, state]) => {
      currentHoldings[symbol] = state.shares;
      const price = dailyData.get(symbol)?.close || lastKnownPrices[symbol];
      if (price) {
        currentPrices[symbol] = price;
      }
    });

    snapshots.push({
      date,
      capital,
      profit,
      profitRate,
      profitRatePerDay: 0,
      profitRatePerWeek: 0,
      profitRatePerMonth: 0,
      profitRatePerYear: 0,
      cash,
      holdings: currentHoldings,
      currentPrices,
    });
  }

  // Calculate CAGR for the last snapshot
  if (snapshots.length > 1) {
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    last.profitRatePerYear = calculateCAGR(first.capital, last.capital, first.date, last.date);
  }

  return snapshots;
}