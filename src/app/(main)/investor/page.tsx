'use client';

import InvestorCard from '@/components/backtesting/investor-card';
import { Header } from '@/medusa/components/header';
import { SingleColumnPage } from '@/medusa/layout/pages/single-column-page';
import { IBacktestingResult } from '@/types/investor';
import { Container } from '@medusajs/ui';

// 샘플 투자자 데이터
const sampleInvestors: IBacktestingResult[] = [
  {
    investor: {
      id: '1',
      name: '보수적 투자자',
      initialCapital: 10000000,
      portfolio: [
        {
          symbol: 'AAPL',
          type: 'STOCK',
          amount: 10,
          strategy: 'HOLD',
        },
        {
          symbol: 'MSFT',
          type: 'STOCK',
          amount: 15,
          strategy: 'HOLD',
        },
        {
          symbol: 'NVDA',
          type: 'STOCK',
          amount: 5,
          strategy: 'REINVESTMENT_STOCK',
        },
      ],
    },
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    interval: '1d',
    result: [
      {
        capital: 12500000,
        profit: 2500000,
        profitRate: 25.0,
        profitRatePerYear: 25.0,
        profitRatePerMonth: 2.08,
        profitRatePerWeek: 0.48,
        profitRatePerDay: 0.07,
      },
    ],
  },
  {
    investor: {
      id: '2',
      name: '적극적 투자자',
      initialCapital: 50000000,
      portfolio: [
        {
          symbol: 'TSLA',
          type: 'STOCK',
          amount: 100,
          strategy: 'REINVESTMENT_STOCK',
        },
        {
          symbol: 'AMZN',
          type: 'STOCK',
          amount: 30,
          strategy: 'REINVESTMENT_STOCK',
        },
        {
          symbol: 'GOOGL',
          type: 'STOCK',
          amount: 50,
          strategy: 'HOLD',
        },
        {
          symbol: 'META',
          type: 'STOCK',
          amount: 25,
          strategy: 'REINVESTMENT_STOCK',
        },
      ],
    },
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    interval: '1d',
    result: [
      {
        capital: 67500000,
        profit: 17500000,
        profitRate: 35.0,
        profitRatePerYear: 35.0,
        profitRatePerMonth: 2.92,
        profitRatePerWeek: 0.67,
        profitRatePerDay: 0.1,
      },
    ],
  },
  {
    investor: {
      id: '3',
      name: '배당 중심 투자자',
      initialCapital: 30000000,
      portfolio: [
        {
          symbol: 'KO',
          type: 'DIVIDEND',
          amount: 200,
          strategy: 'REINVESTMENT_DIVIDEND',
        },
        {
          symbol: 'JNJ',
          type: 'DIVIDEND',
          amount: 150,
          strategy: 'REINVESTMENT_DIVIDEND',
        },
        {
          symbol: 'PG',
          type: 'DIVIDEND',
          amount: 100,
          strategy: 'HOLD',
        },
        {
          symbol: 'VTI',
          type: 'DIVIDEND',
          amount: 300,
          strategy: 'REINVESTMENT_DIVIDEND',
        },
        {
          symbol: 'SCHD',
          type: 'DIVIDEND',
          amount: 500,
          strategy: 'REINVESTMENT_DIVIDEND',
        },
      ],
    },
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    interval: '1d',
    result: [
      {
        capital: 33900000,
        profit: 3900000,
        profitRate: 13.0,
        profitRatePerYear: 13.0,
        profitRatePerMonth: 1.08,
        profitRatePerWeek: 0.25,
        profitRatePerDay: 0.04,
      },
    ],
  },
  {
    investor: {
      id: '4',
      name: '균형 투자자',
      initialCapital: 20000000,
      portfolio: [
        {
          symbol: 'SPY',
          type: 'STOCK',
          amount: 80,
          strategy: 'REINVESTMENT_STOCK',
        },
        {
          symbol: 'QQQ',
          type: 'STOCK',
          amount: 50,
          strategy: 'REINVESTMENT_STOCK',
        },
        {
          symbol: 'VYM',
          type: 'DIVIDEND',
          amount: 100,
          strategy: 'REINVESTMENT_DIVIDEND',
        },
      ],
    },
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    interval: '1d',
    result: [
      {
        capital: 18500000,
        profit: -1500000,
        profitRate: -7.5,
        profitRatePerYear: -7.5,
        profitRatePerMonth: -0.63,
        profitRatePerWeek: -0.14,
        profitRatePerDay: -0.02,
      },
    ],
  },
];

const BacktestingPage = () => {
  return (
    <SingleColumnPage>
      <Header title="백테스팅 시뮬레이션" />

      <Container className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleInvestors.map((result, index) => (
            <InvestorCard key={index} result={result} />
          ))}
        </div>
      </Container>
    </SingleColumnPage>
  );
};

export default BacktestingPage;
