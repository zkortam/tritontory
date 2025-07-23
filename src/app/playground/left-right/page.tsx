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
  Flag, 
  Brain, 
  Target,
  Clock,
  CheckCircle,
  Info,
  RotateCcw,
  Share2,
  Download,
  Star,
  TestTube,
  BarChart3
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  category: 'lifestyle' | 'personality' | 'social';
  weight: number;
  leftTrait: string;
  rightTrait: string;
}

interface Answer extends Record<string, unknown> {
  questionId: number;
  value: number; // 1-5 scale: 1 = Strongly Left, 5 = Strongly Right
}

interface Results {
  leftScore: number; // 0 to 100 (percentage left-leaning)
  rightScore: number; // 0 to 100 (percentage right-leaning)
  orientation: string;
  description: string;
  scientificBackground: string;
  recommendations: string[];
  geneticFactors: string[];
}

export default function LeftRightTest() {
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
    politicalPosition: string;
    overallScore: number;
    economicScore: number;
    socialScore: number;
  } | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);

  const questions: Question[] = [
    // Lifestyle Questions
    { 
      id: 1, 
      text: "I prefer routine and predictable schedules", 
      category: 'lifestyle', 
      weight: 1,
      leftTrait: "Spontaneous",
      rightTrait: "Structured"
    },
    { 
      id: 2, 
      text: "I enjoy trying new foods and cuisines", 
      category: 'lifestyle', 
      weight: 1,
      leftTrait: "Adventurous",
      rightTrait: "Traditional"
    },
    { 
      id: 3, 
      text: "I prefer to plan things in advance", 
      category: 'lifestyle', 
      weight: 1,
      leftTrait: "Flexible",
      rightTrait: "Organized"
    },
    { 
      id: 4, 
      text: "I like to keep my living space neat and organized", 
      category: 'lifestyle', 
      weight: 1,
      leftTrait: "Creative chaos",
      rightTrait: "Orderly"
    },
    { 
      id: 5, 
      text: "I enjoy outdoor activities and nature", 
      category: 'lifestyle', 
      weight: 1,
      leftTrait: "Urban lifestyle",
      rightTrait: "Rural connection"
    },
    
    // Personality Questions
    { 
      id: 6, 
      text: "I tend to be cautious and avoid risks", 
      category: 'personality', 
      weight: 1.5,
      leftTrait: "Risk-taking",
      rightTrait: "Risk-averse"
    },
    { 
      id: 7, 
      text: "I value tradition and established customs", 
      category: 'personality', 
      weight: 1.5,
      leftTrait: "Progressive",
      rightTrait: "Traditional"
    },
    { 
      id: 8, 
      text: "I prefer clear rules and guidelines", 
      category: 'personality', 
      weight: 1.5,
      leftTrait: "Flexible",
      rightTrait: "Rule-following"
    },
    { 
      id: 9, 
      text: "I enjoy abstract thinking and theoretical discussions", 
      category: 'personality', 
      weight: 1,
      leftTrait: "Analytical",
      rightTrait: "Practical"
    },
    { 
      id: 10, 
      text: "I tend to trust authority figures", 
      category: 'personality', 
      weight: 1.5,
      leftTrait: "Questioning",
      rightTrait: "Respectful"
    },
    
    // Social Questions
    { 
      id: 11, 
      text: "I prefer to work in teams rather than alone", 
      category: 'social', 
      weight: 1,
      leftTrait: "Independent",
      rightTrait: "Collaborative"
    },
    { 
      id: 12, 
      text: "I value individual achievement over group success", 
      category: 'social', 
      weight: 1.5,
      leftTrait: "Collective",
      rightTrait: "Individualistic"
    },
    { 
      id: 13, 
      text: "I prefer to make decisions based on facts rather than feelings", 
      category: 'social', 
      weight: 1,
      leftTrait: "Emotional",
      rightTrait: "Logical"
    },
    { 
      id: 14, 
      text: "I believe in personal responsibility over collective responsibility", 
      category: 'social', 
      weight: 1.5,
      leftTrait: "Communal",
      rightTrait: "Personal"
    },
    { 
      id: 15, 
      text: "I prefer stability over change", 
      category: 'social', 
      weight: 1.5,
      leftTrait: "Change-oriented",
      rightTrait: "Stability-seeking"
    }
  ];

  useEffect(() => {
    // Check for shared results in URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shared = urlParams.get('shared');
      const score = urlParams.get('score');
      const orientation = urlParams.get('orientation');
      
      if (shared === 'true' && score && orientation) {
        setSharedResults({
          politicalPosition: decodeURIComponent(orientation),
          overallScore: parseInt(score),
          economicScore: 0, // Placeholder, needs actual calculation
          socialScore: 0 // Placeholder, needs actual calculation
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
            TEST_TYPES.POLITICAL_COORDINATES_LEFT_RIGHT
          );
          
          if (hasCompleted) {
            const savedResult = await SurveyService.getSurveyResult<Results>(
              user.uid,
              TEST_TYPES.POLITICAL_COORDINATES_LEFT_RIGHT
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

    const loadStatistics = async () => {
      try {
        // const stats = await SurveyService.getTestStatistics(TEST_TYPES.POLITICAL_COORDINATES_LEFT_RIGHT);
        // setStatistics(stats); // This line was removed as per the edit hint
      } catch (error) {
        console.error("Error loading statistics:", error);
      }
    };

    checkPreviousResults();
    loadStatistics();
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
    let totalScore = 0;
    let maxScore = 0;
    
    questions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id);
      if (answer) {
        // Convert 1-5 scale to 0-100 (1 = left, 5 = right)
        const normalizedValue = ((answer.value - 1) / 4) * 100;
        totalScore += normalizedValue * question.weight;
        maxScore += 100 * question.weight;
      }
    });
    
    const rightScore = Math.round((totalScore / maxScore) * 100);
    const leftScore = 100 - rightScore;
    
    // Determine orientation
    let orientation = "";
    let description = "";
    let scientificBackground = "";
    let recommendations: string[] = [];
    let geneticFactors: string[] = [];
    
    if (rightScore >= 70) {
      orientation = "Strongly Right-Leaning";
      description = "Your lifestyle and personality traits align strongly with conservative political orientations. You tend to value tradition, order, and personal responsibility.";
      scientificBackground = "Research by Hibbing et al. suggests that right-leaning individuals often have higher levels of threat sensitivity and prefer structured, predictable environments.";
      recommendations = [
        "Explore conservative political philosophy and its historical development",
        "Study how traditional values can adapt to modern challenges",
        "Consider the role of personal responsibility in social policy"
      ];
      geneticFactors = [
        "Higher sensitivity to potential threats",
        "Preference for structured environments",
        "Stronger in-group loyalty tendencies"
      ];
    } else if (rightScore >= 55) {
      orientation = "Moderately Right-Leaning";
      description = "You show a moderate preference for conservative values and traditional approaches, while still being open to some progressive ideas.";
      scientificBackground = "Moderate conservatives often balance traditional values with practical considerations, showing flexibility in their political thinking.";
      recommendations = [
        "Study centrist conservative approaches to governance",
        "Explore how tradition and progress can be balanced",
        "Consider evidence-based conservative policies"
      ];
      geneticFactors = [
        "Moderate threat sensitivity",
        "Balanced preference for order and flexibility",
        "Mixed in-group and out-group orientations"
      ];
    } else if (rightScore >= 45) {
      orientation = "Centrist";
      description = "You show a balanced approach, not strongly favoring either left or right political orientations. You likely evaluate issues on a case-by-case basis.";
      scientificBackground = "Centrists often have moderate levels of the personality traits associated with political orientation, allowing for flexible political thinking.";
      recommendations = [
        "Study pragmatic approaches to political problems",
        "Explore evidence-based policy making",
        "Consider how compromise can lead to effective solutions"
      ];
      geneticFactors = [
        "Balanced threat sensitivity",
        "Flexible environmental preferences",
        "Moderate social orientation"
      ];
    } else if (rightScore >= 30) {
      orientation = "Moderately Left-Leaning";
      description = "You show a moderate preference for progressive values and social change, while still valuing some traditional approaches.";
      scientificBackground = "Moderate liberals often balance progressive ideals with practical considerations, showing openness to new ideas while maintaining some traditional values.";
      recommendations = [
        "Study progressive political philosophy and its applications",
        "Explore how social change can be implemented effectively",
        "Consider evidence-based progressive policies"
      ];
      geneticFactors = [
        "Lower threat sensitivity",
        "Preference for novel environments",
        "Stronger out-group empathy"
      ];
    } else {
      orientation = "Strongly Left-Leaning";
      description = "Your lifestyle and personality traits align strongly with progressive political orientations. You tend to value change, equality, and collective responsibility.";
      scientificBackground = "Research suggests that left-leaning individuals often have lower threat sensitivity and prefer novel, diverse environments with less rigid structure.";
      recommendations = [
        "Explore progressive political philosophy and social movements",
        "Study how social change has been achieved historically",
        "Consider the role of collective action in social progress"
      ];
      geneticFactors = [
        "Lower sensitivity to potential threats",
        "Preference for novel and diverse environments",
        "Stronger empathy for out-groups"
      ];
    }
    
    return {
      leftScore,
      rightScore,
      orientation,
      description,
      scientificBackground,
      recommendations,
      geneticFactors
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
          TEST_TYPES.POLITICAL_COORDINATES_LEFT_RIGHT,
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
          TEST_TYPES.POLITICAL_COORDINATES_LEFT_RIGHT
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
    setSharedResults(null); // Reset shared results state
    setIsSharedView(false); // Reset shared view state
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Shared Political Orientation Results</h1>
            <p className="text-gray-400">Someone shared their political orientation test results with you</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shared Results Summary */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-6 w-6 text-blue-400" />
                  Shared Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{sharedResults.politicalPosition}</div>
                </div>
                
                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                    <div className="text-2xl font-bold text-red-400 mb-1">{sharedResults.overallScore}%</div>
                    <div className="text-sm text-gray-400">Overall</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-400 mb-1">{sharedResults.economicScore}%</div>
                    <div className="text-sm text-gray-400">Economic</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400 mb-1">{sharedResults.socialScore}%</div>
                    <div className="text-sm text-gray-400">Social</div>
                  </div>
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
                  Curious about your own political orientation? Take the same test to discover where you fall on the political spectrum!
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
                    setHasPreviousResult(false);
                    setSharedResults(null); // Reset shared results state
                    setIsSharedView(false); // Reset shared view state
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Take Political Orientation Test
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Political Orientation</h1>
            <p className="text-gray-400">Based on scientific research linking lifestyle to political preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results Summary */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-6 w-6 text-blue-400" />
                  Your Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{results.orientation}</div>
                  <p className="text-gray-300">{results.description}</p>
                </div>
                
                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                    <div className="text-2xl font-bold text-red-400 mb-1">{results.leftScore}%</div>
                    <div className="text-sm text-gray-400">Left-Leaning</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-400 mb-1">{results.rightScore}%</div>
                    <div className="text-sm text-gray-400">Right-Leaning</div>
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

            {/* Scientific Background */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-6 w-6 text-green-400" />
                  Scientific Background
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{results.scientificBackground}</p>
                <div className="space-y-2">
                  <h4 className="font-medium text-green-400">Genetic Factors:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {results.geneticFactors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Political Spectrum */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-indigo-400" />
                Political Spectrum Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Detailed Spectrum with Ideologies */}
                <div className="relative">
                  <div className="w-full h-12 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-lg overflow-hidden">
                                         {/* User Position */}
                     <div 
                       className="absolute top-0 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gray-800 transform -translate-x-3"
                       style={{ left: `${results.rightScore}%`, top: '11px' }}
                     >
                     </div>
                    
                                         {/* Reference Points */}
                     <div className="absolute top-0" style={{ left: '20%' }}>
                       <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium">
                         Liberal
                       </div>
                     </div>
                     <div className="absolute top-0" style={{ left: '50%' }}>
                       <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium">
                         Centrist
                       </div>
                     </div>
                     <div className="absolute top-0" style={{ left: '80%' }}>
                       <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium">
                         Conservative
                       </div>
                     </div>
                  </div>
                  
                  {/* Percentage Labels */}
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {/* Position Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <div className="text-lg font-bold text-red-400 mb-2">Left Wing</div>
                    <div className="text-sm text-gray-400">
                      Progressive, social equality, government intervention, environmental protection
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <div className="text-lg font-bold text-yellow-400 mb-2">Center</div>
                    <div className="text-sm text-gray-400">
                      Balanced approach, pragmatic solutions, evidence-based policy
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <div className="text-lg font-bold text-blue-400 mb-2">Right Wing</div>
                    <div className="text-sm text-gray-400">
                      Traditional values, free markets, personal responsibility, limited government
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
              {hasPreviousResult ? "Retake Test" : "Take Test Again"}
            </Button>
            <Button 
              onClick={() => {
                const shareUrl = `${window.location.origin}/playground/left-right?shared=true&score=${results.rightScore}&orientation=${encodeURIComponent(results.orientation)}`;
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
                const report = `Political Orientation Test Report\n\nYour Position: ${results.rightScore}% Right\nOrientation: ${results.orientation}\n\nDescription:\n${results.description}\n\nScientific Background:\n${results.scientificBackground}\n\nRecommendations:\n${results.recommendations.map((rec, i) => `${i+1}. ${rec}`).join('\n')}\n\nGenetic Factors:\n${results.geneticFactors.map((factor, i) => `${i+1}. ${factor}`).join('\n')}`;
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'political-orientation-report.txt';
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Left vs Right Test</h1>
          <p className="text-gray-400 mb-4">Based on scientific research linking genetics to political orientation</p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{questions.length} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>3-5 minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <TestTube className="h-4 w-4" />
              <span>Scientific</span>
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
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-4">
                <span className="text-red-400">{questions[currentQuestion].leftTrait}</span>
                <span>←</span>
                <span>→</span>
                <span className="text-blue-400">{questions[currentQuestion].rightTrait}</span>
              </div>
              <p className="text-gray-400 text-sm">
                Rate how much this statement applies to you
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {[
                { value: 1, label: "Strongly Left", color: "bg-red-500" },
                { value: 2, label: "Left", color: "bg-orange-500" },
                { value: 3, label: "Neutral", color: "bg-yellow-500" },
                { value: 4, label: "Right", color: "bg-green-500" },
                { value: 5, label: "Strongly Right", color: "bg-blue-500" }
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
        <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-green-400 mb-1">Scientific Basis</p>
              <p>
                This test is based on research by John R. Hibbing, Kevin B. Smith, and John R. Alford, 
                who found that political differences are partially rooted in genetics and manifest in lifestyle choices. 
                The same genes that influence political preferences also affect personality and behavior patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 