export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
}

// Stock symbols to track
export const STOCK_SYMBOLS = [
  "SPY", // S&P 500 ETF
  "QQQ", // NASDAQ ETF
  "QCOM", // Qualcomm
  "GLD", // Gold ETF
  "AAPL", // Apple
  "MSFT", // Microsoft
  "TSLA", // Tesla
  "GOOGL", // Google
  "AMZN", // Amazon
  "NVDA"  // NVIDIA
];

// Static data with all values set to 0 (fallback)
export const FALLBACK_STOCK_DATA: StockData[] = [
  { symbol: "SPY", price: 0, change: 0, changePercent: 0 },
  { symbol: "QQQ", price: 0, change: 0, changePercent: 0 },
  { symbol: "QCOM", price: 0, change: 0, changePercent: 0 },
  { symbol: "GLD", price: 0, change: 0, changePercent: 0 },
  { symbol: "AAPL", price: 0, change: 0, changePercent: 0 },
  { symbol: "MSFT", price: 0, change: 0, changePercent: 0 },
  { symbol: "TSLA", price: 0, change: 0, changePercent: 0 },
  { symbol: "GOOGL", price: 0, change: 0, changePercent: 0 },
  { symbol: "AMZN", price: 0, change: 0, changePercent: 0 },
  { symbol: "NVDA", price: 0, change: 0, changePercent: 0 },
];

export class StockService {
  private static instance: StockService;
  private apiCallCount: number = 0;
  private lastFetchTime: number = 0;
  private cachedData: StockData[] = FALLBACK_STOCK_DATA;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): StockService {
    if (!StockService.instance) {
      StockService.instance = new StockService();
    }
    return StockService.instance;
  }

  async getStockData(): Promise<StockData[]> {
    // Check if we have cached data that's still fresh
    const now = Date.now();
    if (now - this.lastFetchTime < this.CACHE_DURATION && this.cachedData !== FALLBACK_STOCK_DATA) {
      return this.cachedData;
    }

    try {
      this.apiCallCount++;
      const stockData = await this.fetchRealStockData();
      this.cachedData = stockData;
      this.lastFetchTime = now;
      return stockData;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Return cached data if available, otherwise fallback
      return this.cachedData !== FALLBACK_STOCK_DATA ? this.cachedData : FALLBACK_STOCK_DATA;
    }
  }

  private async fetchRealStockData(): Promise<StockData[]> {
    // Try multiple data sources for redundancy
    try {
      return await this.fetchFromYahooFinance();
    } catch (error) {
      console.error('Yahoo Finance failed, trying alternative source:', error);
      try {
        return await this.fetchFromStockMarketData();
      } catch (error2) {
        console.error('All data sources failed:', error2);
        throw error2;
      }
    }
  }

  private async fetchFromYahooFinance(): Promise<StockData[]> {
    const stockData: StockData[] = [];
    
    for (const symbol of STOCK_SYMBOLS) {
      try {
        const response = await fetch(`/api/stocks/yahoo?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        stockData.push({
          symbol: data.symbol,
          price: data.regularMarketPrice || 0,
          change: data.regularMarketChange || 0,
          changePercent: data.regularMarketChangePercent || 0,
          volume: data.regularMarketVolume,
          open: data.regularMarketOpen,
          high: data.regularMarketDayHigh,
          low: data.regularMarketDayLow,
          previousClose: data.regularMarketPreviousClose
        });
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        // Add fallback data for this symbol
        stockData.push({
          symbol,
          price: 0,
          change: 0,
          changePercent: 0
        });
      }
    }
    
    return stockData;
  }

  private async fetchFromStockMarketData(): Promise<StockData[]> {
    const stockData: StockData[] = [];
    
    for (const symbol of STOCK_SYMBOLS) {
      try {
        const response = await fetch(`/api/stocks/market-data?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        stockData.push({
          symbol: data.symbol,
          price: data.price || 0,
          change: data.change || 0,
          changePercent: data.changePercent || 0,
          volume: data.volume,
          open: data.open,
          high: data.high,
          low: data.low,
          previousClose: data.previousClose
        });
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        // Add fallback data for this symbol
        stockData.push({
          symbol,
          price: 0,
          change: 0,
          changePercent: 0
        });
      }
    }
    
    return stockData;
  }

  // Method to get API call count for monitoring
  getApiCallCount(): number {
    return this.apiCallCount;
  }

  // Method to reset API call count
  resetApiCallCount(): void {
    this.apiCallCount = 0;
  }

  // Method to clear cache
  clearCache(): void {
    this.cachedData = FALLBACK_STOCK_DATA;
    this.lastFetchTime = 0;
  }
} 