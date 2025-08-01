'use client';

import { BaseChart } from './base-chart';
import { createLineDataset, getChartColors } from '@/lib/chart-config';
import { HistoricalDataPoint } from '@/types/yahoo-finance';
import { TooltipItem } from 'chart.js';
import { useTheme } from 'next-themes';
import React, { useMemo } from 'react';

interface StockChartProps {
  data: HistoricalDataPoint[];
  symbol: string;
  loading?: boolean;
  error?: string;
  height?: number;
  className?: string;
  showVolume?: boolean;
  showAdjustedClose?: boolean;
}

/**
 * 주식 히스토리컬 데이터를 시각화하는 라인 차트 컴포넌트
 */
export function StockChart({
  data,
  symbol,
  loading = false,
  error,
  height = 400,
  className = '',
  showVolume = false,
  showAdjustedClose = false,
}: StockChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getChartColors(isDark);

  // 정렬된 데이터 (tooltip에서 사용하기 위해 컴포넌트 레벨에서 관리)
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    if (sortedData.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // 기본 가격 데이터셋들
    const datasets = [];

    // 종가 데이터
    const closeData = sortedData.map((item) => ({
      x: item.date,
      y: item.close,
    }));

    datasets.push(createLineDataset(`${symbol} 종가`, closeData, colors.primary, false));

    // 시가 데이터 (선택적)
    const openData = sortedData.map((item) => ({
      x: item.date,
      y: item.open,
    }));

    datasets.push(createLineDataset(`${symbol} 시가`, openData, colors.gray, false));

    // 조정 종가 데이터 (선택적)
    if (showAdjustedClose) {
      const adjCloseData = sortedData.map((item) => ({
        x: item.date,
        y: item.adjustedClose,
      }));

      datasets.push(createLineDataset(`${symbol} 조정종가`, adjCloseData, colors.info, false));
    }

    return {
      labels: sortedData.map((item) => item.date),
      datasets,
    };
  }, [sortedData, symbol, colors, showAdjustedClose]);

  // 볼륨 차트 데이터 (별도 차트로 표시할 예정)
  const volumeChartData = useMemo(() => {
    if (sortedData.length === 0 || !showVolume) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const volumeData = sortedData.map((item) => ({
      x: item.date,
      y: item.volume,
    }));

    return {
      labels: sortedData.map((item) => item.date),
      datasets: [createLineDataset(`${symbol} 거래량`, volumeData, colors.warning, true)],
    };
  }, [sortedData, symbol, colors, showVolume]);

  // 차트 옵션 (가격 차트용)
  const priceChartOptions = useMemo(
    () => ({
      plugins: {
        title: {
          display: true,
          text: `${symbol} 주가 차트`,
          color: colors.text,
          font: {
            size: 16,
            weight: 600,
          },
        },
        legend: {
          position: 'top' as const,
          labels: {
            color: colors.text,
            usePointStyle: true,
            pointStyle: 'line',
          },
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            title: (context: TooltipItem<'line'>[]) => {
              if (context.length > 0) {
                const dataIndex = context[0].dataIndex;
                if (sortedData && sortedData[dataIndex]) {
                  const dateStr = sortedData[dataIndex].date;
                  const date = new Date(dateStr);
                  return date.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  });
                }
              }
              return '';
            },
            label: (context: TooltipItem<'line'>) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: $${value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            },
            afterBody: (context: TooltipItem<'line'>[]) => {
              if (context.length > 0) {
                const dataIndex = context[0].dataIndex;
                if (sortedData && sortedData[dataIndex]) {
                  const point = sortedData[dataIndex];
                  const change = point.close - point.open;
                  const changePercent = (change / point.open) * 100;
                  const changeText = change >= 0 ? `+$${change.toFixed(2)}` : `-$${Math.abs(change).toFixed(2)}`;
                  const percentText = change >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`;

                  return [
                    `일일 변동: ${changeText} (${percentText})`,
                    `거래량: ${point.volume.toLocaleString('en-US')}`,
                    `최고가: $${point.high.toFixed(2)}`,
                    `최저가: $${point.low.toFixed(2)}`,
                  ];
                }
              }
              return [];
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: colors.grid,
          },
          ticks: {
            color: colors.text,
          },
        },
        y: {
          grid: {
            color: colors.grid,
          },
          ticks: {
            color: colors.text,
            callback: function (value: string | number) {
              return `$${Number(value).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            },
          },
        },
      },
    }),
    [symbol, colors, sortedData]
  );

  // 볼륨 차트 옵션
  const volumeChartOptions = useMemo(
    () => ({
      plugins: {
        title: {
          display: true,
          text: `${symbol} 거래량`,
          color: colors.text,
          font: {
            size: 14,
            weight: 500,
          },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            color: colors.grid,
          },
          ticks: {
            color: colors.text,
          },
        },
        y: {
          grid: {
            color: colors.grid,
          },
          ticks: {
            color: colors.text,
            callback: function (value: string | number) {
              const num = Number(value);
              if (num >= 1000000) {
                return `${(num / 1000000).toFixed(1)}M`;
              } else if (num >= 1000) {
                return `${(num / 1000).toFixed(1)}K`;
              }
              return num.toLocaleString('en-US');
            },
          },
        },
      },
    }),
    [symbol, colors]
  );

  if (loading) {
    return (
      <div className={className}>
        <BaseChart data={{ labels: [], datasets: [] }} loading={true} height={height} />
        {showVolume && (
          <div className="mt-4">
            <BaseChart data={{ labels: [], datasets: [] }} loading={true} height={150} />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <BaseChart data={{ labels: [], datasets: [] }} error={error} height={height} />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 메인 가격 차트 */}
      <BaseChart data={chartData} options={priceChartOptions} height={height} />

      {/* 볼륨 차트 (선택적) */}
      {showVolume && (
        <div className="mt-4">
          <BaseChart data={volumeChartData} options={volumeChartOptions} height={150} />
        </div>
      )}
    </div>
  );
}
