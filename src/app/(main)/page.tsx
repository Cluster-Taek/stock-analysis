import { IndiceContainer } from '@/components/dashboard/indice-container';
import LastNewsWidget from '@/components/dashboard/last-news-widget';
import { SingleColumnPage } from '@/medusa/layout/pages/single-column-page';

const DashboardPage = () => {
  return (
    <SingleColumnPage>
      <IndiceContainer />
      <LastNewsWidget symbol="^GSPC" count={10} />
    </SingleColumnPage>
  );
};

export default DashboardPage;
