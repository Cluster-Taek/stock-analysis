import { useStockHistoricalData } from './use-stock-historical-data';
import { ChartConfig } from '@/types/yahoo-finance';
import { useMemo } from 'react';

interface UseStockChartParams extends ChartConfig {
  enabled?: boolean;
}

/**
 * 주식 차트 데이터와 상태를 관리하는 커스텀 훅
 */
export function useStockChart({ symbol, startDate, endDate, interval = '1d', enabled = true }: UseStockChartParams) {
  // 히스토리컬 데이터 가져오기
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useStockHistoricalData({
    symbol,
    startDate,
    endDate,
    interval,
    enabled,
  });

  // 차트에 필요한 추가 정보 계산
  const chartData = useMemo(() => {
    if (!response?.data || response.data.length === 0) {
      return null;
    }

    const data = response.data;
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 기본 통계 계산
    const prices = sortedData.map((item) => item.close);
    const volumes = sortedData.map((item) => item.volume);

    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
    const avgVolume = totalVolume / volumes.length;

    // 변동률 계산
    const totalChange = lastPrice - firstPrice;
    const totalChangePercent = (totalChange / firstPrice) * 100;

    // 일일 변동률들
    const dailyChanges = sortedData.slice(1).map((item, index) => {
      const prevPrice = sortedData[index].close;
      const currentPrice = item.close;
      return ((currentPrice - prevPrice) / prevPrice) * 100;
    });

    const volatility =
      dailyChanges.length > 0
        ? Math.sqrt(dailyChanges.reduce((sum, change) => sum + Math.pow(change, 2), 0) / dailyChanges.length)
        : 0;

    return {
      data: sortedData,
      metadata: response.metadata,
      statistics: {
        firstPrice,
        lastPrice,
        maxPrice,
        minPrice,
        totalChange,
        totalChangePercent,
        totalVolume,
        avgVolume,
        volatility,
        dataPoints: sortedData.length,
      },
    };
  }, [response]);

  // 에러 메시지 처리
  const errorMessage = useMemo(() => {
    if (!isError || !error) return null;

    if (error.message.includes('404') || error.message.includes('not found')) {
      return `종목 심볼 '${symbol}'을 찾을 수 없습니다. 올바른 심볼인지 확인해주세요.`;
    }

    if (error.message.includes('timeout')) {
      return '데이터 로딩 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
    }

    if (error.message.includes('rate limit')) {
      return 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    }

    return error.message || '차트 데이터를 불러오는데 실패했습니다.';
  }, [isError, error, symbol]);

  return {
    data: chartData?.data || [],
    metadata: chartData?.metadata || null,
    statistics: chartData?.statistics || null,
    isLoading,
    isError,
    error: errorMessage,
    refetch,
  };
}
