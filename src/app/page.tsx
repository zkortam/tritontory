import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedHeroBackground } from "@/components/ui/animated-hero-background";
import { ArticleService, VideoService, ResearchService, LegalService } from "@/lib/firebase-service";
import { Article, Video, Research, LegalArticle } from "@/lib/models";
import { Badge } from "@/components/ui/badge";

// Founders information
const founders = [
  {
    name: "Zakaria Kortam",
    title: "Co-Founder",
    bio: "3rd year Electrical Engineering major with a passion for campus journalism and technology.",
    image: "https://picsum.photos/300/300?random=1"
  },
  {
    name: "Dylan Archer",
    title: "Co-Founder",
    bio: "3rd year Political Science and History double major focused on bringing informed journalism to UC San Diego.",
    image: "https://picsum.photos/300/300?random=2"
  }
];

// Media sections explained
const mediaSections = [
  {
    title: "Triton Tory News",
    description: "Campus-focused journalism covering UCSD events, student government, sports, and more. From local happenings to global impacts, get the full story.",
    icon: "/icons/newspaper.svg?v=2",
    gradient: "from-tory-500/20 to-tory-700/20",
    color: "tory-500"
  },
  {
    title: "Triton Today",
    description: "Vertical short-form news videos where reporters deliver 30-60 second updates on the most important campus events.",
    icon: "/icons/video.svg?v=2",
    gradient: "from-today-500/20 to-today-700/20",
    color: "today-500"
  },
  {
    title: "Science Journal",
    description: "Highlighting groundbreaking research and scientific discoveries happening across UC San Diego departments and labs.",
    icon: "/icons/microscope.svg?v=2",
    gradient: "from-science-500/20 to-science-700/20",
    color: "science-500"
  },
  {
    title: "Law Review",
    description: "Student-led legal analysis on campus policies, broader legal developments, and their implications for the university community.",
    icon: "/icons/scale.svg?v=2",
    gradient: "from-law-500/20 to-law-700/20",
    color: "law-500"
  }
];

export default async function Home() {
  // Fetch real data from Firebase with error handling
  let featuredArticles: Article[] = [];
  let latestArticles: Article[] = [];
  let latestVideos: Video[] = [];
  let latestResearch: Research[] = [];
  let latestLegal: LegalArticle[] = [];

  // Fetch each content type individually to handle partial failures
  try {
    featuredArticles = await ArticleService.getArticles(undefined, undefined, true, 4);
  } catch (error) {
    console.error("Error fetching featured articles:", error);
  }

  try {
    latestArticles = await ArticleService.getArticles(undefined, undefined, false, 3);
  } catch (error) {
    console.error("Error fetching latest articles:", error);
  }

  try {
    latestVideos = await VideoService.getVideos(undefined, false, 3);
  } catch (error) {
    console.error("Error fetching latest videos:", error);
  }

  try {
    latestResearch = await ResearchService.getResearchArticles(undefined, false, 3);
  } catch (error) {
    console.error("Error fetching latest research:", error);
  }

  try {
    latestLegal = await LegalService.getLegalArticles(undefined, false, 3);
  } catch (error) {
    console.error("Error fetching latest legal articles:", error);
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <AnimatedHeroBackground />

        {/* Hero Content */}
        <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
              Triton Tory Media
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              The comprehensive voice of UC San Diego
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8 slide-up">
            <Link href="/triton-tory" className="hero-button tory-gradient">
              News & Articles
            </Link>
            <Link href="/triton-today" className="hero-button today-gradient">
              Watch Videos
            </Link>
            <Link href="/triton-science" className="hero-button science-gradient">
              Science Journal
            </Link>
            <Link href="/triton-law" className="hero-button law-gradient">
              Law Review
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-300"
          >
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Media Sections Explanation */}
      <section className="container px-4 md:px-6 py-12 md:py-24">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
            Your Complete Campus Media Source
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl">
            Four distinct platforms, one unified mission: keeping the UCSD community informed, engaged, and connected.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mediaSections.map((section, index) => (
            <Card key={index} className={`bg-gray-900 border-gray-800 hover:border-${section.color} transition-colors`}>
              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 p-3 rounded-lg bg-gradient-to-br ${section.gradient}`}>
                  <Image
                    src={section.icon}
                    alt={section.title}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center">{section.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Content */}
      <section className="container px-4 md:px-6 py-12 md:py-24">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
            Featured Stories
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl">
            The latest and most important stories from across our platforms.
          </p>
        </div>

        {/* Featured Articles Grid */}
        {featuredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="bg-gray-900 border-gray-800 hover:border-tory-500 transition-colors group">
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <Image
                    src={article.coverImage || `https://via.placeholder.com/800x450/001429/FFFFFF?text=${article.title.slice(0, 20)}`}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-tory-500 text-white">Featured</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{formatDate(article.publishedAt)}</span>
                  <Link href={`/triton-tory/${article.id}`}>
                    <Button variant="ghost" size="sm" className="text-tory-400 hover:text-tory-300">
                      Read More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Latest Content Tabs */}
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-800">
            <TabsTrigger value="articles" className="data-[state=active]:bg-tory-500 data-[state=active]:text-white">
              Articles
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-today-500 data-[state=active]:text-white">
              Videos
            </TabsTrigger>
            <TabsTrigger value="research" className="data-[state=active]:bg-science-500 data-[state=active]:text-white">
              Research
            </TabsTrigger>
            <TabsTrigger value="legal" className="data-[state=active]:bg-law-500 data-[state=active]:text-white">
              Legal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="mt-6">
            {latestArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestArticles.map((article) => (
                  <Card key={article.id} className="bg-gray-900 border-gray-800 hover:border-tory-500 transition-colors">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <Image
                        src={article.coverImage || `https://picsum.photos/800/450?random=${article.id}`}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Link href={`/triton-tory/${article.id}`} className="w-full">
                        <Button variant="outline" className="w-full border-tory-500 text-tory-400 hover:bg-tory-500 hover:text-white">
                          Read Article
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No articles available at the moment.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            {latestVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestVideos.map((video) => (
                  <Card key={video.id} className="bg-gray-900 border-gray-800 hover:border-today-500 transition-colors">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 bg-today-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{formatViews(video.views)} views</span>
                      <Link href={`/triton-today/${video.id}`}>
                        <Button variant="outline" size="sm" className="border-today-500 text-today-400 hover:bg-today-500 hover:text-white">
                          Watch
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No videos available at the moment.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="research" className="mt-6">
            {latestResearch.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestResearch.map((research) => (
                  <Card key={research.id} className="bg-gray-900 border-gray-800 hover:border-science-500 transition-colors">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                                              <Image
                          src={research.coverImage || `https://picsum.photos/800/450?random=${research.id}`}
                          alt={research.title}
                          fill
                          className="object-cover"
                        />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{research.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{research.abstract}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Link href={`/triton-science/${research.id}`} className="w-full">
                        <Button variant="outline" className="w-full border-science-500 text-science-400 hover:bg-science-500 hover:text-white">
                          Read Research
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No research articles available at the moment.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="legal" className="mt-6">
            {latestLegal.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestLegal.map((legal) => (
                  <Card key={legal.id} className="bg-gray-900 border-gray-800 hover:border-law-500 transition-colors">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <Image
                        src={legal.coverImage}
                        alt={legal.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{legal.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{legal.abstract}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Link href={`/triton-law/${legal.id}`} className="w-full">
                        <Button variant="outline" className="w-full border-law-500 text-law-400 hover:bg-law-500 hover:text-white">
                          Read Analysis
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No legal articles available at the moment.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Founders Section */}
      <section className="container px-4 md:px-6 py-12 md:py-24">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
            Meet Our Founders
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl">
            The passionate students behind Triton Tory Media, dedicated to bringing quality journalism to UC San Diego.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {founders.map((founder, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800 text-center">
              <CardHeader>
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-2xl">{founder.name}</CardTitle>
                <CardDescription className="text-lg text-tory-400">{founder.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{founder.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
