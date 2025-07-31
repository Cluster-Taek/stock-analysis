'use client';

import { useStockSearch } from '@/hooks/use-stock-search';
import { ChartConfig, SearchResult } from '@/types/yahoo-finance';
import { Button } from '@medusajs/ui';
import React, { useCallback, useEffect, useState } from 'react';

interface ChartFormProps {
  onSubmit: (config: ChartConfig) => void;
  loading?: boolean;
  initialValues?: Partial<ChartConfig>;
  className?: string;
}

/**
 * 주식 차트 설정을 위한 폼 컴포넌트
 * 종목 검색 자동완성, 날짜 선택, 인터벌 설정 기능 포함
 */
export function ChartForm({ onSubmit, loading = false, initialValues, className = '' }: ChartFormProps) {
  // 폼 상태
  const [symbol, setSymbol] = useState(initialValues?.symbol || '');
  const [startDate, setStartDate] = useState(
    initialValues?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30일 전
  );
  const [endDate, setEndDate] = useState(
    initialValues?.endDate || new Date().toISOString().split('T')[0] // 오늘
  );
  const [interval, setInterval] = useState<'1d' | '1wk' | '1mo'>(initialValues?.interval || '1d');

  // 검색 자동완성 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 종목 검색 훅
  const { data: searchResults, isLoading: searchLoading } = useStockSearch({
    query: searchQuery,
    enabled: searchQuery.length >= 2,
  });

  // 폼 검증
  const isValid = symbol.trim().length > 0 && startDate && endDate && new Date(startDate) <= new Date(endDate);

  // 폼 제출
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isValid && !loading) {
        onSubmit({
          symbol: symbol.trim().toUpperCase(),
          startDate,
          endDate,
          interval,
        });
      }
    },
    [symbol, startDate, endDate, interval, isValid, loading, onSubmit]
  );

  // 종목 선택
  const handleSelectStock = useCallback((stock: SearchResult) => {
    setSymbol(stock.symbol);
    setSearchQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
  }, []);

  // 검색어 변경
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSymbol(value);
    setShowDropdown(value.length >= 2);
    setSelectedIndex(-1);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown || !searchResults?.results?.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < searchResults.results.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && searchResults.results[selectedIndex]) {
            handleSelectStock(searchResults.results[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [showDropdown, searchResults, selectedIndex, handleSelectStock]
  );

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
      setSelectedIndex(-1);
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* 종목 검색 */}
      <div className="space-y-2">
        <label htmlFor="symbol" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          종목 심볼
        </label>
        <div className="relative">
          <input
            id="symbol"
            type="text"
            value={searchQuery || symbol}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onClick={() => setShowDropdown(searchQuery.length >= 2)}
            placeholder="AAPL, TSLA, MSFT 등을 입력하세요"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoComplete="off"
          />

          {/* 로딩 표시 */}
          {searchLoading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* 검색 결과 드롭다운 */}
          {showDropdown && searchResults?.results && searchResults.results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
              {searchResults.results.map((stock, index) => (
                <button
                  key={stock.symbol}
                  type="button"
                  onClick={() => handleSelectStock(stock)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stock.name} {stock.exchange && `• ${stock.exchange}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 날짜 선택 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            시작일
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            종료일
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            max={new Date().toISOString().split('T')[0]}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 인터벌 선택 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">데이터 간격</label>
        <div className="flex space-x-4">
          {[
            { value: '1d', label: '일별' },
            { value: '1wk', label: '주별' },
            { value: '1mo', label: '월별' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="interval"
                value={option.value}
                checked={interval === option.value}
                onChange={(e) => setInterval(e.target.value as '1d' | '1wk' | '1mo')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 제출 버튼 */}
      <Button type="submit" disabled={!isValid || loading} className="w-full" size="large">
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            차트 로딩 중...
          </div>
        ) : (
          '차트 보기'
        )}
      </Button>

      {/* 유효성 검사 메시지 */}
      {!isValid && symbol && startDate && endDate && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {new Date(startDate) > new Date(endDate)
            ? '시작일이 종료일보다 늦을 수 없습니다.'
            : '모든 필수 항목을 입력해주세요.'}
        </p>
      )}
    </form>
  );
}
