'use client';

import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// D3를 동적으로 import
let d3: typeof import('d3');

async function loadD3() {
  if (typeof window !== 'undefined' && !d3) {
    d3 = await import('d3');
  }
}

loadD3();

export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
}

export interface D3ChartConfig {
  margins?: ChartMargins;
  responsive?: boolean;
  animation?: {
    duration?: number;
    ease?: (t: number) => number;
  };
}

export interface UseD3ChartOptions<T = unknown> {
  data: T[];
  config?: D3ChartConfig;
}

const defaultMargins: ChartMargins = {
  top: 20,
  right: 30,
  bottom: 40,
  left: 50,
};

const defaultConfig: Required<D3ChartConfig> = {
  margins: defaultMargins,
  responsive: true,
  animation: {
    duration: 750,
    ease: (t: number) => t * t,
  },
};

export function useD3Chart<T = unknown>({ data, config = {} }: UseD3ChartOptions<T>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 800,
    height: 400,
    innerWidth: 0,
    innerHeight: 0,
  });

  const mergedConfig = useMemo(() => {
    if (!d3) return defaultConfig;
    return {
      ...defaultConfig,
      ...config,
      animation: {
        ...defaultConfig.animation,
        ...config.animation,
        ease: config.animation?.ease || (d3 ? d3.easeQuadInOut : (t: number) => t * t),
      },
    };
  }, [config]);

  const margins = useMemo(() => ({ ...defaultMargins, ...mergedConfig.margins }), [mergedConfig.margins]);

  // 테마에 따른 색상 설정
  const getColors = useCallback(() => {
    const isDark = theme === 'dark';
    return {
      background: isDark ? '#1f2937' : '#ffffff',
      text: isDark ? '#f9fafb' : '#111827',
      grid: isDark ? '#374151' : '#e5e7eb',
      primary: isDark ? '#3b82f6' : '#2563eb',
      secondary: isDark ? '#10b981' : '#059669',
      accent: isDark ? '#f59e0b' : '#d97706',
      danger: isDark ? '#ef4444' : '#dc2626',
    };
  }, [theme]);

  // 리사이즈 처리
  useEffect(() => {
    if (!mergedConfig.responsive || !containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const innerWidth = Math.max(0, width - margins.left - margins.right);
        const innerHeight = Math.max(0, height - margins.top - margins.bottom);

        setDimensions({
          width,
          height,
          innerWidth,
          innerHeight,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [margins, mergedConfig.responsive]);

  // SVG 초기화
  const initializeSVG = useCallback(() => {
    if (!svgRef.current || !d3) return null;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // 메인 그룹 생성
    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margins.left},${margins.top})`);

    return { svg, g };
  }, [dimensions, margins]);

  // 스케일 생성 유틸리티
  const createScales = useCallback(() => {
    if (!d3) throw new Error('D3 is not available');

    return {
      // 선형 스케일
      linear: () => d3.scaleLinear().range([dimensions.innerHeight, 0]),

      // 밴드 스케일 (막대 차트용)
      band: () => d3.scaleBand().range([0, dimensions.innerWidth]).padding(0.1),

      // 시간 스케일
      time: () => d3.scaleTime().range([0, dimensions.innerWidth]),

      // 색상 스케일
      ordinal: (colors?: string[]) => {
        const defaultColors = [getColors().primary, getColors().secondary, getColors().accent, getColors().danger];
        return d3.scaleOrdinal(colors || defaultColors);
      },
    };
  }, [dimensions, getColors]);

  // 축 생성 유틸리티
  const createAxes = useCallback(
    (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
      const colors = getColors();

      return {
        // X축
        xAxis: (
          scale: d3.AxisScale<d3.NumberValue>,
          options?: {
            tickFormat?: (d: d3.NumberValue) => string;
            ticks?: number;
            label?: string;
          }
        ) => {
          const axis = d3.axisBottom(scale);

          if (options?.tickFormat) axis.tickFormat(options.tickFormat);
          if (options?.ticks) axis.ticks(options.ticks);

          const xAxisGroup = g
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${dimensions.innerHeight})`)
            .call(axis);

          xAxisGroup.selectAll('text, line').attr('fill', colors.text);
          xAxisGroup.select('.domain').attr('stroke', colors.grid);

          if (options?.label) {
            xAxisGroup
              .append('text')
              .attr('x', dimensions.innerWidth / 2)
              .attr('y', 35)
              .attr('fill', colors.text)
              .style('text-anchor', 'middle')
              .text(options.label);
          }

          return xAxisGroup;
        },

        // Y축
        yAxis: (
          scale: d3.AxisScale<d3.NumberValue>,
          options?: {
            tickFormat?: (d: d3.NumberValue) => string;
            ticks?: number;
            label?: string;
          }
        ) => {
          const axis = d3.axisLeft(scale);

          if (options?.tickFormat) axis.tickFormat(options.tickFormat);
          if (options?.ticks) axis.ticks(options.ticks);

          const yAxisGroup = g.append('g').attr('class', 'y-axis').call(axis);

          yAxisGroup.selectAll('text, line').attr('fill', colors.text);
          yAxisGroup.select('.domain').attr('stroke', colors.grid);

          if (options?.label) {
            yAxisGroup
              .append('text')
              .attr('transform', 'rotate(-90)')
              .attr('y', -35)
              .attr('x', -dimensions.innerHeight / 2)
              .attr('fill', colors.text)
              .style('text-anchor', 'middle')
              .text(options.label);
          }

          return yAxisGroup;
        },
      };
    },
    [dimensions, getColors]
  );

  // 그리드 생성 유틸리티
  const createGrid = useCallback(
    (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
      const colors = getColors();

      return {
        xGrid: (scale: d3.AxisScale<d3.NumberValue>) => {
          return g
            .append('g')
            .attr('class', 'grid x-grid')
            .attr('transform', `translate(0,${dimensions.innerHeight})`)
            .call(
              d3
                .axisBottom(scale)
                .tickSize(-dimensions.innerHeight)
                .tickFormat(() => '')
            )
            .selectAll('line')
            .attr('stroke', colors.grid)
            .attr('stroke-opacity', 0.3);
        },

        yGrid: (scale: d3.AxisScale<d3.NumberValue>) => {
          return g
            .append('g')
            .attr('class', 'grid y-grid')
            .call(
              d3
                .axisLeft(scale)
                .tickSize(-dimensions.innerWidth)
                .tickFormat(() => '')
            )
            .selectAll('line')
            .attr('stroke', colors.grid)
            .attr('stroke-opacity', 0.3);
        },
      };
    },
    [dimensions, getColors]
  );

  // 애니메이션 유틸리티
  const animate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (selection: any) => {
      if (!d3) return selection;
      return selection
        .transition()
        .duration(mergedConfig.animation.duration || 750)
        .ease(mergedConfig.animation.ease || d3.easeQuadInOut);
    },
    [mergedConfig.animation]
  );

  // 툴팁 생성 유틸리티
  const createTooltip = useCallback(() => {
    if (!d3)
      return {
        show: () => {},
        hide: () => {},
        move: () => {},
        remove: () => {},
      };

    const colors = getColors();

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', colors.background)
      .style('color', colors.text)
      .style('border', `1px solid ${colors.grid}`)
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)')
      .style('z-index', '1000');

    return {
      show: (content: string, event: MouseEvent) => {
        tooltip
          .style('visibility', 'visible')
          .html(content)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      },
      hide: () => {
        tooltip.style('visibility', 'hidden');
      },
      move: (event: MouseEvent) => {
        tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY - 10}px`);
      },
      remove: () => {
        tooltip.remove();
      },
    };
  }, [getColors]);

  // 차트 그리기 함수
  const drawChart = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (drawFunction: (params: any) => void) => {
      if (!svgRef.current || dimensions.innerWidth <= 0 || dimensions.innerHeight <= 0 || !d3) {
        return;
      }

      const result = initializeSVG();
      if (!result) return;

      const { svg, g } = result;
      const scales = createScales();
      const axes = createAxes(g);
      const grid = createGrid(g);
      const colors = getColors();
      const tooltip = createTooltip();

      drawFunction({
        data,
        svg,
        g,
        dimensions,
        scales,
        axes,
        grid,
        colors,
        animate,
        tooltip,
      });

      // 컴포넌트 언마운트 시 툴팁 제거
      return () => {
        tooltip.remove();
      };
    },
    [data, dimensions, initializeSVG, createScales, createAxes, createGrid, getColors, animate, createTooltip]
  );

  return {
    svgRef,
    containerRef,
    dimensions,
    drawChart,
    colors: getColors(),
  };
}

// 미리 정의된 차트 타입들
export const chartTypes = {
  // 선 차트
  line: <T extends { x: number; y: number }>(
    data: T[],
    options?: {
      xAccessor?: (d: T) => number;
      yAccessor?: (d: T) => number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      curve?: any;
      showDots?: boolean;
    }
  ) => ({
    data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    draw: ({ data, g, scales, axes, grid, colors, animate }: any) => {
      if (!d3) return;
      const xAccessor = options?.xAccessor || ((d: T) => d.x);
      const yAccessor = options?.yAccessor || ((d: T) => d.y);
      const curve = options?.curve || d3.curveMonotoneX;

      const xExtent = d3.extent(data, xAccessor);
      const yExtent = d3.extent(data, yAccessor);

      if (!xExtent[0] || !xExtent[1] || !yExtent[0] || !yExtent[1]) return;

      const xScale = scales.linear().domain(xExtent);
      const yScale = scales.linear().domain(yExtent);

      // 그리드
      grid.xGrid(xScale);
      grid.yGrid(yScale);

      // 축
      axes.xAxis(xScale);
      axes.yAxis(yScale);

      // 선 생성기
      const line = d3
        .line<T>()
        .x((d: T) => xScale(xAccessor(d)))
        .y((d: T) => yScale(yAccessor(d)))
        .curve(curve);

      // 선 그리기
      const path = g
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 2)
        .attr('d', line);

      // 애니메이션
      const totalLength = path.node()?.getTotalLength() || 0;
      path.attr('stroke-dasharray', `${totalLength} ${totalLength}`).attr('stroke-dashoffset', totalLength);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      animate(path as any).attr('stroke-dashoffset', 0);

      // 점 표시
      if (options?.showDots !== false) {
        g.selectAll('.dot')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('cx', (d: T) => xScale(xAccessor(d)))
          .attr('cy', (d: T) => yScale(yAccessor(d)))
          .attr('r', 0)
          .attr('fill', colors.primary);

        animate(g.selectAll('.dot')).attr('r', 4);
      }
    },
  }),

  // 막대 차트
  bar: <T extends { x: string; y: number }>(
    data: T[],
    options?: {
      xAccessor?: (d: T) => string;
      yAccessor?: (d: T) => number;
    }
  ) => ({
    data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    draw: ({ data, g, dimensions, scales, axes, grid, colors, animate }: any) => {
      if (!d3) return;
      const xAccessor = options?.xAccessor || ((d: T) => d.x);
      const yAccessor = options?.yAccessor || ((d: T) => d.y);

      const maxY = d3.max(data, yAccessor);
      if (!maxY) return;

      const xScale = scales.band().domain(data.map(xAccessor));
      const yScale = scales.linear().domain([0, maxY]).nice();

      // 그리드
      grid.yGrid(yScale);

      // 축
      axes.xAxis(xScale);
      axes.yAxis(yScale);

      // 막대 그리기
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d: T) => xScale(xAccessor(d)) || 0)
        .attr('width', xScale.bandwidth())
        .attr('y', dimensions.innerHeight)
        .attr('height', 0)
        .attr('fill', colors.primary);

      // 애니메이션
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      animate(g.selectAll('.bar') as any)
        .attr('y', (d: T) => yScale(yAccessor(d)))
        .attr('height', (d: T) => dimensions.innerHeight - yScale(yAccessor(d)));
    },
  }),

  // 원 차트 (파이 차트)
  pie: <T extends { label: string; value: number }>(
    data: T[],
    options?: {
      valueAccessor?: (d: T) => number;
      labelAccessor?: (d: T) => string;
      innerRadius?: number;
      showLabels?: boolean;
    }
  ) => ({
    data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    draw: ({ data, g, dimensions, scales, colors }: any) => {
      if (!d3) return;
      const valueAccessor = options?.valueAccessor || ((d: T) => d.value);
      const labelAccessor = options?.labelAccessor || ((d: T) => d.label);
      const innerRadius = options?.innerRadius || 0;
      const outerRadius = Math.min(dimensions.innerWidth, dimensions.innerHeight) / 2 - 10;

      const pie = d3.pie<T>().value(valueAccessor);
      const arc = d3.arc<d3.PieArcDatum<T>>().innerRadius(innerRadius).outerRadius(outerRadius);

      const colorScale = scales.ordinal();

      // 중앙으로 이동
      g.attr('transform', `translate(${dimensions.innerWidth / 2 + 50}, ${dimensions.innerHeight / 2 + 20})`);

      const arcs = g.selectAll('.arc').data(pie(data)).enter().append('g').attr('class', 'arc');

      // 파이 조각 그리기
      arcs
        .append('path')
        .attr('d', arc)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr('fill', (d: any, i: number) => colorScale(i.toString()))
        .attr('stroke', colors.background)
        .attr('stroke-width', 2)
        .on('mouseover', function (this: SVGPathElement) {
          // 간단한 툴팁 효과
          d3.select(this).attr('opacity', 0.8);
        })
        .on('mouseout', function (this: SVGPathElement) {
          d3.select(this).attr('opacity', 1);
        });

      // 라벨 표시
      if (options?.showLabels !== false) {
        arcs
          .append('text')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
          .attr('text-anchor', 'middle')
          .attr('fill', colors.text)
          .style('font-size', '12px')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .text((d: any) => labelAccessor(d.data));
      }
    },
  }),
};
