"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  BookOpen,
  Eye,
  Ear,
  Hand,
  Brain,
  RotateCcw,
  Lightbulb,
  Users,
  Share2,
  Download
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SurveyService, TEST_TYPES } from "@/lib/survey-service";

export default function LearningStyleTest() {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; value: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasPreviousResult, setHasPreviousResult] = useState(false);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sharedResults, setSharedResults] = useState<any>(null);

  const questions = [
    {
      id: 1,
      question: "When you need to learn something new, what do you prefer?",
      options: [
        { text: "Reading about it or seeing diagrams", value: "visual" },
        { text: "Listening to someone explain it", value: "auditory" },
        { text: "Trying it out hands-on", value: "kinesthetic" },
        { text: "Discussing it with others", value: "social" },
        { text: "Working through it alone", value: "solitary" }
      ]
    },
    {
      id: 2,
      question: "How do you best remember information?",
      options: [
        { text: "By seeing it written down or in pictures", value: "visual" },
        { text: "By hearing it explained", value: "auditory" },
        { text: "By doing it myself", value: "kinesthetic" },
        { text: "By talking about it with others", value: "social" },
        { text: "By thinking about it quietly", value: "solitary" }
      ]
    },
    {
      id: 3,
      question: "When studying, what helps you most?",
      options: [
        { text: "Reading textbooks and taking notes", value: "visual" },
        { text: "Listening to lectures or podcasts", value: "auditory" },
        { text: "Doing experiments or hands-on activities", value: "kinesthetic" },
        { text: "Studying in groups", value: "social" },
        { text: "Studying alone in a quiet place", value: "solitary" }
      ]
    },
    {
      id: 4,
      question: "How do you prefer to solve problems?",
      options: [
        { text: "Drawing diagrams or writing it out", value: "visual" },
        { text: "Talking through the problem", value: "auditory" },
        { text: "Building models or using objects", value: "kinesthetic" },
        { text: "Brainstorming with others", value: "social" },
        { text: "Thinking through it step by step", value: "solitary" }
      ]
    },
    {
      id: 5,
      question: "What type of learning environment do you prefer?",
      options: [
        { text: "Quiet with visual materials", value: "visual" },
        { text: "Where I can hear clearly", value: "auditory" },
        { text: "Where I can move around and touch things", value: "kinesthetic" },
        { text: "With other people to interact with", value: "social" },
        { text: "Private space where I can focus", value: "solitary" }
      ]
    },
    {
      id: 6,
      question: "How do you best understand instructions?",
      options: [
        { text: "When they're written down or shown visually", value: "visual" },
        { text: "When someone explains them to me", value: "auditory" },
        { text: "When I can try them out myself", value: "kinesthetic" },
        { text: "When I can ask questions and discuss", value: "social" },
        { text: "When I can read and process them alone", value: "solitary" }
      ]
    },
    {
      id: 7,
      question: "What's your favorite way to take notes?",
      options: [
        { text: "Writing them down with diagrams", value: "visual" },
        { text: "Recording audio and listening back", value: "auditory" },
        { text: "Using flashcards or physical objects", value: "kinesthetic" },
        { text: "Discussing and sharing notes with others", value: "social" },
        { text: "Organizing thoughts in my own way", value: "solitary" }
      ]
    },
    {
      id: 8,
      question: "How do you prefer to learn a new skill?",
      options: [
        { text: "Watching videos or reading instructions", value: "visual" },
        { text: "Having someone guide me through it", value: "auditory" },
        { text: "Jumping in and trying it hands-on", value: "kinesthetic" },
        { text: "Learning with a partner or group", value: "social" },
        { text: "Practicing alone until I master it", value: "solitary" }
      ]
    },
    {
      id: 9,
      question: "What helps you remember names and faces?",
      options: [
        { text: "Seeing their picture or writing their name", value: "visual" },
        { text: "Hearing their name pronounced", value: "auditory" },
        { text: "Shaking their hand or physical interaction", value: "kinesthetic" },
        { text: "Meeting them in a group setting", value: "social" },
        { text: "Taking time to observe them quietly", value: "solitary" }
      ]
    },
    {
      id: 10,
      question: "How do you prefer to review material?",
      options: [
        { text: "Reading over notes and highlighting", value: "visual" },
        { text: "Listening to recordings or explanations", value: "auditory" },
        { text: "Creating flashcards or physical study aids", value: "kinesthetic" },
        { text: "Teaching it to someone else", value: "social" },
        { text: "Going through it methodically alone", value: "solitary" }
      ]
    },
    {
      id: 11,
      question: "What's your ideal way to learn a new language?",
      options: [
        { text: "Reading books and watching movies", value: "visual" },
        { text: "Listening to native speakers and podcasts", value: "auditory" },
        { text: "Practicing with physical objects and gestures", value: "kinesthetic" },
        { text: "Conversing with native speakers", value: "social" },
        { text: "Studying grammar and vocabulary alone", value: "solitary" }
      ]
    },
    {
      id: 12,
      question: "How do you prefer to work on projects?",
      options: [
        { text: "Creating visual plans and diagrams", value: "visual" },
        { text: "Discussing ideas and getting feedback", value: "auditory" },
        { text: "Building prototypes and testing", value: "kinesthetic" },
        { text: "Collaborating with a team", value: "social" },
        { text: "Working independently and presenting later", value: "solitary" }
      ]
    }
  ];

  // Check for shared results on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shared = urlParams.get('shared');
    const learningType = urlParams.get('learningType');
    const percentage = urlParams.get('percentage');
    
    if (shared === 'true' && learningType && percentage) {
      setIsSharedView(true);
      setSharedResults({
        type: decodeURIComponent(learningType),
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
            TEST_TYPES.LEARNING_STYLE
          );
          
          if (hasCompleted) {
            const savedResult = await SurveyService.getSurveyResult(
              user.uid,
              TEST_TYPES.LEARNING_STYLE
            );
            
            if (savedResult) {
              setHasPreviousResult(true);
              setResults(savedResult.results);
              setTimeStarted(savedResult.timeStarted);
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

  const handleAnswer = (value: string) => {
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
    const calculatedResults = calculateLearningStyle();
    setResults(calculatedResults);
    setShowResults(true);

    // Save results if user is authenticated
    if (user && timeStarted) {
      try {
        await SurveyService.saveSurveyResult(
          user.uid,
          TEST_TYPES.LEARNING_STYLE,
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

  const calculateLearningStyle = () => {
    const counts = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      social: 0,
      solitary: 0
    };
    
    answers.forEach(answer => {
      if (answer.value in counts) {
        counts[answer.value as keyof typeof counts]++;
      }
    });
    
    const maxCount = Math.max(...Object.values(counts));
    const dominantStyles = Object.entries(counts)
      .filter(([, count]) => count === maxCount)
      .map(([style]) => style);
    
    if (dominantStyles.length === 1) {
      const style = dominantStyles[0];
      return getStyleDetails(style);
    } else {
      return getMixedStyleDetails(dominantStyles);
    }
  };

  const getStyleDetails = (style: string) => {
    const styles = {
      visual: {
        type: "Visual Learner",
        description: "You learn best through seeing and observing. Visual information helps you understand and remember concepts.",
        traits: ["Visual thinker", "Likes diagrams", "Remembers faces", "Good with maps"],
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        icon: <Eye className="h-8 w-8" />,
        tips: [
          "Use mind maps and diagrams",
          "Highlight and color-code notes",
          "Watch educational videos",
          "Create visual study aids"
        ]
      },
      auditory: {
        type: "Auditory Learner",
        description: "You learn best through listening and speaking. Sound and verbal communication are your strengths.",
        traits: ["Good listener", "Likes discussions", "Remembers conversations", "Enjoys music"],
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        icon: <Ear className="h-8 w-8" />,
        tips: [
          "Record lectures and listen back",
          "Participate in group discussions",
          "Read aloud when studying",
          "Use podcasts and audio books"
        ]
      },
      kinesthetic: {
        type: "Kinesthetic Learner",
        description: "You learn best through hands-on experience and physical activity. Movement and touch help you understand.",
        traits: ["Hands-on learner", "Likes movement", "Good with tools", "Learns by doing"],
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
        icon: <Hand className="h-8 w-8" />,
        tips: [
          "Use physical objects and models",
          "Take frequent study breaks",
          "Practice skills hands-on",
          "Use movement while learning"
        ]
      },
      social: {
        type: "Social Learner",
        description: "You learn best through interaction with others. Group work and discussions help you understand concepts.",
        traits: ["Team player", "Good communicator", "Likes group work", "Enjoys teaching others"],
        color: "text-purple-400",
        bgColor: "bg-purple-500/20",
        icon: <Users className="h-8 w-8" />,
        tips: [
          "Study in groups",
          "Teach concepts to others",
          "Participate in discussions",
          "Join study groups"
        ]
      },
      solitary: {
        type: "Solitary Learner",
        description: "You learn best through self-study and independent work. You prefer to process information alone.",
        traits: ["Independent", "Self-motivated", "Reflective", "Private learner"],
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
        icon: <Brain className="h-8 w-8" />,
        tips: [
          "Create quiet study spaces",
          "Use self-reflection techniques",
          "Keep learning journals",
          "Set personal learning goals"
        ]
      }
    };
    
    return styles[style as keyof typeof styles];
  };

  const getMixedStyleDetails = (styles: string[]) => {
    const styleNames = styles.map(style => {
      const names = {
        visual: "Visual",
        auditory: "Auditory", 
        kinesthetic: "Kinesthetic",
        social: "Social",
        solitary: "Solitary"
      };
      return names[style as keyof typeof names];
    });
    
    return {
      type: `${styleNames.join("/")} Learner`,
      description: `You have a balanced learning style combining ${styleNames.join(", ")} approaches. You can adapt your learning methods based on the situation.`,
      traits: ["Adaptable learner", "Multiple approaches", "Flexible", "Versatile"],
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      icon: <Lightbulb className="h-8 w-8" />,
      tips: [
        "Use a combination of learning methods",
        "Adapt your approach to different subjects",
        "Experiment with different study techniques",
        "Leverage your flexibility in group settings"
      ]
    };
  };

  const resetTest = async () => {
    // Delete previous results if user is authenticated
    if (user && hasPreviousResult) {
      try {
        await SurveyService.deleteSurveyResult(
          user.uid,
          TEST_TYPES.LEARNING_STYLE
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
    setHasPreviousResult(false);
  };

  // Show loading state while checking for previous results
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
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
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Shared Learning Style
              </h1>
              <p className="text-xl text-gray-300">Someone shared their learning style with you</p>
            </div>

            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mb-8">
              <CardHeader className="text-center">
                <div className="inline-flex p-4 rounded-full bg-purple-500/20 mb-4">
                  <BookOpen className="h-8 w-8 text-purple-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-purple-400">
                  {sharedResults.type}
                </CardTitle>
                <p className="text-lg text-gray-300 mt-2">
                  Learning Style Score: {sharedResults.percentage}%
                </p>
              </CardHeader>
            </Card>

            <div className="flex gap-4 justify-center">
              <Link href="/playground/learning-style">
                <Button className="bg-purple-500 hover:bg-purple-600">
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
    const result = results || calculateLearningStyle();
    
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
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your Learning Style
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
                    <h3 className="font-semibold mb-2">Your Learning Traits:</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.traits.map((trait: string, _index: number) => (
                        <Badge key={_index} className="bg-gray-700 text-white">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Study Tips for You:</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {result.tips.map((tip: string, _index: number) => (
                        <li key={_index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={resetTest} className="bg-purple-500 hover:bg-purple-600">
                <RotateCcw className="h-4 w-4 mr-2" />
                {hasPreviousResult ? "Retake Test" : "Take Test Again"}
              </Button>
              <Button 
                onClick={() => {
                  const shareUrl = `${window.location.origin}/playground/learning-style?shared=true&learningType=${encodeURIComponent(result.type)}&percentage=${Math.round((answers.filter(a => a.value === 'visual').length / answers.length) * 100)}`;
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
                  const report = `Learning Style Test Report\n\nLearning Style: ${result.type}\n\nDescription:\n${result.description}\n\nYour Learning Traits:\n${result.traits.join(', ')}\n\nStudy Tips for You:\n${result.tips.map((tip: string, i: number) => `${i+1}. ${tip}`).join('\n')}`;
                  const blob = new Blob([report], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'learning-style-report.txt';
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
            <div className="inline-flex p-4 rounded-full bg-purple-500/20 mb-4">
              <BookOpen className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              What&apos;s Your Learning Style?
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Discover how you learn best and get personalized study tips!
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
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
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
                    className="w-full h-auto p-4 justify-start text-left border-gray-600 hover:border-purple-400 hover:text-purple-400 transition-all duration-200"
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