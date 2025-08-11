import MultiSelect from '../common/multi-select';
import { ControlledInput } from '@/components/common/controlled-input';
import { ControlledSelectBox } from '@/components/common/controlled-select-box';
import { SymbolSearchInput } from '@/components/common/symbol-search-input';
import { YIELDMAX_SYMBOLS } from '@/constants/yieldmax-constants';
import { useAlert } from '@/contexts/alert-provider';
import { IPortfolioItem, PORTFOLIO_STATEGYS, PortfolioStrategy, getPortfolioStrategyLabel } from '@/types/investor';
import { isYieldmaxSymbol } from '@/utils/yieldmax-utils';
import { Button, Drawer, Input, Label } from '@medusajs/ui';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

interface IPortfolioFormValue {
  name: string;
  portfolio: IPortfolioItem[];
  startDate: string;
  endDate: string;
  interval: '1d' | '1wk' | '1mo';
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

  const form = useForm<IPortfolioFormValue>({
    defaultValues: {
      name: '',
      portfolio: [],
      startDate: '',
      endDate: '',
      interval: '1d',
    },
  });

  const handleSubmit = form.handleSubmit(async (value) => {
    if (portfolioItems.length === 0) {
      alert({
        variant: 'error',
        children: '최소 하나의 포트폴리오 아이템을 추가해주세요.',
      });
      return;
    }

    // 포트폴리오 총 금액으로 초기 자본 자동 계산
    const initialCapital = portfolioItems.reduce((total, item) => total + item.amount, 0);

    const submitData = {
      ...value,
      portfolio: portfolioItems,
      initialCapital,
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
    }
  }, [initialData, form]);

  const intervalOptions = [
    { value: '1d', label: '일별' },
    { value: '1wk', label: '주별' },
    { value: '1mo', label: '월별' },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <Drawer.Header>
              <Drawer.Title>포트폴리오 백테스팅 설정</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body className="overflow-auto">
              <div className="mx-auto flex w-full max-w-[720px] flex-col gap-y-4 px-2 py-4">
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

                {/* 자동 계산된 초기 자본금 표시 */}
                {portfolioItems.length > 0 && (
                  <div className="flex w-full gap-4">
                    <div className="flex flex-col w-full space-y-2">
                      <div className="flex items-center gap-x-1">
                        <Label size="small" weight="plus">
                          총 투자금액 (자동 계산)
                        </Label>
                      </div>
                      <div className="px-3 py-2 bg-ui-bg-subtle border border-ui-border-base rounded-md">
                        <span className="text-ui-fg-base font-medium">
                          ${portfolioItems.reduce((total, item) => total + item.amount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 백테스팅 기간 */}
                <div className="flex w-full gap-4">
                  <ControlledInput<IPortfolioFormValue>
                    form={form}
                    label="시작일"
                    name="startDate"
                    type="date"
                    rules={{ required: '시작일은 필수값입니다' }}
                  />
                  <ControlledInput<IPortfolioFormValue>
                    form={form}
                    label="종료일"
                    name="endDate"
                    type="date"
                    rules={{ required: '종료일은 필수값입니다' }}
                  />
                </div>

                {/* 데이터 간격 */}
                <div className="flex w-full gap-4">
                  <div className="flex flex-col w-full space-y-2">
                    <div className="flex items-center gap-x-1">
                      <Label size="small" weight="plus">
                        데이터 간격
                      </Label>
                    </div>
                    <ControlledSelectBox<IPortfolioFormValue>
                      form={form}
                      placeholder="데이터 간격을 선택해주세요"
                      name="interval"
                      rules={{ required: '데이터 간격은 필수값입니다' }}
                      options={intervalOptions}
                    />
                  </div>
                </div>

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
                    </div>
                  ))}
                  {portfolioItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">포트폴리오에 추가할 종목을 선택해주세요</div>
                  )}
                </div>
              </div>
            </Drawer.Body>

            <Drawer.Footer className="gap-x-1">
              <Button variant="secondary" size="small" type="button" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" variant="primary" size="small" isLoading={isLoading}>
                백테스팅 시작
              </Button>
            </Drawer.Footer>
          </form>
        </FormProvider>
      </Drawer.Content>
    </Drawer>
  );
};

export default PortfolioForm;
