"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Users, 
  Target, 
  Heart, 
  Shield, 
  Globe,
  ArrowRight,
  Clock,
  TestTube,
  Calculator,
  BarChart3,
  Compass,
  Flag,
  Crown,
  Skull
} from "lucide-react";

export default function PlaygroundPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Quiz categories and their tests
  const categories = [
    {
      id: "political",
      name: "Political Tests",
      icon: <Globe className="h-6 w-6" />,
      color: "bg-blue-500",
      description: "Discover your political orientation and beliefs",
      tests: [
        {
          id: "political-coordinates",
          title: "Political Coordinates Test",
          description: "Find your position on the political spectrum with this unbiased test",
          icon: <Compass className="h-5 w-5" />,
          questions: 20,
          time: "5-10 min",
          difficulty: "Easy",
          featured: true
        },
        {
          id: "left-right",
          title: "Left vs Right Test",
          description: "Based on scientific research linking genetics to political orientation",
          icon: <Flag className="h-5 w-5" />,
          questions: 15,
          time: "3-5 min",
          difficulty: "Easy",
          featured: false
        }
      ]
    },
    {
      id: "personality",
      name: "Personality Tests",
      icon: <Brain className="h-6 w-6" />,
      color: "bg-purple-500",
      description: "Explore your personality traits and characteristics",
      tests: [
        {
          id: "villain-test",
          title: "Villain Test",
          description: "Compare yourself with 20 historical figures using Big Five personality theory",
          icon: <Skull className="h-5 w-5" />,
          questions: 45,
          time: "10-15 min",
          difficulty: "Medium",
          featured: true
        },
        {
          id: "dark-triad",
          title: "Dark Triad Test",
          description: "Measure narcissism, Machiavellianism, and psychopathy traits",
          icon: <Crown className="h-5 w-5" />,
          questions: 30,
          time: "8-12 min",
          difficulty: "Medium",
          featured: false
        }
      ]
    },
    {
      id: "cognitive",
      name: "Cognitive Tests",
      icon: <Target className="h-6 w-6" />,
      color: "bg-green-500",
      description: "Test your cognitive abilities and intelligence",
      tests: [
        {
          id: "iq-test",
          title: "IQ Assessment",
          description: "Comprehensive intelligence quotient measurement",
          icon: <Calculator className="h-5 w-5" />,
          questions: 25,
          time: "15-20 min",
          difficulty: "Hard",
          featured: false
        },
        {
          id: "memory-test",
          title: "Memory Test",
          description: "Evaluate your short-term and working memory",
          icon: <Brain className="h-5 w-5" />,
          questions: 20,
          time: "10-15 min",
          difficulty: "Medium",
          featured: false
        }
      ]
    },
    {
      id: "social",
      name: "Social Tests",
      icon: <Users className="h-6 w-6" />,
      color: "bg-pink-500",
      description: "Understand your social behavior and relationships",
      tests: [
        {
          id: "empathy-test",
          title: "Empathy Test",
          description: "Measure your emotional intelligence and empathy levels",
          icon: <Heart className="h-5 w-5" />,
          questions: 18,
          time: "5-8 min",
          difficulty: "Easy",
          featured: false
        },
        {
          id: "leadership-test",
          title: "Leadership Style",
          description: "Discover your natural leadership approach",
          icon: <Crown className="h-5 w-5" />,
          questions: 25,
          time: "8-12 min",
          difficulty: "Medium",
          featured: false
        }
      ]
    }
  ];

  const allTests = categories.flatMap(category => 
    category.tests.map(test => ({ ...test, category: category.name, categoryId: category.id }))
  );

  const filteredTests = selectedCategory === "all" 
    ? allTests 
    : allTests.filter(test => test.categoryId === selectedCategory);

  const featuredTests = allTests.filter(test => test.featured);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent leading-tight pb-2">
              Playground
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Discover yourself through scientifically-backed personality tests, political assessments, and cognitive evaluations
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
        {/* Featured Tests */}
        <section className="mb-8 md:mb-12">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold">Featured Tests</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredTests.map((test) => (
              <Card key={test.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 group">
                <Link href={`/playground/${test.id}`} className="block">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        {test.icon}
                      </div>
                      <Badge className="bg-purple-500/90 text-white text-xs">
                        {test.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-purple-400 transition-colors">
                      {test.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {test.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>{test.questions} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{test.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {/* Category Filters */}
        <section className="mb-6 md:mb-8">
          <div className="flex flex-wrap justify-center gap-2 px-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-purple-500 hover:bg-purple-600" : ""}
            >
              All Tests
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-purple-500 hover:bg-purple-600" : ""}
              >
                {category.icon}
                <span className="ml-1">{category.name}</span>
              </Button>
            ))}
          </div>
        </section>

        {/* All Tests Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredTests.map((test) => (
              <Card key={test.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 group">
                <Link href={`/playground/${test.id}`} className="block">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        {test.icon}
                      </div>
                      <Badge className="bg-purple-500/90 text-white text-xs">
                        {test.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-purple-400 transition-colors">
                      {test.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {test.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>{test.questions} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{test.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>


      </div>
    </div>
  );
} 