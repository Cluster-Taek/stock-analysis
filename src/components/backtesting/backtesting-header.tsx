'use client';

import { PortfolioPieChart } from '../charts';
import { PortfolioForm } from './portfolio-form';
import { useBacktesting } from '@/contexts/backtesting-provider';
import { IBacktestingParams } from '@/types/investor';
import { ChevronDown } from '@medusajs/icons';
import { Button, Container, Heading, Text } from '@medusajs/ui';
import { useState } from 'react';

const BacktestingHeader = () => {
  const [open, setOpen] = useState(true);
  const [isPortfolioFormOpen, setIsPortfolioFormOpen] = useState(false);
  const { setPortfolioData, portfolioData, isLoading: isBacktestingLoading } = useBacktesting();

  const handlePortfolioSubmit = async (data: IBacktestingParams) => {
    setPortfolioData(data);
    setIsPortfolioFormOpen(false);
  };

  const handleEditPortfolio = () => {
    setIsPortfolioFormOpen(true);
  };

  const handleDeletePortfolio = () => {
    setPortfolioData(null);
  };

  return (
    <>
      <Container className="w-full p-0 divide-y">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1" className="text-ui-fg-base">
            백테스팅
          </Heading>
          <div className="flex items-center gap-2">
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
            {portfolioData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Text className="text-ui-fg-base font-medium">현재 포트폴리오: {portfolioData.name}</Text>
                  <div className="flex items-center gap-2">
                    <Button type="button" size="small" variant="secondary" onClick={handleEditPortfolio}>
                      수정
                    </Button>
                    <Button type="button" size="small" variant="secondary" onClick={handleDeletePortfolio}>
                      삭제
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-ui-bg-subtle rounded-lg">
                    <Text className="text-ui-fg-muted text-xs">초기 자본금</Text>
                    <Text className="text-ui-fg-base font-medium">
                      $
                      {(portfolioData.portfolio?.reduce((total, item) => total + item.amount, 0) || 0).toLocaleString()}
                    </Text>
                  </div>
                  <div className="p-3 bg-ui-bg-subtle rounded-lg">
                    <Text className="text-ui-fg-muted text-xs">백테스팅 기간</Text>
                    <Text className="text-ui-fg-base font-medium">
                      {portfolioData.startDate} ~ {portfolioData.endDate}
                    </Text>
                  </div>
                  <div className="p-3 bg-ui-bg-subtle rounded-lg">
                    <Text className="text-ui-fg-muted text-xs">데이터 간격</Text>
                    <Text className="text-ui-fg-base font-medium">
                      {portfolioData.interval === '1d' ? '일별' : portfolioData.interval === '1wk' ? '주별' : '월별'}
                    </Text>
                  </div>
                  <div className="p-3 bg-ui-bg-subtle rounded-lg">
                    <Text className="text-ui-fg-muted text-xs">포트폴리오 종목</Text>
                    <Text className="text-ui-fg-base font-medium">{portfolioData.portfolio?.length || 0}개 종목</Text>
                  </div>
                </div>

                {portfolioData.portfolio && portfolioData.portfolio.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Text className="text-ui-fg-muted text-sm">포트폴리오 구성</Text>
                      <Text className="text-ui-fg-muted text-xs">
                        총 투자금액: $
                        {portfolioData.portfolio.reduce((total, item) => total + item.amount, 0).toLocaleString()}
                      </Text>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {portfolioData.portfolio.map((item, index) => {
                        return (
                          <div
                            key={index}
                            className="p-3 border border-ui-border-base rounded-lg bg-ui-bg-base aspect-square"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Text className="text-ui-fg-base font-semibold">{item.symbol}</Text>
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    item.type === 'STOCK' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {item.type === 'STOCK' ? '일반주' : '배당주'}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <Text className="text-ui-fg-muted">투자금액</Text>
                                <Text className="text-ui-fg-base font-medium">${item.amount.toLocaleString()}</Text>
                              </div>
                              <div className="col-span-2">
                                <Text className="text-ui-fg-muted">투자전략</Text>
                                <Text className="text-ui-fg-base font-medium">
                                  {item.strategy === 'HOLD' ? '💰 보유' : `📈 재투자 (${item.reinvestmentTarget})`}
                                </Text>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <PortfolioPieChart portfolio={portfolioData.portfolio} />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Text className="text-ui-fg-muted">백테스팅을 시작하려면 포트폴리오를 설정해주세요.</Text>
                <Button type="button" className="mt-4" onClick={handleEditPortfolio}>
                  포트폴리오 설정하기
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>

      <PortfolioForm
        isOpen={isPortfolioFormOpen}
        onClose={() => setIsPortfolioFormOpen(false)}
        onSubmit={handlePortfolioSubmit}
        initialData={portfolioData || undefined}
        isLoading={isBacktestingLoading}
      />
    </>
  );
};

export default BacktestingHeader;
