"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { Search, ArrowRight, User, Filter, X, TrendingUp, Eye, Brain, Globe, Clock, Target } from "lucide-react";
import { SearchService, SearchResult } from "@/lib/search-service";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPlaygroundSearch?: boolean;
}

const typeColors = {
  article: "bg-tory-500",
  video: "bg-today-500",
  research: "bg-science-500",
  legal: "bg-law-500",
};

const typeLabels = {
  article: "Article",
  video: "Video",
  research: "Research",
  legal: "Legal",
};

const dateRangeOptions = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

const popularityOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "most-liked", label: "Most Liked" },
  { value: "most-viewed", label: "Most Viewed" },
];

const contentTypeOptions = [
  { value: "all", label: "All Content" },
  { value: "article", label: "Articles" },
  { value: "video", label: "Videos" },
  { value: "research", label: "Research" },
  { value: "legal", label: "Legal" },
];

// Playground items for search
const playgroundItems = [
  // Tests
  {
    id: "villain-test",
    title: "Villain Test",
    description: "Compare yourself with 20 historical figures using Big Five personality theory",
    type: "test",
    category: "Personality Tests",
    difficulty: "Medium",
    time: "10-15 min",
    questions: 45,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/villain-test"
  },
  {
    id: "dark-triad",
    title: "Dark Triad Test",
    description: "Measure narcissism, Machiavellianism, and psychopathy traits",
    type: "test",
    category: "Personality Tests",
    difficulty: "Medium",
    time: "8-12 min",
    questions: 30,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/dark-triad"
  },
  {
    id: "political-coordinates",
    title: "Political Coordinates Test",
    description: "Find your position on the political spectrum with this unbiased test",
    type: "test",
    category: "Political Tests",
    difficulty: "Easy",
    time: "5-10 min",
    questions: 20,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/political-coordinates"
  },
  {
    id: "left-right",
    title: "Left vs Right Test",
    description: "Based on scientific research linking genetics to political orientation",
    type: "test",
    category: "Political Tests",
    difficulty: "Easy",
    time: "3-5 min",
    questions: 15,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/left-right"
  },
  {
    id: "iq-test",
    title: "IQ Assessment",
    description: "Comprehensive intelligence quotient measurement",
    type: "test",
    category: "Cognitive Tests",
    difficulty: "Hard",
    time: "15-20 min",
    questions: 25,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/iq-test"
  },
  {
    id: "memory-test",
    title: "Memory Test",
    description: "Evaluate your short-term and working memory",
    type: "test",
    category: "Cognitive Tests",
    difficulty: "Medium",
    time: "10-15 min",
    questions: 20,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/memory-test"
  },
  {
    id: "empathy-test",
    title: "Empathy Test",
    description: "Measure your emotional intelligence and empathy levels",
    type: "test",
    category: "Social Tests",
    difficulty: "Easy",
    time: "5-8 min",
    questions: 18,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/empathy-test"
  },
  {
    id: "leadership-test",
    title: "Leadership Style",
    description: "Discover your natural leadership approach",
    type: "test",
    category: "Social Tests",
    difficulty: "Medium",
    time: "8-12 min",
    questions: 25,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/leadership-test"
  },
  {
    id: "phone-germs",
    title: "Phone Germs Test",
    description: "Find out how many germs are living on your phone!",
    type: "test",
    category: "Lifestyle Tests",
    difficulty: "Easy",
    time: "3-5 min",
    questions: 15,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/phone-germs"
  },
  {
    id: "money-personality",
    title: "Money Personality Test",
    description: "Discover your financial habits and get personalized money advice!",
    type: "test",
    category: "Lifestyle Tests",
    difficulty: "Easy",
    time: "5-8 min",
    questions: 12,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/money-personality"
  },
  {
    id: "organization-test",
    title: "Organization Test",
    description: "How organized are you? Find out and get personalized tips!",
    type: "test",
    category: "Lifestyle Tests",
    difficulty: "Easy",
    time: "5-8 min",
    questions: 12,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/organization-test"
  },
  {
    id: "learning-style",
    title: "Learning Style Test",
    description: "Discover how you learn best and get personalized study tips!",
    type: "test",
    category: "Lifestyle Tests",
    difficulty: "Easy",
    time: "5-8 min",
    questions: 12,
    icon: <Brain className="h-5 w-5" />,
    url: "/playground/learning-style"
  },
  // Geography Games
  {
    id: "country-explorer",
    title: "Country Explorer",
    description: "Learn about countries, capitals, and flags through interactive exploration",
    type: "game",
    category: "Geography Games",
    difficulty: "Easy",
    time: "5-10 min",
    icon: <Globe className="h-5 w-5" />,
    url: "/playground/geography"
  },
  {
    id: "country-guesser",
    title: "Country Guesser",
    description: "Guess countries based on hints and clues - like Globle!",
    type: "game",
    category: "Geography Games",
    difficulty: "Medium",
    time: "5-15 min",
    icon: <Globe className="h-5 w-5" />,
    url: "/playground/geography"
  },
  {
    id: "capital-finder",
    title: "Capital Finder",
    description: "Test your knowledge of world capitals",
    type: "game",
    category: "Geography Games",
    difficulty: "Medium",
    time: "5-10 min",
    icon: <Globe className="h-5 w-5" />,
    url: "/playground/geography"
  },
  {
    id: "flag-master",
    title: "Flag Master",
    description: "Identify countries by their flags",
    type: "game",
    category: "Geography Games",
    difficulty: "Easy",
    time: "3-8 min",
    icon: <Globe className="h-5 w-5" />,
    url: "/playground/geography"
  },
  {
    id: "continent-quiz",
    title: "Continent Quiz",
    description: "Test your knowledge of world continents and regions",
    type: "game",
    category: "Geography Games",
    difficulty: "Easy",
    time: "3-5 min",
    icon: <Globe className="h-5 w-5" />,
    url: "/playground/geography"
  },
  {
    id: "geography-trivia",
    title: "Geography Trivia",
    description: "Fun geography facts and trivia questions",
    type: "game",
    category: "Geography Games",
    difficulty: "Medium",
    time: "5-10 min",
    icon: <Globe className="h-5 w-5" />,
    url: "/playground/geography"
  }
];

export function SearchModal({ isOpen, onClose, isPlaygroundSearch = false }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: "all",
    category: "",
    author: "",
    tags: [] as string[],
    popularity: "recent",
    contentType: "all",
  });
  const router = useRouter();

  // Search function using enhanced faceted search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      if (isPlaygroundSearch) {
        // Search playground items
        const filteredResults = playgroundItems.filter(item => {
          const matchesQuery = 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
          
          return matchesQuery;
        });

        setResults(filteredResults as any);
        setSelectedIndex(0);
      } else {
        // Search regular content
        const searchResults = await SearchService.searchAll(searchQuery, 20);
        
        // Apply basic filters
        let filteredResults = searchResults;
        
        if (filters.contentType && filters.contentType !== "all") {
          filteredResults = filteredResults.filter(result => result.type === filters.contentType);
        }
        
        if (filters.category) {
          filteredResults = filteredResults.filter(result => 
            result.category.toLowerCase().includes(filters.category.toLowerCase())
          );
        }
        
        if (filters.author) {
          filteredResults = filteredResults.filter(result => 
            result.authorName.toLowerCase().includes(filters.author.toLowerCase())
          );
        }

        setResults(filteredResults);
        setSelectedIndex(0);
      }

      // Track search query (simplified)
      console.log('Search tracked:', { searchQuery, resultsCount: results.length, filters, isPlaygroundSearch });
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters, isPlaygroundSearch]);

  // Get search suggestions
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      // Simple suggestions for now
      const suggestions = [
        'campus news',
        'sports',
        'student government',
        'san diego',
        'california',
        'national'
      ].filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      
      setSuggestions(suggestions);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // Debounced suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getSuggestions(query);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, getSuggestions]);

  // Keyboard navigation - disabled on mobile to prevent conflicts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Check if it's a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) return; // Disable keyboard navigation on mobile

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (showSuggestions && suggestions.length > 0) {
            setSelectedIndex((prev) =>
              prev < suggestions.length - 1 ? prev + 1 : prev
            );
          } else {
            setSelectedIndex((prev) =>
              prev < results.length - 1 ? prev + 1 : prev
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (showSuggestions && suggestions[selectedIndex]) {
            setQuery(suggestions[selectedIndex]);
            setShowSuggestions(false);
          } else if (results[selectedIndex]) {
            const result = results[selectedIndex];
            let url = "";
            
            if (isPlaygroundSearch && 'url' in result) {
              url = (result as any).url;
            } else {
              switch (result.type) {
                case "article":
                  url = `/triton-tory/${result.id}`;
                  break;
                case "video":
                  url = `/triton-today/${result.id}`;
                  break;
                case "research":
                  url = `/triton-science/${result.id}`;
                  break;
                case "legal":
                  url = `/triton-law/${result.id}`;
                  break;
              }
            }
            
            router.push(url);
            onClose();
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, suggestions, selectedIndex, showSuggestions, router, onClose]);



  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setShowSuggestions(false);
      setShowFilters(false);
    }
  }, [isOpen]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      dateRange: "all",
      category: "",
      author: "",
      tags: [],
      popularity: "recent",
      contentType: "all",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.dateRange !== "all" ||
      filters.category !== "" ||
      filters.author !== "" ||
      filters.tags.length > 0 ||
      filters.popularity !== "recent" ||
      filters.contentType !== "all"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[90vh] p-0 bg-gray-900 border-gray-800 mobile-gpu-accelerated flex flex-col">
        <DialogHeader className="p-4 md:p-6 pb-0 flex-shrink-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
        </DialogHeader>

        <div className="relative flex-shrink-0">
          <Search className="absolute left-4 md:left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={isPlaygroundSearch ? "Search tests and geography games..." : "Search articles, videos, research, and legal analysis..."}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(!isPlaygroundSearch);
            }}
            onFocus={() => setShowSuggestions(!isPlaygroundSearch)}
            className="border-0 border-b border-gray-700 rounded-none bg-transparent px-12 md:px-12 py-4 md:py-6 text-base md:text-lg focus-visible:ring-0 focus-visible:ring-offset-0 mobile-accessible-text mobile-search-input"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-10 w-10 p-0 mobile-touch-target",
                showFilters && "bg-gray-800"
              )}
            >
              <Filter className="h-4 w-4" />
            </Button>
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-primary"></div>
            )}
          </div>
        </div>

        {/* Filters Panel - Mobile Optimized */}
        {showFilters && (
          <div className="border-b border-gray-700 p-4 md:p-6 bg-gray-800/50 flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Date Range</label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 mobile-touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {dateRangeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content Type */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Content Type</label>
                <Select
                  value={filters.contentType}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, contentType: value }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 mobile-touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {contentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Popularity */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Sort By</label>
                <Select
                  value={filters.popularity}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, popularity: value }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 mobile-touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {popularityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
                <Input
                  placeholder="Enter category..."
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="bg-gray-700 border-gray-600 mobile-accessible-text"
                />
              </div>

              {/* Author */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Author</label>
                <Input
                  placeholder="Enter author name..."
                  value={filters.author}
                  onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                  className="bg-gray-700 border-gray-600 mobile-accessible-text"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Tags</label>
                <Input
                  placeholder="Enter tags (comma separated)..."
                  value={filters.tags.join(", ")}
                  onChange={(e) => {
                    const tags = e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag);
                    setFilters(prev => ({ ...prev, tags }));
                  }}
                  className="bg-gray-700 border-gray-600 mobile-accessible-text"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters() && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-400 border-gray-600 hover:bg-gray-700 mobile-touch-target"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && query && (
          <div className="border-b border-gray-700 flex-shrink-0">
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded-md text-sm hover:bg-gray-800 transition-colors mobile-touch-target mobile-search-item",
                    index === selectedIndex && "bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto mobile-smooth-scroll mobile-search-results">
          {query && !loading && results.length === 0 && (
            <div className="p-4 md:p-6 text-center text-gray-400">
              <Search className="h-8 md:h-12 w-8 md:w-12 mx-auto mb-2 md:mb-4 text-gray-600" />
              <p className="text-sm md:text-base">No results found for &ldquo;{query}&rdquo;</p>
              {hasActiveFilters() && (
                <p className="text-xs text-gray-500 mt-2">Try adjusting your filters</p>
              )}
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              {results.map((result, index) => {
                if (isPlaygroundSearch) {
                  // Render playground items
                  const playgroundResult = result as any;
                  return (
                    <button
                      key={playgroundResult.id}
                      onClick={() => {
                        router.push(playgroundResult.url);
                        onClose();
                      }}
                      className={cn(
                        "w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors mobile-touch-target mobile-search-item",
                        index === selectedIndex && "bg-gray-800"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {playgroundResult.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={playgroundResult.type === "test" ? "bg-purple-500" : "bg-green-500"}>
                              {playgroundResult.type === "test" ? "Test" : "Game"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {playgroundResult.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {playgroundResult.difficulty}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-white mb-1 line-clamp-1">
                            {playgroundResult.title}
                          </h4>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                            {playgroundResult.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{playgroundResult.time}</span>
                            </div>
                            {playgroundResult.questions && (
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                <span>{playgroundResult.questions} questions</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-2" />
                      </div>
                    </button>
                  );
                } else {
                  // Render regular content
                  let url = "";
                  switch (result.type) {
                    case "article":
                      url = `/triton-tory/${result.id}`;
                      break;
                    case "video":
                      url = `/triton-today/${result.id}`;
                      break;
                    case "research":
                      url = `/triton-science/${result.id}`;
                      break;
                    case "legal":
                      url = `/triton-law/${result.id}`;
                      break;
                  }

                  return (
                    <button
                      key={result.id}
                      onClick={() => {
                        router.push(url);
                        onClose();
                      }}
                      className={cn(
                        "w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors mobile-touch-target mobile-search-item",
                        index === selectedIndex && "bg-gray-800"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", typeColors[result.type])} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn("text-xs", typeColors[result.type])}>
                              {typeLabels[result.type]}
                            </Badge>
                            <span className="text-xs text-gray-400">{formatDate(result.publishedAt)}</span>
                          </div>
                          <h4 className="font-medium text-white mb-1 line-clamp-1">
                            {result.title}
                          </h4>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                            {result.excerpt || result.description || result.abstract}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{result.authorName}</span>
                            </div>
                            {result.views && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{result.views}</span>
                              </div>
                            )}
                            {result.likes > 0 && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>{result.likes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-2" />
                      </div>
                    </button>
                  );
                }
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-3 md:p-4 text-xs text-gray-400 flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
            {/* Hide keyboard shortcuts on mobile */}
            <div className="hidden md:flex flex-wrap items-center gap-2 md:gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded">↓</kbd>
                <span className="hidden sm:inline">to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded">↵</kbd>
                <span className="hidden sm:inline">to select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded">esc</kbd>
                <span className="hidden sm:inline">to close</span>
              </span>
            </div>
            {results.length > 0 && (
              <div className="text-xs text-gray-500">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
