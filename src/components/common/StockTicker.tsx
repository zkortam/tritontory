"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, CloudSun, CloudMoon } from "lucide-react";
import { StockService, FALLBACK_STOCK_DATA, type StockData } from "@/lib/stock-service";
import { WeatherService, FALLBACK_WEATHER_DATA, type WeatherData } from "@/lib/weather-service";

export function StockTicker() {
  const [stocks, setStocks] = useState<StockData[]>(FALLBACK_STOCK_DATA);
  const [weather, setWeather] = useState<WeatherData>(FALLBACK_WEATHER_DATA);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false); // Track if we've loaded real data



  // Fetch weather data
  const fetchWeatherData = async () => {
    try {
      const weatherService = WeatherService.getInstance();
      const updatedWeather = await weatherService.getWeatherData();
      setWeather(updatedWeather);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Keep using fallback data if API fails
    }
  };

  // Update stock data every 5 minutes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const stockService = StockService.getInstance();
        const updatedStocks = await stockService.getStockData();
        
        // Check if we got real data (not all zeros)
        const hasRealData = updatedStocks.some(stock => stock.price > 0);
        
        if (hasRealData) {
          setStocks(updatedStocks);
          setHasLoadedOnce(true);
        } else if (!hasLoadedOnce) {
          // If no real data and we haven't loaded before, keep trying
          console.log('No real data received, will retry...');
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
        // Keep using current data if API fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(); // Initial stock fetch
    const stockInterval = setInterval(fetchData, 300000); // 5 minutes
    return () => {
      clearInterval(stockInterval);
    };
  }, [hasLoadedOnce]); // Re-run if hasLoadedOnce changes

  // Update weather every 5 minutes
  useEffect(() => {
    fetchWeatherData(); // Initial weather fetch
    const weatherInterval = setInterval(fetchWeatherData, 300000); // 5 minutes
    return () => {
      clearInterval(weatherInterval);
    };
  }, []);

  // Handle scroll events for fade functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 100; // Start fading after 100px scroll
      
      if (scrollY > threshold) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getDisplayName = (symbol: string) => {
    const displayNames: { [key: string]: string } = {
      'SPY': 'S&P 500',
      'QQQ': 'NASDAQ',
      'QCOM': 'QCOM',
      'GLD': 'GOLD',
      'AAPL': 'AAPL',
      'MSFT': 'MSFT',
      'TSLA': 'TSLA',
      'GOOGL': 'GOOGL',
      'AMZN': 'AMZN',
      'NVDA': 'NVDA'
    };
    return displayNames[symbol] || symbol;
  };

  const getWeatherIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'sun': <Sun className="w-5 h-5" />,
      'moon': <CloudMoon className="w-5 h-5" />,
      'cloud': <Cloud className="w-5 h-5" />,
      'clouds': <Cloud className="w-5 h-5" />,
      'cloud-sun': <CloudSun className="w-5 h-5" />,
      'cloud-moon': <CloudMoon className="w-5 h-5" />,
      'cloud-rain': <CloudRain className="w-5 h-5" />,
      'cloud-sun-rain': <CloudRain className="w-5 h-5" />,
      'cloud-moon-rain': <CloudRain className="w-5 h-5" />,
      'cloud-lightning': <CloudLightning className="w-5 h-5" />,
      'snowflake': <Snowflake className="w-5 h-5" />,
      'cloud-fog': <CloudFog className="w-5 h-5" />
    };
    return iconMap[iconName] || <CloudSun className="w-5 h-5" />;
  };

  return (
    <div 
      className={`fixed top-16 left-0 right-0 z-40 bg-black border-b border-gray-800 transition-opacity duration-300 mobile-gpu-accelerated ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex">
        {/* Weather Section - Responsive width for mobile */}
        <div className="w-[120px] sm:w-[150px] flex-shrink-0 flex items-center justify-center px-2 sm:px-3 py-2 border-r border-gray-700">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="text-blue-400">
              {getWeatherIcon(weather.icon)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{weather.temperature}°</span>
              <span className="text-xs text-gray-400 hidden sm:block">{weather.location}</span>
              <span className="text-xs text-gray-400 sm:hidden">SD</span>
            </div>
          </div>
        </div>

        {/* Stock Ticker Section */}
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-scroll whitespace-nowrap mobile-smooth-scroll">
            {/* Duplicate the stocks array to create seamless scrolling */}
            {[...stocks, ...stocks].map((stock, index) => (
              <div
                key={`${stock.symbol}-${index}`}
                className="flex items-center space-x-3 sm:space-x-4 px-4 sm:px-6 py-2 min-w-max"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white leading-tight">{getDisplayName(stock.symbol)}</span>
                  <span className="text-base sm:text-lg font-bold text-white leading-tight -mt-1">
                    {isLoading && !hasLoadedOnce ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : stock.price > 0 ? (
                      `$${formatPrice(stock.price)}`
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${
                      stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isLoading && !hasLoadedOnce ? (
                        <span className="text-gray-400">--</span>
                      ) : (
                        formatChange(stock.change)
                      )}
                    </span>
                    <span className={`text-xs ${
                      stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isLoading && !hasLoadedOnce ? (
                        <span className="text-gray-400">--</span>
                      ) : (
                        formatChangePercent(stock.changePercent)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 