"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Calendar, 
  MapPin, 

  BookOpen, 
  Eye, 
  Heart, 
  Users, 
  UserPlus, 
  UserCheck,
  Newspaper,
  Video,
  Microscope,
  Scale,
  Clock,
  TrendingUp
} from "lucide-react";
import { UserProfileService } from "@/lib/firebase-service";
import { UserProfile } from "@/lib/models";
import { useAuth, useRedirectOnAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useAuth();
  useRedirectOnAuth(); // Track current page for redirect after auth
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userProfile = await UserProfileService.getUserProfile(userId);
      if (!userProfile) {
        setError("User not found");
        return;
      }
      
      setProfile(userProfile);
      setFollowersCount(userProfile.followers?.length || 0);
      setFollowingCount(userProfile.following?.length || 0);
      
      // Check if current user is following this profile
      if (currentUser) {
        const following = await UserProfileService.isFollowing(
          currentUser.uid,
          userId,
          'user'
        );
        setIsFollowing(following);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      if (isFollowing) {
        await UserProfileService.unfollow(currentUser.uid, userId, 'user');
        setFollowersCount(prev => prev - 1);
      } else {
        await UserProfileService.follow(currentUser.uid, userId, 'user');
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <Newspaper className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'research': return <Microscope className="h-4 w-4" />;
      case 'legal': return <Scale className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'text-tory-500';
      case 'video': return 'text-today-500';
      case 'research': return 'text-science-500';
      case 'legal': return 'text-law-500';
      default: return 'text-gray-400';
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return 'Article';
      case 'video': return 'Video';
      case 'research': return 'Research';
      case 'legal': return 'Legal';
      default: return 'Content';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            <span className="ml-2">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
            <p className="text-gray-400">{error || "This user profile could not be loaded."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-900/50 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.profileImage} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <div className="flex items-center gap-4 text-gray-400 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(profile.joinedAt)}</span>
                    </div>
                    {profile.department && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.department}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {currentUser && currentUser.uid !== userId && (
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className={cn(
                      "flex items-center gap-2",
                      isFollowing && "border-gray-600 text-gray-300"
                    )}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-gray-300 mb-4">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {followersCount} followers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {followingCount} following
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {profile.stats?.totalArticles || 0} articles
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-400">Total Views</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {profile.stats?.totalViews?.toLocaleString() || "0"}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-400" />
                <span className="text-sm text-gray-400">Total Likes</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {profile.stats?.totalLikes?.toLocaleString() || "0"}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-400">Followers</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {followersCount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400">Engagement</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {profile.stats?.totalViews && profile.stats?.totalLikes 
                  ? Math.round((profile.stats.totalLikes / profile.stats.totalViews) * 100)
                  : "0"}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Microscope className="h-4 w-4" />
              Research
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Legal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.authoredContent
                .filter(content => content.contentType === 'article')
                .map((content) => (
                  <Link key={content.contentId} href={`/triton-tory/${content.contentId}`}>
                    <Card className="bg-gray-900/50 border-gray-800 hover:border-tory-500 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getContentTypeIcon('article')}
                          <Badge className={getContentTypeColor('article')}>
                            {getContentTypeLabel('article')}
                          </Badge>
                        </div>
                        <h3 className="font-medium line-clamp-2 mb-2">{content.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(content.publishedAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.authoredContent
                .filter(content => content.contentType === 'video')
                .map((content) => (
                  <Link key={content.contentId} href={`/triton-today/${content.contentId}`}>
                    <Card className="bg-gray-900/50 border-gray-800 hover:border-today-500 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getContentTypeIcon('video')}
                          <Badge className={getContentTypeColor('video')}>
                            {getContentTypeLabel('video')}
                          </Badge>
                        </div>
                        <h3 className="font-medium line-clamp-2 mb-2">{content.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(content.publishedAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.authoredContent
                .filter(content => content.contentType === 'research')
                .map((content) => (
                  <Link key={content.contentId} href={`/triton-science/${content.contentId}`}>
                    <Card className="bg-gray-900/50 border-gray-800 hover:border-science-500 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getContentTypeIcon('research')}
                          <Badge className={getContentTypeColor('research')}>
                            {getContentTypeLabel('research')}
                          </Badge>
                        </div>
                        <h3 className="font-medium line-clamp-2 mb-2">{content.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(content.publishedAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.authoredContent
                .filter(content => content.contentType === 'legal')
                .map((content) => (
                  <Link key={content.contentId} href={`/triton-law/${content.contentId}`}>
                    <Card className="bg-gray-900/50 border-gray-800 hover:border-law-500 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getContentTypeIcon('legal')}
                          <Badge className={getContentTypeColor('legal')}>
                            {getContentTypeLabel('legal')}
                          </Badge>
                        </div>
                        <h3 className="font-medium line-clamp-2 mb-2">{content.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(content.publishedAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {profile.authoredContent.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Content Yet</h3>
            <p className="text-gray-400">
              {profile.name} hasn&apos;t published any content yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 