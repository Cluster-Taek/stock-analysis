'use client';

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { useCallback, useMemo, useRef } from 'react';

// Chart.js 컴포넌트들 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  BarElement,
  BarController,
  ArcElement,
  PieController,
  RadialLinearScale,
  Filler
);

export interface UseChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  animation?: boolean;
  theme?: 'light' | 'dark';
  locale?: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

const useChart = (options: UseChartOptions = {}) => {
  const chartRef = useRef(null);
  const {
    responsive = true,
    maintainAspectRatio = false,
    animation = true,
    theme = 'light',
    locale = 'ko-KR',
  } = options;

  // 테마별 색상 팔레트
  const colorPalette = useMemo(() => {
    const isDark = theme === 'dark';

    return {
      primary: isDark ? '#3B82F6' : '#2563EB',
      secondary: isDark ? '#8B5CF6' : '#7C3AED',
      success: isDark ? '#10B981' : '#059669',
      warning: isDark ? '#F59E0B' : '#D97706',
      error: isDark ? '#EF4444' : '#DC2626',
      info: isDark ? '#06B6D4' : '#0891B2',
      text: isDark ? '#F9FAFB' : '#111827',
      background: isDark ? '#1F2937' : '#FFFFFF',
      border: isDark ? '#374151' : '#E5E7EB',
      grid: isDark ? '#374151' : '#F3F4F6',
    };
  }, [theme]);

  // 기본 차트 옵션
  const defaultOptions = useMemo(
    () => ({
      responsive,
      maintainAspectRatio,
      animation: {
        duration: animation ? 1000 : 0,
      },
      plugins: {
        legend: {
          labels: {
            color: colorPalette.text,
            font: {
              family: 'Inter, sans-serif',
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: colorPalette.background,
          titleColor: colorPalette.text,
          bodyColor: colorPalette.text,
          borderColor: colorPalette.border,
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
        },
      },
      scales: {
        x: {
          grid: {
            color: colorPalette.grid,
          },
          ticks: {
            color: colorPalette.text,
            font: {
              family: 'Inter, sans-serif',
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: colorPalette.grid,
          },
          ticks: {
            color: colorPalette.text,
            font: {
              family: 'Inter, sans-serif',
              size: 11,
            },
          },
        },
      },
    }),
    [responsive, maintainAspectRatio, animation, colorPalette]
  );

  // 자동 색상 적용 함수
  const applyAutoColors = useCallback(
    (datasets: ChartDataset[]): ChartDataset[] => {
      const colors = [
        colorPalette.primary,
        colorPalette.secondary,
        colorPalette.success,
        colorPalette.warning,
        colorPalette.error,
        colorPalette.info,
      ];

      return datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || `${colors[index % colors.length]}20`,
        borderColor: dataset.borderColor || colors[index % colors.length],
        borderWidth: dataset.borderWidth || 2,
      }));
    },
    [colorPalette]
  );

  // 데이터 포맷 함수들
  const formatCurrency = useCallback(
    (value: number): string => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'KRW',
      }).format(value);
    },
    [locale]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return new Intl.NumberFormat(locale, options).format(value);
    },
    [locale]
  );

  const formatPercent = useCallback(
    (value: number): string => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(value / 100);
    },
    [locale]
  );

  // 차트 데이터 헬퍼 함수들
  const createLineChart = useCallback(
    (data: ChartData) => ({
      data: {
        ...data,
        datasets: applyAutoColors(
          data.datasets.map((dataset) => ({
            ...dataset,
            fill: dataset.fill ?? false,
            tension: dataset.tension ?? 0.4,
          }))
        ),
      },
      options: defaultOptions,
    }),
    [applyAutoColors, defaultOptions]
  );

  const createBarChart = useCallback(
    (data: ChartData) => ({
      data: {
        ...data,
        datasets: applyAutoColors(data.datasets),
      },
      options: defaultOptions,
    }),
    [applyAutoColors, defaultOptions]
  );

  const createPieChart = useCallback(
    (data: ChartData) => ({
      data: {
        ...data,
        datasets: applyAutoColors(data.datasets),
      },
      options: {
        ...defaultOptions,
        scales: undefined, // Pie chart에는 scales 불필요
      },
    }),
    [applyAutoColors, defaultOptions]
  );

  const createDoughnutChart = useCallback(
    (data: ChartData) => ({
      data: {
        ...data,
        datasets: applyAutoColors(data.datasets),
      },
      options: {
        ...defaultOptions,
        scales: undefined, // Doughnut chart에는 scales 불필요
      },
    }),
    [applyAutoColors, defaultOptions]
  );

  return {
    chartRef,
    colorPalette,
    formatCurrency,
    formatNumber,
    formatPercent,
    createLineChart,
    createBarChart,
    createPieChart,
    createDoughnutChart,
    defaultOptions,
    applyAutoColors,
  };
};

export default useChart;
