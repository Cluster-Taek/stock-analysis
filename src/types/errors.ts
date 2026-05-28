export class BacktestingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BacktestingError';
  }
}

export const BACKTESTING_ERROR_CODES = {
  INVALID_PARAMS: 'INVALID_PARAMS',
  DATA_FETCH_FAILED: 'DATA_FETCH_FAILED',
  NO_DATA_AVAILABLE: 'NO_DATA_AVAILABLE',
  SIMULATION_FAILED: 'SIMULATION_FAILED',
  INVALID_START_DATE: 'INVALID_START_DATE',
} as const;