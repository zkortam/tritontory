import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    // Use Yahoo Finance API directly
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      return NextResponse.json({ error: 'No data found for symbol' }, { status: 404 });
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const indicators = result.indicators.quote[0];
    
    // Get the latest data points
    const close = indicators.close[indicators.close.length - 1];
    const previousClose = meta.chartPreviousClose; // Use chartPreviousClose instead of previousClose
    
    // Calculate change and change percent
    const change = close - previousClose;
    const changePercent = (change / previousClose) * 100;

    return NextResponse.json({
      symbol: meta.symbol,
      regularMarketPrice: close,
      regularMarketChange: change,
      regularMarketChangePercent: changePercent,
      regularMarketVolume: indicators.volume[indicators.volume.length - 1],
      regularMarketOpen: indicators.open[indicators.open.length - 1],
      regularMarketDayHigh: indicators.high[indicators.high.length - 1],
      regularMarketDayLow: indicators.low[indicators.low.length - 1],
      regularMarketPreviousClose: previousClose
    });

  } catch (error) {
    console.error('Error fetching Yahoo Finance data:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
} 