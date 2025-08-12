'use client';

import { BaseChart } from './base-chart';
import { createLineDataset, getChartColors } from '@/lib/chart-config';
import { IBacktestingSnapshot } from '@/types/investor';
import { useTheme } from 'next-themes';
import React, { useMemo } from 'react';

interface BacktestingChartProps {
  data: IBacktestingSnapshot[];
  loading?: boolean;
  error?: string;
  height?: number;
  className?: string;
}

export function BacktestingChart({
  data,
  loading = false,
  error,
  height = 400,
  className = '',
}: BacktestingChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getChartColors(isDark);

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const chartData = useMemo(() => {
    if (sortedData.length === 0) return { labels: [], datasets: [] };

    const datasets = [];
    const portfolioValueData = sortedData.map((item) => ({ x: item.date, y: item.capital }));
    datasets.push(createLineDataset('Portfolio Value', portfolioValueData, colors.primary, false));

    return {
      labels: sortedData.map((item) => item.date),
      datasets,
    };
  }, [sortedData, colors]);

  const chartOptions = useMemo(
    () => ({
      plugins: {
        title: {
          display: true,
          text: 'Backtesting Result Chart',
          color: colors.text,
          font: { size: 16, weight: 600 },
        },
        legend: {
          position: 'top' as const,
          labels: { color: colors.text, usePointStyle: true, pointStyle: 'line' },
        },
        tooltip: {
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: function (context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                  context.parsed.y
                );
              }

              // Add profitRate
              const snapshot = sortedData[context.dataIndex];
              if (snapshot && snapshot.profitRate !== undefined) {
                label += ` (수익률: ${(snapshot.profitRate * 100).toFixed(2)}%)`;
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { color: colors.text },
        },
        y: {
          type: 'linear' as const,
          position: 'left' as const,
          grid: { color: colors.grid },
          ticks: {
            color: colors.text,
            callback: (value: string | number) => `${Number(value).toLocaleString()}`,
          },
        },
      },
    }),
    [colors, sortedData] // Add sortedData to dependency array
  );

  if (loading) {
    return (
      <div className={className}>
        <BaseChart data={{ labels: [], datasets: [] }} loading={true} height={height} />
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
      <BaseChart data={chartData} options={chartOptions} height={height} />
    </div>
  );
}
