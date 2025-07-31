import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol;

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: "Symbol is required" },
      { status: 400 }
    );
  }

  try {
    // 종목 현재가 가져오기
    const quote = await yahooFinance.quote(symbol);

    return NextResponse.json({
      success: true,
      price: quote.regularMarketPrice,
      currency: quote.currency || "USD",
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
    });
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stock price",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
