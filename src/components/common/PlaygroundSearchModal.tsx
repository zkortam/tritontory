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
import { Search, ArrowRight, Brain, Globe, Filter, X, Clock, Target } from "lucide-react";

interface PlaygroundSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlaygroundItem {
  id: string;
  title: string;
  description: string;
  type: 'test' | 'game';
  category: string;
  difficulty: string;
  time: string;
  questions?: number;
  icon: React.ReactNode;
  url: string;
}

const playgroundItems: PlaygroundItem[] = [
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

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "Personality Tests", label: "Personality Tests" },
  { value: "Political Tests", label: "Political Tests" },
  { value: "Cognitive Tests", label: "Cognitive Tests" },
  { value: "Social Tests", label: "Social Tests" },
  { value: "Lifestyle Tests", label: "Lifestyle Tests" },
  { value: "Geography Games", label: "Geography Games" },
];

const difficultyOptions = [
  { value: "all", label: "All Difficulties" },
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "test", label: "Tests" },
  { value: "game", label: "Games" },
];

export function PlaygroundSearchModal({ isOpen, onClose }: PlaygroundSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaygroundItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    difficulty: "all",
    type: "all",
  });
  const router = useRouter();

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      // Filter playground items based on query and filters
      const filteredResults = playgroundItems.filter(item => {
        const matchesQuery = 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = filters.category === "all" || item.category === filters.category;
        const matchesDifficulty = filters.difficulty === "all" || item.difficulty === filters.difficulty;
        const matchesType = filters.type === "all" || item.type === filters.type;
        
        return matchesQuery && matchesCategory && matchesDifficulty && matchesType;
      });

      setResults(filteredResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            const result = results[selectedIndex];
            router.push(result.url);
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
  }, [isOpen, results, selectedIndex, router, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setShowFilters(false);
    }
  }, [isOpen]);

  const clearFilters = () => {
    setFilters({
      category: "all",
      difficulty: "all",
      type: "all",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.category !== "all" ||
      filters.difficulty !== "all" ||
      filters.type !== "all"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[90vh] p-0 bg-gray-900 border-gray-800 mobile-gpu-accelerated flex flex-col">
        <DialogHeader className="p-4 md:p-6 pb-0 flex-shrink-0">
          <DialogTitle className="sr-only">Playground Search</DialogTitle>
        </DialogHeader>

        <div className="relative flex-shrink-0">
          <Search className="absolute left-4 md:left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search tests and geography games..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-b border-gray-700 p-4 md:p-6 bg-gray-800/50 flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 mobile-touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Difficulty</label>
                <Select
                  value={filters.difficulty}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 mobile-touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {difficultyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 mobile-touch-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto mobile-smooth-scroll mobile-search-results">
          {query && !loading && results.length === 0 && (
            <div className="p-4 md:p-6 text-center text-gray-400">
              <Search className="h-8 md:h-12 w-8 md:w-12 mx-auto mb-2 md:mb-4 text-gray-600" />
              <p className="text-sm md:text-base">No playground items found for &ldquo;{query}&rdquo;</p>
              {hasActiveFilters() && (
                <p className="text-xs text-gray-500 mt-2">Try adjusting your filters</p>
              )}
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => {
                    router.push(result.url);
                    onClose();
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors mobile-touch-target mobile-search-item",
                    index === selectedIndex && "bg-gray-800"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={result.type === "test" ? "bg-purple-500" : "bg-green-500"}>
                          {result.type === "test" ? "Test" : "Game"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.difficulty}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-white mb-1 line-clamp-1">
                        {result.title}
                      </h4>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {result.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{result.time}</span>
                        </div>
                        {result.questions && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>{result.questions} questions</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-2" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-3 md:p-4 text-xs text-gray-400 flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
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