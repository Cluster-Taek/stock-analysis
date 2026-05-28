'use client';

import { BaseChart } from './base-chart';
import { createLineDataset, getChartColors } from '@/lib/chart-config';
import { HistoricalDataPoint } from '@/types/yahoo-finance';
// Chart.js의 핵심 타입들을 직접 가져와서 사용합니다.
import { Chart as ChartJS, Scale } from 'chart.js';
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

// 가격별 거래량 분포 계산 함수 (수정본)
const calculateVolumeByPrice = (data: HistoricalDataPoint[], bins: number = 40) => {
  if (!data || data.length === 0) return [];

  // 가격 범위 계산
  const prices = data.flatMap((item) => [item.high, item.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // ✨ --- 수정된 부분 시작 --- ✨
  // [버그 수정] maxPrice와 minPrice가 같으면 priceStep이 0이 되어 나누기 오류가 발생합니다.
  // 이 경우를 먼저 확인하고 모든 거래량을 단일 가격 구간으로 처리합니다.
  if (maxPrice === minPrice) {
    const totalVolume = data.reduce((sum, item) => sum + item.volume, 0);
    if (totalVolume > 0) {
      return [
        {
          priceRange: minPrice,
          priceRangeEnd: maxPrice,
          volume: totalVolume,
        },
      ];
    }
    return []; // 거래량도 없으면 빈 배열 반환
  }
  // ✨ --- 수정된 부분 끝 --- ✨

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
    // avgPrice가 maxPrice와 정확히 일치할 경우를 대비하여, 인덱스가 bins를 넘어가지 않도록 처리
    let binIndex = Math.floor((avgPrice - minPrice) / priceStep);
    if (binIndex >= bins) {
      binIndex = bins - 1;
    }

    if (binIndex >= 0) {
      volumeByPrice[binIndex].volume += item.volume;
    }
  });

  return volumeByPrice.filter((item) => item.volume > 0);
};

// =================================================================
// ✨ 1. 가격대별 거래량을 그리는 커스텀 Chart.js 플러그인 생성
// =================================================================
const volumeByPricePlugin = {
  id: 'volumeByPrice',
  // 데이터셋이 그려지기 '전에' 이 플러그인을 실행합니다.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeDatasetsDraw(chart: ChartJS, args: any, options: any) {
    const {
      ctx,
      chartArea,
      scales: { y: yScale },
    } = chart;
    const { volumeData, barColor, maxBarWidth } = options;

    if (!volumeData || volumeData.length === 0 || !chartArea) {
      return;
    }

    const maxVolume = Math.max(...volumeData.map((d: any) => d.volume)); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (maxVolume === 0) return;

    ctx.save();
    ctx.fillStyle = barColor;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    volumeData.forEach((item: any) => {
      // 가격 범위에 해당하는 y축의 픽셀 위치를 가져옵니다.
      const yStart = yScale.getPixelForValue(item.priceRangeEnd);
      const yEnd = yScale.getPixelForValue(item.priceRange);
      const barHeight = Math.abs(yEnd - yStart);

      // 거래량에 비례하여 막대의 너비를 계산합니다.
      const barWidth = (item.volume / maxVolume) * maxBarWidth;

      // 차트의 오른쪽에 막대를 그립니다.
      ctx.fillRect(
        chartArea.right - barWidth, // 시작 x 좌표 (오른쪽 끝에서 너비만큼 왼쪽으로)
        yStart, // 시작 y 좌표
        barWidth, // 막대 너비
        barHeight // 막대 높이
      );
    });

    ctx.restore();
  },
};

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

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const chartData = useMemo(() => {
    if (sortedData.length === 0) return { labels: [], datasets: [] };

    const datasets = [];
    const closeData = sortedData.map((item) => ({ x: item.date, y: item.close }));
    datasets.push(createLineDataset(`${symbol} 종가`, closeData, colors.primary, false));

    if (showAdjustedClose) {
      const adjCloseData = sortedData.map((item) => ({ x: item.date, y: item.adjustedClose }));
      datasets.push(createLineDataset(`${symbol} 조정종가`, adjCloseData, colors.info, false));
    }

    return {
      labels: sortedData.map((item) => item.date),
      datasets,
    };
  }, [sortedData, symbol, colors, showAdjustedClose]);

  // =================================================================
  // ✨ 2. 가격대별 거래량 데이터를 계산 (렌더링 데이터가 아닌 순수 데이터)
  // =================================================================
  const volumeByPriceRawData = useMemo(() => {
    if (!showVolume || sortedData.length === 0) return [];
    // bin의 수를 늘려 더 세밀하게 표현
    return calculateVolumeByPrice(sortedData, 50);
  }, [showVolume, sortedData]);

  const chartOptions = useMemo(
    () => ({
      plugins: {
        title: {
          display: true,
          text: `${symbol} 주가 차트`,
          color: colors.text,
          font: { size: 16, weight: 600 },
        },
        legend: {
          position: 'top' as const,
          labels: { color: colors.text, usePointStyle: true, pointStyle: 'line' },
        },
        tooltip: {
          // ... (기존 tooltip 콜백은 그대로 사용)
        },
        // =================================================================
        // ✨ 3. 플러그인에 옵션(데이터, 색상 등)을 전달합니다.
        // =================================================================
        ...(showVolume && {
          volumeByPrice: {
            volumeData: volumeByPriceRawData,
            // 'colors.warning' 대신 원하는 노란색 Hex 코드로 직접 지정
            barColor: '#FFD700', // Gold 색상(#FFD700)에 투명도(30% = '4D') 적용
            maxBarWidth: 400,
          },
        }),
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
            callback: (value: string | number) => `$${Number(value).toFixed(2)}`,
          },
          // =================================================================
          // ✨ 4. 거래량 차트가 그려질 공간을 확보하기 위해 여백을 추가합니다.
          // =================================================================
          afterFit: (scaleInstance: Scale) => {
            if (showVolume) {
              scaleInstance.width += 20; // 오른쪽 눈금과 차트 끝 사이의 여백 추가
            }
          },
        },
        // 별도의 y1 축은 더 이상 필요하지 않습니다.
      },
      // 레이아웃을 조정하여 플러그인이 그릴 공간 확보
      layout: {
        padding: {
          // showVolume일 때 오른쪽에 150px(maxBarWidth) 만큼의 여백을 줌
          right: showVolume ? 160 : 0,
        },
      },
    }),
    [symbol, colors, showVolume, volumeByPriceRawData]
  );

  // 로딩 및 에러 처리는 기존과 동일
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

  // =================================================================
  // ✨ 5. 단일 BaseChart 컴포넌트만 렌더링
  // =================================================================
  return (
    <div className={className}>
      <BaseChart
        data={chartData}
        options={chartOptions}
        height={height}
        // 플러그인을 BaseChart에 등록합니다.
        plugins={[volumeByPricePlugin]}
      />
    </div>
  );
}
