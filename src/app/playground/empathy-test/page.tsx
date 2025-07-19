"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Heart, 
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
  Lightbulb,
  Smile,
  Frown
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  type: 'cognitive' | 'affective' | 'compassionate';
  weight: number;
  reverse: boolean;
}

interface Answer {
  questionId: number;
  value: number; // 1-5 scale: 1 = Strongly Disagree, 5 = Strongly Agree
}

interface Results {
  cognitiveEmpathy: number; // 0-100
  affectiveEmpathy: number; // 0-100
  compassionateEmpathy: number; // 0-100
  overallEmpathy: number; // 0-100
  empathyLevel: string;
  description: string;
  analysis: string;
  recommendations: string[];
  strengths: string[];
  areasForGrowth: string[];
}

export default function EmpathyTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeCompleted, setTimeCompleted] = useState<Date | null>(null);

  const questions: Question[] = [
    // Cognitive Empathy (Understanding others' perspectives)
    { id: 1, text: "I can easily understand what someone else is thinking", type: 'cognitive', weight: 1, reverse: false },
    { id: 2, text: "I find it difficult to see things from other people's point of view", type: 'cognitive', weight: 1, reverse: true },
    { id: 3, text: "I can usually tell when someone is lying to me", type: 'cognitive', weight: 1, reverse: false },
    { id: 4, text: "I often misunderstand what others are trying to tell me", type: 'cognitive', weight: 1, reverse: true },
    { id: 5, text: "I can read people's emotions from their facial expressions", type: 'cognitive', weight: 1, reverse: false },
    { id: 6, text: "I struggle to understand why people feel the way they do", type: 'cognitive', weight: 1, reverse: true },
    
    // Affective Empathy (Feeling others' emotions)
    { id: 7, text: "When someone is happy, I feel happy too", type: 'affective', weight: 1, reverse: false },
    { id: 8, text: "I get upset when I see someone else crying", type: 'affective', weight: 1, reverse: false },
    { id: 9, text: "I can remain emotionally detached from other people's problems", type: 'affective', weight: 1, reverse: true },
    { id: 10, text: "I feel anxious when someone around me is anxious", type: 'affective', weight: 1, reverse: false },
    { id: 11, text: "I can easily ignore other people's emotional states", type: 'affective', weight: 1, reverse: true },
    { id: 12, text: "I feel sad when I see someone else suffering", type: 'affective', weight: 1, reverse: false },
    
    // Compassionate Empathy (Taking action to help)
    { id: 13, text: "I often go out of my way to help others", type: 'compassionate', weight: 1, reverse: false },
    { id: 14, text: "I prefer to avoid getting involved in other people's problems", type: 'compassionate', weight: 1, reverse: true },
    { id: 15, text: "I volunteer my time to help those in need", type: 'compassionate', weight: 1, reverse: false },
    { id: 16, text: "I feel responsible for helping others when they're struggling", type: 'compassionate', weight: 1, reverse: false },
    { id: 17, text: "I would rather focus on my own problems than help others", type: 'compassionate', weight: 1, reverse: true },
    { id: 18, text: "I actively try to make the world a better place", type: 'compassionate', weight: 1, reverse: false }
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
    // Calculate scores for each empathy type
    const typeScores: { [key: string]: number[] } = {
      cognitive: [],
      affective: [],
      compassionate: []
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
        typeScores[question.type].push(normalizedValue * question.weight);
      }
    });

    const cognitiveEmpathy = Math.round(typeScores.cognitive.reduce((a, b) => a + b, 0) / typeScores.cognitive.length);
    const affectiveEmpathy = Math.round(typeScores.affective.reduce((a, b) => a + b, 0) / typeScores.affective.length);
    const compassionateEmpathy = Math.round(typeScores.compassionate.reduce((a, b) => a + b, 0) / typeScores.compassionate.length);
    
    const overallEmpathy = Math.round((cognitiveEmpathy + affectiveEmpathy + compassionateEmpathy) / 3);

    // Determine empathy level and analysis
    let empathyLevel = "";
    let description = "";
    let analysis = "";
    let recommendations: string[] = [];
    let strengths: string[] = [];
    let areasForGrowth: string[] = [];

    if (overallEmpathy >= 80) {
      empathyLevel = "Highly Empathetic";
      description = "You show exceptional levels of empathy across all dimensions. You are deeply attuned to others' emotions and actively work to help them.";
      analysis = "Your high empathy scores indicate strong emotional intelligence and social awareness. You likely have excellent interpersonal relationships and are seen as caring and supportive by others.";
      strengths = [
        "Excellent emotional understanding",
        "Strong compassion and helping behavior",
        "High social awareness"
      ];
      areasForGrowth = [
        "Maintain healthy boundaries",
        "Practice self-care to avoid empathy fatigue",
        "Channel empathy into effective action"
      ];
      recommendations = [
        "Use your empathy to mentor and support others",
        "Consider careers in helping professions",
        "Practice self-care to maintain your emotional well-being"
      ];
    } else if (overallEmpathy >= 65) {
      empathyLevel = "Moderately Empathetic";
      description = "You show good levels of empathy and generally understand and care about others' feelings and experiences.";
      analysis = "Your moderate empathy scores suggest you have solid emotional intelligence and are generally good at understanding others. You may excel in some areas while having room for growth in others.";
      strengths = [
        "Good emotional understanding",
        "Generally caring attitude",
        "Some helping behaviors"
      ];
      areasForGrowth = [
        "Practice active listening",
        "Develop deeper emotional connections",
        "Increase helping behaviors"
      ];
      recommendations = [
        "Practice active listening in conversations",
        "Volunteer to develop compassion skills",
        "Read literature to understand diverse perspectives"
      ];
    } else if (overallEmpathy >= 50) {
      empathyLevel = "Average Empathy";
      description = "You show typical levels of empathy. You can understand others' feelings but may not always act on that understanding.";
      analysis = "Your average empathy scores indicate you have basic emotional intelligence but may benefit from developing deeper empathy skills. You likely have some good relationships but could improve others.";
      strengths = [
        "Basic emotional understanding",
        "Some perspective-taking ability",
        "Room for growth"
      ];
      areasForGrowth = [
        "Practice perspective-taking exercises",
        "Develop emotional awareness",
        "Increase helping behaviors"
      ];
      recommendations = [
        "Practice putting yourself in others' shoes",
        "Ask more questions about others' feelings",
        "Try volunteering or community service"
      ];
    } else if (overallEmpathy >= 35) {
      empathyLevel = "Below Average Empathy";
      description = "You may struggle to understand or connect with others' emotions. This could affect your relationships and social interactions.";
      analysis = "Your below-average empathy scores suggest you may have difficulty understanding others' perspectives and emotions. This could lead to misunderstandings and strained relationships.";
      strengths = [
        "Potential for growth",
        "Self-awareness of limitations"
      ];
      areasForGrowth = [
        "Learn to recognize emotions in others",
        "Practice active listening",
        "Develop perspective-taking skills"
      ];
      recommendations = [
        "Work with a therapist or counselor",
        "Practice mindfulness and emotional awareness",
        "Read books about emotional intelligence"
      ];
    } else {
      empathyLevel = "Low Empathy";
      description = "You show very low levels of empathy, which may significantly impact your relationships and social interactions.";
      analysis = "Your low empathy scores indicate significant challenges in understanding and responding to others' emotions. This may lead to difficulties in relationships and social situations.";
      strengths = [
        "Honest self-assessment",
        "Potential for improvement"
      ];
      areasForGrowth = [
        "Develop basic emotional recognition",
        "Learn social skills",
        "Practice perspective-taking"
      ];
      recommendations = [
        "Seek professional help from a therapist",
        "Practice basic social skills",
        "Learn about emotional intelligence"
      ];
    }

    return {
      cognitiveEmpathy,
      affectiveEmpathy,
      compassionateEmpathy,
      overallEmpathy,
      empathyLevel,
      description,
      analysis,
      recommendations,
      strengths,
      areasForGrowth
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Empathy Test Results</h1>
            <p className="text-gray-400">Analysis of your emotional intelligence and empathy levels</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results Summary */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-pink-400" />
                  Your Empathy Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400 mb-2">{results.empathyLevel}</div>
                  <p className="text-gray-300">{results.description}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Empathy</span>
                    <span className="text-lg font-bold text-pink-400">{results.overallEmpathy}%</span>
                  </div>
                  <Progress value={results.overallEmpathy} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-400">{results.cognitiveEmpathy}%</div>
                      <div className="text-xs text-gray-400">Cognitive</div>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <div className="text-lg font-bold text-green-400">{results.affectiveEmpathy}%</div>
                      <div className="text-xs text-gray-400">Affective</div>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <div className="text-lg font-bold text-purple-400">{results.compassionateEmpathy}%</div>
                      <div className="text-xs text-gray-400">Compassionate</div>
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

            {/* Strengths and Growth Areas */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-400" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
                      <Smile className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {results.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-orange-400 mb-2 flex items-center gap-2">
                      <Frown className="h-4 w-4" />
                      Areas for Growth
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {results.areasForGrowth.map((area, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-400" />
                Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{results.analysis}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-400" />
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
                const text = `Empathy Test Results:\n${results.empathyLevel}\nOverall Empathy: ${results.overallEmpathy}%\nCognitive: ${results.cognitiveEmpathy}%\nAffective: ${results.affectiveEmpathy}%\nCompassionate: ${results.compassionateEmpathy}%`;
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
                const report = `Empathy Test Report\n\n${results.empathyLevel}\n${results.description}\n\nScores:\n- Overall Empathy: ${results.overallEmpathy}%\n- Cognitive Empathy: ${results.cognitiveEmpathy}%\n- Affective Empathy: ${results.affectiveEmpathy}%\n- Compassionate Empathy: ${results.compassionateEmpathy}%\n\nAnalysis:\n${results.analysis}\n\nStrengths:\n${results.strengths.map((strength, i) => `${i+1}. ${strength}`).join('\n')}\n\nAreas for Growth:\n${results.areasForGrowth.map((area, i) => `${i+1}. ${area}`).join('\n')}\n\nRecommendations:\n${results.recommendations.map((rec, i) => `${i+1}. ${rec}`).join('\n')}`;
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'empathy-test-report.txt';
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Empathy Test</h1>
          <p className="text-gray-400 mb-4">Measure your emotional intelligence and empathy levels</p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{questions.length} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>5-8 minutes</span>
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
        <div className="mt-8 p-4 bg-pink-500/10 border border-pink-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-pink-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-pink-400 mb-1">About Empathy</p>
              <p>
                This test measures three types of empathy: Cognitive (understanding others&apos; thoughts), 
                Affective (feeling others&apos; emotions), and Compassionate (taking action to help). 
                Empathy is a key component of emotional intelligence and social relationships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 