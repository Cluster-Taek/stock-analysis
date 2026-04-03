'use client';

import useLocalStorage from '@/hooks/use-local-storage';
import { BacktestingError, BACKTESTING_ERROR_CODES } from '@/types/errors';
import { IBacktestingParams, IBacktestingResult, IBacktestingConfig } from '@/types/investor';
import { buildTimelineData, createDividendMaps, fetchDividendData, fetchHistoricalData, runBacktestingSimulation } from '@/utils/backtesting-utils';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// --- Context Definition (다중 포트폴리오 지원) ---
interface IBacktestingContextType {
  portfolios: IBacktestingParams[];
  selectedPortfolios: Set<string>;
  backtestingResults: IBacktestingResult[];
  isLoading: boolean;
  addPortfolio: (data: IBacktestingParams) => void;
  updatePortfolio: (id: string, data: IBacktestingParams) => void;
  deletePortfolio: (id: string) => void;
  togglePortfolioSelection: (id: string) => void;
  startBacktesting: (portfolioIds: string[], config: IBacktestingConfig) => Promise<void>;
}

interface IBacktestingContextProps {
  children: React.ReactNode;
}

export const BacktestingContext = createContext<IBacktestingContextType>({} as IBacktestingContextType);

// --- Provider Implementation (다중 포트폴리오 지원) ---
const BacktestingProvider: React.FC<IBacktestingContextProps> = ({ children }) => {
  const { value: portfolios, setValue: setPortfolios } = useLocalStorage<IBacktestingParams[]>(
    'backtesting-portfolios',
    []
  );
  const [selectedPortfolios, setSelectedPortfolios] = useState<Set<string>>(new Set());
  const [backtestingResults, setBacktestingResults] = useState<IBacktestingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 포트폴리오 추가
  const addPortfolio = useCallback((data: IBacktestingParams) => {
    const id = crypto.randomUUID();
    const portfolioWithId = { ...data, id };
    setPortfolios(prev => [...prev, portfolioWithId]);

    // 새로 추가된 포트폴리오를 자동으로 선택
    setSelectedPortfolios(prev => new Set([...Array.from(prev), id]));
  }, [setPortfolios]);

  // 포트폴리오 수정
  const updatePortfolio = useCallback((id: string, data: IBacktestingParams) => {
    setPortfolios(prev => prev.map(p =>
      p.id === id ? { ...data, id } : p
    ));
  }, [setPortfolios]);

  // 포트폴리오 삭제
  const deletePortfolio = useCallback((id: string) => {
    setPortfolios(prev => prev.filter(p => p.id !== id));

    // 선택된 포트폴리오에서도 제거
    setSelectedPortfolios(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });

    // 백테스팅 결과에서도 제거
    setBacktestingResults(prev => prev.filter(r => r.portfolioId !== id));
  }, [setPortfolios]);

  // 포트폴리오 선택/해제 토글
  const togglePortfolioSelection = useCallback((id: string) => {
    setSelectedPortfolios(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // 백테스팅 실행 (여러 포트폴리오)
  const startBacktesting = useCallback(async (portfolioIds: string[], config: IBacktestingConfig) => {
    if (portfolioIds.length === 0) {
      throw new BacktestingError(
        '선택된 포트폴리오가 없습니다.',
        BACKTESTING_ERROR_CODES.INVALID_PARAMS,
        { portfolioIds }
      );
    }

    setIsLoading(true);
    setBacktestingResults([]);

    try {
      const selectedPortfolioData = portfolios.filter(p => p.id && portfolioIds.includes(p.id));
      const results: IBacktestingResult[] = [];
      const failedPortfolios: Array<{ name: string; error: string }> = [];

      // 각 포트폴리오에 대해 병렬로 백테스팅 실행
      await Promise.all(
        selectedPortfolioData.map(async (params) => {
          try {
            // 백테스팅 설정을 포트폴리오 데이터와 합치기
            const paramsWithConfig = { ...params, ...config };

            // 1. 포트폴리오의 모든 종목 및 재투자 대상 종목, 거래 규칙 종목 수집
            const allSymbolsToFetch = new Set<string>();
            paramsWithConfig.portfolio.forEach((p) => {
              allSymbolsToFetch.add(p.symbol);
              if (p.strategy === 'REINVESTMENT' && p.reinvestmentTarget) {
                allSymbolsToFetch.add(p.reinvestmentTarget);
              }
            });

            // 거래 규칙에서 사용하는 종목들도 추가
            if (paramsWithConfig.tradingRules) {
              paramsWithConfig.tradingRules.forEach((rule) => {
                allSymbolsToFetch.add(rule.symbol);
                // PRICE 트리거의 경우 모니터링할 종목도 추가
                if (rule.triggerType === 'PRICE' && rule.triggerConfig.priceCondition) {
                  allSymbolsToFetch.add(rule.triggerConfig.priceCondition.symbol);
                }
                // COST_BASIS 트리거의 경우 모니터링할 종목도 추가
                if (rule.triggerType === 'COST_BASIS' && rule.triggerConfig.costBasisCondition) {
                  allSymbolsToFetch.add(rule.triggerConfig.costBasisCondition.symbol);
                }
                // RSI 트리거의 경우 모니터링할 종목도 추가
                if (rule.triggerType === 'RSI' && rule.triggerConfig.rsiCondition) {
                  allSymbolsToFetch.add(rule.triggerConfig.rsiCondition.symbol);
                }
              });
            }

            const uniqueSymbols = Array.from(allSymbolsToFetch);

            // 2. 데이터 패칭
            const [fetchedResults, fetchedDividends] = await Promise.all([
              fetchHistoricalData(uniqueSymbols, paramsWithConfig),
              fetchDividendData(uniqueSymbols)
            ]);

            // 3. 데이터 가공
            const { dividendMapBySymbolAndDate, payableDividendMapBySymbolAndDate } = createDividendMaps(fetchedDividends);
            const timelineData = buildTimelineData(fetchedResults, dividendMapBySymbolAndDate);

            // 4. 시뮬레이션 준비
            const sortedDates = Array.from(timelineData.keys()).sort();
            if (sortedDates.length === 0) {
              throw new BacktestingError(
                '선택된 기간에 대한 데이터가 없습니다.',
                BACKTESTING_ERROR_CODES.NO_DATA_AVAILABLE,
                { startDate: config.startDate, endDate: config.endDate }
              );
            }

            // 모든 포트폴리오 종목의 데이터가 있는 실제 시작일 찾기
            let actualStartDate: string | null = null;

            if (paramsWithConfig.portfolio.length > 0) {
              // 포트폴리오가 있는 경우: 모든 종목의 데이터가 있는 날짜 찾기
              for (const date of sortedDates) {
                const dailyData = timelineData.get(date);
                if (dailyData) {
                  const allSymbolsHaveData = paramsWithConfig.portfolio.every(
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
                    requestedStartDate: config.startDate,
                    availableDates: sortedDates.slice(0, 5),
                    portfolioSymbols: paramsWithConfig.portfolio.map(p => p.symbol)
                  }
                );
              }
            } else {
              // 포트폴리오가 없는 경우 (현금 + 거래 규칙만): 첫 데이터 날짜 사용
              actualStartDate = sortedDates[0];
              if (!actualStartDate) {
                throw new BacktestingError(
                  '선택된 기간에 유효한 데이터가 없습니다.',
                  BACKTESTING_ERROR_CODES.NO_DATA_AVAILABLE,
                  {
                    requestedStartDate: config.startDate,
                    requestedEndDate: config.endDate
                  }
                );
              }
            }

            const startIndex = sortedDates.indexOf(actualStartDate);
            const simulationDates = sortedDates.slice(startIndex);

            // 5. 시뮬레이션 실행
            const snapshots = runBacktestingSimulation(
              paramsWithConfig,
              timelineData,
              payableDividendMapBySymbolAndDate,
              uniqueSymbols,
              actualStartDate,
              simulationDates,
              config.buyFeeRate,
              config.sellFeeRate
            );

            if (params.id) {
              results.push({
                result: snapshots,
                portfolioId: params.id,
                portfolioName: params.name
              });
            }
          } catch (error) {
            console.error(`백테스팅 실패 (${params.name}):`, error);
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
            failedPortfolios.push({ name: params.name, error: errorMessage });
          }
        })
      );

      setBacktestingResults(results);

      // 실패한 포트폴리오가 있으면 사용자에게 알림
      if (failedPortfolios.length > 0) {
        const failedNames = failedPortfolios.map(f => `${f.name}: ${f.error}`).join('\n');
        console.warn(`⚠️ 다음 포트폴리오의 백테스팅이 실패했습니다:\n${failedNames}`);
        throw new BacktestingError(
          `${failedPortfolios.length}개 포트폴리오의 백테스팅이 실패했습니다`,
          BACKTESTING_ERROR_CODES.SIMULATION_FAILED,
          { failedPortfolios }
        );
      }
    } catch (error) {
      console.error('백테스팅 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [portfolios]);

  // 포트폴리오가 변경되면 백테스팅 결과 초기화
  useEffect(() => {
    setBacktestingResults([]);
  }, [portfolios]);

  return (
    <BacktestingContext.Provider
      value={{
        portfolios,
        selectedPortfolios,
        backtestingResults,
        isLoading,
        addPortfolio,
        updatePortfolio,
        deletePortfolio,
        togglePortfolioSelection,
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
