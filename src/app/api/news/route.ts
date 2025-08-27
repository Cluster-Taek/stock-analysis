import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const count = searchParams.get('count');

  if (!symbol) {
    return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
  }

  try {
    const searchResult = await yahooFinance.search(symbol, {
      newsCount: count ? parseInt(count) : 10,
    });

    // search 결과에서 뉴스 데이터만 추출합니다.
    const news = searchResult.news;

    if (!news || news.length === 0) {
      return NextResponse.json({ message: '관련 뉴스를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 필요한 정보만 가공하여 반환
    const formattedNews = news.map((item) => ({
      uuid: item.uuid,
      title: item.title,
      publisher: item.publisher,
      link: item.link,
      providerPublishTime: item.providerPublishTime,
      thumbnail: item.thumbnail?.resolutions[0]?.url || null, // 썸네일 이미지 URL
    }));

    return NextResponse.json(formattedNews);
  } catch (error) {
    console.error(`Failed to fetch news for ${symbol}:`, error);
    return NextResponse.json({ error: '마켓 뉴스를 가져오는데 실패했습니다.' }, { status: 500 });
  }
}
