import { ApiResponse, HistoricalDataResponse } from '@/types/yahoo-finance';
import { useQuery } from '@tanstack/react-query';

interface UseStockHistoricalDataParams {
  symbol: string;
  startDate: string;
  endDate: string;
  interval?: '1d' | '1wk' | '1mo';
  enabled?: boolean;
}

/**
 * 종목의 히스토리컬 데이터를 가져오는 커스텀 훅
 */
export function useStockHistoricalData({
  symbol,
  startDate,
  endDate,
  interval = '1d',
  enabled = true,
}: UseStockHistoricalDataParams) {
  return useQuery({
    queryKey: ['stock-historical', symbol, startDate, endDate, interval],
    queryFn: async (): Promise<HistoricalDataResponse> => {
      if (!symbol || !startDate || !endDate) {
        throw new Error('필수 파라미터가 누락되었습니다.');
      }

      const params = new URLSearchParams({
        startDate,
        endDate,
        interval,
      });

      const response = await fetch(`/api/stock/historical/${symbol}?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '히스토리컬 데이터를 가져오는데 실패했습니다.');
      }

      const data: ApiResponse<HistoricalDataResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || '히스토리컬 데이터를 가져오는데 실패했습니다.');
      }

      return data;
    },
    enabled: enabled && !!symbol && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분 (구 cacheTime)
    retry: (failureCount, error) => {
      // 404 에러나 잘못된 심볼의 경우 재시도하지 않음
      if (error.message.includes('404') || error.message.includes('not found')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
