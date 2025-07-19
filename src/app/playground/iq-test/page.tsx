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
  Calculator, 
  Brain, 
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  Info,
  RotateCcw,
  Share2,
  Download,
  TestTube,
  Lightbulb
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  type: 'logical' | 'mathematical' | 'spatial' | 'verbal' | 'pattern';
  difficulty: number; // 1-5
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Answer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

interface Results {
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  averageTime: number;
  iqEstimate: number;
  percentile: number;
  category: string;
  breakdown: {
    logical: { score: number; total: number };
    mathematical: { score: number; total: number };
    spatial: { score: number; total: number };
    verbal: { score: number; total: number };
    pattern: { score: number; total: number };
  };
  analysis: string;
  recommendations: string[];
}

export default function IQTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeCompleted, setTimeCompleted] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);

  const questions: Question[] = [
    // Logical Reasoning
    {
      id: 1,
      text: "If all roses are flowers and some flowers are red, which statement is definitely true?",
      type: 'logical',
      difficulty: 2,
      options: [
        "All roses are red",
        "Some roses are red",
        "All red things are roses",
        "None of the above"
      ],
      correctAnswer: 1,
      explanation: "If all roses are flowers and some flowers are red, then some roses could be red, but we can't be certain that all roses are red."
    },
    {
      id: 2,
      text: "Complete the sequence: 2, 6, 12, 20, 30, ?",
      type: 'pattern',
      difficulty: 3,
      options: ["40", "42", "44", "46"],
      correctAnswer: 1,
      explanation: "The difference between consecutive terms increases by 2: +4, +6, +8, +10, +12. So 30 + 12 = 42."
    },
    {
      id: 3,
      text: "If A=1, B=2, C=3, what does CAB equal?",
      type: 'mathematical',
      difficulty: 2,
      options: ["123", "312", "321", "213"],
      correctAnswer: 2,
      explanation: "C=3, A=1, B=2, so CAB = 312."
    },
    {
      id: 4,
      text: "Which word doesn't belong: Apple, Banana, Carrot, Orange?",
      type: 'verbal',
      difficulty: 1,
      options: ["Apple", "Banana", "Carrot", "Orange"],
      correctAnswer: 2,
      explanation: "Carrot is a vegetable, while the others are fruits."
    },
    {
      id: 5,
      text: "If 3 workers can complete a task in 6 days, how many days will it take 2 workers?",
      type: 'mathematical',
      difficulty: 3,
      options: ["4 days", "6 days", "9 days", "12 days"],
      correctAnswer: 2,
      explanation: "If 3 workers take 6 days, then 1 worker would take 18 days. So 2 workers would take 18/2 = 9 days."
    },
    {
      id: 6,
      text: "Which figure comes next in the pattern: ▲, ■, ●, ▲, ■, ?",
      type: 'pattern',
      difficulty: 2,
      options: ["▲", "■", "●", "◆"],
      correctAnswer: 2,
      explanation: "The pattern repeats: ▲, ■, ●. So the next figure is ●."
    },
    {
      id: 7,
      text: "If all scientists are researchers and some researchers are professors, then:",
      type: 'logical',
      difficulty: 3,
      options: [
        "All scientists are professors",
        "Some scientists are professors",
        "All professors are scientists",
        "None of the above"
      ],
      correctAnswer: 1,
      explanation: "If all scientists are researchers and some researchers are professors, then some scientists could be professors."
    },
    {
      id: 8,
      text: "What is the missing number: 8, 16, 32, 64, ?",
      type: 'pattern',
      difficulty: 2,
      options: ["96", "128", "256", "512"],
      correctAnswer: 1,
      explanation: "Each number is multiplied by 2: 8×2=16, 16×2=32, 32×2=64, 64×2=128."
    },
    {
      id: 9,
      text: "Which word is most similar to 'Eloquent':",
      type: 'verbal',
      difficulty: 3,
      options: ["Quiet", "Articulate", "Fast", "Loud"],
      correctAnswer: 1,
      explanation: "Eloquent means fluent or persuasive in speech, similar to articulate."
    },
    {
      id: 10,
      text: "If a rectangle has a perimeter of 20 and an area of 24, what are its dimensions?",
      type: 'mathematical',
      difficulty: 4,
      options: ["3×8", "4×6", "2×12", "5×4.8"],
      correctAnswer: 1,
      explanation: "4×6 = 24 (area) and 2(4+6) = 20 (perimeter)."
    },
    {
      id: 11,
      text: "Complete: If P then Q. Not Q. Therefore:",
      type: 'logical',
      difficulty: 4,
      options: ["P", "Not P", "Q", "Not Q"],
      correctAnswer: 1,
      explanation: "This is modus tollens: If P then Q, Not Q, therefore Not P."
    },
    {
      id: 12,
      text: "Which number comes next: 1, 3, 6, 10, 15, ?",
      type: 'pattern',
      difficulty: 3,
      options: ["18", "20", "21", "25"],
      correctAnswer: 2,
      explanation: "The differences increase by 1: +2, +3, +4, +5, +6. So 15 + 6 = 21."
    },
    {
      id: 13,
      text: "If 'Fast' is to 'Slow' as 'Hot' is to:",
      type: 'verbal',
      difficulty: 2,
      options: ["Warm", "Cold", "Temperature", "Weather"],
      correctAnswer: 1,
      explanation: "Fast is the opposite of Slow, so Hot is the opposite of Cold."
    },
    {
      id: 14,
      text: "A cube has 6 faces. How many edges does it have?",
      type: 'spatial',
      difficulty: 3,
      options: ["8", "12", "16", "24"],
      correctAnswer: 1,
      explanation: "A cube has 12 edges: 4 on top, 4 on bottom, and 4 connecting them."
    },
    {
      id: 15,
      text: "If 2x + 3y = 12 and x + y = 5, what is x?",
      type: 'mathematical',
      difficulty: 4,
      options: ["2", "3", "4", "5"],
      correctAnswer: 1,
      explanation: "From x + y = 5, y = 5 - x. Substitute: 2x + 3(5-x) = 12. 2x + 15 - 3x = 12. -x = -3, so x = 3."
    },
    {
      id: 16,
      text: "Which shape would complete the pattern: ○, □, △, ○, □, ?",
      type: 'pattern',
      difficulty: 2,
      options: ["○", "□", "△", "◇"],
      correctAnswer: 2,
      explanation: "The pattern repeats: ○, □, △. So the next shape is △."
    },
    {
      id: 17,
      text: "If all doctors are professionals and some professionals are teachers, then:",
      type: 'logical',
      difficulty: 3,
      options: [
        "All doctors are teachers",
        "Some doctors are teachers",
        "All teachers are doctors",
        "None of the above"
      ],
      correctAnswer: 1,
      explanation: "If all doctors are professionals and some professionals are teachers, then some doctors could be teachers."
    },
    {
      id: 18,
      text: "What is the sum of the first 10 odd numbers?",
      type: 'mathematical',
      difficulty: 4,
      options: ["45", "55", "100", "110"],
      correctAnswer: 2,
      explanation: "First 10 odd numbers: 1,3,5,7,9,11,13,15,17,19. Sum = 100."
    },
    {
      id: 19,
      text: "Which word means the opposite of 'Concise':",
      type: 'verbal',
      difficulty: 3,
      options: ["Brief", "Verbose", "Clear", "Simple"],
      correctAnswer: 1,
      explanation: "Concise means brief and to the point, so the opposite is verbose (wordy)."
    },
    {
      id: 20,
      text: "If you fold a piece of paper in half 3 times, how many layers will you have?",
      type: 'spatial',
      difficulty: 3,
      options: ["3", "6", "8", "9"],
      correctAnswer: 2,
      explanation: "Each fold doubles the layers: 1→2→4→8. So 3 folds = 8 layers."
    },
    {
      id: 21,
      text: "Complete the sequence: 1, 4, 9, 16, 25, ?",
      type: 'pattern',
      difficulty: 2,
      options: ["30", "36", "49", "64"],
      correctAnswer: 1,
      explanation: "These are perfect squares: 1², 2², 3², 4², 5², so next is 6² = 36."
    },
    {
      id: 22,
      text: "If 'Light' is to 'Dark' as 'Day' is to:",
      type: 'verbal',
      difficulty: 2,
      options: ["Night", "Sun", "Time", "Bright"],
      correctAnswer: 0,
      explanation: "Light is the opposite of Dark, so Day is the opposite of Night."
    },
    {
      id: 23,
      text: "A triangle has angles of 45°, 45°, and 90°. What type of triangle is it?",
      type: 'spatial',
      difficulty: 3,
      options: ["Equilateral", "Isosceles", "Scalene", "Obtuse"],
      correctAnswer: 1,
      explanation: "An isosceles right triangle has two equal angles (45°) and one right angle (90°)."
    },
    {
      id: 24,
      text: "If 3x = 27, what is x?",
      type: 'mathematical',
      difficulty: 2,
      options: ["6", "7", "8", "9"],
      correctAnswer: 3,
      explanation: "3x = 27, so x = 27/3 = 9."
    },
    {
      id: 25,
      text: "Which figure would come next: ⬜, ⬛, ⬜, ⬛, ⬜, ?",
      type: 'pattern',
      difficulty: 1,
      options: ["⬜", "⬛", "⬜⬛", "⬛⬜"],
      correctAnswer: 1,
      explanation: "The pattern alternates: ⬜, ⬛, ⬜, ⬛, ⬜, so next is ⬛."
    }
  ];

  useEffect(() => {
    if (!timeStarted) {
      setTimeStarted(new Date());
    }
    setQuestionStartTime(new Date());
  }, [currentQuestion, timeStarted]);

  const handleAnswer = (selectedAnswer: number) => {
    const endTime = new Date();
    const timeSpent = questionStartTime ? (endTime.getTime() - questionStartTime.getTime()) / 1000 : 0;
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionId === questions[currentQuestion].id);
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = { questionId: questions[currentQuestion].id, selectedAnswer, isCorrect, timeSpent };
    } else {
      newAnswers.push({ questionId: questions[currentQuestion].id, selectedAnswer, isCorrect, timeSpent });
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
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalQuestions = questions.length;
    const totalScore = Math.round((correctAnswers / totalQuestions) * 100);
    const averageTime = Math.round(answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length);
    
    // Calculate IQ estimate (simplified)
    const iqEstimate = Math.round(100 + (totalScore - 50) * 2);
    
    // Calculate percentile
    let percentile = 50;
    if (totalScore >= 90) percentile = 95;
    else if (totalScore >= 80) percentile = 85;
    else if (totalScore >= 70) percentile = 70;
    else if (totalScore >= 60) percentile = 50;
    else if (totalScore >= 50) percentile = 30;
    else if (totalScore >= 40) percentile = 15;
    else percentile = 5;
    
    // Determine category
    let category = "";
    if (iqEstimate >= 130) category = "Very Superior";
    else if (iqEstimate >= 120) category = "Superior";
    else if (iqEstimate >= 110) category = "Above Average";
    else if (iqEstimate >= 90) category = "Average";
    else if (iqEstimate >= 80) category = "Below Average";
    else category = "Low";
    
    // Calculate breakdown by type
    const breakdown = {
      logical: { score: 0, total: 0 },
      mathematical: { score: 0, total: 0 },
      spatial: { score: 0, total: 0 },
      verbal: { score: 0, total: 0 },
      pattern: { score: 0, total: 0 }
    };
    
    questions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id);
      if (answer) {
        breakdown[question.type].total++;
        if (answer.isCorrect) {
          breakdown[question.type].score++;
        }
      }
    });
    
    const analysis = `You scored ${totalScore}% on this IQ assessment, which corresponds to an estimated IQ of ${iqEstimate}. This places you in the ${category} range (${percentile}th percentile). Your performance shows ${correctAnswers} correct answers out of ${totalQuestions} questions, with an average response time of ${averageTime} seconds per question.`;
    
    const recommendations = [
      "Practice pattern recognition exercises to improve spatial reasoning",
      "Read challenging material to enhance verbal comprehension",
      "Solve mathematical puzzles to strengthen logical thinking",
      "Take timed practice tests to improve speed and accuracy"
    ];
    
    return {
      totalScore,
      correctAnswers,
      totalQuestions,
      averageTime,
      iqEstimate,
      percentile,
      category,
      breakdown,
      analysis,
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">IQ Assessment Results</h1>
            <p className="text-gray-400">Comprehensive intelligence quotient measurement</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results Summary */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-blue-400" />
                  Your IQ Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{results.iqEstimate}</div>
                  <div className="text-lg text-gray-300 mb-2">{results.category}</div>
                  <p className="text-sm text-gray-400">{results.percentile}th percentile</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Score</span>
                    <span className="text-lg font-bold text-green-400">{results.totalScore}%</span>
                  </div>
                  <Progress value={results.totalScore} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <div className="text-lg font-bold text-green-400">{results.correctAnswers}/{results.totalQuestions}</div>
                      <div className="text-xs text-gray-400">Correct Answers</div>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-400">{results.averageTime}s</div>
                      <div className="text-xs text-gray-400">Avg Time</div>
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

            {/* Breakdown */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-green-400" />
                  Performance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(results.breakdown).map(([type, data]) => (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{type}</span>
                        <span>{data.score}/{data.total}</span>
                      </div>
                      <Progress value={(data.score / data.total) * 100} className="h-2" />
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
                <Brain className="h-6 w-6 text-purple-400" />
                Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{results.analysis}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                const text = `IQ Test Results:\nEstimated IQ: ${results.iqEstimate}\nCategory: ${results.category}\nPercentile: ${results.percentile}th\nScore: ${results.totalScore}%\nCorrect: ${results.correctAnswers}/${results.totalQuestions}`;
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
                const report = `IQ Assessment Report\n\nEstimated IQ: ${results.iqEstimate}\nCategory: ${results.category}\nPercentile: ${results.percentile}th\n\nPerformance:\n- Overall Score: ${results.totalScore}%\n- Correct Answers: ${results.correctAnswers}/${results.totalQuestions}\n- Average Time: ${results.averageTime} seconds\n\nAnalysis:\n${results.analysis}\n\nRecommendations:\n${results.recommendations.map((rec, i) => `${i+1}. ${rec}`).join('\n')}`;
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'iq-test-report.txt';
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">IQ Assessment</h1>
          <p className="text-gray-400 mb-4">Comprehensive intelligence quotient measurement</p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{questions.length} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>15-20 minutes</span>
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
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-blue-500/90 text-white text-xs">
                  {questions[currentQuestion].type.charAt(0).toUpperCase() + questions[currentQuestion].type.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Difficulty: {questions[currentQuestion].difficulty}/5
                </Badge>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-4 leading-relaxed">
                {questions[currentQuestion].text}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    currentAnswer?.selectedAnswer === index
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      currentAnswer?.selectedAnswer === index ? 'bg-blue-500 ring-2 ring-white' : 'bg-gray-600'
                    }`}></div>
                    <span className="font-medium">{String.fromCharCode(65 + index)}. {option}</span>
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
              <p className="font-medium text-blue-400 mb-1">About This IQ Test</p>
              <p>
                This test measures various cognitive abilities including logical reasoning, mathematical skills, 
                pattern recognition, verbal comprehension, and spatial awareness. The results provide an estimate 
                of your cognitive abilities relative to the general population.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 