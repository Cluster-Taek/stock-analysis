import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// Simple in-memory cache
interface CacheItem {
  data: unknown[];
  timestamp: number;
  expiresAt: number;
}

interface Cache {
  [key: string]: CacheItem;
}

// Cache with 30-minute expiration by default
const cache: Cache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Fetches data with retry logic
 */
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = MAX_RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message);

      if (attempt < maxRetries - 1) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

/**
 * Validates the historical data
 */
function validateHistoricalData(data: unknown[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  // Check if data has the expected structure
  return data.every(
    (item) =>
      item && typeof item === 'object' && 'date' in item && 'open' in item && 'close' in item && 'adjClose' in item
  );
}

/**
 * Formats the date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  const symbol = params.symbol;
  const searchParams = request.nextUrl.searchParams;

  // Get query parameters
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate') || formatDate(new Date());
  const interval = searchParams.get('interval') || '1d'; // Default to daily data
  const skipCache = searchParams.get('skipCache') === 'true';

  // Validate symbol
  if (!symbol) {
    return NextResponse.json({ success: false, error: 'Symbol is required' }, { status: 400 });
  }

  // Validate startDate
  if (!startDateParam) {
    return NextResponse.json({ success: false, error: 'startDate parameter is required' }, { status: 400 });
  }

  // Validate interval
  if (!['1d', '1wk', '1mo'].includes(interval)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid interval. Must be one of: 1d, 1wk, 1mo',
      },
      { status: 400 }
    );
  }

  try {
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    // Validate dates
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid startDate format. Use YYYY-MM-DD' }, { status: 400 });
    }

    if (isNaN(endDate.getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid endDate format. Use YYYY-MM-DD' }, { status: 400 });
    }

    if (startDate > endDate) {
      return NextResponse.json({ success: false, error: 'startDate must be before endDate' }, { status: 400 });
    }

    // Create a cache key
    const cacheKey = `historical_${symbol}_${formatDate(startDate)}_${formatDate(endDate)}_${interval}`;

    // Check if we have a valid cache entry
    const now = Date.now();
    if (!skipCache && cache[cacheKey] && cache[cacheKey].expiresAt > now) {
      console.log(`Cache hit for ${cacheKey}`);
      return NextResponse.json({
        success: true,
        data: cache[cacheKey].data,
        metadata: {
          symbol,
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          interval,
          dataPoints: cache[cacheKey].data.length,
          fromCache: true,
        },
      });
    }

    // Fetch historical data from Yahoo Finance with retry logic
    const historicalData = await fetchWithRetry(async () => {
      const data = await yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
        interval: interval as '1d' | '1wk' | '1mo',
      });

      // Validate the data
      if (!validateHistoricalData(data)) {
        throw new Error('Invalid or empty data received from Yahoo Finance API');
      }

      return data;
    });

    // Format the data
    const formattedData = historicalData.map((item) => ({
      date: formatDate(item.date),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      adjustedClose: item.adjClose,
    }));

    // Store in cache
    cache[cacheKey] = {
      data: formattedData,
      timestamp: now,
      expiresAt: now + CACHE_TTL,
    };

    // Clean up old cache entries (simple garbage collection)
    Object.keys(cache).forEach((key) => {
      if (cache[key].expiresAt < now) {
        delete cache[key];
      }
    });

    return NextResponse.json({
      success: true,
      data: formattedData,
      metadata: {
        symbol,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        interval,
        dataPoints: formattedData.length,
        fromCache: false,
      },
    });
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);

    // Determine appropriate status code based on error
    let statusCode = 500;
    let errorMessage = 'Failed to fetch historical stock data';

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('Not Found') || error.message.includes('404')) {
        statusCode = 404;
        errorMessage = `Symbol '${symbol}' not found`;
      } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
        statusCode = 504;
        errorMessage = 'Request timed out while fetching data';
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        statusCode = 429;
        errorMessage = 'Rate limit exceeded, please try again later';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: statusCode }
    );
  }
}
