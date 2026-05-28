import { INews } from '@/types/news';
import { Text } from '@medusajs/ui';
import { motion } from 'framer-motion';

interface INewsItemProps {
  news: INews;
}

const NewsItem = ({ news }: INewsItemProps) => {
  return (
    <motion.div
      className="flex flex-row gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div
        className="flex flex-col gap-1 hover:text-ui-fg-interactive cursor-pointer"
        onClick={() => {
          window.open(news.link, '_blank');
        }}
      >
        <Text size="large" weight="plus">
          {news.title}
        </Text>
        <Text size="xsmall">
          {new Date(news.providerPublishTime).toLocaleString()} ({news.publisher})
        </Text>
      </div>
    </motion.div>
  );
};

export default NewsItem;
