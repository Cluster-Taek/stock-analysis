import { StockPriceResponse } from '@/types/yahoo-finance';
import { TriangleDownMini, TriangleUpMini } from '@medusajs/icons';
import { Container, Text } from '@medusajs/ui';

interface IIndiceCardProps {
  data: StockPriceResponse;
}

const IndiceCard = ({ data }: IIndiceCardProps) => {
  const isPositive = data.change > 0;
  const changeColor = isPositive ? 'text-ui-fg-error' : 'text-ui-fg-interactive';

  return (
    <Container className="flex flex-col gap-2">
      <Text size="small">{data.name}</Text>
      <Text size="xlarge" weight="plus">
        {data.price}
      </Text>
      <div className="flex flex-row gap-1 items-center">
        <Text size="xsmall" className={changeColor}>
          {data.change > 0 ? '+' : ''}
          {data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
        </Text>
        {isPositive ? <TriangleUpMini className={changeColor} /> : <TriangleDownMini className={changeColor} />}
      </div>
    </Container>
  );
};

export default IndiceCard;
