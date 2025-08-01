import { INavItem } from '@/medusa/layout/nav-item';
import { ChartBar, House } from '@medusajs/icons';

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
        icon: <ChartBar />,
        label: '과거 데이터',
        to: '/history-data',
      },
    ],
  },
];
