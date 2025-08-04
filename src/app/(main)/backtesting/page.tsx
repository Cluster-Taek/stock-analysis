'use client';

import BacktestingHeader from '@/components/backtesting/backtesting-header';
import { SingleColumnPage } from '@/medusa/layout/pages/single-column-page';

const BacktestingPage = () => {
  return (
    <SingleColumnPage>
      <BacktestingHeader />
    </SingleColumnPage>
  );
};

export default BacktestingPage;
