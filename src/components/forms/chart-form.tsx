'use client';

import { SymbolSearchInput } from '../common/symbol-search-input';
import { ChartConfig } from '@/types/yahoo-finance';
import { Button, Container, Heading, Input, Label, RadioGroup, Text } from '@medusajs/ui';
import React, { useCallback, useState } from 'react';

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
          <SymbolSearchInput value={symbol} onChange={setSymbol} />

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
