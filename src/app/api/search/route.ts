import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from '@/lib/yahoo-finance';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ success: false, error: '검색어는 2글자 이상이어야 합니다.' }, { status: 400 });
  }

  try {
    // Yahoo Finance API를 사용하여 종목 검색
    const searchResults = await yahooFinance.search(query);

    // 검색 결과 필터링 및 포맷팅
    const formattedResults = searchResults.quotes
      .filter((quote) => quote.isYahooFinance)
      .map((quote) => ({
        symbol: quote.symbol,
        name: quote.shortname || quote.longname || quote.symbol,
        exchange: quote.exchDisp || quote.exchange || '',
        type: quote.quoteType, // 상품 타입 정보 추가 (EQUITY 또는 ETF)
      }))
      .slice(0, 10); // 최대 10개 결과만 반환

    return NextResponse.json({
      success: true,
      results: formattedResults,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '검색 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
