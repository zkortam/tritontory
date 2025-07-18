"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleService } from "@/lib/firebase-service";
import { Article } from "@/lib/models";
import { Search, User, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const categories = ["All", "Campus", "Sports", "Student Government", "Academics", "Events", "San Diego", "California", "National"];
const sections = [
  { value: "all", label: "All Sections" },
  { value: "campus", label: "Campus News" },
  { value: "sports", label: "Sports" },
  { value: "student-government", label: "Student Government" },
  { value: "san-diego", label: "San Diego" },
  { value: "california", label: "California" },
  { value: "national", label: "National" },
];

export default function TritonToryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSection, setSelectedSection] = useState("all");

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);

        // Fetch featured articles
        const featured = await ArticleService.getArticles(
          undefined,
          undefined,
          true,
          4
        );
        setFeaturedArticles(featured);

        // Fetch all articles
        const categoryFilter = selectedCategory === "All" ? undefined : selectedCategory;
        const sectionFilter = selectedSection === "all" ? undefined : selectedSection;

        const allArticles = await ArticleService.getArticles(
          categoryFilter,
          sectionFilter,
          false,
          20
        );
        setArticles(allArticles);

      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [selectedCategory, selectedSection]);

  // Filter articles based on search query
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-tory-900 to-tory-700 py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Triton Tory
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Your source for UC San Diego campus news, sports, and student life
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg bg-white/10 border-white/20 text-white placeholder-gray-300"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 py-12 pb-20">
        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="h-6 w-6 text-tory-500" />
              <h2 className="text-3xl font-bold">Featured Stories</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-hidden">
              {featuredArticles.map((article, index) => (
                <Card key={article.id} className={`bg-gray-900 border-gray-800 hover:border-tory-500 transition-all duration-300 overflow-hidden ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                  <Link
                    href={`/triton-tory/${article.id}`}
                    className="group block"
                  >
                    <div className={`relative ${index === 0 ? 'aspect-video' : 'aspect-[4/3]'} overflow-hidden rounded-t-lg`}>
                      <Image
                        src={article.coverImage || `https://picsum.photos/800/450?random=${article.id}`}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-tory-500 text-white mb-2">
                          {article.category}
                        </Badge>
                        <h3 className={`font-bold text-white group-hover:text-tory-400 transition-colors ${index === 0 ? 'text-2xl' : 'text-lg'}`}>
                          {article.title}
                        </h3>
                        {index === 0 && article.excerpt && (
                          <p className="text-gray-300 mt-2 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="h-4 w-4" />
                      <span>{article.authorName}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(article.publishedAt, { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="mb-8">
          <Tabs defaultValue="category" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="category">By Category</TabsTrigger>
              <TabsTrigger value="section">By Section</TabsTrigger>
            </TabsList>

            <TabsContent value="category" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-tory-500 hover:bg-tory-600" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="section" className="mt-4">
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <Button
                    key={section.value}
                    variant={selectedSection === section.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSection(section.value)}
                    className={selectedSection === section.value ? "bg-tory-500 hover:bg-tory-600" : ""}
                  >
                    {section.label}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Articles Grid */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Clock className="h-6 w-6 text-tory-500" />
            <h2 className="text-3xl font-bold">Latest Articles</h2>
            {(selectedCategory !== "All" || selectedSection !== "all" || searchQuery) && (
              <Badge variant="outline" className="ml-2">
                {filteredArticles.length} results
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-gray-900 border-gray-800">
                  <div className="aspect-video bg-gray-800 animate-pulse rounded-t-lg" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-800 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4 mb-4" />
                    <div className="h-3 bg-gray-800 rounded animate-pulse w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? "Try adjusting your search terms" : "No articles match the selected filters"}
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedSection("all");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="bg-gray-900 border-gray-800 hover:border-tory-500 transition-all duration-300 h-full overflow-hidden">
                  <Link
                    href={`/triton-tory/${article.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <Image
                        src={article.coverImage || `https://picsum.photos/800/450?random=${article.id}`}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-tory-500 text-white">
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-4 flex flex-col h-full">
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-tory-500 transition-colors mb-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-auto">
                      <User className="h-4 w-4" />
                      <span>{article.authorName}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(article.publishedAt, { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {filteredArticles.length > 0 && filteredArticles.length >= 20 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Articles
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
