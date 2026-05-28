'use client';

import NewsItem from './news-item';
import { NoResults } from '@/medusa/components/empty-table-content';
import { INews } from '@/types/news';
import { AnimatePresence } from 'framer-motion';
import { chunk } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

interface INewsTableProps {
  data: INews[];
}

const COUNT_FOR_ONE_PAGE = 5;
const INTERVAL_SECOND = 10;

const NewsTable = ({ data }: INewsTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const chunkedData = chunk(data, COUNT_FOR_ONE_PAGE);
  const maxPage = Math.ceil(data.length / COUNT_FOR_ONE_PAGE);

  const handleNextPage = useCallback(() => {
    if (currentPage < maxPage - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      setCurrentPage(0);
    }
  }, [currentPage, maxPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleNextPage();
    }, INTERVAL_SECOND * 1000);

    return () => clearTimeout(timer);
  }, [handleNextPage]);

  return (
    <div className="block">
      {chunkedData.length > 0 ? (
        <AnimatePresence>
          <div className="flex flex-col gap-4">
            {chunkedData[currentPage]?.map((item) => <NewsItem key={item.uuid} news={item} />)}
          </div>
        </AnimatePresence>
      ) : (
        <NoResults title="No news found" message="최근 뉴스가 없습니다." />
      )}
    </div>
  );
};

export default NewsTable;
