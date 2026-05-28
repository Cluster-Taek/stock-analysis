import { NextResponse } from 'next/server';
import yahooFinance from '@/lib/yahoo-finance';

export async function GET() {
  const symbols = ['^IXIC', '^KS11', '^KQ11'];

  try {
    const quotes = await yahooFinance.quote(symbols);

    const indices = quotes.map((quote) => ({
      symbol: quote.symbol,
      name: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
    }));

    return NextResponse.json(indices);
  } catch (error) {
    console.error('Failed to fetch indices data:', error);
    return NextResponse.json({ error: '지수 데이터를 가져오는데 실패했습니다.' }, { status: 500 });
  }
}
