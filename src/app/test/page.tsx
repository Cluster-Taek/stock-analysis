'use client';

import { StockChart } from '@/components/charts';
import { ChartForm } from '@/components/forms';
import { useStockChart } from '@/hooks/use-stock-chart';
import { ChartConfig } from '@/types/yahoo-finance';
import React, { useState } from 'react';

/**
 * 주식 차트 컴포넌트들의 테스트 페이지
 */
export default function TestPage() {
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);

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

  // 폼 제출 핸들러
  const handleFormSubmit = (config: ChartConfig) => {
    console.log('Form submitted with config:', config);
    setChartConfig(config);
  };

  // 차트 다시 로드
  const handleRefresh = () => {
    refetch();
  };

  // 설정 초기화
  const handleReset = () => {
    setChartConfig(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">📊 주식 차트 컴포넌트 테스트</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            StockChart와 ChartForm 컴포넌트의 동작을 테스트해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 좌측: 폼 영역 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">차트 설정</h2>

              <ChartForm
                onSubmit={handleFormSubmit}
                loading={isLoading}
                initialValues={chartConfig || undefined}
                className="mb-4"
              />

              {/* 액션 버튼들 */}
              {chartConfig && (
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔄 새로고침
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    🗑️ 초기화
                  </button>
                </div>
              )}

              {/* 현재 설정 표시 */}
              {chartConfig && (
                <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">현재 설정:</h3>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>
                      <strong>종목:</strong> {chartConfig.symbol}
                    </li>
                    <li>
                      <strong>시작일:</strong> {chartConfig.startDate}
                    </li>
                    <li>
                      <strong>종료일:</strong> {chartConfig.endDate}
                    </li>
                    <li>
                      <strong>간격:</strong> {chartConfig.interval}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 우측: 차트 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">차트 미리보기</h2>
                {metadata && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {metadata.dataPoints}개 데이터 포인트
                    {metadata.fromCache && ' (캐시됨)'}
                  </span>
                )}
              </div>

              {!chartConfig ? (
                <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <p className="text-gray-500 dark:text-gray-400">좌측 폼에서 종목을 선택하면 차트가 표시됩니다</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 통계 정보 */}
                  {statistics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">시작가</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          ${statistics.firstPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">현재가</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          ${statistics.lastPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">변동</p>
                        <p
                          className={`text-sm font-semibold ${
                            statistics.totalChange >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {statistics.totalChange >= 0 ? '+' : ''}${statistics.totalChange.toFixed(2)}(
                          {statistics.totalChangePercent.toFixed(2)}%)
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">변동성</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {statistics.volatility.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 메인 차트 */}
                  <StockChart
                    data={chartData}
                    symbol={chartConfig.symbol}
                    loading={isLoading}
                    error={error || undefined}
                    height={400}
                    showVolume={false}
                    showAdjustedClose={true}
                  />

                  {/* 볼륨 차트 */}
                  <StockChart
                    data={chartData}
                    symbol={chartConfig.symbol}
                    loading={isLoading}
                    error={error || undefined}
                    height={200}
                    showVolume={true}
                    showAdjustedClose={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 디버깅 정보 */}
        {process.env.NODE_ENV === 'development' && chartConfig && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🐛 개발자 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">API 응답 메타데이터:</h4>
                <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-3 rounded-md overflow-auto">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">통계 정보:</h4>
                <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-3 rounded-md overflow-auto">
                  {JSON.stringify(statistics, null, 2)}
                </pre>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">상태 정보:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>
                  <strong>로딩:</strong> {isLoading ? '예' : '아니오'}
                </li>
                <li>
                  <strong>에러:</strong> {error || '없음'}
                </li>
                <li>
                  <strong>데이터 포인트:</strong> {chartData.length}개
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
