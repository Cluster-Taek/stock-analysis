import { IBacktestingParams, IBacktestingResult } from '@/types/investor';
import { useEffect, useState } from 'react';
import { useCallback } from 'react';

const useBacktesting = (params: IBacktestingParams) => {
  const [result, setResult] = useState<IBacktestingResult | null>(null);

  const backtesting = useCallback(async (params: IBacktestingParams) => {
    try {
      const result: IBacktestingResult = {
        startDate: params.startDate,
        endDate: params.endDate,
        interval: params.interval,
        result: [],
      };
      // TODO: 백테스팅 로직 구현
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  const getBacktestingResult = useCallback(
    async (params: IBacktestingParams) => {
      const result = await backtesting(params);
      setResult(result);
    },
    [backtesting]
  );

  useEffect(() => {
    getBacktestingResult(params);
  }, [params, getBacktestingResult]);

  return { result };
};

export default useBacktesting;
