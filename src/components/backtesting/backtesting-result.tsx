'use client';

import { BacktestingChart } from '../charts/backtesting-chart';
import { useBacktesting } from '@/contexts/backtesting-provider';
import { Button } from '@medusajs/ui';

const BacktestingResult = () => {
  const { portfolioData, backtestingResult, startBacktesting, isLoading } = useBacktesting();

  if (!portfolioData) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div>
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={() => startBacktesting(portfolioData)}
          isLoading={isLoading}
        >
          백테스팅 시작
        </Button>
      </div>
      <BacktestingChart data={backtestingResult?.result || []} loading={isLoading} />
    </div>
  );
};

export default BacktestingResult;
