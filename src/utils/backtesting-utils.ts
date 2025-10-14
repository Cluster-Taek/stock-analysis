import { parseValidDate } from './utils';
import { isYieldmaxSymbol } from './yieldmax-utils';
import { checkTrigger, executeTrade, validateTradingRule } from './trading-utils';
import { BACKTESTING_CONSTANTS } from '@/constants/backtesting';
import { DividendData, DividendResponse, HistoricalData, IBacktestingParams, IPendingDividend, ITradeExecution } from '@/types/investor';
import { ApiResponse, HistoricalDataResponse } from '@/types/yahoo-finance';
import { DistributionHistoryItem } from '@/types/yieldmax';

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
      const apiResponse = await response.json();
      const distributionHistory = apiResponse.data.distributionHistory;

      // DistributionHistoryItem을 DividendData로 변환
      const convertedData: DividendData[] = distributionHistory.map((item: DistributionHistoryItem) => ({
        date: parseValidDate(item.date, item.date),
        amount: item.amount,
        exDate: item.exDate,
        payableDate: item.payableDate,
      }));

      return { symbol, data: convertedData };
    });

  return Promise.all(dividendsPromises);
}

export function createDividendMaps(fetchedDividends: DividendResponse[]): {
  dividendMapBySymbolAndDate: Map<string, Map<string, { dividend: number; payableDate: string }>>;
  payableDividendMapBySymbolAndDate: Map<string, Map<string, number>>;
} {
  const dividendMapBySymbolAndDate = new Map<string, Map<string, { dividend: number; payableDate: string }>>();
  const payableDividendMapBySymbolAndDate = new Map<string, Map<string, number>>();

  for (const { symbol, data: dividends } of fetchedDividends) {
    const exDateMap = new Map<string, { dividend: number; payableDate: string }>();
    const payableDateMap = new Map<string, number>();

    dividends.forEach((div: DividendData) => {
      // div.date는 이미 string 형태 (YYYY-MM-DD)
      const baseDateStr = div.date;

      const exDateStr = parseValidDate(div.exDate, baseDateStr);
      const payableDateStr = parseValidDate(div.payableDate, exDateStr);
      
      // ex-date에 배당금과 실제 payableDate 정보 저장
      exDateMap.set(exDateStr, {
        dividend: div.amount,
        payableDate: payableDateStr
      });

      payableDateMap.set(payableDateStr, div.amount);
    });

    dividendMapBySymbolAndDate.set(symbol, exDateMap);
    payableDividendMapBySymbolAndDate.set(symbol, payableDateMap);
  }

  // API에서 가져온 배당금 데이터 총계 출력
  console.log('📋 API에서 가져온 배당금 데이터 총계:');
  let totalApiDividends = 0;
  for (const { symbol, data: dividends } of fetchedDividends) {
    console.log(`  📊 ${symbol}: ${dividends.length}건`);
    totalApiDividends += dividends.length;
  }
  console.log(`  🔢 총 API 배당금 데이터: ${totalApiDividends}건`);

  return { dividendMapBySymbolAndDate, payableDividendMapBySymbolAndDate };
}

export function buildTimelineData(
  fetchedResults: HistoricalData[],
  dividendMapBySymbolAndDate: Map<string, Map<string, { dividend: number; payableDate: string }>>
): Map<string, Map<string, { close: number; dividend: number; payableDate?: string }>> {
  const timelineData = new Map<string, Map<string, { close: number; dividend: number; payableDate?: string }>>();

  for (const { symbol, data } of fetchedResults) {
    for (const item of data) {
      if (item.date && item.close != null) {
        const dateStr = item.date; // 이미 YYYY-MM-DD 형식
        if (!timelineData.has(dateStr)) timelineData.set(dateStr, new Map());

        const dividendInfo = dividendMapBySymbolAndDate.get(symbol)?.get(dateStr);
        const dividendAmount = dividendInfo?.dividend || 0;
        const payableDate = dividendInfo?.payableDate;

        timelineData.get(dateStr)!.set(symbol, {
          close: item.close,
          dividend: dividendAmount,
          payableDate: payableDate,
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
    const exactMatch = entries.find(
      ([, amount]) => Math.abs(amount - dividendAmount) < BACKTESTING_CONSTANTS.DIVIDEND_COMPARISON_TOLERANCE
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
  const years =
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / BACKTESTING_CONSTANTS.MILLISECONDS_PER_YEAR;
  if (years <= 0) return 0;
  return Math.pow(finalCapital / initialCapital, 1 / years) - 1;
}

export function runBacktestingSimulation(
  params: IBacktestingParams,
  timelineData: Map<string, Map<string, { close: number; dividend: number; payableDate?: string }>>,
  payableDividendMapBySymbolAndDate: Map<string, Map<string, number>>,
  uniqueSymbols: string[],
  actualStartDate: string,
  simulationDates: string[],
  buyFeeRate: number = BACKTESTING_CONSTANTS.DEFAULT_BUY_FEE_RATE,
  sellFeeRate: number = BACKTESTING_CONSTANTS.DEFAULT_SELL_FEE_RATE
) {
  // 배당금 발생 횟수 추적
  const dividendOccurrences: Record<string, number> = {};
  uniqueSymbols.forEach(symbol => {
    dividendOccurrences[symbol] = 0;
  });

  // 거래 규칙 가져오기 및 검증
  const tradingRules = params.tradingRules || [];
  if (tradingRules.length > 0) {
    console.log(`📋 거래 규칙 ${tradingRules.length}개 로드됨`);
    tradingRules.forEach((rule, index) => {
      const validation = validateTradingRule(rule);
      if (!validation.valid) {
        console.warn(`⚠️ 거래 규칙 ${index + 1} 검증 실패:`, validation.errors);
      }
    });
  }

  const portfolioTotal = params.portfolio.reduce((sum, item) => sum + item.amount, 0);
  const initialCashAmount = params.initialCash || 0;
  const initialCapital = portfolioTotal + initialCashAmount;
  const portfolioState: Record<string, { shares: number }> = {};
  const lastKnownPrices: Record<string, number> = {};
  const pendingDividends: IPendingDividend[] = [];
  let cash = initialCashAmount;

  // Initialize portfolio state
  uniqueSymbols.forEach((symbol) => {
    portfolioState[symbol] = { shares: 0 };
  });

  // 포트폴리오가 있는 경우만 초기 매수 진행
  if (params.portfolio.length > 0) {
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
          // API에서 제공하는 실제 payableDate 사용
          const payableDate = priceData.payableDate || date; // fallback to ex-date if no payableDate

          // 배당금 발생 횟수 증가
          dividendOccurrences[symbol]++;

          // 백테스팅 종료일과 비교
          const lastDate = simulationDates[simulationDates.length - 1];
          const willBeProcessed = payableDate <= lastDate;
          
          console.log(`📊 [${date}] ${symbol} 배당금 발생 (${dividendOccurrences[symbol]}회차):`);
          console.log(`  - 보유주식: ${shares.toFixed(2)}주`);
          console.log(`  - 주당배당금: $${priceData.dividend}`);
          console.log(`  - 총 배당금: $${dividendReceived.toFixed(2)}`);
          console.log(`  - 지급예정일: ${payableDate} ${willBeProcessed ? '✅' : '❌ (기간 외)'}`);
          console.log(`  - 백테스팅 종료: ${lastDate}`);

          // Find the original portfolio item or reinvestment target configuration
          const originalItem = params.portfolio.find((item) => item.symbol === symbol);
          const reinvestmentTarget = originalItem?.reinvestmentTarget || symbol; // Default to same symbol for reinvestment targets
          const strategy = originalItem?.strategy || 'REINVESTMENT'; // Default reinvestment for dividend stocks

          pendingDividends.push({
            symbol: symbol,
            amount: dividendReceived,
            payableDate,
            reinvestmentTarget: reinvestmentTarget,
            strategy: strategy,
          });
        }
      }
    }

    // Process dividend payments
    const dividendsToExecute = pendingDividends.filter((dividend) => dividend.payableDate === date);
    const remainingDividends = pendingDividends.filter((dividend) => dividend.payableDate !== date);

    const dividendsReceived: Record<string, number> = {};
    if (dividendsToExecute.length > 0) {
      console.log(`💰 [${date}] 배당금 지급 처리:`);
    }
    
    for (const dividend of dividendsToExecute) {
      const cashGenerated = processDividendPayment(dividend, dailyData, lastKnownPrices, portfolioState);
      cash += cashGenerated;
      dividendsReceived[dividend.symbol] = (dividendsReceived[dividend.symbol] || 0) + dividend.amount;
      
      console.log(`  💵 ${dividend.symbol}: $${dividend.amount.toFixed(2)} (${dividend.strategy === 'REINVESTMENT' ? '재투자' : '현금'}) → 현금 증가: $${cashGenerated.toFixed(2)}`);
    }

    // Update pending dividends queue
    pendingDividends.length = 0;
    pendingDividends.push(...remainingDividends);

    // Process trading rules
    const trades: ITradeExecution[] = [];
    if (tradingRules.length > 0) {
      for (const rule of tradingRules) {
        // Check if trigger conditions are met
        const triggerMet = checkTrigger(rule, date, lastKnownPrices);

        if (triggerMet) {
          console.log(`🎯 [${date}] 거래 규칙 트리거: ${rule.action} ${rule.symbol}`);

          // Ensure symbol exists in portfolio state
          if (!portfolioState[rule.symbol]) {
            portfolioState[rule.symbol] = { shares: 0 };
          }

          const currentPrice = dailyData.get(rule.symbol)?.close || lastKnownPrices[rule.symbol];
          if (!currentPrice) {
            console.warn(`⚠️ [${date}] ${rule.symbol}의 가격 정보 없음, 거래 건너뜀`);
            continue;
          }

          const feeRate = rule.action === 'BUY' ? buyFeeRate : sellFeeRate;

          const tradeResult = executeTrade(rule, {
            currentDate: date,
            currentPrice,
            cash,
            shares: portfolioState[rule.symbol].shares,
            feeRate,
          });

          if (tradeResult.success && tradeResult.execution) {
            // Update portfolio state
            cash = tradeResult.newCash;
            portfolioState[rule.symbol].shares = tradeResult.newShares;
            trades.push(tradeResult.execution);

            console.log(`✅ [${date}] ${rule.action} 실행 완료:`);
            console.log(`  - 심볼: ${rule.symbol}`);
            console.log(`  - 주식 수: ${tradeResult.execution.shares.toFixed(4)}주`);
            console.log(`  - 가격: $${currentPrice.toFixed(2)}`);
            console.log(`  - 거래 금액: $${tradeResult.execution.totalAmount.toFixed(2)}`);
            console.log(`  - 수수료: $${tradeResult.execution.fee.toFixed(2)}`);
            console.log(`  - 새 현금 잔고: $${cash.toFixed(2)}`);
            console.log(`  - 새 보유 주식: ${portfolioState[rule.symbol].shares.toFixed(4)}주`);
          } else {
            console.warn(`❌ [${date}] ${rule.action} 실행 실패: ${tradeResult.errorMessage}`);
          }
        }
      }
    }

    // Recalculate market value after trades
    marketValue = 0;
    for (const symbol of uniqueSymbols) {
      const price = dailyData.get(symbol)?.close || lastKnownPrices[symbol];
      lastKnownPrices[symbol] = price;
      marketValue += (portfolioState[symbol]?.shares || 0) * price;
    }

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

    // 배당금이 기록된 날짜의 스냅샷 로그
    if (Object.keys(dividendsReceived).length > 0) {
      console.log(`📈 [${date}] 스냅샷에 배당금 기록:`);
      Object.entries(dividendsReceived).forEach(([symbol, amount]) => {
        console.log(`  📊 ${symbol}: $${amount.toFixed(2)}`);
      });
      console.log(`  💼 총 자본: $${capital.toFixed(2)} (현금: $${cash.toFixed(2)})`);
    }

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
      dividendsReceived: Object.keys(dividendsReceived).length > 0 ? dividendsReceived : undefined,
      trades: trades.length > 0 ? trades : undefined,
    });
  }

  // Calculate CAGR for the last snapshot
  if (snapshots.length > 1) {
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    last.profitRatePerYear = calculateCAGR(first.capital, last.capital, first.date, last.date);
  }

  // 배당금 발생 횟수 총계 출력
  console.log('🎯 백테스팅 배당금 발생 횟수 총계:');
  const totalDividendOccurrences = Object.values(dividendOccurrences).reduce((sum, count) => sum + count, 0);
  Object.entries(dividendOccurrences).forEach(([symbol, count]) => {
    console.log(`  📊 ${symbol}: ${count}회`);
  });
  console.log(`  🔢 총 배당금 발생: ${totalDividendOccurrences}회`);
  
  // 미지급 배당금 확인 (백테스팅 기간을 벗어난 케이스들)
  if (pendingDividends.length > 0) {
    const lastSimulationDate = simulationDates[simulationDates.length - 1];
    console.log('⏳ 백테스팅 기간을 벗어난 미지급 배당금들:');
    console.log(`   📅 백테스팅 종료일: ${lastSimulationDate}`);
    console.log('');
    
    pendingDividends.forEach((div, index) => {
      const isOutsideRange = div.payableDate > lastSimulationDate;
      console.log(`  💸 #${index + 1} ${div.symbol}:`);
      console.log(`     💰 금액: $${div.amount.toFixed(2)}`);
      console.log(`     📅 지급예정일: ${div.payableDate}`);
      console.log(`     ⚠️ 기간 초과: ${isOutsideRange ? 'YES' : 'NO'} (${isOutsideRange ? div.payableDate + ' > ' + lastSimulationDate : '기간 내'})`);
      console.log(`     🔄 전략: ${div.strategy}`);
      if (div.reinvestmentTarget) {
        console.log(`     🎯 재투자 대상: ${div.reinvestmentTarget}`);
      }
      console.log('');
    });
    console.log(`  🔢 미지급 배당금 총 ${pendingDividends.length}건`);
    
    const outsideRangeCount = pendingDividends.filter(div => div.payableDate > lastSimulationDate).length;
    const withinRangeCount = pendingDividends.length - outsideRangeCount;
    
    if (outsideRangeCount > 0) {
      console.log(`  📊 기간 초과: ${outsideRangeCount}건`);
    }
    if (withinRangeCount > 0) {
      console.log(`  📊 기간 내 미처리: ${withinRangeCount}건 (처리 로직 확인 필요)`);
    }
  }
  
  // 실제 지급된 배당금 총계
  const totalPaidDividends = snapshots.reduce((total, snapshot) => {
    if (snapshot.dividendsReceived) {
      return total + Object.keys(snapshot.dividendsReceived).length;
    }
    return total;
  }, 0);
  
  console.log(`💰 실제 지급된 배당금: ${totalPaidDividends}회`);
  console.log(`📊 차트 표시 예상: ${totalPaidDividends}회`);
  
  if (totalDividendOccurrences !== totalPaidDividends) {
    console.log(`⚠️ 차이: ${totalDividendOccurrences - totalPaidDividends}회 미지급`);
  }

  return snapshots;
}
