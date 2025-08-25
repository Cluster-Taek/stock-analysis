'use client';

import { BacktestingChart } from '../charts/backtesting-chart';
import MultiSelect from '../common/multi-select';
import { useBacktesting } from '@/contexts/backtesting-provider';
import { IBacktestingConfig } from '@/types/investor';
import { Button, Container, Input, Label, Text } from '@medusajs/ui';
import { useState } from 'react';

const BacktestingResult = () => {
  const { portfolios, selectedPortfolios, backtestingResults, startBacktesting, isLoading } = useBacktesting();

  const [backtestingConfig, setBacktestingConfig] = useState<IBacktestingConfig>({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    interval: '1d',
  });

  const handleStartBacktesting = () => {
    const selectedIds = Array.from(selectedPortfolios);
    if (selectedIds.length > 0) {
      startBacktesting(selectedIds, backtestingConfig);
    }
  };

  const selectedPortfolioNames = Array.from(selectedPortfolios)
    .map((id) => portfolios.find((p) => p.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-y-4">
      {selectedPortfolios.size > 0 && (
        <Container className="p-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Text size="base" weight="plus" leading="compact">
                  백테스팅 설정
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  선택된 {selectedPortfolios.size}개 포트폴리오: {selectedPortfolioNames.join(', ')}
                </Text>
              </div>
              <Button type="button" variant="secondary" onClick={handleStartBacktesting} isLoading={isLoading}>
                백테스팅 시작
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label size="small" weight="plus">
                  시작일
                </Label>
                <Input
                  type="date"
                  size="small"
                  value={backtestingConfig.startDate}
                  onChange={(e) => setBacktestingConfig((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label size="small" weight="plus">
                  종료일
                </Label>
                <Input
                  type="date"
                  size="small"
                  value={backtestingConfig.endDate}
                  onChange={(e) => setBacktestingConfig((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label size="small" weight="plus">
                  데이터 간격
                </Label>
                <MultiSelect
                  value={'1d'}
                  multiple={false}
                  disabled
                  onValueChange={(value) =>
                    setBacktestingConfig((prev) => ({ ...prev, interval: value as '1d' | '1wk' | '1mo' }))
                  }
                >
                  <MultiSelect.Trigger>
                    <MultiSelect.Value placeholder="Select options..." />
                  </MultiSelect.Trigger>
                  <MultiSelect.Content>
                    <MultiSelect.Item value="1d">일별</MultiSelect.Item>
                    <MultiSelect.Item value="1wk">주별</MultiSelect.Item>
                    <MultiSelect.Item value="1mo">월별</MultiSelect.Item>
                  </MultiSelect.Content>
                </MultiSelect>
              </div>
            </div>
          </div>
        </Container>
      )}

      {selectedPortfolios.size === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Text size="base" className="text-ui-fg-subtle">
            백테스팅할 포트폴리오를 선택해주세요.
          </Text>
        </div>
      )}

      {backtestingResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Text className="text-ui-fg-base font-medium">
              백테스팅 결과 ({backtestingResults.length}개 포트폴리오)
            </Text>
            <div className="flex items-center gap-4 text-sm text-ui-fg-muted">
              {backtestingResults.map((result, index) => (
                <div key={result.portfolioId} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPortfolioColor(index) }} />
                  <span>{result.portfolioName}</span>
                </div>
              ))}
            </div>
          </div>

          <BacktestingChart data={backtestingResults} loading={isLoading} />
        </div>
      )}

      {selectedPortfolios.size > 0 && backtestingResults.length === 0 && !isLoading && (
        <div className="text-center py-8 border border-ui-border-base border-dashed rounded-lg">
          <Text className="text-ui-fg-muted">백테스팅 버튼을 클릭하여 선택된 포트폴리오들의 성과를 비교해보세요.</Text>
        </div>
      )}
    </div>
  );
};

// 포트폴리오 색상 유틸리티 함수
function getPortfolioColor(index: number): string {
  const colors = [
    'rgb(59, 130, 246)', // blue
    'rgb(91, 33, 182)', // purple
    'rgb(249, 115, 22)', // orange
    'rgb(16, 185, 129)', // green
    'rgb(244, 63, 94)', // red
    'rgb(167, 139, 250)', // purple-light
    'rgb(96, 165, 250)', // blue-light
    'rgb(251, 146, 60)', // orange-light
    'rgb(52, 211, 153)', // green-light
    'rgb(161, 161, 170)', // gray
  ];
  return colors[index % colors.length];
}

export default BacktestingResult;
