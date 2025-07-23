"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ResearchService } from "@/lib/firebase-service";
import type { Research } from "@/lib/models";
import { AnalyticsService } from "@/lib/analytics-service";
import { 
  Microscope, 
  FlaskConical, 
  Dna, 
  Atom, 
  Brain, 
  Leaf, 
  Zap, 
  Database,
  Users,
  Calendar,
  TrendingUp,
  BookOpen,
  FileText,
  Search,
  ArrowRight,
  Building,
  GraduationCap,
  Target,
  Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { calculateReadingTime } from "@/lib/utils";

export default function TritonSciencePage() {
  const [research, setResearch] = useState<Research[]>([]);
  const [featuredResearch, setFeaturedResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [clickData, setClickData] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch featured research (top 3 most recent)
        const featured = await ResearchService.getResearchArticles(undefined, true, 3);
        setFeaturedResearch(featured);

        // Fetch all research for filtering
        const allResearch = await ResearchService.getResearchArticles(undefined, false, 50);
        setResearch(allResearch);

        // Fetch click data for all research articles
        const clickDataMap: Record<string, number> = {};
        for (const article of allResearch) {
          try {
            console.log(`Fetching analytics for research article: ${article.id}`);
            const analytics = await AnalyticsService.getContentAnalytics(article.id);
            console.log(`Analytics for ${article.id}:`, analytics);
            clickDataMap[article.id] = analytics?.clicks || 0;
          } catch (error) {
            console.error(`Error fetching analytics for research article ${article.id}:`, error);
            clickDataMap[article.id] = 0;
          }
        }
        console.log('Final click data map:', clickDataMap);
        setClickData(clickDataMap);

      } catch (error) {
        console.error("Error fetching research data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter research based on selections
  const filteredResearch = research.filter(item => {
    const matchesDepartment = !selectedDepartment || item.department === selectedDepartment;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDepartment && matchesSearch;
  });

  // Department configurations
  const departments = [
    { name: "Biology", icon: <Dna className="h-5 w-5" />, color: "bg-green-500", count: research.filter(r => r.department === "Biology").length },
    { name: "Chemistry", icon: <FlaskConical className="h-5 w-5" />, color: "bg-blue-500", count: research.filter(r => r.department === "Chemistry").length },
    { name: "Physics", icon: <Atom className="h-5 w-5" />, color: "bg-purple-500", count: research.filter(r => r.department === "Physics").length },
    { name: "Neuroscience", icon: <Brain className="h-5 w-5" />, color: "bg-pink-500", count: research.filter(r => r.department === "Neuroscience").length },
    { name: "Environment", icon: <Leaf className="h-5 w-5" />, color: "bg-emerald-500", count: research.filter(r => r.department === "Environmental Science").length },
    { name: "Computer Science", icon: <Database className="h-5 w-5" />, color: "bg-orange-500", count: research.filter(r => r.department === "Computer Science").length },
    { name: "Engineering", icon: <Zap className="h-5 w-5" />, color: "bg-red-500", count: research.filter(r => r.department === "Engineering").length },
  ];



  const renderFeaturedResearchCard = (research: Research) => (
    <Card key={research.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 hover:border-science-500/50 transition-all duration-300 overflow-hidden group">
      <Link href={`/triton-science/${research.id}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={research.coverImage || `https://picsum.photos/800/450?random=${research.id}`}
                    alt={research.title}
                    fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Department Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-science-500/90 text-white text-xs font-medium">
              {research.department}
            </Badge>
          </div>

          {/* Research Type Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-black/80 text-white text-xs">
                      Research
                    </Badge>
                  </div>

          {/* Content */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-bold text-white group-hover:text-science-400 transition-colors line-clamp-2 text-xl">
              {research.title}
            </h3>
            {research.abstract && (
              <p className="text-gray-300 mt-2 line-clamp-2 text-sm opacity-90">
                {research.abstract}
              </p>
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">{research.authorName}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(research.publishedAt, { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{calculateReadingTime(research.content || "")} min read</span>
              </div>
            </div>
          </div>
          
          {/* Research Metrics */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Eye className="h-3 w-3" />
              <span>{clickData[research.id] || 0} clicks</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  const renderResearchCard = (research: Research) => (
    <div key={research.id} className="group border-b border-gray-800/50 last:border-b-0 py-6 hover:bg-gray-900/30 transition-colors duration-200 rounded-lg px-2 -mx-2">
      <div className="flex gap-4">
        <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={research.coverImage || `https://picsum.photos/80/64?random=${research.id}`}
            alt={research.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-science-500 text-white text-xs font-medium">
                      {research.department}
                    </Badge>
            <Badge variant="outline" className="text-xs">
              Research
            </Badge>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{formatDistanceToNow(research.publishedAt, { addSuffix: true })}</span>
                  </div>
          <Link href={`/triton-science/${research.id}`} className="group">
            <h4 className="font-semibold text-white group-hover:text-science-400 transition-colors line-clamp-2 text-sm leading-tight mb-2">
              {research.title}
            </h4>
          </Link>
          <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
                      <span>{research.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{calculateReadingTime(research.content || "")} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{clickData[research.id] || 0} clicks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDepartmentSection = (title: string, research: Research[], icon: React.ReactNode, color: string) => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
            <div className={`${color.replace('bg-', 'text-')}`}>
              {icon}
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <Badge variant="outline" className="text-xs">{research.length} studies</Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {research.length > 0 ? (
        <div className="space-y-0">
          {research.slice(0, 3).map((item) => renderResearchCard(item))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Microscope className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">No research in this department yet.</p>
        </div>
      )}
    </section>
  );

  // Research Stats Widget
  const renderResearchStatsWidget = () => (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 sticky top-20 max-h-[400px] self-end mobile-gpu-accelerated">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-science-500/20">
            <TrendingUp className="h-6 w-6 text-science-500" />
          </div>
          <h3 className="text-lg font-semibold text-white">Research Stats</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">Total Studies</span>
            </div>
            <span className="text-lg font-bold text-white">{research.length}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Departments</span>
            </div>
            <span className="text-lg font-bold text-white">{new Set(research.map(r => r.department)).size}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">Researchers</span>
            </div>
            <span className="text-lg font-bold text-white">{new Set(research.map(r => r.authorName)).size}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-gray-300">This Month</span>
            </div>
            <span className="text-lg font-bold text-white">
              {research.filter(r => {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return r.publishedAt > monthAgo;
              }).length}
            </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              <Search className="h-6 w-6 text-science-500" />
              <h2 className="text-2xl font-bold">Search Results</h2>
              <Badge variant="outline" className="ml-2">
                {filteredResearch.length} results
                  </Badge>
            </div>
            
            {filteredResearch.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-600 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-3">No research found</h3>
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
                {filteredResearch.map((item) => renderFeaturedResearchCard(item))}
              </div>
            )}
          </section>
        ) : (
          // Main Layout
          <div className="space-y-12">


            {/* Featured Research with Stats Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Featured Research - 3/4 width */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-science-500/20">
                    <TrendingUp className="h-6 w-6 text-science-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Featured Research</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featuredResearch.slice(0, 2).map((item) => 
                    renderFeaturedResearchCard(item)
                  )}
                </div>
              </div>

              {/* Research Stats Widget - 1/4 width */}
              <div className="lg:col-span-1 flex flex-col">
                <div className="mt-auto">
                  {renderResearchStatsWidget()}
                </div>
                  </div>
        </div>
        
            {/* Department Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {departments.map((dept) => {
                const deptResearch = research.filter(r => r.department === dept.name);
                return renderDepartmentSection(
                  dept.name, 
                  deptResearch, 
                  dept.icon, 
                  dept.color
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 