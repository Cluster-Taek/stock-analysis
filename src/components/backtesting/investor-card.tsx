import { PortfolioPieChart } from '@/components/charts';
import { IBacktestingResult } from '@/types/investor';
import { Badge, Container, Heading, StatusBadge, Text } from '@medusajs/ui';
import Link from 'next/link';

interface IInvestorCardProps {
  result: IBacktestingResult;
}

const InvestorCard = ({ result }: IInvestorCardProps) => {
  // 초기 자본 포맷팅
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  // 포트폴리오 통계 계산
  const portfolioStats = {
    totalItems: result.investor.portfolio.length,
    stockCount: result.investor.portfolio.filter((item) => item.type === 'STOCK').length,
    dividendCount: result.investor.portfolio.filter((item) => item.type === 'DIVIDEND').length,
  };

  // 백테스팅 결과 상태
  const getBacktestingStatus = () => {
    if (!result.result) return null;

    const lastResult = result.result[result.result.length - 1];
    if (!lastResult) return null;

    const isProfit = lastResult.profitRate >= 0;
    return {
      profitRate: lastResult.profitRate,
      color: (isProfit ? 'green' : 'red') as 'green' | 'red',
      label: isProfit ? '수익' : '손실',
    };
  };

  const backtestingStatus = getBacktestingStatus();

  return (
    <Link href={`/backtesting/${result.investor.id}`}>
      <Container className="p-6 hover:shadow-md transition-shadow duration-200 border border-ui-border-base rounded-lg">
        <div className="space-y-4">
          {/* 투자자 정보 헤더 */}
          <div className="space-y-2">
            <Heading level="h3" className="text-ui-fg-base">
              {result.investor.name}
            </Heading>
            <Text size="large" weight="plus" className="text-ui-fg-subtle">
              초기 자본: {formatCurrency(result.investor.initialCapital || 0)}
            </Text>
          </div>

          {/* 포트폴리오 통계 */}
          <div className="space-y-3">
            <Text size="base" weight="plus" className="text-ui-fg-base">
              포트폴리오 구성
            </Text>

            <div className="flex flex-wrap gap-2">
              <Badge color="blue" size="small">
                총 {portfolioStats.totalItems}개 종목
              </Badge>

              {portfolioStats.stockCount > 0 && (
                <Badge color="purple" size="small">
                  일반주 {portfolioStats.stockCount}개
                </Badge>
              )}

              {portfolioStats.dividendCount > 0 && (
                <Badge color="orange" size="small">
                  배당주 {portfolioStats.dividendCount}개
                </Badge>
              )}
            </div>

            {/* 포트폴리오 파이 차트 */}
            {result.investor.portfolio.length > 0 && (
              <div className="space-y-2">
                <Text size="small" className="text-ui-fg-muted">
                  포트폴리오 구성
                </Text>
                <div className="h-32">
                  <PortfolioPieChart portfolio={result.investor.portfolio} height={128} className="rounded-lg" />
                </div>
              </div>
            )}
          </div>

          {/* 백테스팅 결과 */}
          {backtestingStatus && (
            <div className="pt-3 border-t border-ui-border-base">
              <div className="flex items-center justify-between">
                <Text size="base" weight="plus" className="text-ui-fg-base">
                  백테스팅 결과
                </Text>
                <div className="flex items-center gap-2">
                  <StatusBadge color={backtestingStatus.color}>{backtestingStatus.label}</StatusBadge>
                  <Text
                    size="small"
                    weight="plus"
                    className={`${backtestingStatus.profitRate >= 0 ? 'text-ui-tag-green-text' : 'text-ui-tag-red-text'}`}
                  >
                    {backtestingStatus.profitRate.toFixed(2)}%
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Link>
  );
};

export default InvestorCard;
