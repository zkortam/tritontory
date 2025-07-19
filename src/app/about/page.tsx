"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Newspaper, Video, Scale, FlaskConical, Building, Globe } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const founders = [
    {
      name: "Zakaria Kortam",
      role: "Co-Editor In Chief",
      position: "Head of Digital Infrastructure",
      major: "Electrical Engineering",
      year: "4th Year",
      specialization: "Machine Learning Controls",
      description: "Leading the digital transformation and technical infrastructure of Triton Tory Media.",
      icon: <Building className="h-5 w-5" />,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    },
    {
      name: "Dylan Archer",
      role: "Co-Editor In Chief", 
      position: "Head of Operations",
      major: "Political Science & History",
      year: "4th Year",
      specialization: "Data Science & Analytics",
      description: "Overseeing operations and strategic direction with expertise in political analysis and data-driven insights.",
      icon: <Globe className="h-5 w-5" />,
      color: "bg-green-500/10 text-green-400 border-green-500/20"
    }
  ];

  const publications = [
    {
      name: "Triton Tory",
      description: "Campus news, sports, and student life coverage",
      icon: <Newspaper className="h-6 w-6" />,
      color: "bg-tory-500/10 text-tory-400 border-tory-500/20",
      href: "/triton-tory"
    },
    {
      name: "Triton Today",
      description: "Short-form video content and campus updates",
      icon: <Video className="h-6 w-6" />,
      color: "bg-today-500/10 text-today-400 border-today-500/20",
      href: "/triton-today"
    },
    {
      name: "Triton Science Journal",
      description: "Research news and scientific discoveries",
      icon: <FlaskConical className="h-6 w-6" />,
      color: "bg-science-500/10 text-science-400 border-science-500/20",
      href: "/triton-science"
    },
    {
      name: "Triton Law Review",
      description: "Legal analysis and policy commentary",
      icon: <Scale className="h-6 w-6" />,
      color: "bg-law-500/10 text-law-400 border-law-500/20",
      href: "/triton-law"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto mobile-safe-area py-12 max-w-6xl">
        {/* Back Button */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-tory-500/10 rounded-xl mb-6 border border-tory-500/20">
            <Newspaper className="h-8 w-8 text-tory-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About Triton Tory Media
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The comprehensive voice of UC San Diego, delivering news, analysis, and insights 
            across campus life, research, and legal discourse.
          </p>
        </div>

        {/* History Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Story</h2>
            <p className="text-gray-400">A legacy of student journalism and innovation</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-2 h-2 bg-tory-500 rounded-full"></div>
                  <CardTitle className="text-xl text-white">Original Establishment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  The Triton Tory was originally established in 2023 as a pioneering student media outlet, 
                  setting the foundation for comprehensive campus journalism at UC San Diego.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-2 h-2 bg-tory-400 rounded-full"></div>
                  <CardTitle className="text-xl text-white">Re-Establishment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  In 2025, Zakaria Kortam and Dylan Archer re-established the publication, 
                  bringing fresh vision and modern digital infrastructure to expand its reach and impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Founders Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Leadership Team</h2>
            <p className="text-gray-400">Meet the co-founders driving innovation in student media</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {founders.map((founder, index) => (
              <Card key={index} className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm hover:border-gray-700/50 transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-xl ${founder.color} border group-hover:scale-105 transition-transform duration-300`}>
                      {founder.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">{founder.name}</CardTitle>
                  <p className="text-tory-400 font-medium">{founder.position}</p>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <div className="space-y-2 mb-4">
                    <p className="text-white font-medium">{founder.major}</p>
                    <p className="text-gray-400 text-sm">{founder.year} • {founder.specialization}</p>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {founder.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Publications Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Publications</h2>
            <p className="text-gray-400">Comprehensive coverage across all aspects of campus life and academia</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {publications.map((pub, index) => (
              <Card key={index} className="bg-gray-900/30 border-gray-800/50 backdrop-blur-sm hover:border-gray-700/50 transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${pub.color} border group-hover:scale-105 transition-transform duration-300`}>
                      {pub.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white mb-1">{pub.name}</CardTitle>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {pub.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={pub.href}>
                      Explore {pub.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto pb-16">
          <Card className="bg-gradient-to-br from-gray-900/30 to-tory-900/10 border-gray-800/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white mb-2">Our Mission</CardTitle>
              <CardDescription className="text-gray-400">
                Empowering student voices through comprehensive media coverage
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                              <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Triton Tory Media is committed to providing accurate, engaging, and comprehensive coverage 
                of UC San Diego&apos;s vibrant campus community. From breaking news to in-depth analysis, 
                we strive to inform, inspire, and connect the Triton community through quality journalism 
                and innovative storytelling across all our platforms.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 