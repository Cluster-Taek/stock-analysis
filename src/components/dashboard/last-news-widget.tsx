import { Loader } from '../common/loader';
import NewsTable from './news-table';
import { INews } from '@/types/news';
import { Container } from '@medusajs/ui';
import { Suspense } from 'react';
import yahooFinance from 'yahoo-finance2';

interface ILastNewsWidgetProps {
  symbol: string;
  count: number;
}

const LastNewsWidget = async ({ symbol, count }: ILastNewsWidgetProps) => {
  const searchResult = await yahooFinance.search(symbol, {
    newsCount: count,
  });

  const news = searchResult.news;

  const data = news.map((item) => ({
    uuid: item.uuid,
    title: item.title,
    publisher: item.publisher,
    link: item.link,
    providerPublishTime: item.providerPublishTime,
    thumbnail: item.thumbnail?.resolutions[0]?.url || null, // 썸네일 이미지 URL
  })) as INews[];

  return (
    <Container className="flex flex-col gap-4">
      <div className="text-lg font-bold">Last News</div>
      <Suspense fallback={<Loader />}>
        <NewsTable data={data} />
      </Suspense>
    </Container>
  );
};

export default LastNewsWidget;
