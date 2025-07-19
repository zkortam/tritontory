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
import { cn } from "@/lib/utils";
import { Search, ArrowRight, Hash, Calendar, User } from "lucide-react";
import { SearchService, SearchResult } from "@/lib/search-service";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Search function using real Firebase data
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const searchResults = await SearchService.searchAll(searchQuery, 20);
      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [isOpen, results, selectedIndex, router, onClose]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // Open search modal
          setQuery("");
          setResults([]);
          setSelectedIndex(0);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] p-0 bg-gray-900 border-gray-800 mobile-gpu-accelerated">
        <DialogHeader className="p-4 md:p-6 pb-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-4 md:left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search articles, videos, research, and legal analysis..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 border-b border-gray-700 rounded-none bg-transparent px-12 md:px-12 py-4 md:py-6 text-base md:text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          {loading && (
            <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-primary"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="max-h-[50vh] md:max-h-[400px] overflow-y-auto mobile-smooth-scroll">
          {query && !loading && results.length === 0 && (
            <div className="p-4 md:p-6 text-center text-gray-400">
              <Search className="h-8 md:h-12 w-8 md:w-12 mx-auto mb-2 md:mb-4 text-gray-600" />
              <p className="text-sm md:text-base">No results found for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              {results.map((result, index) => {
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
                      "w-full text-left p-3 md:p-4 rounded-lg transition-colors",
                      index === selectedIndex
                        ? "bg-gray-800"
                        : "hover:bg-gray-800/50"
                    )}
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 md:gap-2 mb-1">
                          <Badge
                            className={cn(
                              "text-white text-xs",
                              typeColors[result.type]
                            )}
                          >
                            {typeLabels[result.type]}
                          </Badge>
                          {result.category && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {result.category}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium line-clamp-1 mb-1 text-sm md:text-base">
                          {result.title}
                        </h3>
                        {(result.excerpt || result.description || result.abstract) && (
                          <p className="text-xs md:text-sm text-gray-400 line-clamp-2 mb-2">
                            {result.excerpt || result.description || result.abstract}
                          </p>
                        )}
                        <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-500">
                          {result.authorName && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {result.authorName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(result.publishedAt)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-3 md:p-4 text-xs text-gray-400">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
