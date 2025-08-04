import { SymbolSearchInput } from '../symbol-search-input';
import {
  IPortfolioItem,
  PORTFOLIO_STATEGYS,
  PORTFOLIO_TYPES,
  PortfolioStrategy,
  PortfolioType,
  getPortfolioStrategyLabel,
  getPortfolioTypeLabel,
} from '@/types/investor';
import { PlusMini, XMarkMini } from '@medusajs/icons';
import { Button, IconButton, Input, Label, RadioGroup, Select, Text } from '@medusajs/ui';

interface IPortfolioSelectorProps {
  value: IPortfolioItem[];
  onChange: (portfolioList: IPortfolioItem[]) => void;
}

const MAX_PORTFOLIO_ITEMS = 5;

export const PortfolioSelector = ({ value, onChange }: IPortfolioSelectorProps) => {
  const handleAddPortfolioItem = () => {
    if (value.length >= MAX_PORTFOLIO_ITEMS) return;

    const newItem: IPortfolioItem = {
      symbol: '',
      type: 'STOCK' as PortfolioType,
      quantity: 0,
      strategy: undefined,
    };

    onChange([...value, newItem]);
  };

  const handleRemovePortfolioItem = (index: number) => {
    const updatedValue = value.filter((_, i) => i !== index);
    onChange(updatedValue);
  };

  const handleSymbolChange = (index: number, symbol: string) => {
    const updatedValue = value.map((item, i) => (i === index ? { ...item, symbol } : item));
    onChange(updatedValue);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedValue = value.map((item, i) => (i === index ? { ...item, quantity } : item));
    onChange(updatedValue);
  };

  const handleStrategyChange = (index: number, strategy: PortfolioStrategy) => {
    const updatedValue = value.map((item, i) => (i === index ? { ...item, strategy } : item));
    onChange(updatedValue);
  };

  const handleTypeChange = (index: number, type: PortfolioType) => {
    const updatedValue = value.map((item, i) => (i === index ? { ...item, type } : item));
    onChange(updatedValue);
  };

  const canAddMore = value.length < MAX_PORTFOLIO_ITEMS;

  // 유효성 검사 함수들
  const getDuplicateSymbols = () => {
    const symbols = value.filter((item) => item.symbol.trim() !== '').map((item) => item.symbol);
    const duplicates = symbols.filter((symbol, index) => symbols.indexOf(symbol) !== index);
    return Array.from(new Set(duplicates));
  };

  const getValidationErrors = (index: number, portfolio: IPortfolioItem) => {
    const errors: string[] = [];

    // 필수값 체크
    if (!portfolio.symbol.trim()) {
      errors.push('종목 심볼을 입력해주세요');
    }

    if (portfolio.quantity <= 0) {
      errors.push('수량은 1개 이상이어야 합니다');
    }

    if (!portfolio.strategy) {
      errors.push('투자 전략을 선택해주세요');
    }

    // 중복 심볼 체크
    const duplicateSymbols = getDuplicateSymbols();
    if (portfolio.symbol.trim() && duplicateSymbols.includes(portfolio.symbol)) {
      errors.push('이미 추가된 종목입니다');
    }

    return errors;
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-6">
        {value.map((portfolio, index) => {
          const validationErrors = getValidationErrors(index, portfolio);
          const hasErrors = validationErrors.length > 0;

          return (
            <div
              key={`portfolio-${index}`}
              className={`flex flex-col w-full gap-2 p-4 border rounded-lg ${
                hasErrors ? 'border-ui-tag-red-border bg-ui-tag-red-bg/10' : 'border-ui-border-base'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Text className="text-ui-fg-base font-medium">포트폴리오 #{index + 1}</Text>
                  {hasErrors && (
                    <Text className="text-ui-tag-red-text text-sm">({validationErrors.length}개 오류)</Text>
                  )}
                </div>
                <IconButton
                  variant="transparent"
                  onClick={() => handleRemovePortfolioItem(index)}
                  className="text-ui-fg-muted hover:text-ui-fg-base"
                >
                  <XMarkMini />
                </IconButton>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Text className="text-ui-fg-subtle">종목 심볼</Text>
                  <SymbolSearchInput
                    value={portfolio.symbol}
                    onChange={(symbol) => handleSymbolChange(index, symbol)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Text className="text-ui-fg-subtle">수량</Text>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={portfolio.quantity.toString()}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value) || 0;
                      handleQuantityChange(index, quantity);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Text className="text-ui-fg-subtle">투자 전략</Text>
                  <Select
                    value={portfolio.strategy || ''}
                    onValueChange={(value) => handleStrategyChange(index, value as PortfolioStrategy)}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="전략을 선택하세요" />
                    </Select.Trigger>
                    <Select.Content>
                      {PORTFOLIO_STATEGYS.map((strategy) => (
                        <Select.Item key={strategy} value={strategy}>
                          {getPortfolioStrategyLabel(strategy as PortfolioStrategy)}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Text className="text-ui-fg-subtle mb-3">포트폴리오 타입</Text>
                <RadioGroup
                  value={portfolio.type}
                  onValueChange={(value) => handleTypeChange(index, value as PortfolioType)}
                  className="flex gap-6"
                >
                  {PORTFOLIO_TYPES.map((type) => (
                    <div key={type} className="flex items-center gap-x-2">
                      <RadioGroup.Item value={type} id={`type-${index}-${type}`} />
                      <Label htmlFor={`type-${index}-${type}`} className="text-ui-fg-base">
                        {getPortfolioTypeLabel(type as PortfolioType)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              {hasErrors && (
                <div className="mt-3 p-3 bg-ui-tag-red-bg/10 border border-ui-tag-red-border rounded">
                  <Text className="text-ui-tag-red-text text-sm font-medium mb-1">다음 항목을 확인해주세요:</Text>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, errorIndex) => (
                      <li key={errorIndex} className="text-ui-tag-red-text text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {canAddMore && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={handleAddPortfolioItem} className="w-full">
            <PlusMini />
            포트폴리오 항목 추가 ({value.length}/{MAX_PORTFOLIO_ITEMS})
          </Button>
        </div>
      )}

      {!canAddMore && (
        <Text className="text-center text-ui-fg-muted">
          최대 {MAX_PORTFOLIO_ITEMS}개의 포트폴리오 항목까지 추가할 수 있습니다.
        </Text>
      )}
    </div>
  );
};
