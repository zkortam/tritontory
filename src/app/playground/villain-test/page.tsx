"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { SurveyService, TEST_TYPES } from "@/lib/survey-service";
import { 
  ArrowLeft, 
  ArrowRight, 
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
  History
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
  weight: number;
}

interface Answer extends Record<string, unknown> {
  questionId: number;
  value: number; // 1-5 scale: 1 = Strongly Disagree, 5 = Strongly Agree
}

interface HistoricalFigure {
  name: string;
  title: string;
  period: string;
  country: string;
  description: string;
  scores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  matchPercentage: number;
}

interface Results {
  bigFiveScores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  topMatches: HistoricalFigure[];
  personalityType: string;
  description: string;
  analysis: string;
  recommendations: string[];
}

export default function VillainTest() {
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
    personalityType: string;
    agreeableness: number;
  } | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);

  const questions: Question[] = [
    // Openness Questions
    { id: 1, text: "I enjoy abstract philosophical discussions", trait: 'openness', weight: 1 },
    { id: 2, text: "I prefer routine over new experiences", trait: 'openness', weight: 1 },
    { id: 3, text: "I appreciate art and creative expression", trait: 'openness', weight: 1 },
    { id: 4, text: "I like to question traditional beliefs", trait: 'openness', weight: 1 },
    { id: 5, text: "I enjoy trying new and unusual foods", trait: 'openness', weight: 1 },
    { id: 6, text: "I prefer practical solutions over theoretical ones", trait: 'openness', weight: 1 },
    { id: 7, text: "I enjoy reading complex literature", trait: 'openness', weight: 1 },
    { id: 8, text: "I like to travel to unfamiliar places", trait: 'openness', weight: 1 },
    { id: 9, text: "I enjoy solving puzzles and brain teasers", trait: 'openness', weight: 1 },
    
    // Conscientiousness Questions
    { id: 10, text: "I always plan things in advance", trait: 'conscientiousness', weight: 1 },
    { id: 11, text: "I pay attention to details", trait: 'conscientiousness', weight: 1 },
    { id: 12, text: "I prefer to work without a schedule", trait: 'conscientiousness', weight: 1 },
    { id: 13, text: "I like to keep things organized", trait: 'conscientiousness', weight: 1 },
    { id: 14, text: "I often procrastinate on important tasks", trait: 'conscientiousness', weight: 1 },
    { id: 15, text: "I follow rules and regulations strictly", trait: 'conscientiousness', weight: 1 },
    { id: 16, text: "I prefer to work systematically", trait: 'conscientiousness', weight: 1 },
    { id: 17, text: "I often forget to return borrowed items", trait: 'conscientiousness', weight: 1 },
    { id: 18, text: "I like to have a clear plan before starting", trait: 'conscientiousness', weight: 1 },
    
    // Extraversion Questions
    { id: 19, text: "I feel energized after spending time with large groups", trait: 'extraversion', weight: 1 },
    { id: 20, text: "I prefer to work alone", trait: 'extraversion', weight: 1 },
    { id: 21, text: "I enjoy being the center of attention", trait: 'extraversion', weight: 1 },
    { id: 22, text: "I prefer quiet activities over social ones", trait: 'extraversion', weight: 1 },
    { id: 23, text: "I often take charge in group situations", trait: 'extraversion', weight: 1 },
    { id: 24, text: "I need time alone to recharge", trait: 'extraversion', weight: 1 },
    { id: 25, text: "I enjoy public speaking", trait: 'extraversion', weight: 1 },
    { id: 26, text: "I prefer small gatherings over large parties", trait: 'extraversion', weight: 1 },
    { id: 27, text: "I often initiate conversations with strangers", trait: 'extraversion', weight: 1 },
    
    // Agreeableness Questions
    { id: 28, text: "I often put others' needs before my own", trait: 'agreeableness', weight: 1 },
    { id: 29, text: "I enjoy arguing with people", trait: 'agreeableness', weight: 1 },
    { id: 30, text: "I try to avoid conflicts", trait: 'agreeableness', weight: 1 },
    { id: 31, text: "I believe people are generally trustworthy", trait: 'agreeableness', weight: 1 },
    { id: 32, text: "I can be cold and distant", trait: 'agreeableness', weight: 1 },
    { id: 33, text: "I enjoy helping others", trait: 'agreeableness', weight: 1 },
    { id: 34, text: "I often criticize others", trait: 'agreeableness', weight: 1 },
    { id: 35, text: "I try to be fair to everyone", trait: 'agreeableness', weight: 1 },
    { id: 36, text: "I can be manipulative to get what I want", trait: 'agreeableness', weight: 1 },
    
    // Neuroticism Questions
    { id: 37, text: "I often worry about things", trait: 'neuroticism', weight: 1 },
    { id: 38, text: "I remain calm under pressure", trait: 'neuroticism', weight: 1 },
    { id: 39, text: "I often feel anxious", trait: 'neuroticism', weight: 1 },
    { id: 40, text: "I rarely feel sad or depressed", trait: 'neuroticism', weight: 1 },
    { id: 41, text: "I get easily irritated", trait: 'neuroticism', weight: 1 },
    { id: 42, text: "I handle stress well", trait: 'neuroticism', weight: 1 },
    { id: 43, text: "I often feel insecure", trait: 'neuroticism', weight: 1 },
    { id: 44, text: "I am generally optimistic", trait: 'neuroticism', weight: 1 },
    { id: 45, text: "I often feel overwhelmed", trait: 'neuroticism', weight: 1 }
  ];

  const historicalFigures: HistoricalFigure[] = [
    {
      name: "Adolf Hitler",
      title: "Nazi Dictator",
      period: "1889-1945",
      country: "Germany",
      description: "Leader of Nazi Germany, responsible for the Holocaust and World War II",
      scores: { openness: 30, conscientiousness: 85, extraversion: 70, agreeableness: 15, neuroticism: 60 },
      matchPercentage: 0
    },
    {
      name: "Joseph Stalin",
      title: "Soviet Dictator",
      period: "1878-1953",
      country: "Soviet Union",
      description: "Totalitarian leader of the Soviet Union, responsible for millions of deaths",
      scores: { openness: 25, conscientiousness: 90, extraversion: 40, agreeableness: 10, neuroticism: 75 },
      matchPercentage: 0
    },
    {
      name: "Mao Zedong",
      title: "Chinese Communist Leader",
      period: "1893-1976",
      country: "China",
      description: "Founder of the People's Republic of China, led the Cultural Revolution",
      scores: { openness: 35, conscientiousness: 80, extraversion: 65, agreeableness: 20, neuroticism: 55 },
      matchPercentage: 0
    },
    {
      name: "Pol Pot",
      title: "Khmer Rouge Leader",
      period: "1925-1998",
      country: "Cambodia",
      description: "Leader of the Khmer Rouge, responsible for the Cambodian genocide",
      scores: { openness: 20, conscientiousness: 85, extraversion: 30, agreeableness: 5, neuroticism: 80 },
      matchPercentage: 0
    },
    {
      name: "Saddam Hussein",
      title: "Iraqi Dictator",
      period: "1937-2006",
      country: "Iraq",
      description: "President of Iraq, known for brutal repression and wars",
      scores: { openness: 25, conscientiousness: 75, extraversion: 60, agreeableness: 15, neuroticism: 70 },
      matchPercentage: 0
    },
    {
      name: "Idi Amin",
      title: "Ugandan Dictator",
      period: "1925-2003",
      country: "Uganda",
      description: "Military dictator of Uganda, known for human rights abuses",
      scores: { openness: 15, conscientiousness: 60, extraversion: 80, agreeableness: 10, neuroticism: 85 },
      matchPercentage: 0
    },
    {
      name: "Kim Il-sung",
      title: "North Korean Leader",
      period: "1912-1994",
      country: "North Korea",
      description: "Founder of North Korea, established the Kim dynasty",
      scores: { openness: 20, conscientiousness: 85, extraversion: 50, agreeableness: 15, neuroticism: 65 },
      matchPercentage: 0
    },
    {
      name: "Francisco Franco",
      title: "Spanish Dictator",
      period: "1892-1975",
      country: "Spain",
      description: "Military dictator of Spain, ruled for 36 years",
      scores: { openness: 15, conscientiousness: 90, extraversion: 40, agreeableness: 20, neuroticism: 60 },
      matchPercentage: 0
    },
    {
      name: "Benito Mussolini",
      title: "Italian Fascist Leader",
      period: "1883-1945",
      country: "Italy",
      description: "Founder of Italian Fascism, allied with Nazi Germany",
      scores: { openness: 30, conscientiousness: 70, extraversion: 75, agreeableness: 25, neuroticism: 55 },
      matchPercentage: 0
    },
    {
      name: "Augusto Pinochet",
      title: "Chilean Dictator",
      period: "1915-2006",
      country: "Chile",
      description: "Military dictator of Chile, overthrew democratic government",
      scores: { openness: 20, conscientiousness: 85, extraversion: 45, agreeableness: 15, neuroticism: 70 },
      matchPercentage: 0
    },
    {
      name: "Fidel Castro",
      title: "Cuban Revolutionary",
      period: "1926-2016",
      country: "Cuba",
      description: "Revolutionary leader of Cuba, ruled for nearly 50 years",
      scores: { openness: 40, conscientiousness: 80, extraversion: 70, agreeableness: 30, neuroticism: 50 },
      matchPercentage: 0
    },
    {
      name: "Muammar Gaddafi",
      title: "Libyan Dictator",
      period: "1942-2011",
      country: "Libya",
      description: "Long-time ruler of Libya, known for eccentric behavior",
      scores: { openness: 35, conscientiousness: 60, extraversion: 80, agreeableness: 20, neuroticism: 75 },
      matchPercentage: 0
    },
    {
      name: "Robert Mugabe",
      title: "Zimbabwean President",
      period: "1924-2019",
      country: "Zimbabwe",
      description: "Long-time president of Zimbabwe, known for economic mismanagement",
      scores: { openness: 25, conscientiousness: 70, extraversion: 60, agreeableness: 25, neuroticism: 65 },
      matchPercentage: 0
    },
    {
      name: "Vladimir Putin",
      title: "Russian President",
      period: "1952-present",
      country: "Russia",
      description: "Current president of Russia, known for authoritarian rule",
      scores: { openness: 20, conscientiousness: 85, extraversion: 40, agreeableness: 15, neuroticism: 60 },
      matchPercentage: 0
    },
    {
      name: "Kim Jong-un",
      title: "North Korean Leader",
      period: "1984-present",
      country: "North Korea",
      description: "Current leader of North Korea, continues family dynasty",
      scores: { openness: 15, conscientiousness: 80, extraversion: 45, agreeableness: 10, neuroticism: 70 },
      matchPercentage: 0
    },
    {
      name: "Bashar al-Assad",
      title: "Syrian President",
      period: "1965-present",
      country: "Syria",
      description: "President of Syria, involved in ongoing civil war",
      scores: { openness: 25, conscientiousness: 75, extraversion: 35, agreeableness: 20, neuroticism: 65 },
      matchPercentage: 0
    },
    {
      name: "Nicolae Ceaușescu",
      title: "Romanian Dictator",
      period: "1918-1989",
      country: "Romania",
      description: "Communist dictator of Romania, overthrown in 1989",
      scores: { openness: 20, conscientiousness: 85, extraversion: 50, agreeableness: 15, neuroticism: 75 },
      matchPercentage: 0
    },
    {
      name: "Enver Hoxha",
      title: "Albanian Dictator",
      period: "1908-1985",
      country: "Albania",
      description: "Communist leader of Albania, isolated the country",
      scores: { openness: 15, conscientiousness: 90, extraversion: 30, agreeableness: 10, neuroticism: 80 },
      matchPercentage: 0
    },
    {
      name: "Todor Zhivkov",
      title: "Bulgarian Leader",
      period: "1911-1998",
      country: "Bulgaria",
      description: "Long-time communist leader of Bulgaria",
      scores: { openness: 20, conscientiousness: 80, extraversion: 40, agreeableness: 25, neuroticism: 60 },
      matchPercentage: 0
    },
    {
      name: "Slobodan Milošević",
      title: "Serbian President",
      period: "1941-2006",
      country: "Serbia",
      description: "President of Serbia, involved in Yugoslav wars",
      scores: { openness: 25, conscientiousness: 70, extraversion: 55, agreeableness: 20, neuroticism: 70 },
      matchPercentage: 0
    }
  ];

  useEffect(() => {
    // Check for shared results in URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shared = urlParams.get('shared');
      const personalityType = urlParams.get('personalityType');
      const agreeableness = urlParams.get('agreeableness');
      
      if (shared === 'true' && personalityType && agreeableness) {
        setSharedResults({
          personalityType: decodeURIComponent(personalityType),
          agreeableness: parseInt(agreeableness)
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
            TEST_TYPES.VILLAIN_TEST
          );
          
          if (hasCompleted) {
            const savedResult = await SurveyService.getSurveyResult<Results>(
              user.uid,
              TEST_TYPES.VILLAIN_TEST
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
        // const stats = await SurveyService.getTestStatistics(TEST_TYPES.VILLAIN_TEST);
        // setStatistics(stats); // Removed unused variable
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
    // Calculate Big Five scores
    const traitScores: { [key: string]: number[] } = {
      openness: [],
      conscientiousness: [],
      extraversion: [],
      agreeableness: [],
      neuroticism: []
    };

    questions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id);
      if (answer) {
        // Convert 1-5 scale to 0-100
        const normalizedValue = ((answer.value - 1) / 4) * 100;
        traitScores[question.trait].push(normalizedValue * question.weight);
      }
    });

    const bigFiveScores = {
      openness: Math.round(traitScores.openness.reduce((a, b) => a + b, 0) / traitScores.openness.length),
      conscientiousness: Math.round(traitScores.conscientiousness.reduce((a, b) => a + b, 0) / traitScores.conscientiousness.length),
      extraversion: Math.round(traitScores.extraversion.reduce((a, b) => a + b, 0) / traitScores.extraversion.length),
      agreeableness: Math.round(traitScores.agreeableness.reduce((a, b) => a + b, 0) / traitScores.agreeableness.length),
      neuroticism: Math.round(traitScores.neuroticism.reduce((a, b) => a + b, 0) / traitScores.neuroticism.length)
    };

    // Calculate matches with historical figures
    const figuresWithMatches = historicalFigures.map(figure => {
      const matchScore = Math.sqrt(
        Math.pow(bigFiveScores.openness - figure.scores.openness, 2) +
        Math.pow(bigFiveScores.conscientiousness - figure.scores.conscientiousness, 2) +
        Math.pow(bigFiveScores.extraversion - figure.scores.extraversion, 2) +
        Math.pow(bigFiveScores.agreeableness - figure.scores.agreeableness, 2) +
        Math.pow(bigFiveScores.neuroticism - figure.scores.neuroticism, 2)
      );
      
      const matchPercentage = Math.max(0, 100 - (matchScore / 5));
      
      return { ...figure, matchPercentage: Math.round(matchPercentage) };
    });

    // Sort by match percentage and get top 5
    const topMatches = figuresWithMatches
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 5);

    // Determine personality type
    let personalityType = "";
    let description = "";
    let analysis = "";
    let recommendations: string[] = [];

    const avgAgreeableness = bigFiveScores.agreeableness;
    const avgConscientiousness = bigFiveScores.conscientiousness;
    const avgNeuroticism = bigFiveScores.neuroticism;

    if (avgAgreeableness < 30 && avgConscientiousness > 70 && avgNeuroticism > 60) {
      personalityType = "Authoritarian Personality";
      description = "You show traits commonly associated with authoritarian leaders: low agreeableness, high conscientiousness, and elevated neuroticism.";
      analysis = "This combination suggests a preference for order, structure, and control, with a tendency toward rigid thinking and reduced empathy.";
      recommendations = [
        "Practice empathy and perspective-taking exercises",
        "Learn about democratic leadership styles",
        "Explore collaborative decision-making approaches"
      ];
    } else if (avgAgreeableness < 40 && avgNeuroticism > 70) {
      personalityType = "High Conflict Personality";
      description = "You show elevated neuroticism and reduced agreeableness, which can lead to interpersonal conflicts.";
      analysis = "This pattern is associated with increased stress reactivity and difficulty in cooperative situations.";
      recommendations = [
        "Develop stress management techniques",
        "Practice active listening and conflict resolution",
        "Consider therapy for emotional regulation"
      ];
    } else if (avgConscientiousness > 80 && avgAgreeableness < 50) {
      personalityType = "Rigid Perfectionist";
      description = "You show very high conscientiousness with reduced agreeableness, suggesting a rigid, rule-oriented approach.";
      analysis = "This combination can lead to high achievement but may cause interpersonal difficulties due to inflexibility.";
      recommendations = [
        "Learn to balance standards with flexibility",
        "Practice collaborative problem-solving",
        "Develop emotional intelligence skills"
      ];
    } else {
      personalityType = "Balanced Personality";
      description = "Your personality shows a balanced profile across the Big Five traits.";
      analysis = "This suggests good adaptability and interpersonal skills, with moderate levels of all personality dimensions.";
      recommendations = [
        "Continue developing your strengths",
        "Explore areas for personal growth",
        "Maintain healthy relationships and boundaries"
      ];
    }

    return {
      bigFiveScores,
      topMatches,
      personalityType,
      description,
      analysis,
      recommendations
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
          TEST_TYPES.VILLAIN_TEST,
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
          TEST_TYPES.VILLAIN_TEST
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Shared Personality Analysis</h1>
            <p className="text-gray-400">Someone shared their personality analysis results with you</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shared Results Summary */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-400" />
                  Shared Personality Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">{sharedResults.personalityType}</div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-purple-400">Agreeableness Score:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Agreeableness</span>
                      <span className="text-sm font-medium">{sharedResults.agreeableness}%</span>
                    </div>
                    <Progress value={sharedResults.agreeableness} className="h-2" />
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
                  Curious about your own personality type? Take the same test to discover your Big Five personality traits and see which historical figures you match!
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Based on Big Five personality theory</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Only takes 5-10 minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Get detailed analysis and historical comparisons</span>
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
                    setSharedResults(null);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Take Personality Analysis Test
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Personality Analysis</h1>
            <p className="text-gray-400">Based on Big Five personality theory and historical comparisons</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personality Summary */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-400" />
                  Your Personality Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">{results.personalityType}</div>
                  <p className="text-gray-300">{results.description}</p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-purple-400">Big Five Scores:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Openness</span>
                      <span className="text-sm font-medium">{results.bigFiveScores.openness}%</span>
                    </div>
                    <Progress value={results.bigFiveScores.openness} className="h-2" />
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Conscientiousness</span>
                      <span className="text-sm font-medium">{results.bigFiveScores.conscientiousness}%</span>
                    </div>
                    <Progress value={results.bigFiveScores.conscientiousness} className="h-2" />
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Extraversion</span>
                      <span className="text-sm font-medium">{results.bigFiveScores.extraversion}%</span>
                    </div>
                    <Progress value={results.bigFiveScores.extraversion} className="h-2" />
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Agreeableness</span>
                      <span className="text-sm font-medium">{results.bigFiveScores.agreeableness}%</span>
                    </div>
                    <Progress value={results.bigFiveScores.agreeableness} className="h-2" />
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Neuroticism</span>
                      <span className="text-sm font-medium">{results.bigFiveScores.neuroticism}%</span>
                    </div>
                    <Progress value={results.bigFiveScores.neuroticism} className="h-2" />
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

            {/* Top Matches */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-6 w-6 text-red-400" />
                  Historical Comparisons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.topMatches.map((figure) => (
                    <div key={figure.name} className="p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{figure.name}</div>
                        <Badge className="bg-red-500/90 text-white text-xs">
                          {figure.matchPercentage}% match
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-400 mb-1">{figure.title} • {figure.period}</div>
                      <p className="text-xs text-gray-500">{figure.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-6 w-6 text-green-400" />
                Psychological Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{results.analysis}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">Recommendation {index + 1}</span>
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
                const shareUrl = `${window.location.origin}/playground/villain-test?shared=true&personalityType=${encodeURIComponent(results.personalityType)}&agreeableness=${results.bigFiveScores.agreeableness}`;
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
                const report = `Villain Test Report\n\nPersonality Type: ${results.personalityType}\n\nBig Five Scores:\n- Openness: ${results.bigFiveScores.openness}%\n- Conscientiousness: ${results.bigFiveScores.conscientiousness}%\n- Extraversion: ${results.bigFiveScores.extraversion}%\n- Agreeableness: ${results.bigFiveScores.agreeableness}%\n- Neuroticism: ${results.bigFiveScores.neuroticism}%\n\nDescription:\n${results.description}\n\nAnalysis:\n${results.analysis}\n\nTop Historical Matches:\n${results.topMatches.map((match, i) => `${i+1}. ${match.name} (${match.title}) - ${match.matchPercentage}% match`).join('\n')}\n\nRecommendations:\n${results.recommendations.map((rec, i) => `${i+1}. ${rec}`).join('\n')}`;
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'villain-test-report.txt';
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Villain Test</h1>
          <p className="text-gray-400 mb-4">Compare your personality with 20 historical figures using Big Five theory</p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{questions.length} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>10-15 minutes</span>
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
              <p className="text-gray-400 text-sm">
                Rate how much this statement applies to you
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
        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-red-400 mb-1">About This Test</p>
              <p>
                This test uses the Big Five personality model to compare your traits with historical figures. 
                The comparisons are based on psychological research and historical analysis. 
                Remember: personality traits are complex and this is for educational purposes only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 