"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LegalService } from "@/lib/firebase-service";
import type { LegalArticle } from "@/lib/models";
import { AnalyticsService } from "@/lib/analytics-service";
import { 
  Scale,
  Gavel, 
  BookOpen, 
  Eye,
  Users,
  Calendar,
  TrendingUp,
  Search,
  ArrowRight,
  Building,
  Shield,
  Heart,
  AlertTriangle,
  Briefcase
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { calculateReadingTime } from "@/lib/utils";

export default function TritonLawPage() {
  const [legalArticles, setLegalArticles] = useState<LegalArticle[]>([]);
  const [featuredLegal, setFeaturedLegal] = useState<LegalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [clickData, setClickData] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch featured legal articles (top 3 most recent)
        const featured = await LegalService.getLegalArticles(undefined, true, 3);
        setFeaturedLegal(featured);

        // Fetch all legal articles for filtering
        const allLegal = await LegalService.getLegalArticles(undefined, false, 50);
        setLegalArticles(allLegal);

        // Fetch click data for all legal articles
        const clickDataMap: Record<string, number> = {};
        for (const article of allLegal) {
          try {
            const analytics = await AnalyticsService.getContentAnalytics(article.id);
            clickDataMap[article.id] = analytics?.clicks || 0;
          } catch (error) {
            console.error(`Error fetching analytics for legal article ${article.id}:`, error);
            clickDataMap[article.id] = 0;
          }
        }
        setClickData(clickDataMap);

      } catch (error) {
        console.error("Error fetching legal data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter legal articles based on selections
  const filteredLegal = legalArticles.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Legal category configurations
  const legalCategories = [
    { name: "Campus Policy", icon: <Building className="h-5 w-5 text-white" />, color: "bg-crimson-500", count: legalArticles.filter(l => l.category === "Campus Policy").length },
    { name: "Student Rights", icon: <Shield className="h-5 w-5 text-white" />, color: "bg-crimson-500", count: legalArticles.filter(l => l.category === "Student Rights").length },
    { name: "Supreme Court", icon: <Gavel className="h-5 w-5 text-white" />, color: "bg-crimson-500", count: legalArticles.filter(l => l.category === "Supreme Court").length },
    { name: "Constitutional Law", icon: <BookOpen className="h-5 w-5 text-white" />, color: "bg-crimson-500", count: legalArticles.filter(l => l.category === "Constitutional Law").length },
    { name: "Admin Law", icon: <Briefcase className="h-5 w-5 text-white" />, color: "bg-crimson-500", count: legalArticles.filter(l => l.category === "Administrative Law").length },
    { name: "Civil Rights", icon: <Heart className="h-5 w-5 text-white" />, color: "bg-crimson-500", count: legalArticles.filter(l => l.category === "Civil Rights").length },
    { name: "Criminal Law", icon: <AlertTriangle className="h-5 w-5 text-white" />, color: "bg-crimson-500", count: legalArticles.filter(l => l.category === "Criminal Law").length },
  ];



  const renderFeaturedLegalCard = (legal: LegalArticle) => (
    <Card key={legal.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 hover:border-crimson-500/50 transition-all duration-300 overflow-hidden group">
      <Link href={`/triton-law/${legal.id}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
            src={legal.coverImage || `https://picsum.photos/800/450?random=${legal.id}`}
                    alt={legal.title}
                    fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-crimson-500/90 text-white text-xs font-medium">
                      {legal.category}
                    </Badge>
                  </div>

          {/* Legal Analysis Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-black/80 text-white text-xs">
                      Legal Analysis
                    </Badge>
                  </div>

          {/* Content */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-bold text-white group-hover:text-crimson-400 transition-colors line-clamp-2 text-xl">
              {legal.title}
            </h3>
            {legal.abstract && (
              <p className="text-gray-300 mt-2 line-clamp-2 text-sm opacity-90">
                {legal.abstract}
              </p>
            )}
                  </div>
                </div>
        
        <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">{legal.authorName}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(legal.publishedAt, { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{calculateReadingTime(legal.content || legal.abstract || "")} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{clickData[legal.id] || 0} clicks</span>
              </div>
            </div>
          </div>
          

        </CardContent>
      </Link>
    </Card>
  );

  const renderLegalCard = (legal: LegalArticle) => (
    <div key={legal.id} className="group border-b border-gray-800/50 last:border-b-0 py-6 hover:bg-gray-900/30 transition-colors duration-200 rounded-lg px-2 -mx-2">
      <div className="flex gap-4">
        <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={legal.coverImage || `https://picsum.photos/80/64?random=${legal.id}`}
            alt={legal.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-crimson-500 text-white text-xs font-medium">
              {legal.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Analysis
            </Badge>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{formatDistanceToNow(legal.publishedAt, { addSuffix: true })}</span>
          </div>
          <Link href={`/triton-law/${legal.id}`} className="group">
            <h4 className="font-semibold text-white group-hover:text-crimson-400 transition-colors line-clamp-2 text-sm leading-tight mb-2">
              {legal.title}
            </h4>
          </Link>
          <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
                      <span>{legal.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{calculateReadingTime(legal.content || legal.abstract || "")} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{clickData[legal.id] || 0} clicks</span>
            </div>

          </div>
        </div>
                    </div>
                  </div>
  );

  const renderCategorySection = (title: string, legal: LegalArticle[], icon: React.ReactNode) => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-crimson-500">
            {icon}
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <Badge variant="outline" className="text-xs">{legal.length} analyses</Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {legal.length > 0 ? (
        <div className="space-y-0">
          {legal.slice(0, 3).map((item) => renderLegalCard(item))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Scale className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">No legal analyses in this category yet.</p>
        </div>
      )}
    </section>
  );

  

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto mobile-safe-area py-8">

        {loading ? (
          <div className="space-y-12">
            {/* Loading skeleton */}
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
          </div>
        ) : searchQuery ? (
          // Search Results
      <section>
            <div className="flex items-center gap-3 mb-8">
              <Search className="h-6 w-6 text-crimson-500" />
              <h2 className="text-2xl font-bold">Search Results</h2>
              <Badge variant="outline" className="ml-2">
                {filteredLegal.length} results
                  </Badge>
                </div>
            
            {filteredLegal.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-600 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-3">No legal analyses found</h3>
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
                {filteredLegal.map((item) => (
                  <div key={item.id}>
                    {renderFeaturedLegalCard(item)}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          // Main Layout
          <div className="space-y-12">


            {/* Featured Legal */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-crimson-500/20">
                  <TrendingUp className="h-6 w-6 text-crimson-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Featured Analysis</h2>
                  </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredLegal.slice(0, 2).map((item) => (
                  <div key={item.id}>
                    {renderFeaturedLegalCard(item)}
                  </div>
                ))}
              </div>
        </div>
        
            {/* Category Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {legalCategories.map((category) => {
                const categoryLegal = legalArticles.filter(l => l.category === category.name);
                return (
                  <div key={category.name}>
                    {renderCategorySection(
                      category.name, 
                      categoryLegal, 
                      category.icon
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 