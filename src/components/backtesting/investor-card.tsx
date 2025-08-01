import { PortfolioPieChart } from '@/components/charts';
import { IInvestor } from '@/types/investor';
import { Badge, Container, Heading, StatusBadge, Text } from '@medusajs/ui';

interface IInvestorCardProps {
  investor: IInvestor;
}

const InvestorCard = ({ investor }: IInvestorCardProps) => {
  // 초기 자본 포맷팅
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  // 포트폴리오 통계 계산
  const portfolioStats = {
    totalItems: investor.portfolio.length,
    stockCount: investor.portfolio.filter((item) => item.type === 'STOCK').length,
    dividendCount: investor.portfolio.filter((item) => item.type === 'DIVIDEND').length,
  };

  // 백테스팅 결과 상태
  const getBacktestingStatus = () => {
    if (!investor.backtestingResult) return null;

    const lastResult = investor.backtestingResult.result[investor.backtestingResult.result.length - 1];
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
    <Container className="p-6 hover:shadow-md transition-shadow duration-200 border border-ui-border-base rounded-lg">
      <div className="space-y-4">
        {/* 투자자 정보 헤더 */}
        <div className="space-y-2">
          <Heading level="h3" className="text-ui-fg-base">
            {investor.name}
          </Heading>
          <Text size="large" weight="plus" className="text-ui-fg-subtle">
            초기 자본: {formatCurrency(investor.initialCapital)}
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
          {investor.portfolio.length > 0 && (
            <div className="space-y-2">
              <Text size="small" className="text-ui-fg-muted">
                포트폴리오 구성
              </Text>
              <div className="h-32">
                <PortfolioPieChart portfolio={investor.portfolio} height={128} className="rounded-lg" />
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
  );
};

export default InvestorCard;
