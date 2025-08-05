# D3 React 차트 훅 가이드

React에서 D3.js를 편리하게 사용할 수 있는 커스텀 훅과 차트 타입들을 제공합니다.

## 주요 특징

- 🎨 **반응형 디자인**: 자동 리사이즈 처리
- 🌙 **다크모드 지원**: 테마 변경 자동 대응
- ⚡ **애니메이션**: 부드러운 전환 효과
- 📊 **다양한 차트 타입**: 선형, 막대, 파이 차트 등
- 🛠️ **완전한 커스터마이징**: 자유로운 차트 구성

## 설치 및 설정

이미 프로젝트에 포함되어 있습니다:

```bash
yarn add d3 @types/d3
```

## 기본 사용법

### 1. 훅 임포트

```tsx
import { chartTypes, useD3Chart } from '@/components/d3charts';
```

### 2. 기본 선형 차트

```tsx
function LineChartExample() {
  const data = [
    { x: 0, y: 10 },
    { x: 1, y: 15 },
    { x: 2, y: 8 },
    { x: 3, y: 22 },
    // ...
  ];

  const { svgRef, containerRef, drawChart } = useD3Chart({
    data,
    config: {
      margins: { top: 20, right: 30, bottom: 40, left: 50 },
    },
  });

  useEffect(() => {
    const cleanup = drawChart(
      chartTypes.line(data, {
        showDots: true,
      }).draw
    );

    return cleanup;
  }, [drawChart]);

  return (
    <div ref={containerRef} className="w-full h-80">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
```

### 3. 막대 차트

```tsx
function BarChartExample() {
  const data = [
    { x: '월', y: 120 },
    { x: '화', y: 190 },
    { x: '수', y: 300 },
    // ...
  ];

  const { svgRef, containerRef, drawChart } = useD3Chart({ data });

  useEffect(() => {
    const cleanup = drawChart(chartTypes.bar(data).draw);
    return cleanup;
  }, [drawChart]);

  return (
    <div ref={containerRef} className="w-full h-80">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
```

### 4. 파이 차트

```tsx
function PieChartExample() {
  const data = [
    { label: 'React', value: 40 },
    { label: 'Vue', value: 25 },
    { label: 'Angular', value: 20 },
    { label: 'Svelte', value: 15 },
  ];

  const { svgRef, containerRef, drawChart } = useD3Chart({ data });

  useEffect(() => {
    const cleanup = drawChart(
      chartTypes.pie(data, {
        showLabels: true,
      }).draw
    );
    return cleanup;
  }, [drawChart]);

  return (
    <div ref={containerRef} className="w-full h-80">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
```

## 고급 사용법

### 커스텀 차트 그리기

```tsx
function CustomChart() {
  const { svgRef, containerRef, drawChart } = useD3Chart({
    data: myData,
    config: {
      margins: { top: 20, right: 30, bottom: 40, left: 60 },
      animation: {
        duration: 1000,
        ease: d3.easeElasticOut,
      },
    },
  });

  useEffect(() => {
    const cleanup = drawChart(({ data, g, dimensions, scales, axes, grid, colors, animate }) => {
      // 스케일 설정
      const xScale = scales.time().domain(d3.extent(data, (d) => d.date));

      const yScale = scales
        .linear()
        .domain(d3.extent(data, (d) => d.value))
        .nice();

      // 그리드
      grid.xGrid(xScale);
      grid.yGrid(yScale);

      // 축
      axes.xAxis(xScale, {
        tickFormat: d3.timeFormat('%m/%d'),
        label: '날짜',
      });
      axes.yAxis(yScale, {
        label: '값',
      });

      // 커스텀 시각화 요소들
      // ...

      // 애니메이션 적용
      animate(mySelection).attr('opacity', 1);
    });

    return cleanup;
  }, [drawChart]);

  return (
    <div ref={containerRef} className="w-full h-96">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
```

## 구성 옵션

### ChartConfig

```tsx
interface D3ChartConfig {
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  responsive?: boolean; // 기본값: true
  animation?: {
    duration?: number; // 기본값: 750ms
    ease?: (t: number) => number; // 기본값: d3.easeQuadInOut
  };
}
```

### 차트 타입별 옵션

#### 선형 차트 (Line Chart)

```tsx
chartTypes.line(data, {
  xAccessor?: (d) => d.x,     // X 값 접근자
  yAccessor?: (d) => d.y,     // Y 값 접근자
  curve?: d3.curveMonotoneX,  // 곡선 타입
  showDots?: true,            // 점 표시 여부
})
```

#### 막대 차트 (Bar Chart)

```tsx
chartTypes.bar(data, {
  xAccessor?: (d) => d.x,  // X 값 접근자 (문자열)
  yAccessor?: (d) => d.y,  // Y 값 접근자 (숫자)
})
```

#### 파이 차트 (Pie Chart)

```tsx
chartTypes.pie(data, {
  valueAccessor?: (d) => d.value,  // 값 접근자
  labelAccessor?: (d) => d.label,  // 라벨 접근자
  innerRadius?: 0,                 // 내부 반지름 (도넛 차트용)
  showLabels?: true,               // 라벨 표시 여부
})
```

## 유틸리티 API

### 스케일 (Scales)

```tsx
const scales = createScales();

// 선형 스케일
const xScale = scales.linear().domain([0, 100]);

// 밴드 스케일 (막대 차트용)
const xScale = scales.band().domain(['A', 'B', 'C']);

// 시간 스케일
const xScale = scales.time().domain([startDate, endDate]);

// 색상 스케일
const colorScale = scales.ordinal(['#ff0000', '#00ff00', '#0000ff']);
```

### 축 (Axes)

```tsx
// X축
axes.xAxis(xScale, {
  tickFormat: (d) => d.toFixed(1),
  ticks: 5,
  label: 'X 축 라벨',
});

// Y축
axes.yAxis(yScale, {
  tickFormat: (d) => `${d}%`,
  ticks: 10,
  label: 'Y 축 라벨',
});
```

### 그리드

```tsx
// X축 그리드
grid.xGrid(xScale);

// Y축 그리드
grid.yGrid(yScale);
```

### 애니메이션

```tsx
// 선택된 요소에 애니메이션 적용
animate(selection).attr('opacity', 1).attr('transform', 'translate(100, 0)');
```

### 툴팁

```tsx
const tooltip = createTooltip();

// 툴팁 표시
selection.on('mouseover', (event, d) => {
  tooltip.show(`값: ${d.value}`, event);
});

// 툴팁 숨기기
selection.on('mouseout', () => {
  tooltip.hide();
});
```

## 스타일링

### CSS 클래스

차트의 각 요소에는 자동으로 CSS 클래스가 할당됩니다:

```css
.x-axis {
} /* X축 */
.y-axis {
} /* Y축 */
.grid {
} /* 그리드 */
.x-grid {
} /* X축 그리드 */
.y-grid {
} /* Y축 그리드 */
.bar {
} /* 막대 */
.dot {
} /* 점 */
.arc {
} /* 파이 조각 */
```

### 다크모드

차트는 자동으로 테마를 감지하고 색상을 조정합니다:

```tsx
const colors = getColors();
// {
//   background: '#ffffff' | '#1f2937',
//   text: '#111827' | '#f9fafb',
//   grid: '#e5e7eb' | '#374151',
//   primary: '#2563eb' | '#3b82f6',
//   // ...
// }
```

## 성능 최적화

1. **메모이제이션**: 데이터가 변경되지 않으면 차트를 다시 그리지 않습니다.
2. **리사이즈 옵저버**: 효율적인 리사이즈 처리로 성능을 최적화합니다.
3. **애니메이션**: GPU 가속을 활용한 부드러운 애니메이션을 제공합니다.

## 예제 확인

더 많은 예제는 `/example` 페이지에서 확인할 수 있습니다:

- 기본 차트 타입들
- 커스텀 스톡 차트
- 애니메이션 데모
- 실시간 데이터 업데이트

## 문제 해결

### 차트가 표시되지 않는 경우

1. 컨테이너에 명시적인 크기 설정:

   ```tsx
   <div ref={containerRef} className="w-full h-80">
   ```

2. 데이터 형식 확인:

   ```tsx
   // 올바른 형식
   const data = [
     { x: 0, y: 10 },
     { x: 1, y: 15 },
   ];
   ```

3. useEffect 의존성 배열 확인:
   ```tsx
   useEffect(() => {
     const cleanup = drawChart(chartFunction);
     return cleanup;
   }, [drawChart]); // drawChart를 의존성에 포함
   ```

### 애니메이션이 작동하지 않는 경우

애니메이션 설정을 확인하세요:

```tsx
const { drawChart } = useD3Chart({
  data,
  config: {
    animation: {
      duration: 750,
      ease: d3.easeQuadInOut,
    },
  },
});
```
