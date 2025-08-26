// Yahoo Finance API 응답 타입 정의

export interface HistoricalDataPoint {
  date: string; // YYYY-MM-DD 형식
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

export interface HistoricalDataResponse {
  success: boolean;
  data: HistoricalDataPoint[];
  metadata: {
    symbol: string;
    startDate: string;
    endDate: string;
    interval: string;
    dataPoints: number;
    fromCache: boolean;
  };
  error?: string;
}

export interface StockPriceResponse {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
}

// 차트 관련 타입
export interface ChartConfig {
  symbol: string;
  startDate: string;
  endDate: string;
  interval?: '1d' | '1wk' | '1mo';
}

export type ApiResponse<T> = T | ApiErrorResponse;
