import { INavItem } from '@/medusa/layout/nav-item';
import { ChartBar, ChartPie, CommandLine, House } from '@medusajs/icons';

export interface IRoutes {
  title: string;
  navItems: INavItem[];
}

export const MENU_CONSTANTS: IRoutes[] = [
  {
    title: '메인',
    navItems: [
      {
        icon: <House />,
        label: '메인',
        to: '/',
      },
      {
        icon: <ChartPie />,
        label: '백테스팅',
        to: '/backtesting',
      },
      {
        icon: <ChartBar />,
        label: '과거 데이터',
        to: '/history-data',
      },
      {
        icon: <CommandLine />,
        label: 'D3 차트 예제',
        to: '/example',
      },
    ],
  },
];
