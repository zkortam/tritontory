"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ResearchService } from "@/lib/firebase-service";

import { useRedirectOnAuth } from "@/lib/auth-context";
import type { Research } from "@/lib/models";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  BookOpen, 
  Eye, 
  Download, 
  Star,
  Building,
  GraduationCap,
  Target,
  Microscope,
  FlaskConical,
  Dna,
  Atom,
  Brain,
  Leaf,
  Zap,
  Database,
  FileText,
  Share2,

  MessageCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { calculateReadingTime } from "@/lib/utils";

export default function TritonScienceArticlePage() {
  const params = useParams();
  // const { user: _user } = useAuth();
  useRedirectOnAuth(); // Track current page for redirect after auth
  
  const [research, setResearch] = useState<Research | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResearch() {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const researchData = await ResearchService.getResearchArticle(params.id as string);
        setResearch(researchData);
      } catch (error) {
        console.error("Error fetching research:", error);
        setError("Failed to load research article");
      } finally {
        setLoading(false);
      }
    }

    fetchResearch();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !research) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Research article not found</div>
          <Link href="/triton-science">
            <Button variant="outline">Back to Research</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getDepartmentIcon = (department: string) => {
    const icons = {
      'Biology': <Dna className="h-5 w-5" />,
      'Chemistry': <FlaskConical className="h-5 w-5" />,
      'Physics': <Atom className="h-5 w-5" />,
      'Neuroscience': <Brain className="h-5 w-5" />,
      'Environmental Science': <Leaf className="h-5 w-5" />,
      'Computer Science': <Database className="h-5 w-5" />,
      'Engineering': <Zap className="h-5 w-5" />,
    };
    return icons[department as keyof typeof icons] || <Microscope className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative h-96 overflow-hidden">
        <Image
          src={research.coverImage || `https://picsum.photos/1200/600?random=${research.id}`}
          alt={research.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Link href="/triton-science">
            <Button variant="outline" size="sm" className="bg-black/50 border-white/20 text-white hover:bg-black/70">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Research
            </Button>
          </Link>
        </div>

        {/* Department Badge */}
        <div className="absolute top-6 right-6">
          <Badge className="bg-science-500/90 text-white text-sm font-medium">
            {getDepartmentIcon(research.department)}
            <span className="ml-2">{research.department}</span>
          </Badge>
        </div>

        {/* Content */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            {research.title}
          </h1>
          {research.abstract && (
            <p className="text-gray-300 text-lg max-w-4xl leading-relaxed">
              {research.abstract}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-2">
            {/* Author Info */}
            <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-science-500/20 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-science-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{research.authorName}</h3>
                      <p className="text-gray-400 text-sm">{research.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDistanceToNow(research.publishedAt, { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{calculateReadingTime(research.content || "")} min read</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research Content */}
            <div className="prose prose-invert max-w-none">
              <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-8">
                {research.content ? (
                  <div 
                    className="text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: research.content }}
                  />
                ) : (
                  <div className="text-gray-400 text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Research content not available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Research Stats */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-4">Research Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Eye className="h-4 w-4" />
                      <span>Views</span>
                    </div>
                    <span className="text-white font-medium">{Math.floor(Math.random() * 500) + 100}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Download className="h-4 w-4" />
                      <span>Citations</span>
                    </div>
                    <span className="text-white font-medium">{Math.floor(Math.random() * 50) + 10}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Rating</span>
                    </div>
                    <span className="text-white font-medium">{Math.floor(Math.random() * 5) + 1}.{Math.floor(Math.random() * 9)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research Details */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-4">Research Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Building className="h-4 w-4" />
                    <span>Department: {research.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <GraduationCap className="h-4 w-4" />
                    <span>Author: {research.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Target className="h-4 w-4" />
                    <span>Type: Research Study</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-gray-900/50 border-gray-800/50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-science-600 hover:bg-science-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Research
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Author
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 