import IndiceCard from './indice-card';
import { fetchApi } from '@/lib/base';
import { StockPriceResponse } from '@/types/yahoo-finance';

export const IndiceContainer = async () => {
  const data = await fetchApi.get<StockPriceResponse[]>('/api/indices');

  return (
    <div className="flex flex-row gap-4 w-full">
      {data?.map((indice: StockPriceResponse) => <IndiceCard key={indice.currency} data={indice} />)}
    </div>
  );
};
