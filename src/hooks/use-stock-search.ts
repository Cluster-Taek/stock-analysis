import useDebounce from './use-debounce';
import { ApiResponse, SearchResponse } from '@/types/yahoo-finance';
import { useQuery } from '@tanstack/react-query';

interface UseStockSearchParams {
  query: string;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * 종목 검색을 위한 커스텀 훅
 * 자동완성 기능을 위해 디바운싱 적용
 */
export function useStockSearch({ query, enabled = true, debounceMs = 300 }: UseStockSearchParams) {
  // 디바운싱을 적용하여 불필요한 API 호출 방지
  const debouncedQuery = useDebounce(query, debounceMs);

  return useQuery({
    queryKey: ['stock-search', debouncedQuery],
    queryFn: async (): Promise<SearchResponse> => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        return { success: true, results: [] };
      }

      const params = new URLSearchParams({
        query: debouncedQuery.trim(),
      });

      const response = await fetch(`/api/search?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '종목 검색에 실패했습니다.');
      }

      const data: ApiResponse<SearchResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || '종목 검색에 실패했습니다.');
      }

      return data;
    },
    enabled: enabled && debouncedQuery.trim().length >= 2,
    staleTime: 10 * 60 * 1000, // 10분 - 검색 결과는 상대적으로 오래 유지
    gcTime: 60 * 60 * 1000, // 1시간
    retry: 1, // 검색은 한 번만 재시도
    retryDelay: 1000,
  });
}

/**
 * 종목 검색 결과에서 특정 심볼을 찾는 헬퍼 함수
 */
export function findSymbolInResults(results: SearchResponse['results'], symbol: string) {
  return results.find((result) => result.symbol.toLowerCase() === symbol.toLowerCase());
}
