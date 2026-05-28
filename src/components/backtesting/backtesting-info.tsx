import { IBacktestingParams } from '@/types/investor';
import { Container } from '@medusajs/ui';

interface IBacktestingInfoProps {
  backtestingResult: IBacktestingParams;
}

const BacktestingInfo = ({ backtestingResult }: IBacktestingInfoProps) => {
  return (
    <Container>
      <div>{backtestingResult.investor.name}</div>
    </Container>
  );
};

export default BacktestingInfo;
