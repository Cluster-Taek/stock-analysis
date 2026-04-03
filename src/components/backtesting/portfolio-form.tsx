import MultiSelect from '../common/multi-select';
import TradingRulesForm from './trading-rules-form';
import { ControlledInput } from '@/components/common/controlled-input';
import { SymbolSearchInput } from '@/components/common/symbol-search-input';
import { YIELDMAX_SYMBOLS } from '@/constants/yieldmax-constants';
import { useAlert } from '@/contexts/alert-provider';
import { IPortfolioItem, ITradingRule, PORTFOLIO_STATEGYS, PortfolioStrategy, getPortfolioStrategyLabel } from '@/types/investor';
import { isYieldmaxSymbol } from '@/utils/yieldmax-utils';
import { Button, Drawer, Input, Label } from '@medusajs/ui';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

interface IPortfolioFormValue {
  name: string;
  portfolio: IPortfolioItem[];
  tradingRules?: ITradingRule[];
  initialCash?: number;
}

interface IPortfolioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IPortfolioFormValue) => void;
  initialData?: Partial<IPortfolioFormValue>;
  isLoading?: boolean;
}

export const PortfolioForm: React.FC<IPortfolioFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { alert } = useAlert();
  const [portfolioItems, setPortfolioItems] = useState<IPortfolioItem[]>([]);
  const [tradingRules, setTradingRules] = useState<ITradingRule[]>([]);

  const form = useForm<IPortfolioFormValue>({
    defaultValues: {
      name: '',
      portfolio: [],
      tradingRules: [],
      initialCash: 0,
    },
  });

  const handleSubmit = form.handleSubmit(async (value) => {
    const hasPortfolio = portfolioItems.length > 0;
    const hasInitialCash = (value.initialCash || 0) > 0;
    const hasTradingRules = tradingRules.length > 0;

    if (!hasPortfolio && !hasInitialCash && !hasTradingRules) {
      alert({
        variant: 'error',
        children: '포트폴리오, 초기 현금, 거래 규칙 중 최소 하나는 설정해야 합니다.',
      });
      return;
    }

    const submitData = {
      ...value,
      portfolio: portfolioItems,
      tradingRules: tradingRules,
      initialCash: value.initialCash || 0,
    };

    onSubmit(submitData);
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const addPortfolioItem = () => {
    const newItem: IPortfolioItem = {
      symbol: '',
      type: 'STOCK',
      amount: 0,
      strategy: 'HOLD',
      reinvestmentTarget: '',
    };
    setPortfolioItems([...portfolioItems, newItem]);
  };

  const updatePortfolioItem = (index: number, updatedItem: Partial<IPortfolioItem>) => {
    const newItems = [...portfolioItems];

    // 심볼이 변경된 경우 자동으로 타입 및 투자 전략 설정
    if (updatedItem.symbol) {
      const isYieldMax = YIELDMAX_SYMBOLS.some((yieldmax) => yieldmax.symbol === updatedItem.symbol);
      if (isYieldMax) {
        updatedItem.type = 'DIVIDEND';
      } else {
        // 일반주의 경우 기본 전략 유지 (사용자가 선택할 수 있도록)
        updatedItem.type = 'STOCK';
        updatedItem.strategy = 'HOLD';
      }
    }

    // 전략이 HOLD로 변경된 경우 재투자 대상 초기화
    if (updatedItem.strategy === 'HOLD') {
      updatedItem.reinvestmentTarget = '';
    }

    newItems[index] = { ...newItems[index], ...updatedItem };
    setPortfolioItems(newItems);
  };

  const removePortfolioItem = (index: number) => {
    const newItems = portfolioItems.filter((_, i) => i !== index);
    setPortfolioItems(newItems);
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
      });
      if (initialData.portfolio) {
        setPortfolioItems(initialData.portfolio);
      }
      if (initialData.tradingRules) {
        setTradingRules(initialData.tradingRules);
      }
    } else {
      // 새 포트폴리오 추가시 폼 초기화
      form.reset({
        name: '',
        portfolio: [],
        tradingRules: [],
        initialCash: 0,
      });
      setPortfolioItems([]);
      setTradingRules([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);


  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <Drawer.Header>
              <Drawer.Title>포트폴리오 백테스팅 설정</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body className="overflow-auto">
              <div className="mx-auto flex w-full max-w-[720px] flex-col gap-y-6 px-2 py-4">
                {/* 포트폴리오 이름 */}
                <div className="flex w-full gap-4">
                  <ControlledInput<IPortfolioFormValue>
                    form={form}
                    label="포트폴리오 이름"
                    name="name"
                    placeholder="포트폴리오 이름을 입력해주세요"
                    rules={{ required: '포트폴리오 이름은 필수값입니다' }}
                  />
                </div>

                {/* 초기 현금 */}
                <div className="flex w-full gap-4">
                  <ControlledInput<IPortfolioFormValue>
                    form={form}
                    label="초기 현금 ($)"
                    name="initialCash"
                    type="number"
                    placeholder="거래 규칙에서 사용할 초기 현금"
                    rules={{
                      min: { value: 0, message: '초기 현금은 0 이상이어야 합니다' }
                    }}
                  />
                </div>

                {/* 자동 계산된 총 투자금액 표시 */}
                {(portfolioItems.length > 0 || form.watch('initialCash')) && (
                  <div className="flex w-full gap-4">
                    <div className="flex flex-col w-full space-y-2">
                      <div className="flex items-center gap-x-1">
                        <Label size="small" weight="plus">
                          총 투자금액 (자동 계산)
                        </Label>
                      </div>
                      <div className="px-3 py-2 bg-ui-bg-subtle border border-ui-border-base rounded-md">
                        <span className="text-ui-fg-base font-medium">
                          ${(portfolioItems.reduce((total, item) => total + Number(item.amount), 0) + Number(form.watch('initialCash') || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-ui-fg-muted">
                        포트폴리오: ${portfolioItems.reduce((total, item) => total + Number(item.amount), 0).toLocaleString()} +
                        초기 현금: ${Number(form.watch('initialCash') || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}


                {/* 포트폴리오 아이템들 */}
                <div className="flex flex-col w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <Label size="small" weight="plus">
                      포트폴리오 구성
                    </Label>
                    <Button type="button" variant="secondary" size="small" onClick={addPortfolioItem}>
                      + 종목 추가
                    </Button>
                  </div>

                  {portfolioItems.map((item, index) => (
                    <div key={index} className="border rounded-md p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">종목 {index + 1}</h4>
                        <Button
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={() => removePortfolioItem(index)}
                        >
                          삭제
                        </Button>
                      </div>

                      {/* 컴팩트한 그리드 레이아웃 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* 주식 심볼 */}
                        <div className="flex flex-col space-y-1">
                          <Label size="small" weight="plus">
                            주식 심볼
                          </Label>
                          <SymbolSearchInput
                            value={item.symbol}
                            onChange={(symbol) => updatePortfolioItem(index, { symbol })}
                          />
                        </div>

                        {/* 투자 금액 */}
                        <div className="flex flex-col space-y-1">
                          <Label size="small" weight="plus">
                            투자 금액 ($)
                          </Label>
                          <Input
                            type="number"
                            size="small"
                            value={item.amount}
                            onChange={(e) => updatePortfolioItem(index, { amount: Number(e.target.value) })}
                            placeholder="투자 금액"
                          />
                        </div>
                      </div>

                      {/* 투자 전략 */}
                      <div className="flex flex-col space-y-1">
                        <Label size="small" weight="plus">
                          투자 전략
                        </Label>
                        <MultiSelect
                          value={item.strategy || 'HOLD'}
                          onValueChange={(value) =>
                            updatePortfolioItem(index, { strategy: value as PortfolioStrategy })
                          }
                          disabled={!isYieldmaxSymbol(item.symbol)}
                          searchable={false}
                          multiple={false}
                        >
                          <MultiSelect.Trigger>
                            <MultiSelect.Value placeholder="투자 전략을 선택해주세요" />
                          </MultiSelect.Trigger>
                          <MultiSelect.Content>
                            {PORTFOLIO_STATEGYS.map((strategy) => (
                              <MultiSelect.Item key={strategy} value={strategy}>
                                {getPortfolioStrategyLabel(strategy as PortfolioStrategy)}
                              </MultiSelect.Item>
                            ))}
                          </MultiSelect.Content>
                        </MultiSelect>
                      </div>

                      {/* 재투자 대상 종목 (REINVESTMENT 전략일 때만 표시) */}
                      {item.strategy === 'REINVESTMENT' && (
                        <div className="flex flex-col space-y-1">
                          <Label size="small" weight="plus">
                            배당금 재투자 대상 종목
                          </Label>
                          <SymbolSearchInput
                            value={item.reinvestmentTarget || ''}
                            onChange={(symbol) => updatePortfolioItem(index, { reinvestmentTarget: symbol })}
                          />
                          <div className="text-xs text-ui-fg-muted">
                            배당금을 받은 종목과 동일한 종목에 재투자하려면 빈 값으로 두세요
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {portfolioItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">포트폴리오에 추가할 종목을 선택해주세요</div>
                  )}
                </div>

                {/* 거래 규칙 */}
                <TradingRulesForm tradingRules={tradingRules} onChange={setTradingRules} />
              </div>
            </Drawer.Body>

            <Drawer.Footer className="gap-x-1">
              <Button variant="secondary" size="small" type="button" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" variant="primary" size="small" isLoading={isLoading}>
                저장
              </Button>
            </Drawer.Footer>
          </form>
        </FormProvider>
      </Drawer.Content>
    </Drawer>
  );
};

export default PortfolioForm;
