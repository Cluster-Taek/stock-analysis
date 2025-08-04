'use client';

import { defaultChartOptions } from '@/lib/chart-config';
import { Skeleton } from '@/medusa/components/skeleton';
import { ChartOptions } from 'chart.js';
import React, { useId, useMemo } from 'react';
import { Chart, Line } from 'react-chartjs-2';

interface BaseChartProps {
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  options?: ChartOptions<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  width?: string | number;
  height?: number;
  loading?: boolean;
  error?: string;
  className?: string;
}

/**
 * 재사용 가능한 기본 차트 컴포넌트
 */
export function BaseChart({
  data,
  options,
  width,
  height = 400,
  loading = false,
  error,
  className = '',
}: BaseChartProps) {
  // 고유한 차트 ID 생성 (캔버스 재사용 오류 방지)
  const chartId = useId();

  // 차트 타입 및 특수 차트 여부를 한 번에 계산
  const chartInfo = useMemo(() => {
    if (!data?.datasets) {
      return {
        isSpecialChart: false,
        chartType: 'line' as const,
      };
    }

    const types = data.datasets.map((dataset: any) => dataset.type || 'line'); // eslint-disable-line @typescript-eslint/no-explicit-any
    const uniqueTypes = Array.from(new Set(types));

    // Mixed chart이거나 Bar chart인 경우
    const isSpecialChart = uniqueTypes.length > 1 || uniqueTypes.includes('bar');

    // 차트 타입 결정
    let chartType: 'line' | 'bar' = 'line';
    if (uniqueTypes.length === 1 && uniqueTypes[0] === 'bar') {
      chartType = 'bar';
    }

    return {
      isSpecialChart,
      chartType,
    };
  }, [data]);

  // 로딩 상태
  if (loading) {
    return (
      <div className={`w-full ${className}`} style={{ height, width }}>
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div
        className={`flex items-center justify-center w-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
        style={{ height, width }}
      >
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">차트 로딩 실패</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 상태
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!data.datasets.length || data.datasets.every((dataset: any) => !dataset.data.length)) {
    return (
      <div
        className={`flex items-center justify-center w-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
        style={{ height, width }}
      >
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">데이터가 없습니다</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">선택한 기간에 표시할 차트 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  // 차트 옵션 병합
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergedOptions: ChartOptions<any> = {
    ...defaultChartOptions,
    ...options,
    plugins: {
      ...defaultChartOptions.plugins,
      ...options?.plugins,
    },
    scales: {
      ...defaultChartOptions.scales,
      ...options?.scales,
    },
  };

  return (
    <div className={`w-full ${className}`} style={{ height, width }}>
      {chartInfo.isSpecialChart ? (
        <Chart type={chartInfo.chartType as any} data={data} options={mergedOptions} id={chartId} /> // eslint-disable-line @typescript-eslint/no-explicit-any
      ) : (
        <Line data={data} options={mergedOptions} id={chartId} />
      )}
    </div>
  );
}
