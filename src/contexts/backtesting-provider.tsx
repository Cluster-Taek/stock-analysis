'use client';

import useLocalStorage from '@/hooks/use-local-storage';
import { BacktestingError, BACKTESTING_ERROR_CODES } from '@/types/errors';
import { IBacktestingParams, IBacktestingResult } from '@/types/investor';
import { buildTimelineData, createDividendMaps, fetchDividendData, fetchHistoricalData, runBacktestingSimulation } from '@/utils/backtesting-utils';
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
        throw new BacktestingError(
          '포트폴리오 데이터가 없습니다.',
          BACKTESTING_ERROR_CODES.INVALID_PARAMS,
          { params }
        );
      }

      setIsLoading(true);
      setBacktestingResult(null);

      try {
        // 1. 포트폴리오의 모든 종목 및 재투자 대상 종목 수집
        const allSymbolsToFetch = new Set<string>();
        params.portfolio.forEach((p) => {
          allSymbolsToFetch.add(p.symbol);
          if (p.strategy === 'REINVESTMENT' && p.reinvestmentTarget) {
            allSymbolsToFetch.add(p.reinvestmentTarget);
          }
        });
        const uniqueSymbols = Array.from(allSymbolsToFetch);

        // 2. 데이터 패칭
        const [fetchedResults, fetchedDividends] = await Promise.all([
          fetchHistoricalData(uniqueSymbols, params),
          fetchDividendData(uniqueSymbols)
        ]);

        console.log(fetchedResults);
        console.log(fetchedDividends);

        // 3. 데이터 가공
        const { dividendMapBySymbolAndDate, payableDividendMapBySymbolAndDate } = createDividendMaps(fetchedDividends);
        const timelineData = buildTimelineData(fetchedResults, dividendMapBySymbolAndDate);

        // 4. 시뮬레이션 준비
        const sortedDates = Array.from(timelineData.keys()).sort();
        if (sortedDates.length === 0) {
          throw new BacktestingError(
            '선택된 기간에 대한 데이터가 없습니다.',
            BACKTESTING_ERROR_CODES.NO_DATA_AVAILABLE,
            { startDate: params.startDate, endDate: params.endDate }
          );
        }

        // 모든 포트폴리오 종목의 데이터가 있는 실제 시작일 찾기
        let actualStartDate: string | null = null;
        for (const date of sortedDates) {
          const dailyData = timelineData.get(date);
          if (dailyData) {
            const allSymbolsHaveData = params.portfolio.every(
              (item) => dailyData.has(item.symbol) && dailyData.get(item.symbol)?.close != null
            );
            if (allSymbolsHaveData) {
              actualStartDate = date;
              break;
            }
          }
        }

        if (!actualStartDate) {
          throw new BacktestingError(
            '선택된 기간 내에 모든 포트폴리오 종목의 유효한 시작 가격을 찾을 수 없습니다.',
            BACKTESTING_ERROR_CODES.INVALID_START_DATE,
            { 
              requestedStartDate: params.startDate,
              availableDates: sortedDates.slice(0, 5),
              portfolioSymbols: params.portfolio.map(p => p.symbol)
            }
          );
        }

        const startIndex = sortedDates.indexOf(actualStartDate);
        const simulationDates = sortedDates.slice(startIndex);

        // 5. 시뮬레이션 실행
        const snapshots = runBacktestingSimulation(
          params,
          timelineData,
          payableDividendMapBySymbolAndDate,
          uniqueSymbols,
          actualStartDate,
          simulationDates
        );

        setBacktestingResult({ result: snapshots });
      } catch (error) {
        console.error('백테스팅 실패:', error);
        
        if (error instanceof BacktestingError) {
          console.error('BacktestingError:', {
            code: error.code,
            message: error.message,
            details: error.details
          });
        }
        
        throw error;
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
