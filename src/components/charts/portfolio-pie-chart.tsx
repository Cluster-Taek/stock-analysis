'use client';

import { createPieDataset, defaultPieChartOptions, portfolioColors } from '@/lib/chart-config';
import { Skeleton } from '@/medusa/components/skeleton';
import { IPortfolioItem } from '@/types/investor';
import { ChartOptions } from 'chart.js';
import React from 'react';
import { Pie } from 'react-chartjs-2';

interface PortfolioPieChartProps {
  portfolio: IPortfolioItem[];
  height?: number;
  loading?: boolean;
  error?: string;
  className?: string;
}

/**
 * 포트폴리오 구성을 보여주는 파이 차트 컴포넌트
 */
export function PortfolioPieChart({
  portfolio,
  height = 200,
  loading = false,
  error,
  className = '',
}: PortfolioPieChartProps) {
  // 로딩 상태
  if (loading) {
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div
        className={`flex items-center justify-center w-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 상태
  if (!portfolio.length) {
    return (
      <div
        className={`flex items-center justify-center w-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">포트폴리오가 없습니다</p>
        </div>
      </div>
    );
  }

  // 포트폴리오 데이터를 파이 차트 형식으로 변환
  const symbols = portfolio.map((item) => item.symbol);
  const amounts = portfolio.map((item) => item.amount);

  const data = {
    labels: symbols,
    datasets: [createPieDataset(amounts, portfolioColors)],
  };

  // 파이 차트 옵션 (컴팩트 버전)
  const compactPieOptions: ChartOptions<'pie'> = {
    ...defaultPieChartOptions,
    plugins: {
      ...defaultPieChartOptions.plugins,
      legend: {
        ...defaultPieChartOptions.plugins?.legend,
        position: 'bottom' as const,
        labels: {
          ...defaultPieChartOptions.plugins?.legend?.labels,
          font: {
            size: 10,
            weight: 500,
          },
          padding: 12,
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
    },
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Pie data={data} options={compactPieOptions} />
    </div>
  );
}
