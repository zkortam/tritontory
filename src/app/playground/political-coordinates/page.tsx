"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { SurveyService, TEST_TYPES } from "@/lib/survey-service";
import { 
  ArrowLeft, 
  ArrowRight, 
  Compass, 
  Target,
  Clock,
  Brain,
  Shield,
  CheckCircle,
  Info,
  RotateCcw,
  Share2,
  Download,
  Star
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  category: 'economic' | 'social';
  weight: number;
  polarity: 'positive' | 'negative'; // positive = agreement moves score right/authoritarian, negative = agreement moves score left/libertarian
}

interface Answer extends Record<string, unknown> {
  questionId: number;
  value: number; // 1-5 scale: 1 = Strongly Disagree, 5 = Strongly Agree
}

interface Results {
  economicScore: number; // -100 to 100 (Left to Right)
  socialScore: number; // -100 to 100 (Authoritarian to Libertarian)
  quadrant: string;
  description: string;
  recommendations: string[];
  confidence: number; // 0-100, based on response consistency
  responseQuality: string; // Assessment of response quality
}

export default function PoliticalCoordinatesTest() {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeCompleted, setTimeCompleted] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPreviousResult, setHasPreviousResult] = useState(false);
  const [sharedResults, setSharedResults] = useState<{
    quadrant: string;
    economicScore: number;
    socialScore: number;
    confidence?: number;
    responseQuality?: string;
  } | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);


  const questions: Question[] = [
    // Economic Questions (Left vs Right)
    { id: 1, text: "Healthcare should be primarily funded by the government", category: 'economic', weight: 1, polarity: 'negative' },
    { id: 2, text: "Businesses should operate with minimal government oversight", category: 'economic', weight: 1, polarity: 'positive' },
    { id: 3, text: "Wealth should be redistributed from the rich to the poor", category: 'economic', weight: 1, polarity: 'negative' },
    { id: 4, text: "The free market is the best way to organize economic activity", category: 'economic', weight: 1, polarity: 'positive' },
    { id: 5, text: "Major industries should be owned and controlled by the government", category: 'economic', weight: 1, polarity: 'negative' },
    { id: 6, text: "Taxes should be kept as low as possible", category: 'economic', weight: 1, polarity: 'positive' },
    { id: 7, text: "Unions are essential for protecting workers' rights", category: 'economic', weight: 1, polarity: 'negative' },
    { id: 8, text: "Business owners should have complete control over their companies", category: 'economic', weight: 1, polarity: 'positive' },
    { id: 9, text: "The government should provide a universal basic income", category: 'economic', weight: 1, polarity: 'negative' },
    { id: 10, text: "Competition in the marketplace benefits everyone", category: 'economic', weight: 1, polarity: 'positive' },
    
    // Social Questions (Authoritarian vs Libertarian)
    { id: 11, text: "The government should have the right to monitor citizens' communications", category: 'social', weight: 1, polarity: 'positive' },
    { id: 12, text: "People should be free to use drugs if they want to", category: 'social', weight: 1, polarity: 'negative' },
    { id: 13, text: "The death penalty should be abolished", category: 'social', weight: 1, polarity: 'negative' },
    { id: 14, text: "Schools should teach traditional values and patriotism", category: 'social', weight: 1, polarity: 'positive' },
    { id: 15, text: "People should be free to marry whomever they choose", category: 'social', weight: 1, polarity: 'negative' },
    { id: 16, text: "The government should censor the internet to protect children", category: 'social', weight: 1, polarity: 'positive' },
    { id: 17, text: "Religious institutions should have no influence on government policy", category: 'social', weight: 1, polarity: 'negative' },
    { id: 18, text: "The police should have broad powers to maintain order", category: 'social', weight: 1, polarity: 'positive' },
    { id: 19, text: "People should be free to express any opinion, even offensive ones", category: 'social', weight: 1, polarity: 'negative' },
    { id: 20, text: "The government should promote traditional family values", category: 'social', weight: 1, polarity: 'positive' }
  ];

  useEffect(() => {
    // Check for shared results in URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shared = urlParams.get('shared');
      const quadrant = urlParams.get('quadrant');
      const economicScore = urlParams.get('economicScore');
      const socialScore = urlParams.get('socialScore');
      
      if (shared === 'true' && quadrant && economicScore && socialScore) {
        setSharedResults({
          quadrant: decodeURIComponent(quadrant),
          economicScore: parseInt(economicScore),
          socialScore: parseInt(socialScore)
        });
        setIsSharedView(true);
        setLoading(false);
        return;
      }
    }

    const checkPreviousResults = async () => {
      if (user) {
        try {
          const hasCompleted = await SurveyService.hasCompletedSurvey(
            user.uid,
            TEST_TYPES.POLITICAL_COORDINATES
          );
          
          if (hasCompleted) {
            const savedResult = await SurveyService.getSurveyResult<Results>(
              user.uid,
              TEST_TYPES.POLITICAL_COORDINATES
            );
            
            if (savedResult) {
              setHasPreviousResult(true);
              setResults(savedResult.results as unknown as Results);
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
    let economicWeight = 0;
    let socialWeight = 0;
    
    // Calculate economic score (Left = negative, Right = positive)
    economicQuestions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id);
      if (answer) {
        const rawScore = answer.value; // 1-5 scale
        let normalizedValue: number;
        
        if (question.polarity === 'positive') {
          // Agreement moves score right (positive)
          normalizedValue = ((rawScore - 3) / 2) * 100; // 1=-100, 3=0, 5=+100
        } else {
          // Agreement moves score left (negative)
          normalizedValue = ((3 - rawScore) / 2) * 100; // 1=+100, 3=0, 5=-100
        }
        
        economicScore += normalizedValue * question.weight;
        economicWeight += question.weight;
      }
    });
    
    // Calculate social score (Authoritarian = positive, Libertarian = negative)
    socialQuestions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id);
      if (answer) {
        const rawScore = answer.value; // 1-5 scale
        let normalizedValue: number;
        
        if (question.polarity === 'positive') {
          // Agreement moves score authoritarian (positive)
          normalizedValue = ((rawScore - 3) / 2) * 100; // 1=-100, 3=0, 5=+100
        } else {
          // Agreement moves score libertarian (negative)
          normalizedValue = ((3 - rawScore) / 2) * 100; // 1=+100, 3=0, 5=-100
        }
        
        socialScore += normalizedValue * question.weight;
        socialWeight += question.weight;
      }
    });
    
    // Proper weighted averaging
    economicScore = economicWeight > 0 ? economicScore / economicWeight : 0;
    socialScore = socialWeight > 0 ? socialScore / socialWeight : 0;
    
    // Clamp to valid range
    economicScore = Math.max(-100, Math.min(100, economicScore));
    socialScore = Math.max(-100, Math.min(100, socialScore));
    
    // Determine quadrant with more nuanced thresholds
    let quadrant = "";
    let description = "";
    let recommendations: string[] = [];
    
    // Use more nuanced thresholds based on statistical distribution
    const economicThreshold = 25; // More conservative threshold
    const socialThreshold = 25;
    
    if (economicScore < -economicThreshold && socialScore > socialThreshold) {
      quadrant = "Authoritarian Left";
      description = "You believe in strong government control over both the economy and society. You support collective ownership and centralized planning while maintaining strict social order. This position emphasizes economic equality through state intervention and social control for stability.";
      recommendations = [
        "Research democratic socialism and its practical applications in Nordic countries",
        "Explore how other countries balance social welfare with individual freedoms",
        "Consider the role of worker cooperatives and participatory economics",
        "Study the history of social democracy and its successes"
      ];
    } else if (economicScore > economicThreshold && socialScore > socialThreshold) {
      quadrant = "Authoritarian Right";
      description = "You support free-market capitalism combined with strong government control over social and cultural matters. You value tradition, order, and national identity. This position emphasizes economic freedom while maintaining social hierarchy and cultural conservatism.";
      recommendations = [
        "Study the relationship between economic freedom and social stability",
        "Explore conservative economic policies and their social impacts",
        "Consider how tradition and progress can coexist in modern society",
        "Research the balance between market efficiency and social cohesion"
      ];
    } else if (economicScore > economicThreshold && socialScore < -socialThreshold) {
      quadrant = "Libertarian Right";
      description = "You believe in maximum individual freedom in both economic and social matters. You support free markets, limited government, and personal liberty. This position emphasizes voluntary cooperation and minimal state intervention in both economic and personal affairs.";
      recommendations = [
        "Learn about free-market economics and voluntary cooperation",
        "Explore how private solutions can address social problems",
        "Study the principles of classical liberalism and Austrian economics",
        "Research the effectiveness of market-based solutions to social issues"
      ];
    } else if (economicScore < -economicThreshold && socialScore < -socialThreshold) {
      quadrant = "Libertarian Left";
      description = "You support economic equality and collective ownership while advocating for maximum personal freedom and social tolerance. This position emphasizes both economic democracy and individual liberty, often through decentralized, cooperative structures.";
      recommendations = [
        "Research anarchism and libertarian socialism",
        "Explore worker self-management and cooperative economics",
        "Study how communities can organize without hierarchy",
        "Learn about participatory democracy and consensus decision-making"
      ];
    } else if (Math.abs(economicScore) < 15 && Math.abs(socialScore) < 15) {
      quadrant = "Centrist";
      description = "You take a balanced approach to political issues, avoiding extreme positions on both economic and social matters. You likely evaluate issues on a case-by-case basis rather than following strict ideological principles.";
      recommendations = [
        "Explore pragmatic approaches to political problems",
        "Study how compromise can lead to effective governance",
        "Consider evidence-based policy making",
        "Learn about different political systems and their trade-offs"
      ];
    } else if (Math.abs(economicScore) < 15) {
      // Economic centrist, but socially polarized
      if (socialScore > 15) {
        quadrant = "Socially Conservative Centrist";
        description = "You take a moderate approach to economic issues while supporting traditional social values and government authority in cultural matters.";
      } else {
        quadrant = "Socially Liberal Centrist";
        description = "You take a moderate approach to economic issues while supporting personal freedom and social tolerance.";
      }
      recommendations = [
        "Explore how economic moderation can work with your social values",
        "Study the relationship between economic and social policy",
        "Consider evidence-based approaches to both economic and social issues"
      ];
    } else if (Math.abs(socialScore) < 15) {
      // Social centrist, but economically polarized
      if (economicScore > 15) {
        quadrant = "Economically Conservative Centrist";
        description = "You support free-market economic policies while taking a moderate approach to social and cultural issues.";
      } else {
        quadrant = "Economically Progressive Centrist";
        description = "You support government intervention in the economy while taking a moderate approach to social and cultural issues.";
      }
      recommendations = [
        "Explore how your economic views can be balanced with social moderation",
        "Study the effectiveness of your preferred economic policies",
        "Consider how economic and social policies interact"
      ];
    } else {
      // Moderate positions in both dimensions
      quadrant = "Moderate";
      description = "You hold moderate positions on both economic and social issues, avoiding extreme views while still having clear preferences in both areas.";
      recommendations = [
        "Explore how moderate positions can be effective in governance",
        "Study the benefits and challenges of political moderation",
        "Consider how to bridge divides between more extreme positions"
      ];
    }
    
    // Calculate confidence and response quality
    const answeredQuestions = answers.length;
    const totalQuestions = questions.length;
    const completionRate = (answeredQuestions / totalQuestions) * 100;
    
    // Check for response consistency (if user answered all questions)
    let consistencyScore = 100;
    if (answeredQuestions === totalQuestions) {
      // Check for potential response bias (all same answers)
      const uniqueAnswers = new Set(answers.map(a => a.value));
      if (uniqueAnswers.size <= 2) {
        consistencyScore = 60; // Potential response bias
      } else if (uniqueAnswers.size <= 3) {
        consistencyScore = 80; // Some response bias
      }
    }
    
    const confidence = Math.round((completionRate + consistencyScore) / 2);
    
    let responseQuality = "";
    if (confidence >= 90) {
      responseQuality = "Excellent - Your responses show good consistency and thoughtful consideration.";
    } else if (confidence >= 75) {
      responseQuality = "Good - Your responses are generally consistent with some variation.";
    } else if (confidence >= 60) {
      responseQuality = "Fair - Your responses show some inconsistency or potential bias.";
    } else {
      responseQuality = "Poor - Your responses may not accurately reflect your true political views.";
    }
    
    return {
      economicScore: Math.round(economicScore),
      socialScore: Math.round(socialScore),
      quadrant,
      description,
      recommendations,
      confidence,
      responseQuality
    };
  };

  const handleFinish = async () => {
    const completedTime = new Date();
    setTimeCompleted(completedTime);
    const calculatedResults = calculateResults();
    setResults(calculatedResults);
    setShowResults(true);

    // Save results if user is authenticated
    if (user && timeStarted) {
      try {
        await SurveyService.saveSurveyResult<Results>(
          user.uid,
          TEST_TYPES.POLITICAL_COORDINATES,
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

  const handleRetake = async () => {
    // Delete previous results if user is authenticated
    if (user && hasPreviousResult) {
      try {
        await SurveyService.deleteSurveyResult(
          user.uid,
          TEST_TYPES.POLITICAL_COORDINATES
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
    setSharedResults(null);
    setIsSharedView(false);
  };

  const currentAnswer = answers.find(a => a.questionId === questions[currentQuestion].id);
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = currentAnswer !== undefined;

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
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/playground" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Playground
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Shared Political Coordinates</h1>
            <p className="text-gray-400">Someone shared their political coordinates test results with you</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shared Results Summary */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-6 w-6 text-blue-400" />
                  Shared Political Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{sharedResults.quadrant}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-400 mb-1">{sharedResults.economicScore}</div>
                    <div className="text-sm text-gray-400">Economic Score</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {sharedResults.economicScore < -30 ? "Left" : sharedResults.economicScore > 30 ? "Right" : "Center"}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400 mb-1">{sharedResults.socialScore}</div>
                    <div className="text-sm text-gray-400">Social Score</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {sharedResults.socialScore < -30 ? "Libertarian" : sharedResults.socialScore > 30 ? "Authoritarian" : "Center"}
                    </div>
                  </div>
                </div>
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
                <div className="relative w-full h-80 bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
                  {/* Colored quadrants */}
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500/10"></div>
                  <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10"></div>
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-green-500/10"></div>
                  <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-yellow-500/10"></div>
                  
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-gray-600"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-px h-full bg-gray-600"></div>
                  </div>
                  
                  {/* Quadrant labels with matching colors */}
                  <div className="absolute top-2 left-2 text-xs text-red-300 font-medium">Authoritarian Left</div>
                  <div className="absolute top-2 right-2 text-xs text-blue-300 font-medium">Authoritarian Right</div>
                  <div className="absolute bottom-2 left-2 text-xs text-green-300 font-medium">Libertarian Left</div>
                  <div className="absolute bottom-2 right-2 text-xs text-yellow-300 font-medium">Libertarian Right</div>
                  
                  {/* Axis labels */}
                  <div className="absolute top-1/2 left-2 transform -translate-y-1/2 text-xs text-gray-400 rotate-90">Economic Left</div>
                  <div className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xs text-gray-400 -rotate-90">Economic Right</div>
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">Authoritarian</div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">Libertarian</div>
                  
                  {/* Political figures - Corrected positions based on political analysis */}
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '85%', top: '20%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '88%', top: '15%' }}>Trump</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '75%', top: '30%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '78%', top: '25%' }}>Bush</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '55%', top: '40%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '58%', top: '35%' }}>Clinton</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '45%', top: '35%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '48%', top: '30%' }}>Obama</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '40%', top: '30%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '43%', top: '25%' }}>Biden</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '35%', top: '25%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '38%', top: '20%' }}>Harris</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '80%', top: '40%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '83%', top: '35%' }}>Reagan</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '20%', top: '45%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '23%', top: '40%' }}>FDR</div>

                  {/* Shared position with glow effect */}
                  <div 
                    className="absolute w-4 h-4 bg-purple-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 shadow-lg animate-pulse z-10"
                    style={{
                      left: `${50 + (sharedResults.economicScore / 100) * 40}%`,
                      top: `${50 - (sharedResults.socialScore / 100) * 40}%`,
                      boxShadow: '0 0 10px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.4), 0 0 30px rgba(168, 85, 247, 0.2)'
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Take Test Yourself */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-400" />
                  Take the Test Yourself
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Curious about your own political coordinates? Take the same test to discover your position on the political spectrum!
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Based on scientific research</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Only takes 5-10 minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Get detailed analysis and recommendations</span>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setIsSharedView(false);
                    setSharedResults(null);
                    setShowResults(false);
                    setCurrentQuestion(0);
                    setAnswers([]);
                    setResults(null);
                    setTimeStarted(new Date());
                    setTimeCompleted(null);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Take Political Coordinates Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="relative w-full h-80 bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
                  {/* Colored quadrants */}
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500/10"></div>
                  <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10"></div>
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-green-500/10"></div>
                  <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-yellow-500/10"></div>
                  
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-gray-600"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-px h-full bg-gray-600"></div>
                  </div>
                  
                  {/* Quadrant labels with matching colors */}
                  <div className="absolute top-2 left-2 text-xs text-red-300 font-medium">Authoritarian Left</div>
                  <div className="absolute top-2 right-2 text-xs text-blue-300 font-medium">Authoritarian Right</div>
                  <div className="absolute bottom-2 left-2 text-xs text-green-300 font-medium">Libertarian Left</div>
                  <div className="absolute bottom-2 right-2 text-xs text-yellow-300 font-medium">Libertarian Right</div>
                  
                  {/* Axis labels */}
                  <div className="absolute top-1/2 left-2 transform -translate-y-1/2 text-xs text-gray-400 rotate-90">Economic Left</div>
                  <div className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xs text-gray-400 -rotate-90">Economic Right</div>
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">Authoritarian</div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">Libertarian</div>
                  
                  {/* Political figures - Corrected positions based on political analysis */}
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '85%', top: '20%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '88%', top: '15%' }}>Trump</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '75%', top: '30%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '78%', top: '25%' }}>Bush</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '55%', top: '40%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '58%', top: '35%' }}>Clinton</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '45%', top: '35%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '48%', top: '30%' }}>Obama</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '40%', top: '30%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '43%', top: '25%' }}>Biden</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '35%', top: '25%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '38%', top: '20%' }}>Harris</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '80%', top: '40%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '83%', top: '35%' }}>Reagan</div>
                  
                  <div 
                    className="absolute w-3 h-3 bg-gray-400 rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: '20%', top: '45%' }}
                  ></div>
                  <div className="absolute text-xs text-gray-300 font-medium" style={{ left: '23%', top: '40%' }}>FDR</div>

                  {/* User position with glow effect */}
                  <div 
                    className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 shadow-lg animate-pulse z-10"
                    style={{
                      left: `${50 + (results.economicScore / 100) * 40}%`,
                      top: `${50 - (results.socialScore / 100) * 40}%`,
                      boxShadow: '0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.2)'
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
              onClick={handleRetake}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Test
            </Button>
            <Button 
              onClick={() => {
                const shareUrl = `${window.location.origin}/playground/political-coordinates?shared=true&quadrant=${encodeURIComponent(results.quadrant)}&economicScore=${results.economicScore}&socialScore=${results.socialScore}`;
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
                const report = `Political Coordinates Test Report\n\nYour Position: ${results.quadrant}\n\nScores:\n- Economic Score: ${results.economicScore} (${results.economicScore < -30 ? "Left" : results.economicScore > 30 ? "Right" : "Center"})\n- Social Score: ${results.socialScore} (${results.socialScore < -30 ? "Libertarian" : results.socialScore > 30 ? "Authoritarian" : "Center"})\n\nDescription:\n${results.description}\n\nRecommendations:\n${results.recommendations.map((rec, i) => `${i+1}. ${rec}`).join('\n')}`;
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'political-coordinates-report.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
              variant="outline" 
              className="border-gray-600 hover:bg-gray-800"
            >
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
          
          {!user && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg max-w-md mx-auto">
              <p className="text-yellow-300 text-sm text-center">
                💡 You can take this test without signing in, but your results won&apos;t be saved.
              </p>
            </div>
          )}
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
              <p className="mb-2">
                This test measures your political orientation on two axes: Economic (Left vs Right) and Social (Authoritarian vs Libertarian). 
                Your answers are analyzed using an improved algorithm that accounts for question polarity and response consistency.
              </p>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Neutral question phrasing to reduce bias</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Proper scoring algorithm with question polarity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Response consistency validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Nuanced quadrant classification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 