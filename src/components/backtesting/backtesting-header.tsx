'use client';

import { PortfolioForm } from './portfolio-form';
import { useBacktesting } from '@/contexts/backtesting-provider';
import { IBacktestingParams } from '@/types/investor';
import { ChevronDown } from '@medusajs/icons';
import { Button, Checkbox, Container, Heading, Text, clx } from '@medusajs/ui';
import { useState } from 'react';

const BacktestingHeader = () => {
  const [open, setOpen] = useState(true);
  const [isPortfolioFormOpen, setIsPortfolioFormOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<IBacktestingParams | null>(null);

  const {
    portfolios,
    selectedPortfolios,
    isLoading: isBacktestingLoading,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    togglePortfolioSelection,
  } = useBacktesting();

  const handlePortfolioSubmit = async (data: IBacktestingParams) => {
    if (editingPortfolio?.id) {
      updatePortfolio(editingPortfolio.id, data);
    } else {
      addPortfolio(data);
    }
    setIsPortfolioFormOpen(false);
    setEditingPortfolio(null);
  };

  const handleAddPortfolio = () => {
    setEditingPortfolio(null);
    setIsPortfolioFormOpen(true);
  };

  const handleEditPortfolio = (portfolio: IBacktestingParams) => {
    setEditingPortfolio(portfolio);
    setIsPortfolioFormOpen(true);
  };

  const handleDeletePortfolio = (id: string) => {
    deletePortfolio(id);
  };

  return (
    <>
      <Container className="w-full p-0 divide-y">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1" className="text-ui-fg-base">
            백테스팅
          </Heading>
          <div className="flex items-center gap-2">
            <Button type="button" size="small" variant="secondary" onClick={handleAddPortfolio}>
              + 포트폴리오 추가
            </Button>
            <Button type="button" size="small" variant="transparent" onClick={() => setOpen(!open)}>
              {open ? '닫기' : '열기'}
              <ChevronDown
                fontSize={15}
                className={`transition-transform ${open ? 'transform rotate-180' : 'transform rotate-0'}`}
              />
            </Button>
          </div>
        </div>

        {open && (
          <div className="px-6 py-4">
            {portfolios.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Text className="text-ui-fg-base font-medium">포트폴리오 목록 ({portfolios.length}개)</Text>
                  <Text className="text-ui-fg-muted text-sm">{selectedPortfolios.size}개 선택됨</Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolios.map((portfolio) => (
                    <Container
                      key={portfolio.id}
                      className={clx(
                        'cursor-pointer transition-all duration-200 hover:shadow-elevation-card-hover border-ui-border-base p-0',
                        {
                          'shadow-elevation-card-hover border-ui-border-interactive': selectedPortfolios.has(
                            portfolio.id!
                          ),
                          'hover:border-ui-border-base': !selectedPortfolios.has(portfolio.id!),
                        }
                      )}
                      onClick={() => togglePortfolioSelection(portfolio.id!)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={selectedPortfolios.has(portfolio.id!)}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onCheckedChange={() => {
                                togglePortfolioSelection(portfolio.id!);
                              }}
                            />
                            <div>
                              <Text size="base" weight="plus" leading="compact">
                                {portfolio.name}
                              </Text>
                            </div>
                          </div>
                          <div className="flex items-center gap-x-2">
                            <Button
                              type="button"
                              size="small"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPortfolio(portfolio);
                              }}
                            >
                              수정
                            </Button>
                            <Button
                              type="button"
                              size="small"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePortfolio(portfolio.id!);
                              }}
                            >
                              삭제
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 mb-4">
                          <div className="rounded-rounded bg-ui-bg-subtle px-3 py-2 text-center">
                            <Text size="xsmall" className="text-ui-fg-muted">
                              초기 자본금
                            </Text>
                            <Text size="small" weight="plus" leading="compact">
                              $
                              {(
                                portfolio.portfolio?.reduce((total, item) => total + item.amount, 0) || 0
                              ).toLocaleString()}
                            </Text>
                          </div>
                          <div className="rounded-rounded bg-ui-bg-subtle px-3 py-2 text-center">
                            <Text size="xsmall" className="text-ui-fg-muted">
                              종목 수
                            </Text>
                            <Text size="small" weight="plus" leading="compact">
                              {portfolio.portfolio?.length || 0}개
                            </Text>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Text size="xsmall" className="text-ui-fg-muted">
                            포트폴리오 구성
                          </Text>
                          <div className="flex flex-wrap gap-1">
                            {portfolio.portfolio?.slice(0, 5).map((item, index) => (
                              <span key={index} className="rounded-rounded bg-ui-bg-subtle px-2 py-1 text-ui-fg-base">
                                <Text size="xsmall">{item.symbol}</Text>
                              </span>
                            ))}
                            {portfolio.portfolio && portfolio.portfolio.length > 5 && (
                              <span className="rounded-rounded bg-ui-bg-subtle px-2 py-1">
                                <Text size="xsmall" className="text-ui-fg-muted">
                                  +{portfolio.portfolio.length - 5}개
                                </Text>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Container>
                  ))}
                </div>

                {selectedPortfolios.size > 0 && (
                  <div className="border-ui-border-base border-t pt-4">
                    <Text size="small" className="text-ui-fg-subtle">
                      선택된 포트폴리오:{' '}
                      {Array.from(selectedPortfolios)
                        .map((id) => portfolios.find((p) => p.id === id)?.name)
                        .join(', ')}
                    </Text>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Text size="base" className="text-ui-fg-subtle mb-4">
                  백테스팅을 시작하려면 포트폴리오를 추가해주세요.
                </Text>
                <Button type="button" variant="secondary" onClick={handleAddPortfolio}>
                  첫 포트폴리오 추가하기
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>

      <PortfolioForm
        isOpen={isPortfolioFormOpen}
        onClose={() => {
          setIsPortfolioFormOpen(false);
          setEditingPortfolio(null);
        }}
        onSubmit={handlePortfolioSubmit}
        initialData={editingPortfolio || undefined}
        isLoading={isBacktestingLoading}
      />
    </>
  );
};

export default BacktestingHeader;
