import IndiceCard from './indice-card';
import { StockPriceResponse } from '@/types/yahoo-finance';
import yahooFinance from 'yahoo-finance2';

export const IndiceContainer = async () => {
  const symbols = ['^IXIC', '^KS11', '^KQ11'];

  const quotes = await yahooFinance.quote(symbols);

  const indices = quotes.map((quote) => ({
    symbol: quote.symbol,
    name: quote.longName || quote.shortName,
    price: quote.regularMarketPrice,
    change: quote.regularMarketChange,
    changePercent: quote.regularMarketChangePercent,
  })) as StockPriceResponse[];

  return (
    <div className="flex flex-row gap-4 w-full">
      {indices?.map((indice) => <IndiceCard key={indice.symbol} data={indice} />)}
    </div>
  );
};
