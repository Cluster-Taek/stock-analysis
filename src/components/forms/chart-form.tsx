'use client';

import { useStockSearch } from '@/hooks/use-stock-search';
import { ChartConfig, SearchResult } from '@/types/yahoo-finance';
import { MagnifyingGlass, Spinner } from '@medusajs/icons';
import { Button, Container, Heading, Input, Label, RadioGroup, Text } from '@medusajs/ui';
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
    initialValues?.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1년 전
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
    <Container className={className}>
      <div className="space-y-6">
        <div>
          <Heading level="h3">차트 설정</Heading>
          <Text size="small" className="text-ui-fg-muted mt-1">
            종목과 기간을 선택하여 주식 차트를 확인하세요
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 종목 검색 */}
          <div className="space-y-2">
            <Label htmlFor="symbol">종목 심볼</Label>
            <div className="relative">
              <Input
                id="symbol"
                type="text"
                value={searchQuery || symbol}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onClick={() => setShowDropdown(searchQuery.length >= 2)}
                placeholder="AAPL, TSLA, MSFT 등을 입력하세요"
                autoComplete="off"
                className="pr-10"
              />

              {/* 아이콘 표시 */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {searchLoading ? (
                  <Spinner className="animate-spin h-4 w-4 text-ui-fg-muted" />
                ) : (
                  <MagnifyingGlass className="h-4 w-4 text-ui-fg-muted" />
                )}
              </div>

              {/* 검색 결과 드롭다운 */}
              {showDropdown && searchResults?.results && searchResults.results.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-ui-bg-base border border-ui-border-base rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.results.map((stock, index) => (
                    <button
                      key={stock.symbol}
                      type="button"
                      onClick={() => handleSelectStock(stock)}
                      className={`w-full px-3 py-3 text-left hover:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover focus:outline-none border-b border-ui-border-base last:border-b-0 ${
                        index === selectedIndex ? 'bg-ui-bg-highlight text-ui-fg-base' : 'text-ui-fg-base'
                      }`}
                    >
                      <div className="font-medium text-ui-fg-base">{stock.symbol}</div>
                      <div className="text-small text-ui-fg-muted">
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
              <Label htmlFor="startDate">시작일</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">종료일</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* 인터벌 선택 */}
          <div className="space-y-2">
            <Label>데이터 간격</Label>
            <RadioGroup
              value={interval}
              onValueChange={(value) => setInterval(value as '1d' | '1wk' | '1mo')}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroup.Item value="1d" id="interval-1d" />
                <Label htmlFor="interval-1d" className="cursor-pointer">
                  일별
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroup.Item value="1wk" id="interval-1wk" />
                <Label htmlFor="interval-1wk" className="cursor-pointer">
                  주별
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroup.Item value="1mo" id="interval-1mo" />
                <Label htmlFor="interval-1mo" className="cursor-pointer">
                  월별
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 제출 버튼 */}
          <Button type="submit" disabled={!isValid || loading} className="w-full" size="large" isLoading={loading}>
            차트 보기
          </Button>

          {/* 유효성 검사 메시지 */}
          {!isValid && symbol && startDate && endDate && (
            <Text size="small" className="text-ui-fg-error">
              {new Date(startDate) > new Date(endDate)
                ? '시작일이 종료일보다 늦을 수 없습니다.'
                : '모든 필수 항목을 입력해주세요.'}
            </Text>
          )}
        </form>
      </div>
    </Container>
  );
}
