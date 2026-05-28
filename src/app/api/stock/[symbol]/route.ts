import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from '@/lib/yahoo-finance';

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  const symbol = params.symbol;

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    // 종목 기본 정보 가져오기
    const quote = await yahooFinance.quote(symbol);

    // 과거 주가 데이터 가져오기 (1년)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const historicalData = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    });

    // 차트 데이터 포맷팅
    const chartData = historicalData.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));

    // 종목 정보 구성
    const stockInfo = {
      symbol: symbol,
      name: quote.displayName || quote.shortName || symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      marketCap: quote.marketCap,
      peRatio: quote.trailingPE,
      volume: quote.regularMarketVolume,
      averageVolume: quote.averageDailyVolume10Day,
      high52Week: quote.fiftyTwoWeekHigh,
      low52Week: quote.fiftyTwoWeekLow,
      chartData: chartData,
    };

    return NextResponse.json({
      success: true,
      data: stockInfo,
    });
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stock data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
