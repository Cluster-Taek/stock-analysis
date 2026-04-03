'use client';

import { BaseChart } from './base-chart';
import { createLineDataset, getChartColors, portfolioColors } from '@/lib/chart-config';
import { logger } from '@/utils/logger';
import { IBacktestingResult } from '@/types/investor';
import { useTheme } from 'next-themes';
import React, { useMemo } from 'react';

interface BacktestingChartProps {
  data: IBacktestingResult[];
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

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const datasets: any[] = [];
    const allDates = new Set<string>();

    // 모든 포트폴리오의 날짜를 수집
    data.forEach((portfolio) => {
      portfolio.result.forEach((snapshot) => {
        allDates.add(snapshot.date);
      });
    });

    const sortedDates = Array.from(allDates).sort();

    // 각 포트폴리오별로 데이터셋 생성
    data.forEach((portfolio, index) => {
      const sortedPortfolioData = [...portfolio.result].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const portfolioValueData = sortedPortfolioData.map((item) => ({
        x: item.date,
        y: item.capital,
      }));

      const color = portfolioColors[index % portfolioColors.length];
      const lineDataset = createLineDataset(portfolio.portfolioName, portfolioValueData, color, false);

      // 배당금과 거래 내역이 있는 날짜의 포인트를 강조하기 위한 설정
      const pointBackgroundColors = sortedPortfolioData.map((item) => {
        const hasDividends = item.dividendsReceived && Object.keys(item.dividendsReceived).length > 0;
        const hasBuyTrades = item.trades?.some((t) => t.action === 'BUY');
        const hasSellTrades = item.trades?.some((t) => t.action === 'SELL');

        if (hasBuyTrades) return '#22c55e'; // 초록색 (매수)
        if (hasSellTrades) return '#ef4444'; // 빨간색 (매도)
        if (hasDividends) return '#3b82f6'; // 파란색 (배당금)
        return color;
      });

      const pointBorderColors = sortedPortfolioData.map((item) => {
        const hasDividends = item.dividendsReceived && Object.keys(item.dividendsReceived).length > 0;
        const hasBuyTrades = item.trades?.some((t) => t.action === 'BUY');
        const hasSellTrades = item.trades?.some((t) => t.action === 'SELL');

        if (hasBuyTrades) return '#16a34a'; // 진한 초록 (매수)
        if (hasSellTrades) return '#dc2626'; // 진한 빨강 (매도)
        if (hasDividends) return '#2563eb'; // 진한 파랑 (배당금)
        return color;
      });

      const pointRadius = sortedPortfolioData.map((item) => {
        const hasDividends = item.dividendsReceived && Object.keys(item.dividendsReceived).length > 0;
        const hasTrades = item.trades && item.trades.length > 0;
        return hasDividends || hasTrades ? 4 : 0;
      });

      const pointStyle = sortedPortfolioData.map((item) => {
        const hasBuyTrades = item.trades?.some((t) => t.action === 'BUY');
        const hasSellTrades = item.trades?.some((t) => t.action === 'SELL');

        if (hasBuyTrades) return 'triangle' as const; // 삼각형 (매수)
        if (hasSellTrades) return 'rectRot' as const; // 역삼각형 (매도)
        return 'circle' as const; // 원 (배당금)
      });

      // 배당금과 거래 내역이 있는 날짜 디버깅
      const dividendDates = sortedPortfolioData
        .filter((item) => item.dividendsReceived && Object.keys(item.dividendsReceived).length > 0)
        .map((item) => ({
          date: item.date,
          dividends: item.dividendsReceived,
        }));

      const tradeDates = sortedPortfolioData
        .filter((item) => item.trades && item.trades.length > 0)
        .map((item) => ({
          date: item.date,
          trades: item.trades,
        }));

      if (dividendDates.length > 0) {
        logger.log(`📊 ${portfolio.portfolioName} 차트에 표시될 배당금 날짜들:`, dividendDates);
      }

      if (tradeDates.length > 0) {
        logger.log(`📊 ${portfolio.portfolioName} 차트에 표시될 거래 날짜들:`, tradeDates);
      }

      // 포인트 스타일 오버라이드
      const enhancedDataset = {
        ...lineDataset,
        pointBackgroundColor: pointBackgroundColors,
        pointBorderColor: pointBorderColors,
        pointRadius: pointRadius,
        pointHoverRadius: pointRadius.map((r) => r + 2),
        pointStyle: pointStyle,
      };

      datasets.push(enhancedDataset);
    });

    return {
      labels: sortedDates,
      datasets,
    };
  }, [data, colors]);

  const chartOptions = useMemo(
    () => ({
      plugins: {
        title: {
          display: true,
          text: 'Portfolio Comparison Chart',
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

              // 해당 포트폴리오의 스냅샷 데이터 찾기
              const portfolioData = data[context.datasetIndex];
              if (portfolioData) {
                // 실제 데이터에서 날짜 가져오기
                const dataPoint = context.dataset.data[context.dataIndex];
                const dateStr = dataPoint ? dataPoint.x : null;

                if (dateStr) {
                  const snapshot = portfolioData.result.find((s) => s.date === dateStr);
                  if (snapshot && snapshot.profitRate !== undefined) {
                    label += ` (수익률: ${(snapshot.profitRate * 100).toFixed(2)}%)`;
                  }
                }
              }
              return label;
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            afterLabel: function (context: any) {
              const portfolioData = data[context.datasetIndex];
              if (!portfolioData) return [];

              // 실제 데이터에서 날짜 가져오기 (context.dataIndex를 사용)
              const dataPoint = context.dataset.data[context.dataIndex];
              const dateStr = dataPoint ? dataPoint.x : null;

              if (!dateStr) return [];

              const snapshot = portfolioData.result.find((s) => s.date === dateStr);
              if (!snapshot) return [];

              const labels = [];

              // Add trade information first
              if (snapshot.trades && snapshot.trades.length > 0) {
                labels.push('💰 거래 내역:');
                snapshot.trades.forEach((trade) => {
                  const actionLabel = trade.action === 'BUY' ? '매수' : '매도';
                  const actionSymbol = trade.action === 'BUY' ? '🔼' : '🔽';
                  const formattedAmount = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(trade.totalAmount);
                  const formattedFee = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(trade.fee);
                  labels.push(`  ${actionSymbol} ${actionLabel} ${trade.symbol}`);
                  labels.push(`    수량: ${trade.shares.toFixed(4)}주`);
                  labels.push(`    가격: $${trade.price.toFixed(2)}`);
                  labels.push(`    금액: ${formattedAmount}`);
                  labels.push(`    수수료: ${formattedFee}`);
                });
                labels.push(''); // Add empty line for spacing
              }

              // Add dividend information
              if (snapshot.dividendsReceived) {
                const dividendEntries = Object.entries(snapshot.dividendsReceived);
                if (dividendEntries.length > 0) {
                  labels.push('🎉 배당금:');
                  dividendEntries.forEach(([symbol, amount]) => {
                    const formattedAmount = new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(amount);
                    labels.push(`  ${symbol}: ${formattedAmount}`);
                  });
                  labels.push(''); // Add empty line for spacing
                }
              }

              // Add cash information
              if (snapshot.cash !== undefined) {
                labels.push(
                  `현금: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(snapshot.cash)}`
                );
              }

              // Add holdings information
              if (snapshot.holdings) {
                const holdingEntries = Object.entries(snapshot.holdings).filter(([, shares]) => shares > 0);
                if (holdingEntries.length > 0) {
                  labels.push('보유 주식:');
                  holdingEntries.forEach(([symbol, shares]) => {
                    const currentPrice = snapshot.currentPrices?.[symbol];
                    const priceInfo = currentPrice
                      ? ` (현재가: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currentPrice)})`
                      : '';
                    labels.push(`  ${symbol}: ${shares.toFixed(4)}주${priceInfo}`);
                  });
                }
              }

              return labels;
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
            callback: (value: string | number) => `$${Number(value).toLocaleString()}`,
          },
        },
      },
    }),
    [colors, data]
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
