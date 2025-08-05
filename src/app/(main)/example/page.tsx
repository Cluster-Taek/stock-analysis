'use client';

import { useD3Chart, chartTypes } from '@/components/d3charts';
import { StockD3Chart } from '@/components/charts';
import { Container } from '@medusajs/ui';
import { useState, useEffect } from 'react';

// D3를 동적으로 import
let d3: typeof import('d3');

async function loadD3() {
  if (typeof window !== 'undefined' && !d3) {
    d3 = await import('d3');
  }
}

loadD3();

// 샘플 데이터
const lineChartData = [
  { x: 0, y: 10 },
  { x: 1, y: 15 },
  { x: 2, y: 8 },
  { x: 3, y: 22 },
  { x: 4, y: 18 },
  { x: 5, y: 25 },
  { x: 6, y: 30 },
  { x: 7, y: 28 },
  { x: 8, y: 35 },
  { x: 9, y: 40 },
];

const barChartData = [
  { x: '월', y: 120 },
  { x: '화', y: 190 },
  { x: '수', y: 300 },
  { x: '목', y: 500 },
  { x: '금', y: 200 },
  { x: '토', y: 300 },
  { x: '일', y: 250 },
];

const pieChartData = [
  { label: 'React', value: 40 },
  { label: 'Vue', value: 25 },
  { label: 'Angular', value: 20 },
  { label: 'Svelte', value: 15 },
];

const stockData = [
  { date: new Date('2024-01-01'), price: 100, volume: 1000 },
  { date: new Date('2024-01-02'), price: 105, volume: 1200 },
  { date: new Date('2024-01-03'), price: 102, volume: 800 },
  { date: new Date('2024-01-04'), price: 108, volume: 1500 },
  { date: new Date('2024-01-05'), price: 115, volume: 2000 },
  { date: new Date('2024-01-06'), price: 112, volume: 1300 },
  { date: new Date('2024-01-07'), price: 120, volume: 1800 },
];

// 실제 주식 데이터 샘플 (StockD3Chart용)
const realStockData = [
  { date: '2024-01-01', open: 100, high: 105, low: 98, close: 103, adjustedClose: 103, volume: 1500000 },
  { date: '2024-01-02', open: 103, high: 108, low: 101, close: 107, adjustedClose: 107, volume: 1800000 },
  { date: '2024-01-03', open: 107, high: 109, low: 104, close: 105, adjustedClose: 105, volume: 1200000 },
  { date: '2024-01-04', open: 105, high: 112, low: 103, close: 110, adjustedClose: 110, volume: 2100000 },
  { date: '2024-01-05', open: 110, high: 115, low: 108, close: 113, adjustedClose: 113, volume: 1900000 },
  { date: '2024-01-08', open: 113, high: 118, low: 111, close: 116, adjustedClose: 116, volume: 1700000 },
  { date: '2024-01-09', open: 116, high: 119, low: 114, close: 115, adjustedClose: 115, volume: 1400000 },
  { date: '2024-01-10', open: 115, high: 122, low: 113, close: 120, adjustedClose: 120, volume: 2200000 },
  { date: '2024-01-11', open: 120, high: 124, low: 118, close: 122, adjustedClose: 122, volume: 1600000 },
  { date: '2024-01-12', open: 122, high: 125, low: 119, close: 123, adjustedClose: 123, volume: 1500000 },
  { date: '2024-01-15', open: 123, high: 128, low: 121, close: 126, adjustedClose: 126, volume: 1800000 },
  { date: '2024-01-16', open: 126, high: 130, low: 124, close: 128, adjustedClose: 128, volume: 2000000 },
  { date: '2024-01-17', open: 128, high: 132, low: 126, close: 129, adjustedClose: 129, volume: 1700000 },
  { date: '2024-01-18', open: 129, high: 134, low: 127, close: 131, adjustedClose: 131, volume: 1900000 },
  { date: '2024-01-19', open: 131, high: 135, low: 129, close: 133, adjustedClose: 133, volume: 1600000 },
];

// 선 차트 컴포넌트
function LineChartExample() {
  const { svgRef, containerRef, drawChart } = useD3Chart({
    data: lineChartData,
    config: {
      margins: { top: 20, right: 30, bottom: 40, left: 50 },
    },
  });

  useEffect(() => {
    const cleanup = drawChart(chartTypes.line(lineChartData, {
      showDots: true,
    }).draw);
    
    return cleanup;
  }, [drawChart]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">선 차트 (Line Chart)</h3>
      <div 
        ref={containerRef} 
        className="w-full h-80 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}

// 막대 차트 컴포넌트
function BarChartExample() {
  const { svgRef, containerRef, drawChart } = useD3Chart({
    data: barChartData,
    config: {
      margins: { top: 20, right: 30, bottom: 40, left: 50 },
    },
  });

  useEffect(() => {
    const cleanup = drawChart(chartTypes.bar(barChartData).draw);
    return cleanup;
  }, [drawChart]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">막대 차트 (Bar Chart)</h3>
      <div 
        ref={containerRef} 
        className="w-full h-80 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}

// 파이 차트 컴포넌트
function PieChartExample() {
  const { svgRef, containerRef, drawChart } = useD3Chart({
    data: pieChartData,
    config: {
      margins: { top: 20, right: 30, bottom: 40, left: 50 },
    },
  });

  useEffect(() => {
    const cleanup = drawChart(chartTypes.pie(pieChartData, {
      showLabels: true,
    }).draw);
    return cleanup;
  }, [drawChart]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">파이 차트 (Pie Chart)</h3>
      <div 
        ref={containerRef} 
        className="w-full h-80 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}

// 도넛 차트 컴포넌트
function DonutChartExample() {
  const { svgRef, containerRef, drawChart } = useD3Chart({
    data: pieChartData,
    config: {
      margins: { top: 20, right: 30, bottom: 40, left: 50 },
    },
  });

  useEffect(() => {
    const cleanup = drawChart(chartTypes.pie(pieChartData, {
      innerRadius: 60,
      showLabels: false,
    }).draw);
    return cleanup;
  }, [drawChart]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">도넛 차트 (Donut Chart)</h3>
      <div 
        ref={containerRef} 
        className="w-full h-80 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}

// D3 스톡 차트 컴포넌트
function D3StockChartExample() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">D3 스톡 차트 (거래량 포함)</h3>
      <StockD3Chart
        data={realStockData}
        symbol="AAPL"
        showVolume={true}
        showAdjustedClose={true}
        height={400}
      />
    </div>
  );
}

// D3 스톡 차트 (기본)
function D3StockChartBasic() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">D3 스톡 차트 (기본)</h3>
      <StockD3Chart
        data={realStockData}
        symbol="AAPL"
        showVolume={false}
        showAdjustedClose={false}
        height={400}
      />
    </div>
  );
}

// 커스텀 스톡 차트 컴포넌트
function CustomStockChart() {
  const { svgRef, containerRef, drawChart } = useD3Chart({
    data: stockData,
    config: {
      margins: { top: 20, right: 30, bottom: 40, left: 60 },
    },
  });

  useEffect(() => {
    const cleanup = drawChart(({ data, g, dimensions, scales, axes, grid, colors, animate }) => {
      if (!d3) return;
      
      // 시간 스케일과 선형 스케일 설정
      const xScale = scales.time()
        .domain(d3.extent(data, d => d.date) as [Date, Date]);
      
      const yScale = scales.linear()
        .domain(d3.extent(data, d => d.price) as [number, number])
        .nice();

      const volumeScale = scales.linear()
        .domain([0, d3.max(data, d => d.volume) as number])
        .range([dimensions.innerHeight, dimensions.innerHeight * 0.7]);

      // 그리드
      grid.xGrid(xScale);
      grid.yGrid(yScale);

      // 축
      axes.xAxis(xScale, {
        tickFormat: d3.timeFormat('%m/%d'),
        label: '날짜',
      });
      axes.yAxis(yScale, {
        label: '가격 ($)',
      });

      // 가격 선 그리기
      const line = d3.line<typeof data[0]>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.price))
        .curve(d3.curveMonotoneX);

      const path = g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 2)
        .attr('d', line);

      // 선 애니메이션
      const totalLength = path.node()?.getTotalLength() || 0;
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength);

      animate(path).attr('stroke-dashoffset', 0);

      // 거래량 막대 그리기
      g.selectAll('.volume-bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'volume-bar')
        .attr('x', d => xScale(d.date) - 2)
        .attr('width', 4)
        .attr('y', dimensions.innerHeight)
        .attr('height', 0)
        .attr('fill', colors.secondary)
        .attr('opacity', 0.6);

      animate(g.selectAll('.volume-bar'))
        .attr('y', d => volumeScale(d.volume))
        .attr('height', d => dimensions.innerHeight - volumeScale(d.volume));

      // 데이터 포인트
      g.selectAll('.price-dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'price-dot')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.price))
        .attr('r', 0)
        .attr('fill', colors.primary)
        .on('mouseover', function(_event, _d) {
          // 간단한 툴팁 효과
          d3.select(this).attr('r', 6);
        })
        .on('mouseout', function() {
          d3.select(this).attr('r', 4);
        });

      animate(g.selectAll('.price-dot')).attr('r', 4);
    });

    return cleanup;
  }, [drawChart]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">커스텀 스톡 차트 (Custom Stock Chart)</h3>
      <div 
        ref={containerRef} 
        className="w-full h-80 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}

// 애니메이션 데모 컴포넌트
function AnimationDemo() {
  const [animatedData, setAnimatedData] = useState(lineChartData.slice(0, 3));
  const { svgRef, containerRef, drawChart } = useD3Chart({
    data: animatedData,
    config: {
      margins: { top: 20, right: 30, bottom: 40, left: 50 },
      animation: {
        duration: 1000,
      },
    },
  });

  useEffect(() => {
    const cleanup = drawChart(chartTypes.line(animatedData, {
      showDots: true,
    }).draw);
    return cleanup;
  }, [drawChart, animatedData]);

  const addDataPoint = () => {
    if (animatedData.length < lineChartData.length) {
      setAnimatedData(prev => [...prev, lineChartData[prev.length]]);
    }
  };

  const resetData = () => {
    setAnimatedData(lineChartData.slice(0, 3));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">애니메이션 데모</h3>
        <div className="space-x-2">
          <button
            onClick={addDataPoint}
            disabled={animatedData.length >= lineChartData.length}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            데이터 추가
          </button>
          <button
            onClick={resetData}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            리셋
          </button>
        </div>
      </div>
      <div 
        ref={containerRef} 
        className="w-full h-80 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}

export default function ExamplePage() {
  return (
    <Container className="py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">D3 React 차트 예제</h1>
          <p className="text-gray-600 dark:text-gray-400">
            D3.js를 React에서 쉽게 사용할 수 있는 차트 훅과 다양한 예제들입니다.
          </p>
        </div>

        <div className="grid gap-8">
          <LineChartExample />
          <BarChartExample />
          
          <div className="grid md:grid-cols-2 gap-8">
            <PieChartExample />
            <DonutChartExample />
          </div>
          
          <D3StockChartExample />
          <D3StockChartBasic />
          <CustomStockChart />
          <AnimationDemo />
        </div>

        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">사용법</h3>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-x-auto">
{`import { useD3Chart, chartTypes } from '@/components/d3charts';

function MyChart() {
  const { svgRef, containerRef, drawChart } = useD3Chart({
    data: myData,
    config: {
      margins: { top: 20, right: 30, bottom: 40, left: 50 },
    },
  });

  useEffect(() => {
    const cleanup = drawChart(chartTypes.line(myData).draw);
    return cleanup;
  }, [drawChart]);

  return (
    <div ref={containerRef} className="w-full h-80">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}`}
          </pre>
        </div>
      </div>
    </Container>
  );
}