/**
 * Technical Indicator Utilities
 * 기술적 지표 계산을 위한 유틸리티 함수들
 */

/**
 * RSI(Relative Strength Index) 계산
 *
 * RSI는 0-100 사이의 값을 가지며, 일반적으로:
 * - 70 이상: 과매수 구간
 * - 30 이하: 과매도 구간
 *
 * 계산 방법:
 * 1. 일정 기간 동안의 가격 변화를 계산
 * 2. 상승폭 평균과 하락폭 평균을 구함 (EMA 방식)
 * 3. RS = 평균 상승폭 / 평균 하락폭
 * 4. RSI = 100 - (100 / (1 + RS))
 *
 * @param prices 가격 배열 (오래된 순서부터, [0]이 가장 오래된 가격)
 * @param period RSI 계산 기간 (기본값: 14)
 * @returns RSI 값 (0-100), 데이터가 부족하면 null
 */
export function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) {
    return null; // 충분한 데이터가 없음
  }

  // 가격 변화 계산
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  // 초기 평균 계산 (첫 period 기간)
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // 이후 기간은 EMA 방식으로 계산
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  // RSI 계산
  if (avgLoss === 0) {
    return 100; // 하락이 없으면 RSI는 100
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return rsi;
}

/**
 * 백테스팅을 위한 히스토리컬 RSI 계산
 * 각 날짜별로 해당 시점까지의 데이터를 사용하여 RSI를 계산
 *
 * @param historicalData 날짜별 가격 데이터 (오래된 순서부터)
 * @param period RSI 계산 기간 (기본값: 14)
 * @returns 날짜별 RSI 맵 (date -> RSI value)
 */
export function calculateHistoricalRSI(
  historicalData: Array<{ date: string; close: number }>,
  period: number = 14
): Map<string, number> {
  const rsiMap = new Map<string, number>();

  // 최소 period + 1개의 데이터가 필요
  if (historicalData.length < period + 1) {
    return rsiMap;
  }

  // 각 날짜별로 RSI 계산
  for (let i = period; i < historicalData.length; i++) {
    // 현재 날짜까지의 가격 데이터 추출
    const pricesUpToDate = historicalData.slice(0, i + 1).map((d) => d.close);

    // RSI 계산
    const rsi = calculateRSI(pricesUpToDate, period);

    if (rsi !== null) {
      rsiMap.set(historicalData[i].date, rsi);
    }
  }

  return rsiMap;
}

/**
 * 여러 종목의 히스토리컬 RSI를 한번에 계산
 *
 * @param timelineData 타임라인 데이터 (날짜 -> 종목 -> 가격 정보)
 * @param symbols 계산할 종목 리스트
 * @param period RSI 계산 기간 (기본값: 14)
 * @returns 종목별 날짜별 RSI 맵 (symbol -> date -> RSI value)
 */
export function calculateMultipleHistoricalRSI(
  timelineData: Map<string, Map<string, { close: number }>>,
  symbols: string[],
  period: number = 14
): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>();

  // 날짜를 정렬 (오래된 순서부터)
  const dates = Array.from(timelineData.keys()).sort();

  for (const symbol of symbols) {
    // 해당 종목의 히스토리컬 데이터 추출
    const historicalData: Array<{ date: string; close: number }> = [];

    for (const date of dates) {
      const dailyData = timelineData.get(date);
      const priceData = dailyData?.get(symbol);

      if (priceData?.close !== undefined) {
        historicalData.push({
          date,
          close: priceData.close,
        });
      }
    }

    // RSI 계산
    const symbolRSI = calculateHistoricalRSI(historicalData, period);
    result.set(symbol, symbolRSI);
  }

  return result;
}
