"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Compass, 
  Globe, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Target,
  Clock,
  Brain,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  RotateCcw,
  Share2,
  Download,
  Eye,
  Users,
  Star
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  category: 'economic' | 'social';
  weight: number;
}

interface Answer {
  questionId: number;
  value: number; // 1-5 scale: 1 = Strongly Disagree, 5 = Strongly Agree
}

interface Results {
  economicScore: number; // -100 to 100 (Left to Right)
  socialScore: number; // -100 to 100 (Authoritarian to Libertarian)
  quadrant: string;
  description: string;
  recommendations: string[];
}

export default function PoliticalCoordinatesTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeCompleted, setTimeCompleted] = useState<Date | null>(null);

  const questions: Question[] = [
    // Economic Questions (Left vs Right)
    { id: 1, text: "The government should provide free healthcare for all citizens", category: 'economic', weight: 1 },
    { id: 2, text: "Private companies should be allowed to operate without government regulation", category: 'economic', weight: 1 },
    { id: 3, text: "Wealth should be redistributed from the rich to the poor", category: 'economic', weight: 1 },
    { id: 4, text: "The free market is the best way to organize economic activity", category: 'economic', weight: 1 },
    { id: 5, text: "The government should own and control major industries", category: 'economic', weight: 1 },
    { id: 6, text: "Taxes should be kept as low as possible", category: 'economic', weight: 1 },
    { id: 7, text: "Unions are essential for protecting workers' rights", category: 'economic', weight: 1 },
    { id: 8, text: "Business owners should have complete control over their companies", category: 'economic', weight: 1 },
    { id: 9, text: "The government should provide a universal basic income", category: 'economic', weight: 1 },
    { id: 10, text: "Competition in the marketplace benefits everyone", category: 'economic', weight: 1 },
    
    // Social Questions (Authoritarian vs Libertarian)
    { id: 11, text: "The government should have the right to monitor citizens' communications", category: 'social', weight: 1 },
    { id: 12, text: "People should be free to use drugs if they want to", category: 'social', weight: 1 },
    { id: 13, text: "The death penalty should be abolished", category: 'social', weight: 1 },
    { id: 14, text: "Schools should teach traditional values and patriotism", category: 'social', weight: 1 },
    { id: 15, text: "People should be free to marry whomever they choose", category: 'social', weight: 1 },
    { id: 16, text: "The government should censor the internet to protect children", category: 'social', weight: 1 },
    { id: 17, text: "Religious institutions should have no influence on government policy", category: 'social', weight: 1 },
    { id: 18, text: "The police should have broad powers to maintain order", category: 'social', weight: 1 },
    { id: 19, text: "People should be free to express any opinion, even offensive ones", category: 'social', weight: 1 },
    { id: 20, text: "The government should promote traditional family values", category: 'social', weight: 1 }
  ];

  useEffect(() => {
    if (!timeStarted) {
      setTimeStarted(new Date());
    }
  }, [timeStarted]);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionId === questions[currentQuestion].id);
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex].value = value;
    } else {
      newAnswers.push({ questionId: questions[currentQuestion].id, value });
    }
    
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = (): Results => {
    const economicQuestions = questions.filter(q => q.category === 'economic');
    const socialQuestions = questions.filter(q => q.category === 'social');
    
    let economicScore = 0;
    let socialScore = 0;
    
    // Calculate economic score (Left = negative, Right = positive)
    economicQuestions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id);
      if (answer) {
        // Convert 1-5 scale to -100 to 100
        const normalizedValue = ((answer.value - 3) / 2) * 100;
        economicScore += normalizedValue * question.weight;
      }
    });
    
    // Calculate social score (Authoritarian = positive, Libertarian = negative)
    socialQuestions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id);
      if (answer) {
        // Convert 1-5 scale to -100 to 100
        const normalizedValue = ((answer.value - 3) / 2) * 100;
        socialScore += normalizedValue * question.weight;
      }
    });
    
    // Normalize scores
    economicScore = Math.max(-100, Math.min(100, economicScore / economicQuestions.length));
    socialScore = Math.max(-100, Math.min(100, socialScore / socialQuestions.length));
    
    // Determine quadrant
    let quadrant = "";
    let description = "";
    let recommendations: string[] = [];
    
    if (economicScore < -30 && socialScore > 30) {
      quadrant = "Authoritarian Left";
      description = "You believe in strong government control over both the economy and society. You support collective ownership and centralized planning while maintaining strict social order.";
      recommendations = [
        "Research democratic socialism and its practical applications",
        "Explore how other countries balance social welfare with individual freedoms",
        "Consider the role of worker cooperatives in modern economies"
      ];
    } else if (economicScore > 30 && socialScore > 30) {
      quadrant = "Authoritarian Right";
      description = "You support free-market capitalism combined with strong government control over social and cultural matters. You value tradition, order, and national identity.";
      recommendations = [
        "Study the relationship between economic freedom and social stability",
        "Explore conservative economic policies and their social impacts",
        "Consider how tradition and progress can coexist"
      ];
    } else if (economicScore > 30 && socialScore < -30) {
      quadrant = "Libertarian Right";
      description = "You believe in maximum individual freedom in both economic and social matters. You support free markets, limited government, and personal liberty.";
      recommendations = [
        "Learn about free-market economics and voluntary cooperation",
        "Explore how private solutions can address social problems",
        "Study the principles of classical liberalism"
      ];
    } else if (economicScore < -30 && socialScore < -30) {
      quadrant = "Libertarian Left";
      description = "You support economic equality and collective ownership while advocating for maximum personal freedom and social tolerance.";
      recommendations = [
        "Research anarchism and libertarian socialism",
        "Explore worker self-management and cooperative economics",
        "Study how communities can organize without hierarchy"
      ];
    } else {
      quadrant = "Centrist";
      description = "You take a balanced approach to political issues, avoiding extreme positions on both economic and social matters.";
      recommendations = [
        "Explore pragmatic approaches to political problems",
        "Study how compromise can lead to effective governance",
        "Consider evidence-based policy making"
      ];
    }
    
    return {
      economicScore: Math.round(economicScore),
      socialScore: Math.round(socialScore),
      quadrant,
      description,
      recommendations
    };
  };

  const handleFinish = () => {
    setTimeCompleted(new Date());
    const calculatedResults = calculateResults();
    setResults(calculatedResults);
    setShowResults(true);
  };

  const currentAnswer = answers.find(a => a.questionId === questions[currentQuestion].id);
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = currentAnswer !== undefined;

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/playground" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Playground
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Political Coordinates</h1>
            <p className="text-gray-400">Based on your answers to {questions.length} questions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results Summary */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-6 w-6 text-blue-400" />
                  Your Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{results.quadrant}</div>
                  <p className="text-gray-300">{results.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-400 mb-1">{results.economicScore}</div>
                    <div className="text-sm text-gray-400">Economic Score</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {results.economicScore < -30 ? "Left" : results.economicScore > 30 ? "Right" : "Center"}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400 mb-1">{results.socialScore}</div>
                    <div className="text-sm text-gray-400">Social Score</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {results.socialScore < -30 ? "Libertarian" : results.socialScore > 30 ? "Authoritarian" : "Center"}
                    </div>
                  </div>
                </div>

                {timeStarted && timeCompleted && (
                  <div className="text-center text-sm text-gray-400">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Completed in {Math.round((timeCompleted.getTime() - timeStarted.getTime()) / 1000 / 60)} minutes
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Political Compass Visualization */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-green-400" />
                  Political Compass
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-80 bg-gray-800/30 rounded-lg border border-gray-700">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-gray-600"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-px h-full bg-gray-600"></div>
                  </div>
                  
                  {/* Quadrant labels */}
                  <div className="absolute top-2 left-2 text-xs text-gray-400">Authoritarian Left</div>
                  <div className="absolute top-2 right-2 text-xs text-gray-400">Authoritarian Right</div>
                  <div className="absolute bottom-2 left-2 text-xs text-gray-400">Libertarian Left</div>
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">Libertarian Right</div>
                  
                  {/* Axis labels */}
                  <div className="absolute top-1/2 left-2 transform -translate-y-1/2 text-xs text-gray-400 rotate-90">Economic Left</div>
                  <div className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xs text-gray-400 -rotate-90">Economic Right</div>
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">Authoritarian</div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">Libertarian</div>
                  
                  {/* User position */}
                  <div 
                    className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
                    style={{
                      left: `${50 + (results.economicScore / 100) * 40}%`,
                      top: `${50 - (results.socialScore / 100) * 40}%`
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-400" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">Suggestion {index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-300">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers([]);
                setResults(null);
                setTimeStarted(null);
                setTimeCompleted(null);
              }}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Test
            </Button>
            <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
            <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/playground" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Playground
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Political Coordinates Test</h1>
          <p className="text-gray-400 mb-4">Discover your position on the political spectrum</p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{questions.length} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>5-10 minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Unbiased</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 leading-relaxed">
                {questions[currentQuestion].text}
              </h2>
              <p className="text-gray-400 text-sm">
                Rate how much you agree or disagree with this statement
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {[
                { value: 1, label: "Strongly Disagree", color: "bg-red-500" },
                { value: 2, label: "Disagree", color: "bg-orange-500" },
                { value: 3, label: "Neutral", color: "bg-yellow-500" },
                { value: 4, label: "Agree", color: "bg-green-500" },
                { value: 5, label: "Strongly Agree", color: "bg-blue-500" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    currentAnswer?.value === option.value
                      ? `border-${option.color.split('-')[1]}-500 bg-${option.color.split('-')[1]}-500/20`
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${option.color} ${currentAnswer?.value === option.value ? 'ring-2 ring-white' : ''}`}></div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            variant="outline"
            className="border-gray-600 hover:bg-gray-800 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleFinish}
              disabled={!canProceed}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              See Results
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              disabled={!canProceed}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-blue-400 mb-1">About This Test</p>
              <p>
                This test measures your political orientation on two axes: Economic (Left vs Right) and Social (Authoritarian vs Libertarian). 
                Your answers are analyzed to determine your position on the political compass.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 