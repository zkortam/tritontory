import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    // Use Alpha Vantage API as alternative (free tier available)
    // Note: You'll need to get a free API key from https://www.alphavantage.co/
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    const alphaVantageUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    
    const response = await fetch(alphaVantageUrl);

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
      return NextResponse.json({ error: 'No data found for symbol' }, { status: 404 });
    }

    const quote = data['Global Quote'];
    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
    const volume = parseInt(quote['06. volume']);
    const previousClose = parseFloat(quote['08. previous close']);

    return NextResponse.json({
      symbol: quote['01. symbol'],
      price: price,
      change: change,
      changePercent: changePercent,
      volume: volume,
      previousClose: previousClose,
      open: price - change, // Approximate open
      high: price + Math.abs(change), // Approximate high
      low: price - Math.abs(change) // Approximate low
    });

  } catch (error) {
    console.error('Error fetching Alpha Vantage data:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
} 