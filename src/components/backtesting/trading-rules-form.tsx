'use client';

import MultiSelect from '../common/multi-select';
import { SymbolSearchInput } from '@/components/common/symbol-search-input';
import {
  AMOUNT_TYPE_LABELS,
  AMOUNT_TYPES,
  DAY_OF_WEEK_LABELS,
  INTERVAL_TYPE_LABELS,
  INTERVAL_TYPES,
  TRADING_ACTION_LABELS,
  TRADING_ACTIONS,
  TRIGGER_TYPE_LABELS,
  TRIGGER_TYPES,
} from '@/constants/backtesting';
import { useAlert } from '@/contexts/alert-provider';
import { AmountType, IntervalType, ITradingRule, TradingAction, TriggerType } from '@/types/investor';
import { Button, Input, Label } from '@medusajs/ui';
import { useState } from 'react';

interface ITradingRulesFormProps {
  tradingRules: ITradingRule[];
  onChange: (rules: ITradingRule[]) => void;
}

export const TradingRulesForm: React.FC<ITradingRulesFormProps> = ({ tradingRules, onChange }) => {
  const { alert } = useAlert();
  const [editingRule, setEditingRule] = useState<ITradingRule | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createEmptyRule = (): ITradingRule => ({
    id: crypto.randomUUID(),
    triggerType: 'DATE',
    triggerConfig: {},
    action: 'BUY',
    symbol: '',
    amountType: 'FIXED',
    amount: 0,
  });

  const handleAddRule = () => {
    setEditingRule(createEmptyRule());
    setIsAdding(true);
  };

  const handleSaveRule = () => {
    if (!editingRule) return;

    // Validation
    if (!editingRule.symbol) {
      alert({ variant: 'error', children: '종목 심볼을 입력해주세요.' });
      return;
    }

    if (editingRule.amount <= 0) {
      alert({ variant: 'error', children: '금액/비율을 입력해주세요.' });
      return;
    }

    // Trigger validation
    if (editingRule.triggerType === 'DATE' && !editingRule.triggerConfig.date) {
      alert({ variant: 'error', children: '날짜를 선택해주세요.' });
      return;
    }

    if (editingRule.triggerType === 'INTERVAL') {
      if (!editingRule.triggerConfig.intervalType) {
        alert({ variant: 'error', children: '주기를 선택해주세요.' });
        return;
      }
      if (
        editingRule.triggerConfig.intervalType === 'WEEKLY' &&
        editingRule.triggerConfig.dayOfWeek === undefined
      ) {
        alert({ variant: 'error', children: '요일을 선택해주세요.' });
        return;
      }
      if (
        editingRule.triggerConfig.intervalType === 'MONTHLY' &&
        !editingRule.triggerConfig.dayOfMonth
      ) {
        alert({ variant: 'error', children: '일자를 입력해주세요.' });
        return;
      }
    }

    if (isAdding) {
      onChange([...tradingRules, editingRule]);
    } else {
      onChange(tradingRules.map((r) => (r.id === editingRule.id ? editingRule : r)));
    }

    setEditingRule(null);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setIsAdding(false);
  };

  const handleEditRule = (rule: ITradingRule) => {
    setEditingRule({ ...rule });
    setIsAdding(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    onChange(tradingRules.filter((r) => r.id !== ruleId));
  };

  const updateEditingRule = (updates: Partial<ITradingRule>) => {
    if (!editingRule) return;
    setEditingRule({ ...editingRule, ...updates });
  };

  const updateTriggerConfig = (updates: Partial<ITradingRule['triggerConfig']>) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      triggerConfig: { ...editingRule.triggerConfig, ...updates },
    });
  };

  const renderTriggerConfig = () => {
    if (!editingRule) return null;

    switch (editingRule.triggerType) {
      case 'DATE':
        return (
          <div className="space-y-1">
            <Label size="small" weight="plus">
              실행 날짜
            </Label>
            <Input
              type="date"
              size="small"
              value={editingRule.triggerConfig.date || ''}
              onChange={(e) => updateTriggerConfig({ date: e.target.value })}
            />
          </div>
        );

      case 'INTERVAL':
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label size="small" weight="plus">
                주기
              </Label>
              <MultiSelect
                value={editingRule.triggerConfig.intervalType || ''}
                onValueChange={(value) => updateTriggerConfig({ intervalType: value as IntervalType })}
                searchable={false}
                multiple={false}
              >
                <MultiSelect.Trigger>
                  <MultiSelect.Value placeholder="주기를 선택해주세요" />
                </MultiSelect.Trigger>
                <MultiSelect.Content>
                  {INTERVAL_TYPES.map((type) => (
                    <MultiSelect.Item key={type} value={type}>
                      {INTERVAL_TYPE_LABELS[type]}
                    </MultiSelect.Item>
                  ))}
                </MultiSelect.Content>
              </MultiSelect>
            </div>

            {editingRule.triggerConfig.intervalType === 'WEEKLY' && (
              <div className="space-y-1">
                <Label size="small" weight="plus">
                  요일
                </Label>
                <MultiSelect
                  value={editingRule.triggerConfig.dayOfWeek?.toString() || ''}
                  onValueChange={(value) => updateTriggerConfig({ dayOfWeek: parseInt(value) })}
                  searchable={false}
                  multiple={false}
                >
                  <MultiSelect.Trigger>
                    <MultiSelect.Value placeholder="요일을 선택해주세요" />
                  </MultiSelect.Trigger>
                  <MultiSelect.Content>
                    {Object.entries(DAY_OF_WEEK_LABELS).map(([day, label]) => (
                      <MultiSelect.Item key={day} value={day}>
                        {label}
                      </MultiSelect.Item>
                    ))}
                  </MultiSelect.Content>
                </MultiSelect>
              </div>
            )}

            {editingRule.triggerConfig.intervalType === 'MONTHLY' && (
              <div className="space-y-1">
                <Label size="small" weight="plus">
                  일자 (1-31)
                </Label>
                <Input
                  type="number"
                  size="small"
                  min={1}
                  max={31}
                  value={editingRule.triggerConfig.dayOfMonth || ''}
                  onChange={(e) => updateTriggerConfig({ dayOfMonth: parseInt(e.target.value) })}
                  placeholder="일자"
                />
              </div>
            )}
          </div>
        );

      case 'PRICE':
        return (
          <div className="text-sm text-ui-fg-muted py-2">가격 조건 트리거는 향후 추가 예정입니다.</div>
        );

      default:
        return null;
    }
  };

  const renderRuleSummary = (rule: ITradingRule) => {
    let triggerText = '';
    switch (rule.triggerType) {
      case 'DATE':
        triggerText = `${rule.triggerConfig.date}`;
        break;
      case 'INTERVAL':
        if (rule.triggerConfig.intervalType === 'DAILY') {
          triggerText = '매일';
        } else if (rule.triggerConfig.intervalType === 'WEEKLY') {
          triggerText = `매주 ${DAY_OF_WEEK_LABELS[rule.triggerConfig.dayOfWeek || 0]}`;
        } else if (rule.triggerConfig.intervalType === 'MONTHLY') {
          triggerText = `매월 ${rule.triggerConfig.dayOfMonth}일`;
        }
        break;
      case 'PRICE':
        triggerText = '가격 조건';
        break;
    }

    const actionText = TRADING_ACTION_LABELS[rule.action];
    const amountText =
      rule.amountType === 'FIXED' ? `$${rule.amount.toLocaleString()}` : `${rule.amount}%`;

    return `${triggerText} - ${actionText} ${rule.symbol} ${amountText}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label size="small" weight="plus">
          거래 규칙
        </Label>
        {!editingRule && (
          <Button type="button" variant="secondary" size="small" onClick={handleAddRule}>
            + 규칙 추가
          </Button>
        )}
      </div>

      {/* Existing Rules */}
      {tradingRules.length > 0 && !editingRule && (
        <div className="space-y-2">
          {tradingRules.map((rule, index) => (
            <div key={rule.id} className="border rounded-md p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">규칙 {index + 1}</div>
                <div className="text-sm text-ui-fg-subtle">{renderRuleSummary(rule)}</div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="small" onClick={() => handleEditRule(rule)}>
                  수정
                </Button>
                <Button type="button" variant="danger" size="small" onClick={() => handleDeleteRule(rule.id)}>
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Form */}
      {editingRule && (
        <div className="border rounded-md p-4 space-y-4 bg-ui-bg-subtle">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{isAdding ? '새 규칙 추가' : '규칙 수정'}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trigger Type */}
            <div className="space-y-1">
              <Label size="small" weight="plus">
                트리거 타입
              </Label>
              <MultiSelect
                value={editingRule.triggerType}
                onValueChange={(value) => {
                  updateEditingRule({ triggerType: value as TriggerType, triggerConfig: {} });
                }}
                searchable={false}
                multiple={false}
              >
                <MultiSelect.Trigger>
                  <MultiSelect.Value placeholder="트리거를 선택해주세요" />
                </MultiSelect.Trigger>
                <MultiSelect.Content>
                  {TRIGGER_TYPES.map((type) => (
                    <MultiSelect.Item key={type} value={type}>
                      {TRIGGER_TYPE_LABELS[type]}
                    </MultiSelect.Item>
                  ))}
                </MultiSelect.Content>
              </MultiSelect>
            </div>

            {/* Action */}
            <div className="space-y-1">
              <Label size="small" weight="plus">
                거래 유형
              </Label>
              <MultiSelect
                value={editingRule.action}
                onValueChange={(value) => updateEditingRule({ action: value as TradingAction })}
                searchable={false}
                multiple={false}
              >
                <MultiSelect.Trigger>
                  <MultiSelect.Value placeholder="거래 유형을 선택해주세요" />
                </MultiSelect.Trigger>
                <MultiSelect.Content>
                  {TRADING_ACTIONS.map((action) => (
                    <MultiSelect.Item key={action} value={action}>
                      {TRADING_ACTION_LABELS[action]}
                    </MultiSelect.Item>
                  ))}
                </MultiSelect.Content>
              </MultiSelect>
            </div>
          </div>

          {/* Trigger Config */}
          {renderTriggerConfig()}

          {/* Symbol */}
          <div className="space-y-1">
            <Label size="small" weight="plus">
              종목 심볼
            </Label>
            <SymbolSearchInput
              value={editingRule.symbol}
              onChange={(symbol) => updateEditingRule({ symbol })}
            />
          </div>

          {/* Amount Type & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label size="small" weight="plus">
                금액 타입
              </Label>
              <MultiSelect
                value={editingRule.amountType}
                onValueChange={(value) => updateEditingRule({ amountType: value as AmountType })}
                searchable={false}
                multiple={false}
              >
                <MultiSelect.Trigger>
                  <MultiSelect.Value placeholder="금액 타입을 선택해주세요" />
                </MultiSelect.Trigger>
                <MultiSelect.Content>
                  {AMOUNT_TYPES.map((type) => (
                    <MultiSelect.Item key={type} value={type}>
                      {AMOUNT_TYPE_LABELS[type]}
                    </MultiSelect.Item>
                  ))}
                </MultiSelect.Content>
              </MultiSelect>
            </div>

            <div className="space-y-1">
              <Label size="small" weight="plus">
                {editingRule.amountType === 'FIXED' ? '금액 ($)' : '비율 (%)'}
              </Label>
              <Input
                type="number"
                size="small"
                min={0}
                step={editingRule.amountType === 'FIXED' ? '0.01' : '1'}
                value={editingRule.amount}
                onChange={(e) => updateEditingRule({ amount: parseFloat(e.target.value) || 0 })}
                placeholder={editingRule.amountType === 'FIXED' ? '금액' : '비율'}
              />
              {editingRule.amountType === 'PERCENTAGE' && (
                <div className="text-xs text-ui-fg-muted">
                  {editingRule.action === 'BUY'
                    ? '현금 잔고의 몇 %를 매수할지 입력'
                    : '보유 주식의 몇 %를 매도할지 입력'}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="small" onClick={handleCancelEdit}>
              취소
            </Button>
            <Button type="button" variant="primary" size="small" onClick={handleSaveRule}>
              저장
            </Button>
          </div>
        </div>
      )}

      {tradingRules.length === 0 && !editingRule && (
        <div className="text-center py-4 text-sm text-ui-fg-muted border border-dashed rounded-md">
          거래 규칙을 추가하여 자동 매수/매도를 설정하세요.
        </div>
      )}
    </div>
  );
};

export default TradingRulesForm;
