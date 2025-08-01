import { IYieldmax } from '@/types/yieldmax';

export const YIELDMAX_SYMBOLS: IYieldmax[] = [
  // Weekly Payers
  { symbol: 'CHPY', group: 'WEEKLY' },
  { symbol: 'GPTY', group: 'WEEKLY' },
  { symbol: 'LFGY', group: 'WEEKLY' },
  { symbol: 'QDTY', group: 'WEEKLY' },
  { symbol: 'RDTY', group: 'WEEKLY' },
  { symbol: 'SDTY', group: 'WEEKLY' },
  { symbol: 'ULTY', group: 'WEEKLY' },
  { symbol: 'YMAG', group: 'WEEKLY' },
  { symbol: 'YMAX', group: 'WEEKLY' },

  // Group A ETFs
  { symbol: 'BRKC', group: 'A' },
  { symbol: 'CRSH', group: 'A' },
  { symbol: 'FEAT', group: 'A' },
  { symbol: 'FIVY', group: 'A' },
  { symbol: 'GOOY', group: 'A' },
  { symbol: 'OARK', group: 'A' },
  { symbol: 'RBLY', group: 'A' },
  { symbol: 'SNOY', group: 'A' },
  { symbol: 'TSLY', group: 'A' },
  { symbol: 'TSMY', group: 'A' },
  { symbol: 'XOMO', group: 'A' },
  { symbol: 'YBIT', group: 'A' },

  // Group B ETFs
  { symbol: 'BABO', group: 'B' },
  { symbol: 'DIPS', group: 'B' },
  { symbol: 'FBY', group: 'B' },
  { symbol: 'GDXY', group: 'B' },
  { symbol: 'JPMO', group: 'B' },
  { symbol: 'MARO', group: 'B' },
  { symbol: 'MRNY', group: 'B' },
  { symbol: 'NVDY', group: 'B' },
  { symbol: 'PLTY', group: 'B' },

  // Group C ETFs
  { symbol: 'ABNY', group: 'C' },
  { symbol: 'AMDY', group: 'C' },
  { symbol: 'CONY', group: 'C' },
  { symbol: 'CVNY', group: 'C' },
  { symbol: 'DRAY', group: 'C' },
  { symbol: 'FIAT', group: 'C' },
  { symbol: 'HOOY', group: 'C' },
  { symbol: 'MSFO', group: 'C' },
  { symbol: 'NFLY', group: 'C' },
  { symbol: 'PYPY', group: 'C' },

  // Group D ETFs
  { symbol: 'AIYY', group: 'D' },
  { symbol: 'AMZY', group: 'D' },
  { symbol: 'APLY', group: 'D' },
  { symbol: 'DISO', group: 'D' },
  { symbol: 'MSTY', group: 'D' },
  { symbol: 'SMCY', group: 'D' },
  { symbol: 'WNTR', group: 'D' },
  { symbol: 'XYZY', group: 'D' },
  { symbol: 'YQQQ', group: 'D' },
];

export const YIELDMAX_GROUPS = ['Weekly Payers', 'Group A ETFs', 'Group B ETFs', 'Group C ETFs', 'Group D ETFs'];
