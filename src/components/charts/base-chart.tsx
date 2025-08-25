'use client';

import { defaultChartOptions } from '@/lib/chart-config';
import { Skeleton } from '@/medusa/components/skeleton';
import { ChartBar, ExclamationCircle } from '@medusajs/icons';
import { Text } from '@medusajs/ui';
// ✨ 1. Chart.js에서 Plugin 타입을 가져옵니다.
import { ChartOptions, Plugin } from 'chart.js';
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
  // ✨ 2. plugins prop을 받을 수 있도록 인터페이스에 추가합니다.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins?: Plugin<any>[];
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
  // ✨ 3. props에서 plugins를 추출하고, 기본값으로 빈 배열을 설정합니다.
  plugins = [],
}: BaseChartProps) {
  const chartId = useId();

  const chartInfo = useMemo(() => {
    // ... (기존 로직과 동일)
    if (!data?.datasets) {
      return { isSpecialChart: false, chartType: 'line' as const };
    }
    const types = data.datasets.map((dataset: any) => dataset.type || 'line'); // eslint-disable-line @typescript-eslint/no-explicit-any
    const uniqueTypes = Array.from(new Set(types));
    const isSpecialChart = uniqueTypes.length > 1 || uniqueTypes.includes('bar');
    let chartType: 'line' | 'bar' = 'line';
    if (uniqueTypes.length === 1 && uniqueTypes[0] === 'bar') {
      chartType = 'bar';
    }
    return { isSpecialChart, chartType };
  }, [data]);

  // ... (로딩, 에러, 데이터 없음 상태는 기존과 동일)
  if (loading) {
    return (
      <div className={`w-full ${className}`} style={{ height, width }}>
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }
  if (error) {
    return (
      <div
        className={`flex items-center justify-center w-full bg-ui-bg-subtle rounded-lg border border-ui-border-base ${className}`}
        style={{ height, width }}
      >
        <div className="flex flex-col items-center gap-y-3">
          <ExclamationCircle className="w-12 h-12 text-ui-fg-error" />
          <div className="flex flex-col items-center gap-y-1">
            <Text size="large" leading="compact" weight="plus" className="text-ui-fg-base">
              차트 로딩 실패
            </Text>
            <Text size="small" className="text-ui-fg-muted">
              {error}
            </Text>
          </div>
        </div>
      </div>
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!data.datasets.length || data.datasets.every((dataset: any) => !dataset.data.length)) {
    return (
      <div
        className={`flex items-center justify-center w-full bg-ui-bg-subtle rounded-lg border border-ui-border-base ${className}`}
        style={{ height, width }}
      >
        <div className="flex flex-col items-center gap-y-3">
          <div className="flex flex-row items-center gap-x-2">
            <ChartBar />
            <Text size="large" leading="compact" weight="plus" className="text-ui-fg-base text-center">
              데이터가 없습니다
            </Text>
          </div>
          <Text size="small" className="text-ui-fg-muted">
            선택한 기간에 표시할 차트 데이터가 없습니다.
          </Text>
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
        <Chart
          type={chartInfo.chartType as any} // eslint-disable-line @typescript-eslint/no-explicit-any
          data={data}
          options={mergedOptions}
          id={chartId}
          // ✨ 4. 전달받은 plugins를 Chart 컴포넌트에 넘겨줍니다.
          plugins={plugins}
        />
      ) : (
        <Line
          data={data}
          options={mergedOptions}
          id={chartId}
          // ✨ 4. 전달받은 plugins를 Line 컴포넌트에도 넘겨줍니다.
          plugins={plugins}
        />
      )}
    </div>
  );
}
