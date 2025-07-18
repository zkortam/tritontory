import { ResearchService } from "@/lib/firebase-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function TritonSciencePage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; type?: string }>;
}) {
  const params = await searchParams;
  const departmentFilter = params.department;
  const typeFilter = params.type;
  
  // Fetch research articles from Firebase
  const featuredResearch = await ResearchService.getResearchArticles(undefined, true, 4);
  const allResearch = await ResearchService.getResearchArticles(departmentFilter, false, 12);

  // Filter by type if specified (using department as a proxy for type)
  const filteredResearch = typeFilter 
    ? allResearch.filter(research => research.department.toLowerCase().includes(typeFilter))
    : allResearch;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get unique departments for filter
  const departments = Array.from(new Set(allResearch.map(research => research.department)));

  return (
    <div className="container px-4 md:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
          Science Journal
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Highlighting groundbreaking research and scientific discoveries happening across UC San Diego
        </p>
      </div>

      {/* Department Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Link href="/triton-science">
          <Button 
            variant={!departmentFilter ? "default" : "outline"}
            size="sm"
          >
            All Departments
          </Button>
        </Link>
        {departments.slice(0, 8).map((department) => (
          <Link key={department} href={`/triton-science?department=${encodeURIComponent(department)}`}>
            <Button 
              variant={departmentFilter === department ? "default" : "outline"}
              size="sm"
            >
              {department}
            </Button>
          </Link>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Link href={departmentFilter ? `/triton-science?department=${encodeURIComponent(departmentFilter)}` : "/triton-science"}>
          <Button 
            variant={!typeFilter ? "default" : "outline"}
            size="sm"
          >
            All Research
          </Button>
        </Link>
        <Link href={`/triton-science?type=faculty${departmentFilter ? `&department=${encodeURIComponent(departmentFilter)}` : ''}`}>
          <Button 
            variant={typeFilter === "faculty" ? "default" : "outline"}
            size="sm"
          >
            Faculty Research
          </Button>
        </Link>
        <Link href={`/triton-science?type=student${departmentFilter ? `&department=${encodeURIComponent(departmentFilter)}` : ''}`}>
          <Button 
            variant={typeFilter === "student" ? "default" : "outline"}
            size="sm"
          >
            Student Research
          </Button>
        </Link>
      </div>

      {/* Featured Research */}
      {featuredResearch.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Research</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredResearch.map((research) => (
              <Card key={research.id} className="bg-black/40 border-gray-800 hover:border-science-500/50 transition-colors">
                <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                  <Image
                    src={research.coverImage || `https://picsum.photos/800/450?random=${research.id}`}
                    alt={research.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-science-500 text-white">
                      Research
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="bg-black/80 text-white">
                      {research.department}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg line-clamp-2">{research.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{research.abstract}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{research.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(research.publishedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Research */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          {departmentFilter ? `${departmentFilter} Research` : 'All Research'}
          {typeFilter && ` - ${typeFilter === 'faculty' ? 'Faculty' : 'Student'}`}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResearch.map((research) => (
            <Card key={research.id} className="bg-black/40 border-gray-800 hover:border-science-500/50 transition-colors">
              <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                <Image
                  src={research.coverImage || `https://picsum.photos/800/450?random=${research.id}`}
                  alt={research.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-science-500 text-white">
                    Research
                  </Badge>
                </div>
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="bg-black/80 text-white">
                    {research.department}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg line-clamp-2">{research.title}</CardTitle>
                <CardDescription className="line-clamp-3">{research.abstract}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{research.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(research.publishedAt)}</span>
                  </div>
                </div>
                {research.tags && research.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {research.tags.slice(0, 3).map((tag: string, index: number) => (
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
        
        {filteredResearch.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No research articles found in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
} 