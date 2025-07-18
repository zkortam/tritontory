import { LegalService } from "@/lib/firebase-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function TritonLawPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categoryFilter = params.category;
  
  // Fetch legal articles from Firebase
  const featuredLegal = await LegalService.getLegalArticles(undefined, true, 4);
  const allLegal = await LegalService.getLegalArticles(categoryFilter, false, 12);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(allLegal.map(legal => legal.category)));

  return (
    <div className="container px-4 md:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
          Law Review
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Student-led legal analysis on campus policies, broader legal developments, and their implications for the university community
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Link href="/triton-law">
          <Button 
            variant={!categoryFilter ? "default" : "outline"}
            size="sm"
          >
            All Categories
          </Button>
        </Link>
        {categories.slice(0, 8).map((category) => (
          <Link key={category} href={`/triton-law?category=${encodeURIComponent(category)}`}>
            <Button 
              variant={categoryFilter === category ? "default" : "outline"}
              size="sm"
            >
              {category}
            </Button>
          </Link>
        ))}
      </div>

      {/* Featured Legal Articles */}
      {featuredLegal.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredLegal.map((legal) => (
              <Card key={legal.id} className="bg-black/40 border-gray-800 hover:border-law-500/50 transition-colors">
                <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                  <Image
                    src={legal.coverImage}
                    alt={legal.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-law-500 text-white">
                      {legal.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="bg-black/80 text-white">
                      Legal Analysis
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg line-clamp-2">{legal.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{legal.abstract}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{legal.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(legal.publishedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Legal Articles */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          {categoryFilter ? `${categoryFilter} Analysis` : 'All Legal Analysis'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allLegal.map((legal) => (
            <Card key={legal.id} className="bg-black/40 border-gray-800 hover:border-law-500/50 transition-colors">
              <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                <Image
                                          src={legal.coverImage || `https://picsum.photos/800/450?random=${legal.id}`}
                  alt={legal.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-law-500 text-white">
                    {legal.category}
                  </Badge>
                </div>
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="bg-black/80 text-white">
                    Legal Analysis
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg line-clamp-2">{legal.title}</CardTitle>
                <CardDescription className="line-clamp-3">{legal.abstract}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{legal.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(legal.publishedAt)}</span>
                  </div>
                </div>
                {legal.tags && legal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {legal.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {allLegal.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No legal articles found in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
} 