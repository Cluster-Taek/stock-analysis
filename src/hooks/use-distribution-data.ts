import { DistributionData } from '@/types/yieldmax';
import { isYieldmaxSymbol } from '@/utils/yieldmax-utils';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

interface UseDistributionDataParams {
  symbol: string;
  enabled?: boolean;
}

/**
 * YieldMax ETF의 배당 데이터를 조회하는 커스텀 훅
 */
export function useDistributionData({ symbol, enabled = true }: UseDistributionDataParams) {
  // YieldMax 심볼인지 확인
  const isYieldmax = useMemo(() => {
    return symbol ? isYieldmaxSymbol(symbol) : false;
  }, [symbol]);

  // API 호출
  const query = useQuery({
    queryKey: ['distribution', symbol],
    queryFn: async (): Promise<{ success: boolean; data: DistributionData }> => {
      if (!symbol || !isYieldmax) {
        throw new Error('Not a YieldMax symbol');
      }

      const response = await fetch(`/api/stock/${symbol}/distribution`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: enabled && Boolean(symbol) && isYieldmax,
    staleTime: 30 * 60 * 1000, // 30분
    gcTime: 60 * 60 * 1000, // 1시간 (이전 cacheTime)
    retry: (failureCount, error) => {
      // YieldMax 심볼이 아닌 경우는 재시도하지 않음
      if (error.message === 'Not a YieldMax symbol') {
        return false;
      }
      // 404 에러는 재시도하지 않음
      if (error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // 에러 메시지 처리
  const errorMessage = useMemo(() => {
    if (!query.isError || !query.error) return null;

    const error = query.error;

    if (error.message === 'Not a YieldMax symbol') {
      return null; // YieldMax가 아닌 경우 에러로 취급하지 않음
    }

    if (error.message.includes('404') || error.message.includes('not found')) {
      return `YieldMax ETF '${symbol}'의 배당 데이터를 찾을 수 없습니다.`;
    }

    if (error.message.includes('timeout')) {
      return '배당 데이터 로딩 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
    }

    if (error.message.includes('rate limit')) {
      return 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    }

    return error.message || '배당 데이터를 불러오는데 실패했습니다.';
  }, [query.isError, query.error, symbol]);

  return {
    data: query.data?.data || null,
    isLoading: query.isLoading,
    isError: query.isError && query.error?.message !== 'Not a YieldMax symbol',
    error: errorMessage,
    refetch: query.refetch,
    isYieldmax,
    // 성공적으로 데이터를 가져왔는지 여부
    hasDistributionData: Boolean(query.data?.data && isYieldmax),
  };
}
