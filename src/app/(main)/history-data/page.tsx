'use client';

import { StockChart } from '@/components/charts';
import { CollapseSection } from '@/components/common/collapse-section';
import { ChartForm } from '@/components/forms';
import { DistributionDataTable, StockDataTable } from '@/components/tables';
import { useDistributionData } from '@/hooks/use-distribution-data';
import { useStockChart } from '@/hooks/use-stock-chart';
import { Header } from '@/medusa/components/header';
import { SingleColumnPage } from '@/medusa/layout/pages/single-column-page';
import { ChartConfig } from '@/types/yahoo-finance';
import { ArrowPath, XMark } from '@medusajs/icons';
import { Badge, Button, Container, Heading, Text } from '@medusajs/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useState } from 'react';

/**
 * useSearchParams()를 사용하는 메인 컨텐츠 컴포넌트
 */
function HistoryDataContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 차트 설정 추출하는 유틸리티 함수
  const getChartConfigFromParams = useCallback((): ChartConfig | null => {
    const symbol = searchParams.get('symbol');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const interval = searchParams.get('interval') as '1d' | '1wk' | '1mo' | null;

    if (symbol && startDate && endDate) {
      return {
        symbol,
        startDate,
        endDate,
        interval: interval || '1d',
      };
    }
    return null;
  }, [searchParams]);

  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);

  // URL 파라미터 변경 감지
  useEffect(() => {
    const config = getChartConfigFromParams();
    setChartConfig(config);
  }, [getChartConfigFromParams]);

  // 차트 데이터 훅
  const {
    data: chartData,
    metadata,
    statistics,
    isLoading,
    error,
    refetch,
  } = useStockChart({
    symbol: chartConfig?.symbol || '',
    startDate: chartConfig?.startDate || '',
    endDate: chartConfig?.endDate || '',
    interval: chartConfig?.interval || '1d',
    enabled: !!chartConfig,
  });

  // 배당 데이터 훅 (YieldMax ETF인 경우에만)
  const {
    data: distributionData,
    isLoading: isDistributionLoading,
    error: distributionError,
    isYieldmax,
    hasDistributionData,
    refetch: refetchDistribution,
  } = useDistributionData({
    symbol: chartConfig?.symbol || '',
    enabled: !!chartConfig?.symbol,
  });

  // 폼 제출 시 URL 업데이트
  const handleFormSubmit = (config: ChartConfig) => {
    const params = new URLSearchParams();
    params.set('symbol', config.symbol);
    params.set('startDate', config.startDate);
    params.set('endDate', config.endDate);
    params.set('interval', config.interval || '1d');
    router.push(`/history-data?${params.toString()}`);
  };

  // 차트 다시 로드
  const handleRefresh = () => {
    refetch();
    if (isYieldmax) {
      refetchDistribution();
    }
  };

  // 설정 초기화
  const handleReset = () => {
    router.push('/history-data');
  };

  return (
    <div className="flex flex-col h-full">
      <SingleColumnPage>
        {/* 헤더 */}
        <Container>
          <Header
            title="주식 히스토리컬 데이터"
            subtitle="종목별 과거 주가 데이터를 차트로 확인하세요"
            actions={
              chartConfig
                ? [
                    {
                      type: 'button',
                      props: {
                        children: (
                          <>
                            <ArrowPath className="h-4 w-4 mr-1" />
                            새로고침
                          </>
                        ),
                        variant: 'secondary',
                        size: 'small',
                        disabled: isLoading,
                        onClick: handleRefresh,
                      },
                    },
                    {
                      type: 'button',
                      props: {
                        children: (
                          <>
                            <XMark className="h-4 w-4 mr-1" />
                            초기화
                          </>
                        ),
                        variant: 'transparent',
                        size: 'small',
                        onClick: handleReset,
                      },
                    },
                  ]
                : []
            }
          />
        </Container>
        {/* 상단: 검색 폼 */}
        <CollapseSection title="차트 설정" defaultOpen={true}>
          <ChartForm
            onSubmit={handleFormSubmit}
            loading={isLoading}
            initialValues={chartConfig || undefined}
            key={chartConfig ? `${chartConfig.symbol}-${chartConfig.startDate}-${chartConfig.endDate}` : 'empty'}
          />
        </CollapseSection>

        {/* 개발 모드에서만 URL 정보 표시 */}
        {process.env.NODE_ENV === 'development' && chartConfig && (
          <Container>
            <div className="space-y-2">
              <Text size="small" weight="plus" className="text-ui-fg-base">
                URL 파라미터 (개발용)
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted break-all font-mono" suppressHydrationWarning>
                {typeof window !== 'undefined' ? window.location.search : ''}
              </Text>
            </div>
          </Container>
        )}

        {/* 가운데: 차트 영역 */}
        <CollapseSection title="차트" defaultOpen={true}>
          {!chartConfig ? (
            // 초기 상태
            <Container>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <Heading level="h2" className="mb-2">
                  차트를 시작하세요
                </Heading>
                <Text className="text-ui-fg-muted mb-6">
                  좌측 설정 패널에서 종목과 기간을 선택하면
                  <br />
                  히스토리컬 데이터 차트가 표시됩니다.
                </Text>

                {/* 빠른 시작 버튼들 */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {[
                    { symbol: 'YMAX', name: 'YMAX' },
                    { symbol: 'ULTY', name: 'ULTY' },
                    { symbol: 'QLD', name: 'QLD' },
                  ].map((stock) => (
                    <Button
                      key={stock.symbol}
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        const quickConfig: ChartConfig = {
                          symbol: stock.symbol,
                          startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          endDate: new Date().toISOString().split('T')[0],
                          interval: '1d',
                        };
                        handleFormSubmit(quickConfig);
                      }}
                    >
                      {stock.symbol} ({stock.name})
                    </Button>
                  ))}
                </div>
              </div>
            </Container>
          ) : (
            // 차트 표시
            <div className="space-y-3">
              {/* 통계 정보 카드 */}
              {statistics && (
                <Container>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">📈</span>
                        <Heading level="h3">{chartConfig.symbol} 주요 지표</Heading>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isYieldmax && (
                          <Badge size="small" color="orange">
                            YieldMax ETF
                          </Badge>
                        )}
                        {metadata && (
                          <Badge size="small" color="blue">
                            {metadata.dataPoints}개 데이터
                          </Badge>
                        )}
                        {metadata && metadata.fromCache && (
                          <Badge size="small" color="green">
                            캐시됨
                          </Badge>
                        )}
                        {hasDistributionData && (
                          <Badge size="small" color="purple">
                            배당 {distributionData?.distributionHistory?.length || 0}개
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div
                      className={`grid gap-4 ${isYieldmax && hasDistributionData ? 'grid-cols-2 md:grid-cols-6' : 'grid-cols-2 md:grid-cols-4'}`}
                    >
                      <div className="text-center p-4 bg-ui-bg-component border border-ui-border-base rounded-lg">
                        <Text size="xsmall" className="text-ui-fg-muted mb-1">
                          시작가
                        </Text>
                        <Text size="large" weight="plus" className="text-ui-fg-base">
                          ${statistics.firstPrice.toFixed(2)}
                        </Text>
                      </div>

                      <div className="text-center p-4 bg-ui-bg-component border border-ui-border-base rounded-lg">
                        <Text size="xsmall" className="text-ui-fg-muted mb-1">
                          종료가
                        </Text>
                        <Text size="large" weight="plus" className="text-ui-fg-base">
                          ${statistics.lastPrice.toFixed(2)}
                        </Text>
                      </div>

                      <div className="text-center p-4 bg-ui-bg-component border border-ui-border-base rounded-lg">
                        <Text size="xsmall" className="text-ui-fg-muted mb-1">
                          총 변동
                        </Text>
                        <Text
                          size="large"
                          weight="plus"
                          className={
                            statistics.totalChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-ui-fg-error'
                          }
                        >
                          {statistics.totalChange >= 0 ? '+' : ''}${statistics.totalChange.toFixed(2)}
                        </Text>
                        <Text
                          size="xsmall"
                          className={
                            statistics.totalChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-ui-fg-error'
                          }
                        >
                          {statistics.totalChangePercent >= 0 ? '+' : ''}
                          {statistics.totalChangePercent.toFixed(2)}%
                        </Text>
                      </div>

                      <div className="text-center p-4 bg-ui-bg-component border border-ui-border-base rounded-lg">
                        <Text size="xsmall" className="text-ui-fg-muted mb-1">
                          변동성
                        </Text>
                        <Text size="large" weight="plus" className="text-ui-fg-base">
                          {statistics.volatility.toFixed(2)}%
                        </Text>
                      </div>

                      {/* YieldMax ETF 추가 지표 */}
                      {isYieldmax && hasDistributionData && distributionData && (
                        <>
                          <div className="text-center p-4 bg-ui-bg-component border border-ui-border-base rounded-lg">
                            <Text size="xsmall" className="text-ui-fg-muted mb-1">
                              배당률
                            </Text>
                            <Text size="large" weight="plus" className="text-orange-600 dark:text-orange-400">
                              {distributionData.distributionRate.toFixed(2)}%
                            </Text>
                          </div>

                          <div className="text-center p-4 bg-ui-bg-component border border-ui-border-base rounded-lg">
                            <Text size="xsmall" className="text-ui-fg-muted mb-1">
                              30일 SEC 수익률
                            </Text>
                            <Text size="large" weight="plus" className="text-ui-fg-base">
                              {distributionData.secYield.toFixed(2)}%
                            </Text>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Container>
              )}

              {/* 메인 가격 차트 */}
              <Container>
                <div className="space-y-4">
                  <Heading level="h3">가격 차트</Heading>
                  <StockChart
                    data={chartData}
                    symbol={chartConfig.symbol}
                    loading={isLoading}
                    error={error || undefined}
                    height={500}
                    showVolume={true}
                    showAdjustedClose={false}
                  />
                </div>
              </Container>
            </div>
          )}
        </CollapseSection>

        {/* YieldMax ETF 배당 데이터 테이블 */}
        {chartConfig && isYieldmax && hasDistributionData && distributionData && (
          <CollapseSection title="배당 히스토리" defaultOpen={false}>
            <Container>
              <div className="space-y-3">
                {/* 배당 요약 정보 */}
                <div className="flex items-center justify-between p-4 bg-ui-bg-component border border-ui-border-base rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <Heading level="h3">{chartConfig.symbol} 배당 정보</Heading>
                      <Text size="small" className="text-ui-fg-muted">
                        총 {distributionData.distributionHistory.length}개의 배당 기록
                      </Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text size="xsmall" className="text-ui-fg-muted">
                      최근 배당 ({distributionData.distributionHistory[0]?.date || 'N/A'})
                    </Text>
                    <Text size="large" weight="plus" className="text-orange-600 dark:text-orange-400">
                      ${(distributionData.distributionHistory[0]?.amount || 0).toFixed(4)}
                    </Text>
                  </div>
                </div>

                {/* 에러 처리 */}
                {distributionError && (
                  <Container>
                    <div className="text-center py-6">
                      <Text className="text-ui-fg-error">{distributionError}</Text>
                    </div>
                  </Container>
                )}

                {/* 로딩 상태 */}
                {isDistributionLoading && (
                  <Container>
                    <div className="text-center py-6">
                      <Text className="text-ui-fg-muted">배당 데이터를 불러오는 중...</Text>
                    </div>
                  </Container>
                )}

                {/* 배당 데이터 테이블 */}
                {!isDistributionLoading && !distributionError && (
                  <DistributionDataTable data={distributionData.distributionHistory} symbol={chartConfig.symbol} />
                )}
              </div>
            </Container>
          </CollapseSection>
        )}

        {/* 하단: 주가 데이터 테이블 */}
        {chartConfig && chartData && chartData.length > 0 && (
          <CollapseSection title="주가 데이터 테이블" defaultOpen={false}>
            <StockDataTable data={chartData} symbol={chartConfig.symbol} />
          </CollapseSection>
        )}
      </SingleColumnPage>
    </div>
  );
}

/**
 * 로딩 fallback 컴포넌트
 */
function HistoryDataLoading() {
  return (
    <div className="flex flex-col h-full">
      <Header title="주식 히스토리컬 데이터" subtitle="종목별 과거 주가 데이터를 차트로 확인하세요" />
      <div className="flex-1 px-6 pb-6">
        <SingleColumnPage>
          {/* 폼 스켈레톤 */}
          <Container>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </Container>

          {/* 차트 스켈레톤 */}
          <Container>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </Container>

          {/* 테이블 스켈레톤 */}
          <Container>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </Container>
        </SingleColumnPage>
      </div>
    </div>
  );
}

/**
 * 주식 히스토리컬 데이터 차트 페이지 (Suspense boundary 포함)
 * URL searchParams를 통해 차트 설정을 관리
 */
export default function HistoryDataPage() {
  return (
    <Suspense fallback={<HistoryDataLoading />}>
      <HistoryDataContent />
    </Suspense>
  );
}
