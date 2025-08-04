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

// 가격별 거래량 분포 계산 함수
const calculateVolumeByPrice = (data: HistoricalDataPoint[], bins: number = 20) => {
  if (!data || data.length === 0) return [];

  // 가격 범위 계산
  const prices = data.flatMap((item) => [item.high, item.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceStep = (maxPrice - minPrice) / bins;

  // 가격 구간별 거래량 집계
  const volumeByPrice = Array(bins)
    .fill(0)
    .map((_, i) => ({
      priceRange: minPrice + i * priceStep,
      priceRangeEnd: minPrice + (i + 1) * priceStep,
      volume: 0,
    }));

  // 각 데이터 포인트의 거래량을 해당 가격 구간에 분배
  data.forEach((item) => {
    const avgPrice = (item.high + item.low) / 2;
    const binIndex = Math.min(Math.floor((avgPrice - minPrice) / priceStep), bins - 1);
    if (binIndex >= 0 && binIndex < bins) {
      volumeByPrice[binIndex].volume += item.volume;
    }
  });

  return volumeByPrice.filter((item) => item.volume > 0);
};

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

    // 시간별 거래량은 제거 (가격별 거래량으로 대체)

    return {
      labels: sortedData.map((item) => item.date),
      datasets,
    };
  }, [sortedData, symbol, colors, showAdjustedClose]);

  // 가격별 거래량 차트 데이터
  const volumeByPriceData = useMemo(() => {
    if (sortedData.length === 0 || !showVolume) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const volumeByPrice = calculateVolumeByPrice(sortedData, 100);

    // 가격 순으로 정렬 (낮은 가격부터 높은 가격 순)
    const sortedVolumeByPrice = volumeByPrice.sort((a, b) => a.priceRange - b.priceRange);

    // 가격 구간을 레이블로 사용 (수평 막대 차트에서 y축)
    const labels = sortedVolumeByPrice.map(
      (item) => `$${item.priceRange.toFixed(2)}-$${item.priceRangeEnd.toFixed(2)}`
    );

    // 거래량을 음수로 변환하여 오른쪽(0)에서 왼쪽으로 확장되도록 함
    const data = sortedVolumeByPrice.map((item) => -item.volume);

    return {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          data,
          backgroundColor: colors.warning + '60',
          borderColor: colors.warning,
          borderWidth: 1,
        },
      ],
    };
  }, [sortedData, colors, showVolume]);

  // 차트 옵션 (가격 차트용, mixed chart 지원)
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
            title: (context: TooltipItem<'line' | 'bar'>[]) => {
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
            label: (context: TooltipItem<'line' | 'bar'>) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;

              // 거래량인 경우 다른 포맷 적용
              if (label.includes('거래량')) {
                return `${label}: ${value.toLocaleString('en-US')}`;
              }

              // 가격인 경우
              return `${label}: $${value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            },
            afterBody: (context: TooltipItem<'line' | 'bar'>[]) => {
              if (context.length > 0) {
                const dataIndex = context[0].dataIndex;
                if (sortedData && sortedData[dataIndex]) {
                  const point = sortedData[dataIndex];
                  const change = point.close - point.open;
                  const changePercent = (change / point.open) * 100;
                  const changeText = change >= 0 ? `+$${change.toFixed(2)}` : `-$${Math.abs(change).toFixed(2)}`;
                  const percentText = change >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`;

                  const info = [
                    `일일 변동: ${changeText} (${percentText})`,
                    `최고가: $${point.high.toFixed(2)}`,
                    `최저가: $${point.low.toFixed(2)}`,
                  ];

                  // 거래량이 차트에 표시되지 않은 경우에만 추가
                  if (!showVolume) {
                    info.splice(1, 0, `거래량: ${point.volume.toLocaleString('en-US')}`);
                  }

                  return info;
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
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
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
        ...(showVolume && {
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            min: 0, // 거래량 축을 0부터 시작
            grid: {
              drawOnChartArea: false, // 좌측 축의 그리드만 표시
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
        }),
      },
    }),
    [symbol, colors, sortedData, showVolume]
  );

  // 가격별 거래량 차트 옵션 (수평 막대 차트)
  const volumeByPriceOptions = useMemo(
    () => ({
      indexAxis: 'y' as const, // 수평 막대 차트
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          max: 0, // 오른쪽이 0이 되도록 설정
          // grid: {
          //   color: colors.grid,
          // },
          display: false,
          ticks: {
            color: colors.text,
            callback: function (value: string | number) {
              // 음수값을 절댓값으로 변환하여 표시
              const num = Math.abs(Number(value));
              if (num >= 1000000) {
                return `${(num / 1000000).toFixed(1)}M`;
              } else if (num >= 1000) {
                return `${(num / 1000).toFixed(1)}K`;
              }
              return num.toLocaleString('en-US');
            },
          },
        },
        y: {
          reverse: true, // 높은 가격이 위에 오도록 역순 정렬
          ticks: {
            color: colors.text,
            display: false,
          },
        },
      },
    }),
    [colors]
  );

  if (loading) {
    return (
      <div className={className}>
        {showVolume ? (
          <div className="flex gap-4">
            <div className="flex-1">
              <BaseChart data={{ labels: [], datasets: [] }} loading={true} height={height} />
            </div>
            <div className="w-80">
              <BaseChart data={{ labels: [], datasets: [] }} loading={true} height={height} />
            </div>
          </div>
        ) : (
          <BaseChart data={{ labels: [], datasets: [] }} loading={true} height={height} />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {showVolume ? (
          <div className="flex gap-4">
            <div className="flex-1">
              <BaseChart data={{ labels: [], datasets: [] }} error={error} height={height} />
            </div>
            <div className="w-80">
              <BaseChart data={{ labels: [], datasets: [] }} error={error} height={height} />
            </div>
          </div>
        ) : (
          <BaseChart data={{ labels: [], datasets: [] }} error={error} height={height} />
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {showVolume ? (
        // 가격 차트와 가격별 거래량 차트를 나란히 배치
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute top-[70px] right-[32px]">
              <BaseChart data={volumeByPriceData} options={volumeByPriceOptions} width={800} height={360} />
            </div>
            <div className="w-full relative">
              <BaseChart data={chartData} options={priceChartOptions} height={height} />
            </div>
          </div>
        </div>
      ) : (
        // 거래량 표시하지 않을 때는 가격 차트만
        <BaseChart data={chartData} options={priceChartOptions} height={height} />
      )}
    </div>
  );
}
