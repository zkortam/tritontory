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
  Brain, 
  Eye, 
  TrendingUp, 
  BarChart3,
  Target,
  Clock,
  Shield,
  CheckCircle,
  Info,
  RotateCcw,
  Share2,
  Download,
  Users,
  Star,
  AlertCircle,
  BookOpen,
  TestTube,
  Heart,
  Zap,
  User,
  History,
  Award,
  Target as TargetIcon,
  AlertTriangle,
  UserCheck,
  Brain as BrainIcon,
  Lightbulb,
  Puzzle,
  Timer
} from "lucide-react";

interface MemoryTask {
  id: number;
  type: 'digit-span' | 'visual-memory' | 'pattern-recall' | 'word-list';
  title: string;
  description: string;
  data: any;
  answer: any;
  timeLimit: number; // in seconds
  difficulty: number;
}

interface Answer {
  taskId: number;
  userAnswer: any;
  isCorrect: boolean;
  timeSpent: number;
  score: number;
}

interface Results {
  totalScore: number;
  correctAnswers: number;
  totalTasks: number;
  averageTime: number;
  memoryType: string;
  percentile: number;
  breakdown: {
    digitSpan: { score: number; max: number };
    visualMemory: { score: number; max: number };
    patternRecall: { score: number; max: number };
    wordList: { score: number; max: number };
  };
  analysis: string;
  recommendations: string[];
}

export default function MemoryTest() {
  const [currentTask, setCurrentTask] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeCompleted, setTimeCompleted] = useState<Date | null>(null);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
  const [showData, setShowData] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);

  const memoryTasks: MemoryTask[] = [
    // Digit Span Tests
    {
      id: 1,
      type: 'digit-span',
      title: "Digit Span Forward",
      description: "Remember and repeat the sequence of numbers in order",
      data: "7-2-9-1-4",
      answer: "72914",
      timeLimit: 10,
      difficulty: 2
    },
    {
      id: 2,
      type: 'digit-span',
      title: "Digit Span Forward",
      description: "Remember and repeat the sequence of numbers in order",
      data: "3-8-5-2-7-1",
      answer: "385271",
      timeLimit: 12,
      difficulty: 3
    },
    {
      id: 3,
      type: 'digit-span',
      title: "Digit Span Forward",
      description: "Remember and repeat the sequence of numbers in order",
      data: "9-4-1-6-3-8-2",
      answer: "9416382",
      timeLimit: 15,
      difficulty: 4
    },
    {
      id: 4,
      type: 'digit-span',
      title: "Digit Span Backward",
      description: "Remember and repeat the sequence of numbers in reverse order",
      data: "5-2-8-1-4",
      answer: "41825",
      timeLimit: 12,
      difficulty: 4
    },
    {
      id: 5,
      type: 'digit-span',
      title: "Digit Span Backward",
      description: "Remember and repeat the sequence of numbers in reverse order",
      data: "7-3-9-2-6-1",
      answer: "162937",
      timeLimit: 15,
      difficulty: 5
    },
    
    // Visual Memory Tests
    {
      id: 6,
      type: 'visual-memory',
      title: "Visual Pattern Memory",
      description: "Remember the pattern of squares and reproduce it",
      data: [
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [1, 0, 1, 0],
        [0, 1, 0, 1]
      ],
      answer: [
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [1, 0, 1, 0],
        [0, 1, 0, 1]
      ],
      timeLimit: 8,
      difficulty: 3
    },
    {
      id: 7,
      type: 'visual-memory',
      title: "Visual Pattern Memory",
      description: "Remember the pattern of squares and reproduce it",
      data: [
        [1, 1, 0, 0],
        [0, 0, 1, 1],
        [1, 0, 1, 0],
        [0, 1, 0, 1]
      ],
      answer: [
        [1, 1, 0, 0],
        [0, 0, 1, 1],
        [1, 0, 1, 0],
        [0, 1, 0, 1]
      ],
      timeLimit: 10,
      difficulty: 4
    },
    
    // Pattern Recall Tests
    {
      id: 8,
      type: 'pattern-recall',
      title: "Symbol Sequence",
      description: "Remember the sequence of symbols",
      data: "★-●-■-▲-★",
      answer: "★●■▲★",
      timeLimit: 10,
      difficulty: 3
    },
    {
      id: 9,
      type: 'pattern-recall',
      title: "Symbol Sequence",
      description: "Remember the sequence of symbols",
      data: "▲-■-●-★-■-▲",
      answer: "▲■●★■▲",
      timeLimit: 12,
      difficulty: 4
    },
    
    // Word List Tests
    {
      id: 10,
      type: 'word-list',
      title: "Word List Memory",
      description: "Remember the list of words in order",
      data: ["Apple", "Book", "Cat", "Dog", "Elephant"],
      answer: ["Apple", "Book", "Cat", "Dog", "Elephant"],
      timeLimit: 15,
      difficulty: 3
    },
    {
      id: 11,
      type: 'word-list',
      title: "Word List Memory",
      description: "Remember the list of words in order",
      data: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"],
      answer: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"],
      timeLimit: 18,
      difficulty: 4
    },
    {
      id: 12,
      type: 'word-list',
      title: "Word List Memory",
      description: "Remember the list of words in order",
      data: ["House", "Car", "Tree", "Bird", "Sun", "Moon", "Star"],
      answer: ["House", "Car", "Tree", "Bird", "Sun", "Moon", "Star"],
      timeLimit: 20,
      difficulty: 5
    },
    
    // More Digit Span Tests
    {
      id: 13,
      type: 'digit-span',
      title: "Digit Span Forward",
      description: "Remember and repeat the sequence of numbers in order",
      data: "2-7-4-9-1-6-3-8",
      answer: "27491638",
      timeLimit: 18,
      difficulty: 5
    },
    {
      id: 14,
      type: 'digit-span',
      title: "Digit Span Backward",
      description: "Remember and repeat the sequence of numbers in reverse order",
      data: "8-3-1-5-9-2-7",
      answer: "7295183",
      timeLimit: 20,
      difficulty: 6
    },
    
    // More Visual Memory Tests
    {
      id: 15,
      type: 'visual-memory',
      title: "Visual Pattern Memory",
      description: "Remember the pattern of squares and reproduce it",
      data: [
        [1, 0, 0, 1],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 1, 1]
      ],
      answer: [
        [1, 0, 0, 1],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 1, 1]
      ],
      timeLimit: 12,
      difficulty: 5
    },
    
    // More Pattern Recall Tests
    {
      id: 16,
      type: 'pattern-recall',
      title: "Symbol Sequence",
      description: "Remember the sequence of symbols",
      data: "●-★-▲-■-●-★-▲",
      answer: "●★▲■●★▲",
      timeLimit: 15,
      difficulty: 5
    },
    
    // More Word List Tests
    {
      id: 17,
      type: 'word-list',
      title: "Word List Memory",
      description: "Remember the list of words in order",
      data: ["Ocean", "Mountain", "Forest", "River", "Desert", "Island", "Valley", "Beach"],
      answer: ["Ocean", "Mountain", "Forest", "River", "Desert", "Island", "Valley", "Beach"],
      timeLimit: 25,
      difficulty: 6
    },
    
    // Final challenging tests
    {
      id: 18,
      type: 'digit-span',
      title: "Digit Span Forward",
      description: "Remember and repeat the sequence of numbers in order",
      data: "1-9-4-7-3-8-2-5-6",
      answer: "194738256",
      timeLimit: 20,
      difficulty: 7
    },
    {
      id: 19,
      type: 'visual-memory',
      title: "Visual Pattern Memory",
      description: "Remember the pattern of squares and reproduce it",
      data: [
        [1, 1, 0, 1],
        [0, 1, 1, 0],
        [1, 0, 1, 1],
        [0, 1, 0, 1]
      ],
      answer: [
        [1, 1, 0, 1],
        [0, 1, 1, 0],
        [1, 0, 1, 1],
        [0, 1, 0, 1]
      ],
      timeLimit: 15,
      difficulty: 6
    },
    {
      id: 20,
      type: 'pattern-recall',
      title: "Symbol Sequence",
      description: "Remember the sequence of symbols",
      data: "★-▲-●-■-★-▲-●-■",
      answer: "★▲●■★▲●■",
      timeLimit: 18,
      difficulty: 6
    }
  ];

  useEffect(() => {
    if (!timeStarted) {
      setTimeStarted(new Date());
    }
    setTaskStartTime(new Date());
    setShowData(true);
    setUserInput("");
    
    // Auto-hide data after time limit
    const timer = setTimeout(() => {
      setShowData(false);
    }, memoryTasks[currentTask].timeLimit * 1000);
    
    return () => clearTimeout(timer);
  }, [currentTask, timeStarted]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = () => {
    const endTime = new Date();
    const timeSpent = taskStartTime ? (endTime.getTime() - taskStartTime.getTime()) / 1000 : 0;
    
    let isCorrect = false;
    let score = 0;
    
    const task = memoryTasks[currentTask];
    
    if (task.type === 'visual-memory') {
      // For visual memory, check if the pattern matches
      const userPattern = userInput.split('\n').map(row => row.split('').map(cell => cell === '1' ? 1 : 0));
      isCorrect = JSON.stringify(userPattern) === JSON.stringify(task.answer);
    } else if (task.type === 'word-list') {
      // For word lists, check if words are in correct order
      const userWords = userInput.split(',').map(word => word.trim());
      isCorrect = JSON.stringify(userWords) === JSON.stringify(task.answer);
    } else {
      // For digit span and pattern recall
      isCorrect = userInput.replace(/[^0-9★●■▲]/g, '') === task.answer.replace(/[^0-9★●■▲]/g, '');
    }
    
    // Calculate score based on accuracy and speed
    if (isCorrect) {
      score = Math.max(1, Math.round((task.timeLimit - timeSpent) / task.timeLimit * 10));
    }
    
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.taskId === task.id);
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = { taskId: task.id, userAnswer: userInput, isCorrect, timeSpent, score };
    } else {
      newAnswers.push({ taskId: task.id, userAnswer: userInput, isCorrect, timeSpent, score });
    }
    
    setAnswers(newAnswers);
    setUserInput("");
    
    if (currentTask < memoryTasks.length - 1) {
      setCurrentTask(currentTask + 1);
    } else {
      handleFinish();
    }
  };

  const nextTask = () => {
    if (currentTask < memoryTasks.length - 1) {
      setCurrentTask(currentTask + 1);
    }
  };

  const previousTask = () => {
    if (currentTask > 0) {
      setCurrentTask(currentTask - 1);
    }
  };

  const calculateResults = (): Results => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalTasks = memoryTasks.length;
    const totalScore = Math.round(answers.reduce((sum, a) => sum + a.score, 0) / totalTasks);
    const averageTime = Math.round(answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length);
    
    // Calculate percentile
    let percentile = 50;
    if (totalScore >= 8) percentile = 95;
    else if (totalScore >= 7) percentile = 85;
    else if (totalScore >= 6) percentile = 70;
    else if (totalScore >= 5) percentile = 50;
    else if (totalScore >= 4) percentile = 30;
    else if (totalScore >= 3) percentile = 15;
    else percentile = 5;
    
    // Determine memory type
    let memoryType = "";
    if (totalScore >= 8) memoryType = "Exceptional";
    else if (totalScore >= 7) memoryType = "Excellent";
    else if (totalScore >= 6) memoryType = "Good";
    else if (totalScore >= 5) memoryType = "Average";
    else if (totalScore >= 4) memoryType = "Below Average";
    else memoryType = "Poor";
    
    // Calculate breakdown by type
    const breakdown = {
      digitSpan: { score: 0, max: 0 },
      visualMemory: { score: 0, max: 0 },
      patternRecall: { score: 0, max: 0 },
      wordList: { score: 0, max: 0 }
    };
    
    memoryTasks.forEach(task => {
      const answer = answers.find(a => a.taskId === task.id);
      if (answer) {
        breakdown[task.type].max++;
        if (answer.isCorrect) {
          breakdown[task.type].score++;
        }
      }
    });
    
    const analysis = `You achieved a memory score of ${totalScore}/10, placing you in the ${memoryType} range (${percentile}th percentile). You correctly completed ${correctAnswers} out of ${totalTasks} memory tasks with an average response time of ${averageTime} seconds.`;
    
    const recommendations = [
      "Practice chunking information into smaller groups to improve digit span",
      "Use visualization techniques to enhance visual memory",
      "Create associations and stories to improve word list recall",
      "Practice regularly with memory games and exercises"
    ];
    
    return {
      totalScore,
      correctAnswers,
      totalTasks,
      averageTime,
      memoryType,
      percentile,
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

  const currentAnswer = answers.find(a => a.taskId === memoryTasks[currentTask].id);
  const progress = ((currentTask + 1) / memoryTasks.length) * 100;
  const isLastTask = currentTask === memoryTasks.length - 1;

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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Memory Test Results</h1>
            <p className="text-gray-400">Evaluation of short-term and working memory</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results Summary */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-green-400" />
                  Your Memory Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">{results.totalScore}/10</div>
                  <div className="text-lg text-gray-300 mb-2">{results.memoryType} Memory</div>
                  <p className="text-sm text-gray-400">{results.percentile}th percentile</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Score</span>
                    <span className="text-lg font-bold text-green-400">{results.totalScore}/10</span>
                  </div>
                  <Progress value={results.totalScore * 10} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <div className="text-lg font-bold text-green-400">{results.correctAnswers}/{results.totalTasks}</div>
                      <div className="text-xs text-gray-400">Correct Tasks</div>
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
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                  Memory Type Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Digit Span</span>
                      <span>{results.breakdown.digitSpan.score}/{results.breakdown.digitSpan.max}</span>
                    </div>
                    <Progress value={(results.breakdown.digitSpan.score / results.breakdown.digitSpan.max) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Visual Memory</span>
                      <span>{results.breakdown.visualMemory.score}/{results.breakdown.visualMemory.max}</span>
                    </div>
                    <Progress value={(results.breakdown.visualMemory.score / results.breakdown.visualMemory.max) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pattern Recall</span>
                      <span>{results.breakdown.patternRecall.score}/{results.breakdown.patternRecall.max}</span>
                    </div>
                    <Progress value={(results.breakdown.patternRecall.score / results.breakdown.patternRecall.max) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Word List</span>
                      <span>{results.breakdown.wordList.score}/{results.breakdown.wordList.max}</span>
                    </div>
                    <Progress value={(results.breakdown.wordList.score / results.breakdown.wordList.max) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-purple-400" />
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
                setCurrentTask(0);
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
                const text = `Memory Test Results:\nScore: ${results.totalScore}/10\nMemory Type: ${results.memoryType}\nPercentile: ${results.percentile}th\nCorrect: ${results.correctAnswers}/${results.totalTasks}\nAvg Time: ${results.averageTime}s`;
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
                const report = `Memory Test Report\n\nScore: ${results.totalScore}/10\nMemory Type: ${results.memoryType}\nPercentile: ${results.percentile}th\n\nPerformance:\n- Correct Tasks: ${results.correctAnswers}/${results.totalTasks}\n- Average Time: ${results.averageTime} seconds\n\nBreakdown:\n- Digit Span: ${results.breakdown.digitSpan.score}/${results.breakdown.digitSpan.max}\n- Visual Memory: ${results.breakdown.visualMemory.score}/${results.breakdown.visualMemory.max}\n- Pattern Recall: ${results.breakdown.patternRecall.score}/${results.breakdown.patternRecall.max}\n- Word List: ${results.breakdown.wordList.score}/${results.breakdown.wordList.max}\n\nAnalysis:\n${results.analysis}\n\nRecommendations:\n${results.recommendations.map((rec, i) => `${i+1}. ${rec}`).join('\n')}`;
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'memory-test-report.txt';
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

  const currentTaskData = memoryTasks[currentTask];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/playground" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Playground
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Memory Test</h1>
          <p className="text-gray-400 mb-4">Evaluate your short-term and working memory</p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{memoryTasks.length} tasks</span>
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
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Task {currentTask + 1} of {memoryTasks.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Task Card */}
        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mb-8">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-green-500/90 text-white text-xs">
                  {currentTaskData.type.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Difficulty: {currentTaskData.difficulty}/7
                </Badge>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2">{currentTaskData.title}</h2>
              <p className="text-gray-400 mb-4">{currentTaskData.description}</p>
            </div>

            {/* Display Data */}
            {showData && (
              <div className="mb-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4 text-blue-400">Remember This:</h3>
                  
                  {currentTaskData.type === 'visual-memory' ? (
                    <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                      {currentTaskData.data.map((row: number[], rowIndex: number) => (
                        row.map((cell: number, colIndex: number) => (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-12 h-12 border-2 border-gray-600 ${
                              cell === 1 ? 'bg-white' : 'bg-gray-800'
                            }`}
                          />
                        ))
                      ))}
                    </div>
                  ) : currentTaskData.type === 'word-list' ? (
                    <div className="space-y-2">
                      {currentTaskData.data.map((word: string, index: number) => (
                        <div key={index} className="text-lg font-medium">
                          {index + 1}. {word}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-blue-400">
                      {currentTaskData.data}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Input Section */}
            {!showData && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Your Answer:</h3>
                
                {currentTaskData.type === 'visual-memory' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400">Enter 1 for filled squares, 0 for empty squares (4 rows, 4 columns):</p>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Example:&#10;1001&#10;0110&#10;1001&#10;0110"
                      className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none"
                    />
                  </div>
                ) : currentTaskData.type === 'word-list' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400">Enter the words in order, separated by commas:</p>
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="word1, word2, word3, ..."
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400">Enter your answer:</p>
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Enter your answer here..."
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-center text-xl"
                    />
                  </div>
                )}
                
                <Button
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Answer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-green-400 mb-1">About This Memory Test</p>
              <p>
                This test evaluates different types of memory: digit span (number sequences), visual memory (patterns), 
                pattern recall (symbols), and word list memory. Each task has a time limit for memorization, 
                after which you'll need to recall the information accurately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 