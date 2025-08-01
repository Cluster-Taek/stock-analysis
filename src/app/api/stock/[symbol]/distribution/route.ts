import { DistributionData, DistributionHistoryItem } from '@/types/yieldmax';
import { isYieldmaxSymbol } from '@/utils/yieldmax-utils';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';

// TODO: 캐시 시스템 구현 (historical API 참고)
interface CacheItem {
  data: DistributionData;
  timestamp: number;
  expiresAt: number;
}

const cache: { [key: string]: CacheItem } = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// YieldMax 심볼별 URL 매핑 함수
function getYieldmaxUrl(symbol: string): string {
  const baseUrl = 'https://www.yieldmaxetfs.com';
  const normalizedSymbol = symbol.toLowerCase();

  // 대부분의 ETF는 기본 패턴을 따름: /symbol/
  // 예: ULTY -> https://www.yieldmaxetfs.com/ulty/
  //     TSLY -> https://www.yieldmaxetfs.com/tsly/

  // TODO: 특수 케이스가 발견되면 여기에 매핑 추가
  // const specialCases: Record<string, string> = {
  //   'SPECIAL_SYMBOL': '/special-path/',
  // };

  // if (specialCases[normalizedSymbol]) {
  //   return `${baseUrl}${specialCases[normalizedSymbol]}`;
  // }

  return `${baseUrl}/${normalizedSymbol}/`;
}

// YieldMax ETF별 실제 테이블 ID 매핑 (수정된 버전)
const REAL_TABLE_MAPPING: Record<string, { distributionTable: string; secYieldTable: string; historyTable: string }> = {
  ULTY: { distributionTable: '383', secYieldTable: '382', historyTable: '384' },
  YMAX: { distributionTable: '339', secYieldTable: '340', historyTable: '355' },
  TSLY: { distributionTable: '39', secYieldTable: '45', historyTable: '238' },
  NVDY: { distributionTable: '41', secYieldTable: '47', historyTable: '241' },
  CONY: { distributionTable: '185', secYieldTable: '190', historyTable: '246' },
  APLY: { distributionTable: '23', secYieldTable: '27', historyTable: '240' },
  // TODO: 다른 ETF들의 실제 테이블 ID 매핑 추가 필요
};

// 웹 크롤링 함수 구현 (수정된 버전)
async function scrapeDistributionData(symbol: string): Promise<DistributionData> {
  const url = getYieldmaxUrl(symbol);
  const tableMapping = REAL_TABLE_MAPPING[symbol.toUpperCase()];

  if (!tableMapping) {
    throw new Error(`Table mapping not found for symbol: ${symbol}`);
  }

  try {
    // 1. axios로 페이지 가져오기
    console.log(`Fetching data from: ${url}`);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // 2. cheerio로 HTML 파싱
    const $ = cheerio.load(response.data);

    // 3. 실제 테이블에서 데이터 추출
    // Distribution Rate: table_383_row_0의 첫 번째 td
    const distributionRateText = $(`#table_${tableMapping.distributionTable}_row_0 td:first-child`).text().trim();

    // SEC Yield: table_382_row_0의 두 번째 td
    const secYieldText = $(`#table_${tableMapping.secYieldTable}_row_0 td:nth-child(2)`).text().trim();

    console.log(`Raw distribution rate: "${distributionRateText}"`);
    console.log(`Raw SEC yield: "${secYieldText}"`);

    // 숫자 파싱
    const distributionRate = parseFloat(distributionRateText) || 0;
    const secYield = parseFloat(secYieldText) || 0;

    // 배당 히스토리 크롤링 (모든 데이터)
    const distributionHistory = await scrapeDistributionHistory($, tableMapping.historyTable);

    // 4. DistributionData 형태로 반환
    const distributionData: DistributionData = {
      symbol: symbol.toUpperCase(),
      distributionRate,
      secYield,
      distributionHistory,
    };

    console.log('Scraped distribution data:', distributionData);
    return distributionData;
  } catch (error) {
    console.error(`Error scraping data for ${symbol}:`, error);
    throw new Error(
      `Failed to scrape distribution data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// 모든 배당 히스토리 크롤링 (실제 구현)
async function scrapeDistributionHistory(
  $: cheerio.CheerioAPI,
  historyTableId: string
): Promise<DistributionHistoryItem[]> {
  try {
    const distributionHistory: DistributionHistoryItem[] = [];

    // 테이블의 모든 row들을 순회
    let rowIndex = 0;

    while (true) {
      const row = $(`#table_${historyTableId}_row_${rowIndex}`);

      if (row.length === 0) {
        // 더 이상 row가 없으면 중단
        break;
      }

      const columns = row.find('td');

      if (columns.length >= 3) {
        // 첫 번째 컬럼: 심볼, 두 번째 컬럼: 배당금액, 세 번째 컬럼: 날짜
        // const symbolText = $(columns[0]).text().trim();
        const amountText = $(columns[1]).text().trim();
        const dateText = $(columns[2]).text().trim();

        // 추가 날짜 정보들 (ex-date, record date, payable date)
        const exDate = columns.length > 3 ? $(columns[3]).text().trim() : undefined;
        const recordDate = columns.length > 4 ? $(columns[4]).text().trim() : undefined;
        const payableDate = columns.length > 5 ? $(columns[5]).text().trim() : undefined;

        const amount = parseFloat(amountText) || 0;

        if (amount > 0 && dateText) {
          const distributionItem: DistributionHistoryItem = {
            date: dateText,
            amount,
            returnOfCapital: 100, // 기본값 (추후 개선 가능)
            income: 0, // 기본값 (추후 개선 가능)
            exDate: exDate || undefined,
            recordDate: recordDate || undefined,
            payableDate: payableDate || undefined,
          };

          distributionHistory.push(distributionItem);
          console.log(`Distribution ${rowIndex}: ${amount} on ${dateText}`);
        }
      }

      rowIndex++;

      // 안전장치: 너무 많은 row를 처리하지 않도록 제한
      if (rowIndex > 50) {
        console.warn(`Too many rows in table_${historyTableId}, stopping at row ${rowIndex}`);
        break;
      }
    }

    console.log(`Found ${distributionHistory.length} distribution entries in table_${historyTableId}`);
    return distributionHistory;
  } catch (error) {
    console.error(`Error scraping distribution history from table_${historyTableId}:`, error);

    // 에러 시 빈 배열 반환
    return [];
  }
}

// TODO: 캐시 확인 함수 구현
function getCachedData(symbol: string): DistributionData | null {
  const cached = cache[symbol];
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }
  return null;
}

// TODO: 캐시 저장 함수 구현
function setCachedData(symbol: string, data: DistributionData): void {
  cache[symbol] = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL,
  };
}

export async function GET(request: NextRequest, { params }: { params: { symbol: string } }) {
  const symbol = params.symbol?.toUpperCase();

  // 1. 기본 검증
  if (!symbol) {
    return NextResponse.json(
      {
        success: false,
        error: 'Symbol is required',
      },
      { status: 400 }
    );
  }

  // 2. YieldMax 심볼 검증
  if (!isYieldmaxSymbol(symbol)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Not a YieldMax ETF symbol',
        message: `Symbol '${symbol}' must be a valid YieldMax ETF`,
      },
      { status: 400 }
    );
  }

  try {
    // 3. 캐시 확인
    const cachedData = getCachedData(symbol);
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      });
    }

    // 4. 실제 데이터 크롤링
    // TODO: 실제 크롤링 로직 구현 후 아래 주석 해제
    const distributionData = await scrapeDistributionData(symbol);

    // 5. 캐시에 저장
    setCachedData(symbol, distributionData);

    return NextResponse.json({
      success: true,
      data: distributionData,
      cached: false,
    });
  } catch (error) {
    console.error(`Error fetching distribution data for ${symbol}:`, error);

    // TODO: 에러 타입별 상세 처리
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch distribution data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
