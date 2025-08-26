import { IndiceContainer } from '@/components/dashboard/indice-container';
import { SingleColumnPage } from '@/medusa/layout/pages/single-column-page';

const DashboardPage = () => {
  return (
    <SingleColumnPage>
      <IndiceContainer />
    </SingleColumnPage>
  );
};

export default DashboardPage;
