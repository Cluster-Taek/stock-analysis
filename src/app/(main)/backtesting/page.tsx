'use client';

import BacktestingHeader from '@/components/backtesting/backtesting-header';
import BacktestingResult from '@/components/backtesting/backtesting-result';
import BacktestingProvider from '@/contexts/backtesting-provider';
import { SingleColumnPage } from '@/medusa/layout/pages/single-column-page';

const BacktestingPage = () => {
  return (
    <SingleColumnPage>
      <BacktestingProvider>
        <BacktestingHeader />
        <BacktestingResult />
      </BacktestingProvider>
    </SingleColumnPage>
  );
};

export default BacktestingPage;
