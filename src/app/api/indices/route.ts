import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET() {
  // 조회할 지수의 티커 심볼 배열입니다.
  // 나스닥: ^IXIC, 코스피: ^KS11, 코스닥: ^KQ11
  const symbols = ['^IXIC', '^KS11', '^KQ11'];

  try {
    // yahoo-finance2의 quote 메서드를 사용하여 여러 지수 정보를 동시에 가져옵니다.
    const quotes = await yahooFinance.quote(symbols);

    // 필요한 데이터만 추출하여 새로운 배열을 만듭니다.
    const indices = quotes.map((quote) => ({
      symbol: quote.symbol,
      name: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
    }));

    // NextResponse.json을 사용하여 JSON 형태로 성공 응답을 반환합니다.
    return NextResponse.json(indices);
  } catch (error) {
    // 에러 발생 시 콘솔에 로그를 남기고 500 에러 상태와 함께 에러 메시지를 반환합니다.
    console.error('Failed to fetch indices data:', error);
    return NextResponse.json({ error: '지수 데이터를 가져오는데 실패했습니다.' }, { status: 500 });
  }
}
