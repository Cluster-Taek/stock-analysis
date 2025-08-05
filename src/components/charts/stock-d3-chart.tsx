'use client';

import { useD3Chart } from '@/components/d3charts';
import { HistoricalDataPoint } from '@/types/yahoo-finance';
import { useTheme } from 'next-themes';
import React, { useEffect, useMemo } from 'react';

// D3를 동적으로 import
let d3: typeof import('d3');

async function loadD3() {
  if (typeof window !== 'undefined' && !d3) {
    d3 = await import('d3');
  }
}

loadD3();

interface StockD3ChartProps {
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
 * D3를 사용한 주식 히스토리컬 데이터 시각화 컴포넌트
 */
export function StockD3Chart({
  data,
  symbol,
  loading = false,
  error,
  height = 400,
  className = '',
  showVolume = false,
  showAdjustedClose = false,
}: StockD3ChartProps) {

  // 정렬된 데이터
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // 가격별 거래량 데이터
  const volumeByPriceData = useMemo(() => {
    if (sortedData.length === 0 || !showVolume) return [];
    const volumeByPrice = calculateVolumeByPrice(sortedData, 50);
    return volumeByPrice.sort((a, b) => b.priceRange - a.priceRange); // 높은 가격부터
  }, [sortedData, showVolume]);

  // 메인 차트 설정
  const {
    svgRef: mainSvgRef,
    containerRef: mainContainerRef,
    drawChart: drawMainChart,
  } = useD3Chart({
    data: sortedData,
    config: {
      margins: { top: 20, right: showVolume ? 80 : 60, bottom: 60, left: 80 },
      animation: { duration: 1000 },
    },
  });

  // 거래량 차트 설정 (가격별 거래량)
  const {
    svgRef: volumeSvgRef,
    containerRef: volumeContainerRef,
    drawChart: drawVolumeChart,
  } = useD3Chart({
    data: volumeByPriceData,
    config: {
      margins: { top: 20, right: 20, bottom: 60, left: 60 },
      animation: { duration: 800 },
    },
  });

  // 메인 차트 그리기
  useEffect(() => {
    if (!d3 || sortedData.length === 0) return;

    const cleanup = drawMainChart(({ data, g, dimensions, scales, axes, grid, colors, animate, tooltip }) => {
      // 시간 스케일
      const xScale = scales.time().domain(d3.extent(data, (d) => new Date(d.date)) as [Date, Date]);

      // 가격 스케일
      const priceExtent = d3.extent(data.flatMap((d) => [d.high, d.low])) as [number, number];
      const yScale = scales.linear().domain(priceExtent).nice();

      // 거래량 스케일 (오른쪽 축)
      const volumeScale = scales
        .linear()
        .domain([0, d3.max(data, (d) => d.volume) as number])
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
        tickFormat: (d) => `$${d.toFixed(2)}`,
        label: '가격 ($)',
      });

      // 종가 선 그리기
      const closeLine = d3
        .line<HistoricalDataPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScale(d.close))
        .curve(d3.curveMonotoneX);

      const closePath = g
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 2)
        .attr('d', closeLine);

      // 시가 선 그리기
      const openLine = d3
        .line<HistoricalDataPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScale(d.open))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colors.secondary)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,5')
        .attr('d', openLine);

      // 조정종가 선 그리기 (선택적)
      if (showAdjustedClose) {
        const adjCloseLine = d3
          .line<HistoricalDataPoint>()
          .x((d) => xScale(new Date(d.date)))
          .y((d) => yScale(d.adjustedClose))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', colors.accent)
          .attr('stroke-width', 1.5)
          .attr('d', adjCloseLine);
      }

      // 선 애니메이션
      const totalLength = closePath.node()?.getTotalLength() || 0;
      closePath.attr('stroke-dasharray', `${totalLength} ${totalLength}`).attr('stroke-dashoffset', totalLength);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      animate(closePath as any).attr('stroke-dashoffset', 0);

      // 거래량 막대 (선택적)
      if (showVolume) {
        const barWidth = (dimensions.innerWidth / data.length) * 0.6;

        g.selectAll('.volume-bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'volume-bar')
          .attr('x', (d) => xScale(new Date(d.date)) - barWidth / 2)
          .attr('width', barWidth)
          .attr('y', dimensions.innerHeight)
          .attr('height', 0)
          .attr('fill', colors.secondary)
          .attr('opacity', 0.3);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        animate(g.selectAll('.volume-bar') as any)
          .attr('y', (d: HistoricalDataPoint) => volumeScale(d.volume))
          .attr('height', (d: HistoricalDataPoint) => dimensions.innerHeight - volumeScale(d.volume));

        // 거래량 축 (오른쪽)
        const volumeAxis = d3.axisRight(volumeScale).tickFormat((d) => {
          const num = Number(d);
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
          if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
          return num.toLocaleString();
        });

        g.append('g')
          .attr('class', 'volume-axis')
          .attr('transform', `translate(${dimensions.innerWidth}, 0)`)
          .call(volumeAxis)
          .selectAll('text, line')
          .attr('fill', colors.text);
      }

      // 데이터 포인트와 툴팁
      g.selectAll('.data-point')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', (d) => xScale(new Date(d.date)))
        .attr('cy', (d) => yScale(d.close))
        .attr('r', 0)
        .attr('fill', colors.primary)
        .attr('stroke', colors.background)
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
          d3.select(this).attr('r', 6);

          const change = d.close - d.open;
          const changePercent = (change / d.open) * 100;
          const changeText = change >= 0 ? `+$${change.toFixed(2)}` : `-$${Math.abs(change).toFixed(2)}`;
          const percentText = change >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`;

          const date = new Date(d.date);
          const content = `
            <div class="font-semibold">${symbol} - ${date.toLocaleDateString('ko-KR')}</div>
            <div>종가: $${d.close.toFixed(2)}</div>
            <div>시가: $${d.open.toFixed(2)}</div>
            <div>최고가: $${d.high.toFixed(2)}</div>
            <div>최저가: $${d.low.toFixed(2)}</div>
            <div>일일 변동: ${changeText} (${percentText})</div>
            <div>거래량: ${d.volume.toLocaleString()}</div>
            ${showAdjustedClose ? `<div>조정종가: $${d.adjustedClose.toFixed(2)}</div>` : ''}
          `;

          tooltip.show(content, event);
        })
        .on('mouseout', function () {
          d3.select(this).attr('r', 4);
          tooltip.hide();
        })
        .on('mousemove', function (event) {
          tooltip.move(event);
        });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      animate(g.selectAll('.data-point') as any).attr('r', 4);

      // 범례
      const legend = g.append('g').attr('class', 'legend').attr('transform', `translate(10, 10)`);

      const legendItems = [
        { label: `${symbol} 종가`, color: colors.primary, style: 'solid' },
        { label: `${symbol} 시가`, color: colors.secondary, style: 'dashed' },
      ];

      if (showAdjustedClose) {
        legendItems.push({ label: `${symbol} 조정종가`, color: colors.accent, style: 'solid' });
      }

      legendItems.forEach((item, i) => {
        const legendItem = legend.append('g').attr('transform', `translate(0, ${i * 20})`);

        legendItem
          .append('line')
          .attr('x1', 0)
          .attr('x2', 20)
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', item.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', item.style === 'dashed' ? '5,5' : 'none');

        legendItem
          .append('text')
          .attr('x', 25)
          .attr('y', 0)
          .attr('dy', '0.35em')
          .attr('fill', colors.text)
          .style('font-size', '12px')
          .text(item.label);
      });
    });

    return cleanup;
  }, [drawMainChart, sortedData, symbol, showVolume, showAdjustedClose]);

  // 가격별 거래량 차트 그리기
  useEffect(() => {
    if (!d3 || !showVolume || volumeByPriceData.length === 0) return;

    const cleanup = drawVolumeChart(({ data, g, dimensions, scales, axes, colors, animate }) => {
      // 가격 스케일 (Y축, 수직)
      const yScale = scales
        .linear()
        .domain(d3.extent(data, (d) => d.priceRange) as [number, number])
        .range([dimensions.innerHeight, 0]);

      // 거래량 스케일 (X축, 수평)
      const xScale = scales
        .linear()
        .domain([0, d3.max(data, (d) => d.volume) as number])
        .range([0, dimensions.innerWidth]);

      // 축
      axes.xAxis(xScale, {
        tickFormat: (d) => {
          const num = Number(d);
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
          if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
          return num.toLocaleString();
        },
        label: '거래량',
      });

      axes.yAxis(yScale, {
        tickFormat: (d) => `$${d.toFixed(0)}`,
        label: '가격 ($)',
      });

      // 수평 막대 그리기
      const barHeight = (dimensions.innerHeight / data.length) * 0.8;

      g.selectAll('.volume-bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'volume-bar')
        .attr('x', 0)
        .attr('y', (d) => yScale(d.priceRangeEnd) - barHeight / 2)
        .attr('width', 0)
        .attr('height', barHeight)
        .attr('fill', colors.warning)
        .attr('opacity', 0.7)
        .attr('stroke', colors.warning)
        .attr('stroke-width', 1);

      // 애니메이션
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      animate(g.selectAll('.volume-bar') as any).attr('width', (d: any) => xScale(d.volume));

      // 제목
      g.append('text')
        .attr('x', dimensions.innerWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.text)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('가격별 거래량 분포');
    });

    return cleanup;
  }, [drawVolumeChart, volumeByPriceData, showVolume]);

  if (loading) {
    return (
      <div className={className}>
        {showVolume ? (
          <div className="flex gap-4">
            <div className="flex-1 h-96 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">차트 로딩 중...</div>
            </div>
            <div className="w-80 h-96 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">거래량 차트 로딩 중...</div>
            </div>
          </div>
        ) : (
          <div className="h-96 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">차트 로딩 중...</div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {showVolume ? (
          <div className="flex gap-4">
            <div className="flex-1 h-96 border border-red-200 dark:border-red-700 rounded-lg flex items-center justify-center">
              <div className="text-red-500">{error}</div>
            </div>
            <div className="w-80 h-96 border border-red-200 dark:border-red-700 rounded-lg flex items-center justify-center">
              <div className="text-red-500">{error}</div>
            </div>
          </div>
        ) : (
          <div className="h-96 border border-red-200 dark:border-red-700 rounded-lg flex items-center justify-center">
            <div className="text-red-500">{error}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {showVolume ? (
        <div className="flex gap-4">
          <div className="flex-1">
            <div
              ref={mainContainerRef}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              style={{ height }}
            >
              <svg ref={mainSvgRef} className="w-full h-full" />
            </div>
          </div>
          <div className="w-80">
            <div
              ref={volumeContainerRef}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              style={{ height }}
            >
              <svg ref={volumeSvgRef} className="w-full h-full" />
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={mainContainerRef}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          style={{ height }}
        >
          <svg ref={mainSvgRef} className="w-full h-full" />
        </div>
      )}
    </div>
  );
}
