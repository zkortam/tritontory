"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Globe,
  TestTube,
  BarChart3,
  Shield,
  ArrowRight,
  Map,
  Compass,
  Target,
  Users,
  Heart,
  Crown,
  Skull,
  Calculator,
  Flag
} from "lucide-react";

export default function PlaygroundPage() {
  const mainSections = [
    {
      id: "tests",
      title: "Personality & Cognitive Tests",
      description: "Discover yourself through scientifically-backed personality tests, political assessments, and cognitive evaluations",
      icon: <Brain className="h-12 w-12" />,
      color: "from-purple-400 to-blue-400",
      bgColor: "bg-purple-500/20"
    },
    {
      id: "geography",
      title: "Geography Games",
      description: "Explore the world through interactive geography challenges, country quizzes, and map-based learning games",
      icon: <Globe className="h-12 w-12" />,
      color: "from-green-400 to-teal-400",
      bgColor: "bg-green-500/20"
    }
  ];



  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent leading-tight pb-2">
              Playground
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 max-w-3xl mx-auto px-4">
              Your gateway to self-discovery and world exploration. Take scientifically-backed tests or challenge your geography knowledge.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-400 px-4">
              <div className="flex items-center gap-1">
                <TestTube className="h-4 w-4" />
                <span>Scientific Research</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>Detailed Analytics</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Privacy Focused</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Main Sections */}
        <section className="mb-12 md:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {mainSections.map((section) => (
              <Card key={section.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden">
                <Link href={`/playground/${section.id}`} className="block h-full">
                  <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className={`inline-flex p-4 rounded-2xl ${section.bgColor} mb-6`}>
                      {section.icon}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {section.title}
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
                      {section.description}
                    </p>
                    <div className="flex items-center justify-center gap-3 text-purple-400 group-hover:text-purple-300 transition-colors">
                      <span className="text-lg font-semibold">Explore</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </section>


      </div>
    </div>
  );
} 