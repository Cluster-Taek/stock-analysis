# useChart Hook 사용 가이드

Chart.js를 React에서 편리하게 사용할 수 있도록 만든 커스텀 훅입니다.

## 🚀 주요 기능

- ✅ **자동 색상 적용**: 테마에 맞는 색상 팔레트 제공
- ✅ **다크/라이트 테마 지원**: next-themes와 연동
- ✅ **타입스크립트 지원**: 완전한 타입 안전성
- ✅ **다국어 포맷팅**: 통화, 숫자, 퍼센트 포맷팅 지원
- ✅ **반응형 디자인**: 다양한 화면 크기 지원
- ✅ **4가지 차트 타입**: Line, Bar, Pie, Doughnut

## 📦 설치된 의존성

```bash
# 이미 설치됨
chart.js: ^4.5.0
react-chartjs-2: ^5.3.0
```

## 🎯 기본 사용법

### 1. Hook Import

```tsx
import useChart from '@/hooks/use-chart';
import { useTheme } from 'next-themes';
import { Line } from 'react-chartjs-2';
```

### 2. 라인 차트 예제

```tsx
const MyLineChart = () => {
  const { theme } = useTheme();
  const { createLineChart } = useChart({
    theme: theme === 'dark' ? 'dark' : 'light',
  });

  const data = {
    labels: ['1월', '2월', '3월', '4월', '5월'],
    datasets: [
      {
        label: '매출',
        data: [12000, 19000, 8000, 15000, 20000],
      },
    ],
  };

  const { data: chartData, options } = createLineChart(data);

  return (
    <div className="w-full h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};
```

### 3. 바 차트 예제

```tsx
const MyBarChart = () => {
  const { theme } = useTheme();
  const { createBarChart } = useChart({
    theme: theme === 'dark' ? 'dark' : 'light',
  });

  const data = {
    labels: ['상품A', '상품B', '상품C'],
    datasets: [
      {
        label: '판매량',
        data: [65, 59, 80],
      },
    ],
  };

  const { data: chartData, options } = createBarChart(data);

  return <Bar data={chartData} options={options} />;
};
```

## ⚙️ Hook 옵션

```tsx
const chartHook = useChart({
  responsive: true, // 반응형 여부 (기본값: true)
  maintainAspectRatio: false, // 비율 유지 여부 (기본값: false)
  animation: true, // 애니메이션 여부 (기본값: true)
  theme: 'light', // 테마 ('light' | 'dark')
  locale: 'ko-KR', // 로케일 (기본값: 'ko-KR')
});
```

## 🎨 제공되는 유틸리티

### 색상 팔레트

```tsx
const { colorPalette } = useChart({ theme: 'dark' });

console.log(colorPalette);
// {
//   primary: '#3B82F6',
//   secondary: '#8B5CF6',
//   success: '#10B981',
//   warning: '#F59E0B',
//   error: '#EF4444',
//   info: '#06B6D4',
//   text: '#F9FAFB',
//   background: '#1F2937',
//   border: '#374151',
//   grid: '#374151'
// }
```

### 포맷팅 함수

```tsx
const { formatCurrency, formatNumber, formatPercent } = useChart();

formatCurrency(12000); // ₩12,000
formatNumber(1234.56); // 1,234.56
formatPercent(85); // 85.0%
```

### 자동 색상 적용

```tsx
const { applyAutoColors } = useChart();

const datasets = applyAutoColors([
  { label: 'A', data: [1, 2, 3] },
  { label: 'B', data: [4, 5, 6] },
]);
// 자동으로 backgroundColor, borderColor 적용됨
```

## 📊 차트 타입별 함수

### createLineChart

- 라인 차트용 데이터와 옵션 생성
- 자동으로 `tension: 0.4`, `fill: false` 적용

### createBarChart

- 바 차트용 데이터와 옵션 생성
- 기본 스케일과 그리드 설정 포함

### createPieChart

- 파이 차트용 데이터와 옵션 생성
- 스케일 설정 자동 제거

### createDoughnutChart

- 도넛 차트용 데이터와 옵션 생성
- 스케일 설정 자동 제거

## 🌟 고급 사용법

### 커스텀 색상 적용

```tsx
const data = {
  labels: ['A', 'B', 'C'],
  datasets: [
    {
      label: '커스텀 데이터',
      data: [10, 20, 30],
      backgroundColor: '#FF6384',
      borderColor: '#FF6384',
      borderWidth: 3,
    },
  ],
};
```

### 다중 데이터셋

```tsx
const data = {
  labels: ['1월', '2월', '3월'],
  datasets: [
    {
      label: '매출',
      data: [100, 200, 150],
    },
    {
      label: '비용',
      data: [80, 120, 90],
    },
    {
      label: '이익',
      data: [20, 80, 60],
    },
  ],
};
```

### 조건부 테마 적용

```tsx
const MyChart = () => {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;

  const { createLineChart } = useChart({
    theme: currentTheme === 'dark' ? 'dark' : 'light',
  });

  // ...
};
```

## 🔧 문제 해결

### 차트가 보이지 않는 경우

1. 컨테이너에 명시적인 높이 설정 필요

```tsx
<div className="h-64">
  {' '}
  {/* 높이 설정 필수 */}
  <Line data={data} options={options} />
</div>
```

### 테마 변경이 반영되지 않는 경우

1. useTheme hook이 올바르게 설정되었는지 확인
2. ThemeProvider로 앱이 감싸져 있는지 확인

### TypeScript 에러가 발생하는 경우

1. Chart.js 타입이 올바르게 설치되었는지 확인
2. react-chartjs-2 타입 정의 확인

## 📱 실제 사용 예제

전체 대시보드 예제는 `src/components/chart-examples.tsx`를 참고하세요!

```tsx
import ChartDashboard from '@/components/chart-examples';

// 페이지에서 사용
export default function DashboardPage() {
  return <ChartDashboard />;
}
```
