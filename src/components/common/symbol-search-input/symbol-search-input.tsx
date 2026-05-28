'use client';

import { useStockSearch } from '@/hooks/use-stock-search';
import { SearchResult } from '@/types/yahoo-finance';
import { MagnifyingGlass, Spinner } from '@medusajs/icons';
import { Input } from '@medusajs/ui';
import { useCallback, useEffect, useState } from 'react';

interface ISymbolSearchInputProps {
  value: string;
  onChange: (symbol: string) => void;
}

export const SymbolSearchInput = ({ value, onChange }: ISymbolSearchInputProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 종목 검색 훅
  const { data: searchResults, isLoading: searchLoading } = useStockSearch({
    query: searchQuery,
    enabled: searchQuery.length >= 2,
  });

  // 종목 선택
  const handleSelectStock = useCallback(
    (stock: SearchResult) => {
      onChange(stock.symbol);
      setSearchQuery('');
      setShowDropdown(false);
      setSelectedIndex(-1);
    },
    [onChange]
  );

  // 검색어 변경
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onChange(value);
      setShowDropdown(value.length >= 2);
      setSelectedIndex(-1);
    },
    [onChange]
  );

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
    <div className="relative">
      <Input
        id="symbol"
        type="text"
        value={searchQuery || value}
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
  );
};
