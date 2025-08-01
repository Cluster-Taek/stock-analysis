import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import 'chartjs-adapter-date-fns';

// Chart.js 플러그인 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

// 차트 기본 설정
export const defaultChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: 'rgb(107, 114, 128)', // gray-500
        font: {
          size: 12,
          weight: 500,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        title: (context: TooltipItem<'line'>[]) => {
          if (context.length > 0) {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
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
      },
    },
  },
  scales: {
    x: {
      type: 'time' as const,
      time: {
        displayFormats: {
          day: 'MMM dd',
          week: 'MMM dd',
          month: 'MMM yyyy',
        },
      },
      grid: {
        display: false,
      },
      ticks: {
        color: 'rgb(107, 114, 128)',
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(107, 114, 128, 0.1)',
      },
      ticks: {
        color: 'rgb(107, 114, 128)',
        font: {
          size: 11,
        },
        callback: function (value: string | number) {
          return `$${Number(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        },
      },
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 4,
      hitRadius: 8,
    },
    line: {
      borderWidth: 2,
      tension: 0.1,
    },
  },
};

// 차트 테마 색상
export const chartColors = {
  primary: 'rgb(59, 130, 246)', // blue-500
  success: 'rgb(34, 197, 94)', // green-500
  danger: 'rgb(239, 68, 68)', // red-500
  warning: 'rgb(245, 158, 11)', // amber-500
  info: 'rgb(168, 85, 247)', // purple-500
  gray: 'rgb(107, 114, 128)', // gray-500
};

// 다크 모드 지원을 위한 색상 유틸리티
export const getChartColors = (isDark: boolean = false) => ({
  primary: isDark ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)',
  success: isDark ? 'rgb(74, 222, 128)' : 'rgb(34, 197, 94)',
  danger: isDark ? 'rgb(248, 113, 113)' : 'rgb(239, 68, 68)',
  warning: isDark ? 'rgb(251, 191, 36)' : 'rgb(245, 158, 11)',
  info: isDark ? 'rgb(196, 181, 253)' : 'rgb(168, 85, 247)',
  gray: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
  text: isDark ? 'rgb(243, 244, 246)' : 'rgb(31, 41, 55)',
  grid: isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(107, 114, 128, 0.1)',
});

// 파이 차트 기본 설정
export const defaultPieChartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: 'rgb(107, 114, 128)', // gray-500
        font: {
          size: 11,
          weight: 500,
        },
        padding: 12,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: (context: TooltipItem<'pie'>) => {
          const label = context.label || '';
          const value = context.parsed;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${percentage}%`;
        },
      },
    },
  },
};

// 포트폴리오 차트 색상 팔레트 (medusa UI 색상 시스템 기반)
export const portfolioColors = [
  'rgb(59, 130, 246)', // blue (tag-blue-text)
  'rgb(91, 33, 182)', // purple (tag-purple-text)
  'rgb(249, 115, 22)', // orange (tag-orange-icon)
  'rgb(16, 185, 129)', // green (tag-green-icon)
  'rgb(244, 63, 94)', // red (tag-red-icon)
  'rgb(167, 139, 250)', // purple-light (tag-purple-icon)
  'rgb(96, 165, 250)', // blue-light (tag-blue-icon)
  'rgb(251, 146, 60)', // orange-light (tag-orange-icon)
  'rgb(52, 211, 153)', // green-light (tag-green-text)
  'rgb(161, 161, 170)', // gray (tag-neutral-icon)
];

// 차트 데이터셋 생성 헬퍼
export const createLineDataset = (
  label: string,
  data: { x: string | Date; y: number }[],
  color: string = chartColors.primary,
  fill: boolean = false
) => ({
  label,
  data,
  borderColor: color,
  backgroundColor: fill ? `${color}20` : 'transparent',
  fill,
  pointBackgroundColor: color,
  pointBorderColor: color,
});

// 파이 차트 데이터셋 생성 헬퍼
export const createPieDataset = (data: number[], colors: string[] = portfolioColors) => ({
  data,
  backgroundColor: colors.slice(0, data.length),
  borderColor: colors.slice(0, data.length).map((color) => color.replace('rgb', 'rgba').replace(')', ', 0.8)')),
  borderWidth: 2,
});
