"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Smartphone,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Hand,
  Users,
  Bus,
  Baby,
  Dog,
  Clock,
  Share2,
  Bug
} from "lucide-react";

export default function PhoneGermsTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 1,
      question: "How many times a day do you wash your hands? (showers count as well)",
      options: [
        { text: "I rarely wash my hands", value: 0 },
        { text: "Once", value: 1 },
        { text: "2x", value: 2 },
        { text: "3-4x", value: 3 },
        { text: "5-6x", value: 4 },
        { text: "6 or more", value: 5 }
      ]
    },
    {
      id: 2,
      question: "How often do you clean your phone?",
      options: [
        { text: "Daily", value: 5 },
        { text: "Once a week", value: 4 },
        { text: "Once a month", value: 3 },
        { text: "A few times a year", value: 2 },
        { text: "Never", value: 0 }
      ]
    },
    {
      id: 3,
      question: "When you clean your phone, what do you use?",
      options: [
        { text: "I just wipe the smears away with my sleeve", value: 0 },
        { text: "A damp towel", value: 1 },
        { text: "A damp towel with mild disinfectant or cleanser", value: 3 },
        { text: "Windex (or something similar)", value: 2 },
        { text: "I lick it clean", value: -2 },
        { text: "I don't ever wash my phone", value: -1 }
      ]
    },
    {
      id: 4,
      question: "Do you wash your hands after you go to the bathroom?",
      options: [
        { text: "Yes, always", value: 5 },
        { text: "Yes, but usually only after going #2", value: 3 },
        { text: "No", value: 0 }
      ]
    },
    {
      id: 5,
      question: "What do you do when you sneeze?",
      options: [
        { text: "I sneeze into the floor", value: 1 },
        { text: "I sneeze into my hands and wipe them on whatever is convenient", value: 0 },
        { text: "I sneeze into my hands but wash them afterward", value: 3 },
        { text: "I almost always have kleenex on hand and I sneeze into that", value: 5 }
      ]
    },
    {
      id: 6,
      question: "While moving about, where do you keep your cell phone?",
      options: [
        { text: "Pocket", value: 2 },
        { text: "Purse or bag", value: 3 },
        { text: "Clipped to my waist or arm", value: 1 },
        { text: "Other", value: 2 }
      ]
    },
    {
      id: 7,
      question: "Do you spend the majority of your day with a lot of people?",
      options: [
        { text: "Yes, I'm in an environment with more than 50 people", value: 0 },
        { text: "I'm exposed to a medium-sized group of people (between 10 and 50)", value: 2 },
        { text: "I'm around a small group of people", value: 3 },
        { text: "I spend most days alone", value: 4 }
      ]
    },
    {
      id: 8,
      question: "Do you frequently use a hand sanitizer?",
      options: [
        { text: "Yes, and it's 60% alcohol or greater", value: 4 },
        { text: "Yes, but I don't know the % alcohol", value: 2 },
        { text: "No", value: 0 }
      ]
    },
    {
      id: 9,
      question: "How do you typically travel to work/school/wherever every day?",
      options: [
        { text: "I use public transportation (bus, subway, etc)", value: 0 },
        { text: "I drive a car", value: 3 },
        { text: "I ride in a carpool, vanpool, taxi, or limousine", value: 1 },
        { text: "I walk or ride a bicycle", value: 2 },
        { text: "Other", value: 2 }
      ]
    },
    {
      id: 10,
      question: "How often are you around sick people?",
      options: [
        { text: "All the time (I work at a hospital or somewhere similar)", value: 0 },
        { text: "Sometimes", value: 2 },
        { text: "Almost never", value: 4 }
      ]
    },
    {
      id: 11,
      question: "Do you spend much time around children?",
      options: [
        { text: "Yes, full-time: I work at a school, daycare, etc", value: 0 },
        { text: "Yes, full-time: I'm a stay-at-home parent", value: 1 },
        { text: "Yes, but not full-time", value: 2 },
        { text: "Every now and then I'm around kids", value: 3 },
        { text: "Almost never", value: 4 }
      ]
    },
    {
      id: 12,
      question: "Do you have any pets?",
      options: [
        { text: "Yes", value: 1 },
        { text: "No", value: 3 },
        { text: "No, but I spend a lot of time around them", value: 2 }
      ]
    },
    {
      id: 13,
      question: "Does your phone have a protective case on it that's made of fabric, leather, or some other soft material?",
      options: [
        { text: "Yes", value: 0 },
        { text: "No", value: 2 }
      ]
    },
    {
      id: 14,
      question: "Do you spend AT LEAST 20 seconds washing your hands?",
      options: [
        { text: "Yes, I wash for 20 seconds or more (recommended)", value: 5 },
        { text: "No, I wash for less than 20 seconds", value: 0 }
      ]
    },
    {
      id: 15,
      question: "Do you share your phone with anyone else?",
      options: [
        { text: "Yes", value: 0 },
        { text: "No", value: 3 }
      ]
    }
  ];

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateGerms = () => {
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
    const maxScore = questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.value)), 0);
    const percentage = (totalScore / maxScore) * 100;
    
    if (percentage >= 80) return { germs: "Very Few", count: "1,000-5,000", color: "text-green-400", bgColor: "bg-green-500/20", icon: <CheckCircle className="h-8 w-8" /> };
    if (percentage >= 60) return { germs: "Few", count: "5,000-25,000", color: "text-blue-400", bgColor: "bg-blue-500/20", icon: <Shield className="h-8 w-8" /> };
    if (percentage >= 40) return { germs: "Moderate", count: "25,000-100,000", color: "text-yellow-400", bgColor: "bg-yellow-500/20", icon: <AlertTriangle className="h-8 w-8" /> };
    if (percentage >= 20) return { germs: "Many", count: "100,000-500,000", color: "text-orange-400", bgColor: "bg-orange-500/20", icon: <Bug className="h-8 w-8" /> };
    return { germs: "A LOT", count: "500,000+", color: "text-red-400", bgColor: "bg-red-500/20", icon: <Bug className="h-8 w-8" /> };
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  if (showResults) {
    const result = calculateGerms();
    
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
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Your Phone Germ Results
              </h1>
              <p className="text-xl text-gray-300">The verdict is in...</p>
            </div>

            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mb-8">
              <CardHeader className="text-center">
                <div className={`inline-flex p-4 rounded-full ${result.bgColor} mb-4`}>
                  {result.icon}
                </div>
                <CardTitle className={`text-3xl font-bold ${result.color}`}>
                  {result.germs} Germs
                </CardTitle>
                <p className="text-2xl font-semibold text-gray-300">
                  {result.count} bacteria
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-left">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="font-semibold mb-2">What this means:</h3>
                    <p className="text-gray-300 text-sm">
                      {result.germs === "Very Few" && "Your phone is remarkably clean! You have excellent hygiene habits."}
                      {result.germs === "Few" && "Your phone is relatively clean. You're doing a good job keeping germs at bay."}
                      {result.germs === "Moderate" && "Your phone has an average amount of germs. Consider cleaning it more often."}
                      {result.germs === "Many" && "Your phone has quite a few germs. Time to step up your cleaning routine!"}
                      {result.germs === "A LOT" && "Your phone is a germ factory! Please start cleaning it regularly immediately."}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tips to reduce germs:</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Clean your phone daily with disinfectant wipes</li>
                      <li>• Wash your hands frequently, especially after using the bathroom</li>
                      <li>• Avoid touching your face after handling your phone</li>
                      <li>• Don't share your phone with others</li>
                      <li>• Wash hands for at least 20 seconds</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button onClick={resetTest} className="bg-purple-500 hover:bg-purple-600">
                <RotateCcw className="h-4 w-4 mr-2" />
                Take Test Again
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
            <div className="inline-flex p-4 rounded-full bg-red-500/20 mb-4">
              <Smartphone className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              How Many Germs Are On Your Phone?
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Take this quiz to find out how clean (or dirty) your phone really is!
            </p>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-400 to-pink-400 h-2 rounded-full transition-all duration-300"
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
                    className="w-full h-auto p-4 justify-start text-left border-gray-600 hover:border-red-400 hover:text-red-400 transition-all duration-200"
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