"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  DollarSign,
  PiggyBank,
  CreditCard,
  TrendingUp,
  ShoppingCart,
  Calculator,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Shield,
  Zap,
  Target,
  Wallet,
  Receipt,
  Coins,
  Share2,
  Download
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SurveyService, TEST_TYPES } from "@/lib/survey-service";

export default function MoneyPersonalityTest() {
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
      question: "When you get paid, what's the first thing you do?",
      options: [
        { text: "Pay bills and save a portion", value: 5 },
        { text: "Buy something I've been wanting", value: 1 },
        { text: "Put it all in savings", value: 4 },
        { text: "Spend it on whatever catches my eye", value: 0 },
        { text: "Check my budget and allocate funds", value: 5 }
      ]
    },
    {
      id: 2,
      question: "How do you feel about credit cards?",
      options: [
        { text: "I use them responsibly and pay off monthly", value: 4 },
        { text: "I avoid them completely", value: 3 },
        { text: "I carry a balance but manage it", value: 2 },
        { text: "I max them out and struggle to pay", value: 0 },
        { text: "I use them for rewards and pay in full", value: 5 }
      ]
    },
    {
      id: 3,
      question: "What's your approach to saving money?",
      options: [
        { text: "I save 20% or more of my income", value: 5 },
        { text: "I save whatever is left at the end of the month", value: 2 },
        { text: "I don't really save, I spend everything", value: 0 },
        { text: "I save for specific goals", value: 4 },
        { text: "I have emergency savings and invest", value: 5 }
      ]
    },
    {
      id: 4,
      question: "How do you make big purchases?",
      options: [
        { text: "I research thoroughly and compare prices", value: 5 },
        { text: "I buy on impulse if I want it", value: 0 },
        { text: "I save up and pay cash", value: 4 },
        { text: "I use financing but can afford it", value: 2 },
        { text: "I wait for sales and discounts", value: 3 }
      ]
    },
    {
      id: 5,
      question: "What's your relationship with your bank account?",
      options: [
        { text: "I check it daily and track every transaction", value: 5 },
        { text: "I check it weekly", value: 3 },
        { text: "I check it when I get low balance alerts", value: 1 },
        { text: "I rarely check it", value: 0 },
        { text: "I use budgeting apps and track everything", value: 5 }
      ]
    },
    {
      id: 6,
      question: "How do you handle unexpected expenses?",
      options: [
        { text: "I have an emergency fund for this", value: 5 },
        { text: "I use credit cards and figure it out later", value: 1 },
        { text: "I ask family for help", value: 2 },
        { text: "I cut back on other expenses", value: 3 },
        { text: "I have insurance and savings for emergencies", value: 5 }
      ]
    },
    {
      id: 7,
      question: "What's your investment strategy?",
      options: [
        { text: "I invest regularly in diversified portfolios", value: 5 },
        { text: "I have some savings but don't invest", value: 3 },
        { text: "I don't invest, I spend everything", value: 0 },
        { text: "I invest in things I understand", value: 4 },
        { text: "I'm learning about investing", value: 2 }
      ]
    },
    {
      id: 8,
      question: "How do you feel about debt?",
      options: [
        { text: "I avoid it completely", value: 4 },
        { text: "I use it strategically for investments", value: 3 },
        { text: "I have some debt but manage it well", value: 2 },
        { text: "I'm drowning in debt", value: 0 },
        { text: "I only have mortgage debt", value: 4 }
      ]
    },
    {
      id: 9,
      question: "What's your shopping style?",
      options: [
        { text: "I make lists and stick to budgets", value: 5 },
        { text: "I buy things on sale", value: 3 },
        { text: "I impulse buy when I see something I like", value: 0 },
        { text: "I research and wait for the best deals", value: 4 },
        { text: "I rarely shop, I'm very frugal", value: 4 }
      ]
    },
    {
      id: 10,
      question: "How do you plan for retirement?",
      options: [
        { text: "I contribute to retirement accounts regularly", value: 5 },
        { text: "I have some savings but no specific plan", value: 2 },
        { text: "I don't think about retirement yet", value: 1 },
        { text: "I have a detailed retirement plan", value: 5 },
        { text: "I'll figure it out when I'm older", value: 0 }
      ]
    },
    {
      id: 11,
      question: "What's your attitude toward money?",
      options: [
        { text: "Money is a tool for security and goals", value: 5 },
        { text: "Money is for enjoying life", value: 2 },
        { text: "Money is stressful and complicated", value: 1 },
        { text: "Money is for building wealth", value: 4 },
        { text: "I don't think about money much", value: 0 }
      ]
    },
    {
      id: 12,
      question: "How do you handle financial goals?",
      options: [
        { text: "I set specific goals and track progress", value: 5 },
        { text: "I have general ideas but no specific plans", value: 2 },
        { text: "I don't really set financial goals", value: 0 },
        { text: "I save for short-term goals", value: 3 },
        { text: "I have long-term financial planning", value: 5 }
      ]
    }
  ];

  // Check for shared results on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shared = urlParams.get('shared');
    const personalityType = urlParams.get('personalityType');
    const percentage = urlParams.get('percentage');
    
    if (shared === 'true' && personalityType && percentage) {
      setIsSharedView(true);
      setSharedResults({
        type: decodeURIComponent(personalityType),
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
            TEST_TYPES.MONEY_PERSONALITY
          );
          
          if (hasCompleted) {
            const savedResult = await SurveyService.getSurveyResult(
              user.uid,
              TEST_TYPES.MONEY_PERSONALITY
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
    const calculatedResults = calculatePersonality();
    setResults(calculatedResults);
    setShowResults(true);

    // Save results if user is authenticated
    if (user && timeStarted) {
      try {
        await SurveyService.saveSurveyResult(
          user.uid,
          TEST_TYPES.MONEY_PERSONALITY,
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

  const calculatePersonality = () => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.value, 0);
    const maxScore = questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.value)), 0);
    const percentage = (totalScore / maxScore) * 100;
    
    if (percentage >= 85) return { 
      type: "Financial Guru", 
      description: "You're a money master! You have excellent financial habits and make smart decisions.",
      traits: ["Budget-conscious", "Strategic saver", "Investment-minded", "Debt-averse"],
      color: "text-green-400", 
      bgColor: "bg-green-500/20", 
      icon: <TrendingUp className="h-8 w-8" />,
      tips: [
        "Consider becoming a financial advisor or mentor",
        "Look into advanced investment strategies",
        "Share your knowledge with others",
        "Consider philanthropy with your wealth"
      ]
    };
    if (percentage >= 70) return { 
      type: "Smart Saver", 
      description: "You have good financial habits and make responsible money decisions.",
      traits: ["Budget-aware", "Regular saver", "Cautious spender", "Goal-oriented"],
      color: "text-blue-400", 
      bgColor: "bg-blue-500/20", 
      icon: <PiggyBank className="h-8 w-8" />,
      tips: [
        "Start investing if you haven't already",
        "Consider increasing your savings rate",
        "Look into retirement planning",
        "Explore passive income opportunities"
      ]
    };
    if (percentage >= 50) return { 
      type: "Balanced Spender", 
      description: "You have some good habits but could improve your financial management.",
      traits: ["Mixed habits", "Sometimes impulsive", "Learning about money", "Working on goals"],
      color: "text-yellow-400", 
      bgColor: "bg-yellow-500/20", 
      icon: <Calculator className="h-8 w-8" />,
      tips: [
        "Create a monthly budget",
        "Start an emergency fund",
        "Track your spending",
        "Set specific financial goals"
      ]
    };
    if (percentage >= 30) return { 
      type: "Impulse Spender", 
      description: "You tend to spend impulsively and could benefit from better financial planning.",
      traits: ["Impulsive buyer", "Struggles with saving", "Likes instant gratification", "Learning about money"],
      color: "text-orange-400", 
      bgColor: "bg-orange-500/20", 
      icon: <ShoppingCart className="h-8 w-8" />,
      tips: [
        "Use the 24-hour rule before big purchases",
        "Start with a small emergency fund",
        "Use cash instead of cards",
        "Find an accountability partner"
      ]
    };
    return { 
      type: "Money Mess", 
      description: "You're struggling with money management and need to develop better financial habits.",
      traits: ["Struggles with debt", "Impulsive spender", "No savings", "Financial stress"],
      color: "text-red-400", 
      bgColor: "bg-red-500/20", 
      icon: <AlertTriangle className="h-8 w-8" />,
      tips: [
        "Seek professional financial advice",
        "Start with a basic budget",
        "Focus on paying off high-interest debt",
        "Consider a spending freeze challenge"
      ]
    };
  };

  const resetTest = async () => {
    // Delete previous results if user is authenticated
    if (user && hasPreviousResult) {
      try {
        await SurveyService.deleteSurveyResult(
          user.uid,
          TEST_TYPES.MONEY_PERSONALITY
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
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
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Shared Money Personality
              </h1>
              <p className="text-xl text-gray-300">Someone shared their money personality with you</p>
            </div>

            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mb-8">
              <CardHeader className="text-center">
                <div className="inline-flex p-4 rounded-full bg-green-500/20 mb-4">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-green-400">
                  {sharedResults.type}
                </CardTitle>
                <p className="text-lg text-gray-300 mt-2">
                  Money Personality Score: {sharedResults.percentage}%
                </p>
              </CardHeader>
            </Card>

            <div className="flex gap-4 justify-center">
              <Link href="/playground/money-personality">
                <Button className="bg-green-500 hover:bg-green-600">
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
    const result = results || calculatePersonality();
    
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/playground/tests">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => {}}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tests
              </Button>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Your Money Personality
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
                    <h3 className="font-semibold mb-2">Your Money Traits:</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.traits.map((trait: string, index: number) => (
                        <Badge key={index} className="bg-gray-700 text-white">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Financial Tips for You:</h3>
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
              <Button onClick={resetTest} className="bg-green-500 hover:bg-green-600">
                <RotateCcw className="h-4 w-4 mr-2" />
                {hasPreviousResult ? "Retake Test" : "Take Test Again"}
              </Button>
              <Button 
                onClick={() => {
                  const shareUrl = `${window.location.origin}/playground/money-personality?shared=true&personalityType=${encodeURIComponent(result.type)}&percentage=${Math.round((answers.reduce((sum, answer) => sum + answer.value, 0) / questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.value)), 0)) * 100)}`;
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
                  const report = `Money Personality Test Report\n\nPersonality Type: ${result.type}\n\nDescription:\n${result.description}\n\nYour Money Traits:\n${result.traits.join(', ')}\n\nFinancial Tips for You:\n${result.tips.map((tip: string, i: number) => `${i+1}. ${tip}`).join('\n')}`;
                  const blob = new Blob([report], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'money-personality-report.txt';
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
            <div className="inline-flex p-4 rounded-full bg-green-500/20 mb-4">
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              What's Your Money Personality?
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Discover your financial habits and get personalized money advice!
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
                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
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
                    className="w-full h-auto p-4 justify-start text-left border-gray-600 hover:border-green-400 hover:text-green-400 transition-all duration-200"
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