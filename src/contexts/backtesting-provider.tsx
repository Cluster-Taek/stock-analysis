'use client';

import useLocalStorage from '@/hooks/use-local-storage';
import { IBacktestingParams, IBacktestingResult } from '@/types/investor';
import { createContext, useCallback, useContext, useState } from 'react';

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

const BacktestingProvider: React.FC<IBacktestingContextProps> = ({ children }) => {
  const { value: portfolioData, setValue: setPortfolioData } = useLocalStorage<IBacktestingParams | null>(
    'backtesting-params',
    null
  );
  const [backtestingResult, setBacktestingResult] = useState<IBacktestingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startBacktesting = useCallback(
    async (params: IBacktestingParams) => {
      try {
        if (!params) {
          return;
        }

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const result = await Promise.resolve({
          result: [],
        });

        console.log(params);

        setBacktestingResult(result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [setBacktestingResult, setIsLoading]
  );

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

export const useBacktesting = () => {
  const { backtestingResult, isLoading, setPortfolioData, portfolioData, startBacktesting } =
    useContext(BacktestingContext);

  return { backtestingResult, isLoading, setPortfolioData, portfolioData, startBacktesting };
};

export default BacktestingProvider;
