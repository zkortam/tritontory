"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArticleService, NewsTickerService } from "@/lib/firebase-service";
import type { Article, NewsTicker } from "@/lib/models";
import { Search, User, TrendingUp, Clock, MapPin, Globe, Building, Trophy, Newspaper, Sun, Cloud, TrendingDown, ArrowRight, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { calculateReadingTime } from "@/lib/utils";
import { NewsTicker as NewsTickerComponent } from "@/components/common/NewsTicker";
import { StockService, FALLBACK_STOCK_DATA, type StockData } from "@/lib/stock-service";
import { WeatherService, FALLBACK_WEATHER_DATA, type WeatherData } from "@/lib/weather-service";

export default function TritonToryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [campusArticles, setCampusArticles] = useState<Article[]>([]);
  const [sportsArticles, setSportsArticles] = useState<Article[]>([]);
  const [localArticles, setLocalArticles] = useState<Article[]>([]);
  const [californiaArticles, setCaliforniaArticles] = useState<Article[]>([]);
  const [nationalArticles, setNationalArticles] = useState<Article[]>([]);
  const [newsTickers, setNewsTickers] = useState<NewsTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stocks, setStocks] = useState<StockData[]>(FALLBACK_STOCK_DATA);
  const [weather, setWeather] = useState<WeatherData>(FALLBACK_WEATHER_DATA);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch news tickers
        const tickers = await NewsTickerService.getActiveTickers();
        setNewsTickers(tickers);

        // Fetch featured articles (top 3 most recent)
        const featured = await ArticleService.getArticles(
          undefined,
          undefined,
          true,
          3
        );
        setFeaturedArticles(featured);

        // Fetch articles by category
        const campus = await ArticleService.getArticles("Campus", undefined, false, 3);
        setCampusArticles(campus);

        const sports = await ArticleService.getArticles("Sports", undefined, false, 3);
        setSportsArticles(sports);

        const local = await ArticleService.getArticles("San Diego", undefined, false, 3);
        setLocalArticles(local);

        const california = await ArticleService.getArticles("California", undefined, false, 3);
        setCaliforniaArticles(california);

        const national = await ArticleService.getArticles("National", undefined, false, 3);
        setNationalArticles(national);

        // Fetch all articles for search
        const allArticles = await ArticleService.getArticles(undefined, undefined, false, 50);
        setArticles(allArticles);

        // Fetch stock and weather data
        const stockService = StockService.getInstance();
        const weatherService = WeatherService.getInstance();
        const stockData = await stockService.getStockData();
        const weatherData = await weatherService.getWeatherData();
        
        setStocks(stockData);
        setWeather(weatherData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter articles based on search query
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryIcons = {
    Campus: <Building className="h-4 w-4" />,
    Sports: <Trophy className="h-4 w-4" />,
    "San Diego": <MapPin className="h-4 w-4" />,
    California: <MapPin className="h-4 w-4" />,
    National: <Globe className="h-4 w-4" />,
  };

  const categoryColors = {
    Campus: "bg-blue-500",
    Sports: "bg-green-500",
    "San Diego": "bg-purple-500",
    California: "bg-orange-500",
    National: "bg-red-500",
  };

  const renderHeroArticleCard = (article: Article, isMain: boolean = false) => (
    <Card key={article.id} className={`bg-gray-900/50 backdrop-blur-sm border-gray-800/50 hover:border-tory-500/50 transition-all duration-300 overflow-hidden group ${isMain ? 'lg:col-span-1' : ''}`}>
      <Link href={`/triton-tory/${article.id}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={article.coverImage || `https://picsum.photos/800/450?random=${article.id}`}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge className={`${categoryColors[article.category as keyof typeof categoryColors] || 'bg-gray-600'} text-white text-xs font-medium`}>
              {article.category}
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-bold text-white group-hover:text-tory-400 transition-colors line-clamp-2 text-xl">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-gray-300 mt-2 line-clamp-2 text-sm opacity-90">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{article.authorName}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(article.publishedAt, { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{calculateReadingTime(article.content || "")} min read</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  const renderArticleCard = (article: Article) => (
    <div key={article.id} className="group border-b border-gray-800/50 last:border-b-0 py-6 hover:bg-gray-900/30 transition-colors duration-200 rounded-lg px-2 -mx-2">
      <div className="flex gap-4">
        <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={article.coverImage || `https://picsum.photos/80/64?random=${article.id}`}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${categoryColors[article.category as keyof typeof categoryColors] || 'bg-gray-600'} text-white text-xs font-medium`}>
              {article.category}
            </Badge>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{formatDistanceToNow(article.publishedAt, { addSuffix: true })}</span>
          </div>
          <Link href={`/triton-tory/${article.id}`} className="group">
            <h4 className="font-semibold text-white group-hover:text-tory-400 transition-colors line-clamp-2 text-sm leading-tight mb-2">
              {article.title}
            </h4>
          </Link>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{article.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{calculateReadingTime(article.content || "")} min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategorySection = (title: string, articles: Article[], icon: React.ReactNode, color: string) => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
            <div className={`${color.replace('bg-', 'text-')}`}>
              {icon}
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {articles.length > 0 ? (
        <div className="space-y-0">
          {articles.slice(0, 3).map((article) => renderArticleCard(article))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">No articles in this category yet.</p>
        </div>
      )}
    </section>
  );

  // Enhanced Stock and Weather Widget
  const renderStockWeatherWidget = () => (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 sticky top-20 max-h-[400px] self-end mobile-gpu-accelerated">
      <CardContent className="p-6">
        {/* Weather Section */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="text-blue-400 bg-blue-500/20 p-3 rounded-xl">
              {weather.icon === 'sun' ? <Sun className="w-8 h-8" /> : <Cloud className="w-8 h-8" />}
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{weather.temperature}°</div>
              <div className="text-sm text-gray-400">{weather.location}</div>
            </div>
          </div>
        </div>

        {/* Stock Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-white">Markets</h3>
            <Badge variant="outline" className="text-xs">Live</Badge>
          </div>
          {stocks.slice(0, 4).map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
              <div>
                <div className="text-xs font-medium text-white">{stock.symbol}</div>
                <div className="text-sm font-bold text-white">
                  ${stock.price > 0 ? stock.price.toFixed(2) : '--'}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {stock.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <div className="text-right">
                  <div className={`text-xs font-medium ${
                    stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </div>
                  <div className={`text-xs ${
                    stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-black text-white min-h-screen">
      {/* News Ticker */}
      <NewsTickerComponent tickers={newsTickers} />

      {/* Main Content */}
      <div className="container mx-auto mobile-safe-area py-8">
        {loading ? (
          <div className="space-y-12">
            {/* Featured Section Loading */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-gray-900/50 border border-gray-800/50 p-4 rounded-lg">
                    <div className="h-48 bg-gray-800/50 animate-pulse rounded-lg mb-4" />
                    <div className="h-4 bg-gray-800/50 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-800/50 rounded animate-pulse w-3/4 mb-4" />
                    <div className="h-3 bg-gray-800/50 rounded animate-pulse w-1/2" />
                  </div>
                ))}
              </div>
              <div className="bg-gray-900/50 border border-gray-800/50 p-6 animate-pulse rounded-lg" />
            </div>
            
            {/* Category Sections Loading */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="bg-gray-900/50 border border-gray-800/50 p-4 rounded-lg">
                      <div className="h-4 bg-gray-800/50 rounded animate-pulse mb-2" />
                      <div className="h-3 bg-gray-800/50 rounded animate-pulse w-3/4" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          // Search Results
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Search className="h-6 w-6 text-tory-500" />
              <h2 className="text-2xl font-bold">Search Results</h2>
              <Badge variant="outline" className="ml-2">
                {filteredArticles.length} results
              </Badge>
            </div>
            
            {filteredArticles.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-600 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-3">No articles found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search terms</p>
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  size="lg"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article) => renderHeroArticleCard(article))}
              </div>
            )}
          </section>
        ) : (
          // Main Layout
          <div className="space-y-12">
            {/* Featured Section with Stock Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Featured Articles - 3/4 width */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-tory-500/20">
                    <TrendingUp className="h-6 w-6 text-tory-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Featured Stories</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featuredArticles.slice(0, 2).map((article) => 
                    renderHeroArticleCard(article)
                  )}
                </div>
              </div>

              {/* Stock/Weather Widget - 1/4 width */}
              <div className="lg:col-span-1 flex flex-col">
                <div className="mt-auto">
                  {renderStockWeatherWidget()}
                </div>
              </div>
            </div>

            {/* Three Column Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Campus */}
              {renderCategorySection("Campus", campusArticles, categoryIcons.Campus, categoryColors.Campus)}
              
              {/* San Diego */}
              {renderCategorySection("San Diego", localArticles, categoryIcons["San Diego"], categoryColors["San Diego"])}
              
              {/* National */}
              {renderCategorySection("National", nationalArticles, categoryIcons.National, categoryColors.National)}
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* California */}
              {renderCategorySection("California", californiaArticles, categoryIcons.California, categoryColors.California)}
              
              {/* Sports */}
              {renderCategorySection("Sports", sportsArticles, categoryIcons.Sports, categoryColors.Sports)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
