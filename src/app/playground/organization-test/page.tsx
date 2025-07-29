"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  FolderOpen,
  Calendar,
  CheckSquare,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Shield,
  Zap,
  Target,
  FileText,
  Archive,
  Search,
  List,
  Grid,
  Share2,
  Download
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SurveyService, TEST_TYPES } from "@/lib/survey-service";

export default function OrganizationTest() {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; value: number }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasPreviousResult, setHasPreviousResult] = useState(false);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeCompleted, setTimeCompleted] = useState<Date | null>(null);
  const [results, setResults] = useState<any>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedResults, setSharedResults] = useState<any>(null);

  const questions = [
    {
      id: 1,
      question: "How do you keep track of your tasks and to-dos?",
      options: [
        { text: "I use digital apps and check them daily", value: 5 },
        { text: "I write lists on paper", value: 3 },
        { text: "I keep it all in my head", value: 1 },
        { text: "I don't really track tasks", value: 0 },
        { text: "I have a detailed system with priorities", value: 5 }
      ]
    },
    {
      id: 2,
      question: "What's your desk/workspace like?",
      options: [
        { text: "Everything has a place and is put away", value: 5 },
        { text: "It's mostly organized but gets messy", value: 3 },
        { text: "It's cluttered but I know where things are", value: 2 },
        { text: "It's a complete mess", value: 0 },
        { text: "I clean it regularly and maintain order", value: 5 }
      ]
    },
    {
      id: 3,
      question: "How do you manage your calendar and appointments?",
      options: [
        { text: "I use a digital calendar and check it daily", value: 5 },
        { text: "I write things down but sometimes forget", value: 2 },
        { text: "I keep it all in my head", value: 1 },
        { text: "I don't really use a calendar", value: 0 },
        { text: "I have a detailed scheduling system", value: 5 }
      ]
    },
    {
      id: 4,
      question: "How do you organize your digital files?",
      options: [
        { text: "Everything is in organized folders with clear names", value: 5 },
        { text: "I have some folders but it's not perfect", value: 3 },
        { text: "I save things to desktop and search later", value: 1 },
        { text: "I don't organize files at all", value: 0 },
        { text: "I have a detailed filing system with backups", value: 5 }
      ]
    },
    {
      id: 5,
      question: "How do you handle incoming mail and paperwork?",
      options: [
        { text: "I process it immediately and file it properly", value: 5 },
        { text: "I pile it up and deal with it later", value: 2 },
        { text: "I leave it where it lands", value: 0 },
        { text: "I have a system but sometimes get behind", value: 3 },
        { text: "I have a detailed filing and processing system", value: 5 }
      ]
    },
    {
      id: 6,
      question: "How do you plan your day?",
      options: [
        { text: "I have a detailed schedule and stick to it", value: 5 },
        { text: "I make a rough plan but stay flexible", value: 3 },
        { text: "I wing it and see what happens", value: 1 },
        { text: "I don't really plan my day", value: 0 },
        { text: "I use time-blocking and productivity systems", value: 5 }
      ]
    },
    {
      id: 7,
      question: "How do you organize your home?",
      options: [
        { text: "Everything has a designated place", value: 5 },
        { text: "It's mostly organized but gets messy", value: 3 },
        { text: "I know where things are but it looks cluttered", value: 2 },
        { text: "It's a mess and I can't find anything", value: 0 },
        { text: "I have a detailed home organization system", value: 5 }
      ]
    },
    {
      id: 8,
      question: "How do you handle deadlines and commitments?",
      options: [
        { text: "I track them carefully and rarely miss any", value: 5 },
        { text: "I usually remember but sometimes forget", value: 3 },
        { text: "I often forget or miss deadlines", value: 1 },
        { text: "I don't really track deadlines", value: 0 },
        { text: "I have a comprehensive deadline management system", value: 5 }
      ]
    },
    {
      id: 9,
      question: "How do you organize your closet and clothes?",
      options: [
        { text: "Everything is organized by type and color", value: 5 },
        { text: "It's mostly organized but gets messy", value: 3 },
        { text: "I know where things are but it's not neat", value: 2 },
        { text: "It's a complete mess", value: 0 },
        { text: "I have a detailed clothing organization system", value: 5 }
      ]
    },
    {
      id: 10,
      question: "How do you handle your email inbox?",
      options: [
        { text: "I process emails immediately and keep it empty", value: 5 },
        { text: "I try to keep it organized but it piles up", value: 3 },
        { text: "I have thousands of unread emails", value: 1 },
        { text: "I don't really manage my email", value: 0 },
        { text: "I have a detailed email management system", value: 5 }
      ]
    },
    {
      id: 11,
      question: "How do you organize your thoughts and ideas?",
      options: [
        { text: "I use notebooks, apps, or systems to capture everything", value: 5 },
        { text: "I write some things down but lose track", value: 2 },
        { text: "I keep it all in my head", value: 1 },
        { text: "I don't really organize my thoughts", value: 0 },
        { text: "I have a comprehensive note-taking and idea system", value: 5 }
      ]
    },
    {
      id: 12,
      question: "How do you handle your phone and apps?",
      options: [
        { text: "I organize apps in folders and keep it clean", value: 5 },
        { text: "I have some organization but it's not perfect", value: 3 },
        { text: "I have apps scattered everywhere", value: 1 },
        { text: "I don't organize my phone at all", value: 0 },
        { text: "I have a detailed phone organization system", value: 5 }
      ]
    }
  ];

  // Check for shared results on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shared = urlParams.get('shared');
    const organizationType = urlParams.get('organizationType');
    const percentage = urlParams.get('percentage');
    
    if (shared === 'true' && organizationType && percentage) {
      setIsSharedView(true);
      setSharedResults({
        type: decodeURIComponent(organizationType),
        percentage: parseInt(percentage)
      });
      setLoading(false);
      return;
    }

    // Check for previous results if user is authenticated
    const checkPreviousResults = async () => {
      if (user) {
        try {
          const hasCompleted = await SurveyService.hasCompletedSurvey(
            user.uid,
            TEST_TYPES.ORGANIZATION_TEST
          );
          
          if (hasCompleted) {
            const savedResult = await SurveyService.getSurveyResult(
              user.uid,
              TEST_TYPES.ORGANIZATION_TEST
            );
            
            if (savedResult) {
              setHasPreviousResult(true);
              setResults(savedResult.results);
              setTimeStarted(savedResult.timeStarted);
              setTimeCompleted(savedResult.timeCompleted);
              setShowResults(true);
            }
          }
        } catch (error) {
          console.error("Error checking previous results:", error);
        }
      }
      setLoading(false);
    };

    checkPreviousResults();
  }, [user]);

  useEffect(() => {
    if (!timeStarted && !hasPreviousResult) {
      setTimeStarted(new Date());
    }
  }, [timeStarted, hasPreviousResult]);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, { questionId: currentQuestion + 1, value }];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    const completedTime = new Date();
    setTimeCompleted(completedTime);
    const calculatedResults = calculateOrganization();
    setResults(calculatedResults);
    setShowResults(true);

    // Save results if user is authenticated
    if (user && timeStarted) {
      try {
        await SurveyService.saveSurveyResult(
          user.uid,
          TEST_TYPES.ORGANIZATION_TEST,
          answers,
          calculatedResults,
          timeStarted,
          completedTime
        );
        setHasPreviousResult(true);
      } catch (error) {
        console.error("Error saving survey results:", error);
      }
    }
  };

  const calculateOrganization = () => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.value, 0);
    const maxScore = questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.value)), 0);
    const percentage = (totalScore / maxScore) * 100;
    
    if (percentage >= 85) return { 
      type: "Organization Expert", 
      description: "You're incredibly organized! You have excellent systems and maintain order in all areas of life.",
      traits: ["Systematic", "Detail-oriented", "Efficient", "Proactive"],
      color: "text-green-400", 
      bgColor: "bg-green-500/20", 
      icon: <CheckCircle className="h-8 w-8" />,
      tips: [
        "Consider becoming an organization consultant",
        "Share your systems with others",
        "Look into advanced productivity tools",
        "Consider teaching organization skills"
      ]
    };
    if (percentage >= 70) return { 
      type: "Pretty Organized", 
      description: "You have good organization habits and maintain order in most areas of your life.",
      traits: ["Generally organized", "Systematic", "Reliable", "Clean"],
      color: "text-blue-400", 
      bgColor: "bg-blue-500/20", 
      icon: <FolderOpen className="h-8 w-8" />,
      tips: [
        "Implement more digital organization tools",
        "Create more detailed systems",
        "Consider time-blocking techniques",
        "Develop daily organization routines"
      ]
    };
    if (percentage >= 50) return { 
      type: "Sometimes Chaotic", 
      description: "You have some organization skills but could benefit from better systems.",
      traits: ["Inconsistent", "Learning organization", "Sometimes messy", "Working on systems"],
      color: "text-yellow-400", 
      bgColor: "bg-yellow-500/20", 
      icon: <AlertTriangle className="h-8 w-8" />,
      tips: [
        "Start with one area and master it",
        "Use simple organization tools",
        "Create daily organization habits",
        "Find an accountability partner"
      ]
    };
    if (percentage >= 30) return { 
      type: "Organization Challenged", 
      description: "You struggle with organization and could benefit from developing better habits.",
      traits: ["Disorganized", "Forgetful", "Cluttered spaces", "Learning organization"],
      color: "text-orange-400", 
      bgColor: "bg-orange-500/20", 
      icon: <Search className="h-8 w-8" />,
      tips: [
        "Start with a simple daily routine",
        "Use basic organization tools",
        "Declutter one area at a time",
        "Consider professional organization help"
      ]
    };
    return { 
      type: "Hot Mess", 
      description: "You're struggling with organization and need to develop basic organizational skills.",
      traits: ["Very disorganized", "Loses things", "Chaotic spaces", "No systems"],
      color: "text-red-400", 
      bgColor: "bg-red-500/20", 
      icon: <AlertTriangle className="h-8 w-8" />,
      tips: [
        "Start with a simple daily routine",
        "Use basic organization tools",
        "Declutter one area at a time",
        "Consider professional organization help"
      ]
    };
  };

  const resetTest = async () => {
    // Delete previous results if user is authenticated
    if (user && hasPreviousResult) {
      try {
        await SurveyService.deleteSurveyResult(
          user.uid,
          TEST_TYPES.ORGANIZATION_TEST
        );
      } catch (error) {
        console.error("Error deleting previous results:", error);
      }
    }

    // Reset all state
    setShowResults(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setResults(null);
    setTimeStarted(new Date());
    setTimeCompleted(null);
    setHasPreviousResult(false);
  };

  // Show loading state while checking for previous results
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show shared results view
  if (isSharedView && sharedResults) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/playground/tests">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tests
              </Button>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Shared Organization Level
              </h1>
              <p className="text-xl text-gray-300">Someone shared their organization level with you</p>
            </div>

            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mb-8">
              <CardHeader className="text-center">
                <div className="inline-flex p-4 rounded-full bg-blue-500/20 mb-4">
                  <FolderOpen className="h-8 w-8 text-blue-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-blue-400">
                  {sharedResults.type}
                </CardTitle>
                <p className="text-lg text-gray-300 mt-2">
                  Organization Score: {sharedResults.percentage}%
                </p>
              </CardHeader>
            </Card>

            <div className="flex gap-4 justify-center">
              <Link href="/playground/organization-test">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Take Test Yourself
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const result = results || calculateOrganization();
    
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/playground/tests">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tests
              </Button>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Your Organization Level
              </h1>
              <p className="text-xl text-gray-300">The verdict is in...</p>
            </div>

            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mb-8">
              <CardHeader className="text-center">
                <div className={`inline-flex p-4 rounded-full ${result.bgColor} mb-4`}>
                  {result.icon}
                </div>
                <CardTitle className={`text-3xl font-bold ${result.color}`}>
                  {result.type}
                </CardTitle>
                <p className="text-lg text-gray-300 mt-2">
                  {result.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-left">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Your Organization Traits:</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.traits.map((trait: string, index: number) => (
                        <Badge key={index} className="bg-gray-700 text-white">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Organization Tips for You:</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {result.tips.map((tip: string, index: number) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={resetTest} className="bg-blue-500 hover:bg-blue-600">
                <RotateCcw className="h-4 w-4 mr-2" />
                {hasPreviousResult ? "Retake Test" : "Take Test Again"}
              </Button>
              <Button 
                onClick={() => {
                  const shareUrl = `${window.location.origin}/playground/organization-test?shared=true&organizationType=${encodeURIComponent(result.type)}&percentage=${Math.round((answers.reduce((sum, answer) => sum + answer.value, 0) / questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.value)), 0)) * 100)}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert('Shareable link copied to clipboard!');
                }}
                variant="outline" 
                className="border-gray-600 hover:bg-gray-800"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
              <Button 
                onClick={() => {
                  const report = `Organization Test Report\n\nOrganization Type: ${result.type}\n\nDescription:\n${result.description}\n\nYour Organization Traits:\n${result.traits.join(', ')}\n\nOrganization Tips for You:\n${result.tips.map((tip: string, i: number) => `${i+1}. ${tip}`).join('\n')}`;
                  const blob = new Blob([report], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'organization-test-report.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                variant="outline" 
                className="border-gray-600 hover:bg-gray-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Link href="/playground/tests">
                <Button variant="outline">
                  Back to Tests
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/playground/tests">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-full bg-blue-500/20 mb-4">
              <FolderOpen className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              How Organized Are You?
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Discover your organization level and get personalized tips!
            </p>
            
            {!user && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg max-w-md mx-auto">
                <p className="text-yellow-300 text-sm text-center">
                  💡 You can take this test without signing in, but your results won&apos;t be saved.
                </p>
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {currentQ.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full h-auto p-4 justify-start text-left border-gray-600 hover:border-blue-400 hover:text-blue-400 transition-all duration-200"
                    onClick={() => handleAnswer(option.value)}
                  >
                    <span className="text-sm">{option.text}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              {questions.length - currentQuestion - 1} questions remaining
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 