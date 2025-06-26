'use client';

import useChart from '@/hooks/use-chart';
import { useTheme } from 'next-themes';
import React from 'react';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';

// 라인 차트 예제
export const LineChartExample = () => {
  const { theme } = useTheme();
  const { createLineChart } = useChart({
    theme: theme === 'dark' ? 'dark' : 'light',
  });

  const sampleData = {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
    datasets: [
      {
        label: '매출',
        data: [12000, 19000, 8000, 15000, 20000, 18000],
      },
      {
        label: '비용',
        data: [8000, 12000, 6000, 10000, 14000, 12000],
      },
    ],
  };

  const { data, options } = createLineChart(sampleData);

  return (
    <div className="w-full h-64">
      <h3 className="text-lg font-semibold mb-4">월별 매출/비용 현황</h3>
      <Line data={data} options={options} />
    </div>
  );
};

// 바 차트 예제
export const BarChartExample = () => {
  const { theme } = useTheme();
  const { createBarChart } = useChart({
    theme: theme === 'dark' ? 'dark' : 'light',
  });

  const sampleData = {
    labels: ['상품A', '상품B', '상품C', '상품D', '상품E'],
    datasets: [
      {
        label: '판매량',
        data: [65, 59, 80, 81, 56],
      },
    ],
  };

  const { data, options } = createBarChart(sampleData);

  return (
    <div className="w-full h-64">
      <h3 className="text-lg font-semibold mb-4">상품별 판매량</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

// 파이 차트 예제
export const PieChartExample = () => {
  const { theme } = useTheme();
  const { createPieChart } = useChart({
    theme: theme === 'dark' ? 'dark' : 'light',
  });

  const sampleData = {
    labels: ['모바일', '데스크탑', '태블릿'],
    datasets: [
      {
        label: '사용자 비율',
        data: [300, 150, 100],
      },
    ],
  };

  const { data, options } = createPieChart(sampleData);

  return (
    <div className="w-full h-64">
      <h3 className="text-lg font-semibold mb-4">디바이스별 사용자 분포</h3>
      <Pie data={data} options={options} />
    </div>
  );
};

// 도넛 차트 예제
export const DoughnutChartExample = () => {
  const { theme } = useTheme();
  const { createDoughnutChart } = useChart({
    theme: theme === 'dark' ? 'dark' : 'light',
  });

  const sampleData = {
    labels: ['완료', '진행중', '대기'],
    datasets: [
      {
        label: '작업 상태',
        data: [45, 30, 25],
      },
    ],
  };

  const { data, options } = createDoughnutChart(sampleData);

  return (
    <div className="w-full h-64">
      <h3 className="text-lg font-semibold mb-4">프로젝트 진행 상황</h3>
      <Doughnut data={data} options={options} />
    </div>
  );
};

// 전체 차트 대시보드 예제
export const ChartDashboard = () => {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Chart.js 대시보드</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <LineChartExample />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <BarChartExample />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <PieChartExample />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <DoughnutChartExample />
        </div>
      </div>
    </div>
  );
};

export default ChartDashboard;
