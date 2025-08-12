'use client';

import useLocalStorage from '@/hooks/use-local-storage';
import { IBacktestingParams, IBacktestingResult, IBacktestingSnapshot } from '@/types/investor';
import { ApiResponse, HistoricalDataResponse } from '@/types/yahoo-finance';
import { isYieldmaxSymbol } from '@/utils/yieldmax-utils';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// --- Context Definition (기존 코드와 동일) ---
interface IBacktestingContextType {
  backtestingResult: IBacktestingResult | null;
  isLoading: boolean;
  portfolioData: IBacktestingParams | null;
  setPortfolioData: (data: IBacktestingParams | null) => void;
  startBacktesting: (params: IBacktestingParams) => Promise<void>;
}

interface IBacktestingContextProps {
  children: React.ReactNode;
}

export const BacktestingContext = createContext<IBacktestingContextType>({} as IBacktestingContextType);

// --- Provider Implementation (startBacktesting 로직 구현) ---
const BacktestingProvider: React.FC<IBacktestingContextProps> = ({ children }) => {
  const { value: portfolioData, setValue: setPortfolioData } = useLocalStorage<IBacktestingParams | null>(
    'backtesting-params',
    null
  );
  const [backtestingResult, setBacktestingResult] = useState<IBacktestingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startBacktesting = useCallback(
    async (params: IBacktestingParams) => {
      if (!params || params.portfolio.length === 0) {
        return;
      }

      setIsLoading(true);
      setBacktestingResult(null); // 이전 결과 초기화

      try {
        // 1. 포트폴리오의 모든 종목 및 재투자 대상 종목에 대한 히스토리컬 데이터 병렬 요청
        const allSymbolsToFetch = new Set<string>();
        params.portfolio.forEach((p) => {
          allSymbolsToFetch.add(p.symbol);
          if (p.strategy === 'REINVESTMENT' && p.reinvestmentTarget) {
            allSymbolsToFetch.add(p.reinvestmentTarget);
          }
        });
        const uniqueSymbols = Array.from(allSymbolsToFetch);

        const dataPromises = uniqueSymbols.map((symbol) => {
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

        const dividendsPromises = uniqueSymbols
          .filter((symbol) => isYieldmaxSymbol(symbol))
          .map(async (symbol) => {
            const response = await fetch(`/api/stock/${symbol}/distribution`);
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            return { symbol, data: (await response.json()).data.distributionHistory };
          });

        const fetchedResults = await Promise.all(dataPromises);
        const fetchedDividends = await Promise.all(dividendsPromises);

        // 2. 조회하기 쉬운 형태로 데이터 가공: Map<날짜, Map<종목, {종가, 배당}>>
        const timelineData = new Map<string, Map<string, { adjclose: number; dividend: number }>>();
        const dividendMapBySymbolAndDate = new Map<string, Map<string, number>>();

        // Populate dividendMapBySymbolAndDate
        for (const { symbol, data: dividends } of fetchedDividends) {
          const dateMap = new Map<string, number>();
          dividends.forEach((div: { date: number; amount: number }) => {
            const dateStr = new Date(div.date).toISOString().split('T')[0];
            dateMap.set(dateStr, div.amount);
          });
          dividendMapBySymbolAndDate.set(symbol, dateMap);
        }

        for (const { symbol, data } of fetchedResults) {
          const timestamps = data.map((item) => item.date);
          const adjcloses = data.map((item) => item.adjustedClose);

          for (let i = 0; i < timestamps.length; i++) {
            const ts = timestamps[i];
            const adjclose = adjcloses[i];
            if (ts && adjclose != null) {
              const dateStr = new Date(ts).toISOString().split('T')[0];
              if (!timelineData.has(dateStr)) timelineData.set(dateStr, new Map());

              const dividendAmount = dividendMapBySymbolAndDate.get(symbol)?.get(dateStr) || 0;

              timelineData.get(dateStr)!.set(symbol, {
                adjclose: adjclose,
                dividend: dividendAmount,
              });
            }
          }
        }

        const sortedDates = Array.from(timelineData.keys()).sort();
        if (sortedDates.length === 0) throw new Error('선택된 기간에 대한 데이터가 없습니다.');

        // Find the actual start date for the simulation where all portfolio items have data
        let actualStartDate: string | null = null;
        for (const date of sortedDates) {
          const dailyData = timelineData.get(date);
          if (dailyData) {
            const allSymbolsHaveData = params.portfolio.every(
              (item) => dailyData.has(item.symbol) && dailyData.get(item.symbol)?.adjclose != null
            );
            if (allSymbolsHaveData) {
              actualStartDate = date;
              break;
            }
          }
        }

        if (!actualStartDate) {
          throw new Error('선택된 기간 내에 모든 포트폴리오 종목의 유효한 시작 가격을 찾을 수 없습니다.');
        }

        // 3. 포트폴리오 초기 상태 설정 (초기 투자금으로 각 종목의 주식 수 계산)
        const initialCapital = params.portfolio.reduce((sum, item) => sum + item.amount, 0);
        const portfolioState: Record<string, { shares: number }> = {};
        let cash = 0;

        // Initialize portfolioState for all unique symbols with 0 shares
        uniqueSymbols.forEach((symbol) => {
          portfolioState[symbol] = { shares: 0 };
        });

        const initialPrices = timelineData.get(actualStartDate)!;
        for (const item of params.portfolio) {
          const priceData = initialPrices.get(item.symbol);
          if (!priceData?.adjclose) {
            throw new Error(`${item.symbol}의 시작일(${actualStartDate}) 가격을 찾을 수 없습니다.`);
          }
          portfolioState[item.symbol] = {
            shares: (portfolioState[item.symbol]?.shares || 0) + item.amount / priceData.adjclose,
          };
        }

        // Adjust sortedDates to start from actualStartDate
        const startIndex = sortedDates.indexOf(actualStartDate);
        const simulationDates = sortedDates.slice(startIndex);

        // 4. 시뮬레이션 실행
        const snapshots: IBacktestingSnapshot[] = [];
        const lastKnownPrices: Record<string, number> = {};
        uniqueSymbols.forEach((s) => {
          lastKnownPrices[s] = timelineData.get(actualStartDate)?.get(s)?.adjclose || 0;
        });

        for (const date of simulationDates) {
          const dailyData = timelineData.get(date)!;
          let marketValue = 0;

          // 현재 보유 주식의 시장 가치 계산
          for (const symbol of uniqueSymbols) {
            const price = dailyData.get(symbol)?.adjclose || lastKnownPrices[symbol];
            lastKnownPrices[symbol] = price; // 마지막 가격 업데이트
            marketValue += (portfolioState[symbol]?.shares || 0) * price;
          }

          // 배당금 처리 및 재투자
          for (const item of params.portfolio) {
            const priceData = dailyData.get(item.symbol);
            if (priceData && priceData.dividend > 0) {
              const dividendReceived = (portfolioState[item.symbol]?.shares || 0) * priceData.dividend;
              if (item.strategy === 'REINVESTMENT' && item.reinvestmentTarget) {
                const targetSymbol = item.reinvestmentTarget;
                const targetPrice = dailyData.get(targetSymbol)?.adjclose || lastKnownPrices[targetSymbol];
                if (targetPrice > 0) {
                  const newShares = dividendReceived / targetPrice;
                  portfolioState[targetSymbol].shares += newShares;
                } else {
                  cash += dividendReceived; // 재투자 대상 가격 없으면 현금으로 보유
                }
              } else {
                cash += dividendReceived; // HOLD 전략은 현금으로 보유
              }
            }
          }

          const capital = marketValue + cash;
          const profit = capital - initialCapital;
          const profitRate = initialCapital > 0 ? profit / initialCapital : 0;

          snapshots.push({
            date,
            capital,
            profit,
            profitRate,
            profitRatePerDay: 0,
            profitRatePerWeek: 0,
            profitRatePerMonth: 0,
            profitRatePerYear: 0, // 우선 0으로 설정
          });
        }

        // 5. 최종 연평균수익률(CAGR) 계산
        if (snapshots.length > 1) {
          const first = snapshots[0];
          const last = snapshots[snapshots.length - 1];
          const years = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 31536000000; // 1년 (ms)
          if (years > 0) {
            last.profitRatePerYear = Math.pow(last.capital / first.capital, 1 / years) - 1;
          }
        }

        setBacktestingResult({ result: snapshots });
      } catch (error) {
        console.error('백테스팅 실패:', error);
        // 사용자에게 에러를 표시하기 위한 상태 추가 가능
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setBacktestingResult]
  );

  useEffect(() => {
    if (portfolioData) {
      setBacktestingResult(null);
    }
  }, [portfolioData]);

  return (
    <BacktestingContext.Provider
      value={{
        backtestingResult,
        isLoading,
        portfolioData,
        setPortfolioData,
        startBacktesting,
      }}
    >
      {children}
    </BacktestingContext.Provider>
  );
};

// --- Custom Hook (기존 코드와 동일) ---
export const useBacktesting = () => {
  const context = useContext(BacktestingContext);
  if (!context) {
    throw new Error('useBacktesting must be used within a BacktestingProvider');
  }
  return context;
};

export default BacktestingProvider;
