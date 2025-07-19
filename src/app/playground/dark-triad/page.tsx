"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Crown, 
  Brain, 
  Target,
  Clock,
  CheckCircle,
  Info,
  RotateCcw,
  Share2,
  Download,
  User,
  AlertTriangle,
  TestTube,
  Star
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  trait: 'narcissism' | 'machiavellianism' | 'psychopathy';
  weight: number;
  reverse: boolean; // Whether to reverse score
}

interface Answer {
  questionId: number;
  value: number; // 1-5 scale: 1 = Strongly Disagree, 5 = Strongly Agree
}

interface Results {
  narcissismScore: number; // 0-100
  machiavellianismScore: number; // 0-100
  psychopathyScore: number; // 0-100
  overallDarkScore: number; // 0-100
  personalityType: string;
  description: string;
  analysis: string;
  recommendations: string[];
  traitBreakdown: {
    narcissism: { level: string; description: string };
    machiavellianism: { level: string; description: string };
    psychopathy: { level: string; description: string };
  };
}

export default function DarkTriadTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeCompleted, setTimeCompleted] = useState<Date | null>(null);

  const questions: Question[] = [
    // Narcissism Questions
    { id: 1, text: "I like to be the center of attention", trait: 'narcissism', weight: 1, reverse: false },
    { id: 2, text: "I deserve special treatment", trait: 'narcissism', weight: 1, reverse: false },
    { id: 3, text: "I am more capable than most people", trait: 'narcissism', weight: 1, reverse: false },
    { id: 4, text: "I expect others to recognize my superiority", trait: 'narcissism', weight: 1, reverse: false },
    { id: 5, text: "I often fantasize about being famous", trait: 'narcissism', weight: 1, reverse: false },
    { id: 6, text: "I am not interested in other people's problems", trait: 'narcissism', weight: 1, reverse: false },
    { id: 7, text: "I like to show off my body", trait: 'narcissism', weight: 1, reverse: false },
    { id: 8, text: "I am an average person", trait: 'narcissism', weight: 1, reverse: true },
    { id: 9, text: "I am not that interested in having others admire me", trait: 'narcissism', weight: 1, reverse: true },
    { id: 10, text: "I am not really interested in others", trait: 'narcissism', weight: 1, reverse: false },
    
    // Machiavellianism Questions
    { id: 11, text: "I tend to manipulate others to get my way", trait: 'machiavellianism', weight: 1, reverse: false },
    { id: 12, text: "I have used deceit or lied to get ahead", trait: 'machiavellianism', weight: 1, reverse: false },
    { id: 13, text: "I have used flattery to get my way", trait: 'machiavellianism', weight: 1, reverse: false },
    { id: 14, text: "I have taken advantage of someone who was vulnerable", trait: 'machiavellianism', weight: 1, reverse: false },
    { id: 15, text: "I have used charm or wit to manipulate someone", trait: 'machiavellianism', weight: 1, reverse: false },
    { id: 16, text: "I have exploited someone to my advantage", trait: 'machiavellianism', weight: 1, reverse: false },
    { id: 17, text: "I have been indifferent to the suffering of others", trait: 'machiavellianism', weight: 1, reverse: false },
    { id: 18, text: "I have used someone to advance my own means", trait: 'machiavellianism', weight: 1, reverse: false },
    { id: 19, text: "I have been unconcerned with the morality of my actions", trait: 'machiavellianism', weight: 1, reverse: false },
    { id: 20, text: "I have been cynical about the nature of others", trait: 'machiavellianism', weight: 1, reverse: false },
    
    // Psychopathy Questions
    { id: 21, text: "I tend to be callous or insensitive", trait: 'psychopathy', weight: 1, reverse: false },
    { id: 22, text: "I tend to be unconcerned with the feelings of others", trait: 'psychopathy', weight: 1, reverse: false },
    { id: 23, text: "I tend to be unemotional or flat", trait: 'psychopathy', weight: 1, reverse: false },
    { id: 24, text: "I tend to be aggressive or rude", trait: 'psychopathy', weight: 1, reverse: false },
    { id: 25, text: "I tend to be impulsive", trait: 'psychopathy', weight: 1, reverse: false },
    { id: 26, text: "I tend to be irresponsible", trait: 'psychopathy', weight: 1, reverse: false },
    { id: 27, text: "I tend to be reckless or take risks", trait: 'psychopathy', weight: 1, reverse: false },
    { id: 28, text: "I tend to be erratic or unpredictable", trait: 'psychopathy', weight: 1, reverse: false },
    { id: 29, text: "I tend to be antisocial or rebellious", trait: 'psychopathy', weight: 1, reverse: false },
    { id: 30, text: "I tend to be hostile or aggressive", trait: 'psychopathy', weight: 1, reverse: false }
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
    // Calculate scores for each trait
    const traitScores: { [key: string]: number[] } = {
      narcissism: [],
      machiavellianism: [],
      psychopathy: []
    };

    questions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id);
      if (answer) {
        let score = answer.value;
        
        // Reverse score if needed
        if (question.reverse) {
          score = 6 - score; // Convert 1-5 to 5-1
        }
        
        // Convert to 0-100 scale
        const normalizedValue = ((score - 1) / 4) * 100;
        traitScores[question.trait].push(normalizedValue * question.weight);
      }
    });

    const narcissismScore = Math.round(traitScores.narcissism.reduce((a, b) => a + b, 0) / traitScores.narcissism.length);
    const machiavellianismScore = Math.round(traitScores.machiavellianism.reduce((a, b) => a + b, 0) / traitScores.machiavellianism.length);
    const psychopathyScore = Math.round(traitScores.psychopathy.reduce((a, b) => a + b, 0) / traitScores.psychopathy.length);
    
    const overallDarkScore = Math.round((narcissismScore + machiavellianismScore + psychopathyScore) / 3);

    // Determine personality type and analysis
    let personalityType = "";
    let description = "";
    let analysis = "";
    let recommendations: string[] = [];

    if (overallDarkScore >= 70) {
      personalityType = "High Dark Triad";
      description = "You show elevated levels across all three dark personality traits. This combination can be associated with manipulative behavior and reduced empathy.";
      analysis = "High dark triad scores are associated with increased risk-taking, reduced cooperation, and potential interpersonal difficulties. However, these traits can also be adaptive in competitive environments.";
      recommendations = [
        "Consider therapy to develop empathy and emotional regulation",
        "Practice perspective-taking exercises",
        "Learn healthy conflict resolution strategies"
      ];
    } else if (overallDarkScore >= 50) {
      personalityType = "Moderate Dark Triad";
      description = "You show moderate levels of dark personality traits. You may be strategic in your interactions while maintaining some empathy.";
      analysis = "Moderate dark triad traits can be beneficial in leadership and competitive situations, but may cause interpersonal challenges if not balanced with prosocial behavior.";
      recommendations = [
        "Develop emotional intelligence skills",
        "Practice active listening and empathy",
        "Balance ambition with cooperation"
      ];
    } else if (overallDarkScore >= 30) {
      personalityType = "Low Dark Triad";
      description = "You show relatively low levels of dark personality traits. You tend to be cooperative and empathetic in your interactions.";
      analysis = "Low dark triad scores are associated with increased cooperation, empathy, and prosocial behavior. This profile is generally beneficial for maintaining healthy relationships.";
      recommendations = [
        "Continue developing your emotional intelligence",
        "Maintain your prosocial tendencies",
        "Learn to set healthy boundaries"
      ];
    } else {
      personalityType = "Very Low Dark Triad";
      description = "You show very low levels of dark personality traits. You are highly cooperative, empathetic, and prosocial.";
      analysis = "Very low dark triad scores indicate high levels of empathy and cooperation. While beneficial for relationships, you may need to develop assertiveness and self-advocacy skills.";
      recommendations = [
        "Develop assertiveness and self-advocacy skills",
        "Learn to balance empathy with self-care",
        "Practice setting and maintaining boundaries"
      ];
    }

    // Trait breakdown
    const traitBreakdown = {
      narcissism: {
        level: narcissismScore >= 70 ? "High" : narcissismScore >= 50 ? "Moderate" : narcissismScore >= 30 ? "Low" : "Very Low",
        description: narcissismScore >= 70 ? "Strong sense of entitlement and need for admiration" :
                    narcissismScore >= 50 ? "Moderate self-focus and desire for recognition" :
                    narcissismScore >= 30 ? "Balanced self-esteem and modest self-view" :
                    "Very humble and modest approach to self"
      },
      machiavellianism: {
        level: machiavellianismScore >= 70 ? "High" : machiavellianismScore >= 50 ? "Moderate" : machiavellianismScore >= 30 ? "Low" : "Very Low",
        description: machiavellianismScore >= 70 ? "Highly strategic and manipulative in interactions" :
                    machiavellianismScore >= 50 ? "Moderately strategic in achieving goals" :
                    machiavellianismScore >= 30 ? "Generally honest and straightforward" :
                    "Very honest and trusting in relationships"
      },
      psychopathy: {
        level: psychopathyScore >= 70 ? "High" : psychopathyScore >= 50 ? "Moderate" : psychopathyScore >= 30 ? "Low" : "Very Low",
        description: psychopathyScore >= 70 ? "Reduced empathy and increased impulsivity" :
                    psychopathyScore >= 50 ? "Moderate emotional regulation and empathy" :
                    psychopathyScore >= 30 ? "Good emotional control and empathy" :
                    "Very high empathy and emotional stability"
      }
    };

    return {
      narcissismScore,
      machiavellianismScore,
      psychopathyScore,
      overallDarkScore,
      personalityType,
      description,
      analysis,
      recommendations,
      traitBreakdown
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Dark Triad Results</h1>
            <p className="text-gray-400">Analysis of narcissism, Machiavellianism, and psychopathy traits</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results Summary */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-purple-400" />
                  Your Dark Triad Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">{results.personalityType}</div>
                  <p className="text-gray-300">{results.description}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Dark Score</span>
                    <span className="text-lg font-bold text-purple-400">{results.overallDarkScore}%</span>
                  </div>
                  <Progress value={results.overallDarkScore} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-red-500/20 rounded-lg">
                      <div className="text-lg font-bold text-red-400">{results.narcissismScore}%</div>
                      <div className="text-xs text-gray-400">Narcissism</div>
                    </div>
                    <div className="p-3 bg-orange-500/20 rounded-lg">
                      <div className="text-lg font-bold text-orange-400">{results.machiavellianismScore}%</div>
                      <div className="text-xs text-gray-400">Machiavellianism</div>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <div className="text-lg font-bold text-yellow-400">{results.psychopathyScore}%</div>
                      <div className="text-xs text-gray-400">Psychopathy</div>
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

            {/* Trait Breakdown */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-green-400" />
                  Trait Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-red-400" />
                      <span className="font-medium text-red-400">Narcissism: {results.traitBreakdown.narcissism.level}</span>
                    </div>
                    <p className="text-sm text-gray-300">{results.traitBreakdown.narcissism.description}</p>
                  </div>
                  
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-orange-400" />
                      <span className="font-medium text-orange-400">Machiavellianism: {results.traitBreakdown.machiavellianism.level}</span>
                    </div>
                    <p className="text-sm text-gray-300">{results.traitBreakdown.machiavellianism.description}</p>
                  </div>
                  
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium text-yellow-400">Psychopathy: {results.traitBreakdown.psychopathy.level}</span>
                    </div>
                    <p className="text-sm text-gray-300">{results.traitBreakdown.psychopathy.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-6 w-6 text-blue-400" />
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
            <Button 
              onClick={() => {
                const text = `Dark Triad Test Results:\n${results.personalityType}\nOverall Score: ${results.overallDarkScore}%\nNarcissism: ${results.narcissismScore}%\nMachiavellianism: ${results.machiavellianismScore}%\nPsychopathy: ${results.psychopathyScore}%`;
                navigator.clipboard.writeText(text);
                alert('Results copied to clipboard!');
              }}
              variant="outline" 
              className="border-gray-600 hover:bg-gray-800"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
            <Button 
              onClick={() => {
                const report = `Dark Triad Test Report\n\n${results.personalityType}\n${results.description}\n\nScores:\n- Overall Dark Score: ${results.overallDarkScore}%\n- Narcissism: ${results.narcissismScore}%\n- Machiavellianism: ${results.machiavellianismScore}%\n- Psychopathy: ${results.psychopathyScore}%\n\nAnalysis:\n${results.analysis}\n\nRecommendations:\n${results.recommendations.map((rec, i) => `${i+1}. ${rec}`).join('\n')}`;
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'dark-triad-test-report.txt';
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dark Triad Test</h1>
          <p className="text-gray-400 mb-4">Measure narcissism, Machiavellianism, and psychopathy traits</p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{questions.length} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>8-12 minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <TestTube className="h-4 w-4" />
              <span>Scientific</span>
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
        <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-purple-400 mb-1">About the Dark Triad</p>
              <p>
                The Dark Triad consists of three personality traits: Narcissism (grandiosity and entitlement), 
                Machiavellianism (manipulation and strategic thinking), and Psychopathy (callousness and impulsivity). 
                This test measures these traits using validated psychological scales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 