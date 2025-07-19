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
  Star,
  TestTube,
  AlertTriangle,
  Lightbulb,
  Users
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  style: 'autocratic' | 'democratic' | 'laissez-faire' | 'transformational' | 'servant';
  weight: number;
  reverse: boolean;
}

interface Answer {
  questionId: number;
  value: number; // 1-5 scale: 1 = Strongly Disagree, 5 = Strongly Agree
}

interface Results {
  autocratic: number; // 0-100
  democratic: number; // 0-100
  laissezFaire: number; // 0-100
  transformational: number; // 0-100
  servant: number; // 0-100
  primaryStyle: string;
  secondaryStyle: string;
  description: string;
  analysis: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  bestSituations: string[];
}

export default function LeadershipTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeCompleted, setTimeCompleted] = useState<Date | null>(null);

  const questions: Question[] = [
    // Autocratic Leadership
    { id: 1, text: "I prefer to make decisions on my own without consulting others", style: 'autocratic', weight: 1, reverse: false },
    { id: 2, text: "I believe the leader should have complete control over the team", style: 'autocratic', weight: 1, reverse: false },
    { id: 3, text: "I expect team members to follow my instructions without question", style: 'autocratic', weight: 1, reverse: false },
    { id: 4, text: "I prefer to set strict rules and guidelines for my team", style: 'autocratic', weight: 1, reverse: false },
    { id: 5, text: "I believe in centralized decision-making authority", style: 'autocratic', weight: 1, reverse: false },
    
    // Democratic Leadership
    { id: 6, text: "I encourage team members to participate in decision-making", style: 'democratic', weight: 1, reverse: false },
    { id: 7, text: "I value input and feedback from my team", style: 'democratic', weight: 1, reverse: false },
    { id: 8, text: "I prefer to reach decisions through group consensus", style: 'democratic', weight: 1, reverse: false },
    { id: 9, text: "I believe in sharing information openly with my team", style: 'democratic', weight: 1, reverse: false },
    { id: 10, text: "I encourage collaboration and teamwork", style: 'democratic', weight: 1, reverse: false },
    
    // Laissez-faire Leadership
    { id: 11, text: "I prefer to give team members complete freedom to work independently", style: 'laissez-faire', weight: 1, reverse: false },
    { id: 12, text: "I believe in minimal supervision and maximum autonomy", style: 'laissez-faire', weight: 1, reverse: false },
    { id: 13, text: "I let team members set their own goals and deadlines", style: 'laissez-faire', weight: 1, reverse: false },
    { id: 14, text: "I prefer to step back and let the team figure things out", style: 'laissez-faire', weight: 1, reverse: false },
    { id: 15, text: "I believe in hands-off leadership", style: 'laissez-faire', weight: 1, reverse: false },
    
    // Transformational Leadership
    { id: 16, text: "I inspire others with my vision and enthusiasm", style: 'transformational', weight: 1, reverse: false },
    { id: 17, text: "I focus on developing and mentoring my team members", style: 'transformational', weight: 1, reverse: false },
    { id: 18, text: "I encourage innovation and creative thinking", style: 'transformational', weight: 1, reverse: false },
    { id: 19, text: "I lead by example and set high standards", style: 'transformational', weight: 1, reverse: false },
    { id: 20, text: "I believe in empowering others to reach their full potential", style: 'transformational', weight: 1, reverse: false },
    
    // Servant Leadership
    { id: 21, text: "I prioritize the needs of my team over my own", style: 'servant', weight: 1, reverse: false },
    { id: 22, text: "I focus on serving and supporting my team members", style: 'servant', weight: 1, reverse: false },
    { id: 23, text: "I believe in putting others first", style: 'servant', weight: 1, reverse: false },
    { id: 24, text: "I emphasize the growth and well-being of my team", style: 'servant', weight: 1, reverse: false },
    { id: 25, text: "I lead by serving the needs of others", style: 'servant', weight: 1, reverse: false }
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
    // Calculate scores for each leadership style
    const styleScores: { [key: string]: number[] } = {
      autocratic: [],
      democratic: [],
      laissezFaire: [],
      transformational: [],
      servant: []
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
        styleScores[question.style].push(normalizedValue * question.weight);
      }
    });

    const autocratic = Math.round(styleScores.autocratic.reduce((a, b) => a + b, 0) / styleScores.autocratic.length);
    const democratic = Math.round(styleScores.democratic.reduce((a, b) => a + b, 0) / styleScores.democratic.length);
    const laissezFaire = Math.round(styleScores.laissezFaire.reduce((a, b) => a + b, 0) / styleScores.laissezFaire.length);
    const transformational = Math.round(styleScores.transformational.reduce((a, b) => a + b, 0) / styleScores.transformational.length);
    const servant = Math.round(styleScores.servant.reduce((a, b) => a + b, 0) / styleScores.servant.length);

    // Determine primary and secondary styles
    const scores = [
      { style: 'Autocratic', score: autocratic },
      { style: 'Democratic', score: democratic },
      { style: 'Laissez-faire', score: laissezFaire },
      { style: 'Transformational', score: transformational },
      { style: 'Servant', score: servant }
    ].sort((a, b) => b.score - a.score);

    const primaryStyle = scores[0].style;
    const secondaryStyle = scores[1].style;

    // Generate analysis based on primary style
    let description = "";
    let analysis = "";
    let strengths: string[] = [];
    let challenges: string[] = [];
    let recommendations: string[] = [];
    let bestSituations: string[] = [];

    switch (primaryStyle) {
      case 'Autocratic':
        description = "You prefer to take charge and make decisions independently. You value control and efficiency in leadership.";
        analysis = "Your autocratic leadership style emphasizes control, quick decision-making, and clear direction. You excel in crisis situations and when quick action is needed.";
        strengths = [
          "Quick decision-making",
          "Clear direction and control",
          "Effective in crisis situations",
          "High efficiency and productivity"
        ];
        challenges = [
          "May stifle creativity and innovation",
          "Can create resistance from team members",
          "May miss valuable input from others",
          "Can lead to low morale if overused"
        ];
        recommendations = [
          "Learn to delegate more effectively",
          "Practice active listening to team input",
          "Consider collaborative approaches for complex decisions",
          "Balance control with team empowerment"
        ];
        bestSituations = [
          "Crisis management and emergencies",
          "Time-sensitive projects",
          "Teams with inexperienced members",
          "Situations requiring quick, decisive action"
        ];
        break;

      case 'Democratic':
        description = "You value collaboration and team input in decision-making. You believe in shared leadership and consensus-building.";
        analysis = "Your democratic leadership style emphasizes participation, collaboration, and team involvement. You create inclusive environments where everyone's voice matters.";
        strengths = [
          "High team engagement and buy-in",
          "Better decision quality through diverse input",
          "Strong team relationships",
          "Encourages creativity and innovation"
        ];
        challenges = [
          "Can be slower in decision-making",
          "May struggle in crisis situations",
          "Requires strong facilitation skills",
          "Can lead to analysis paralysis"
        ];
        recommendations = [
          "Develop time management skills for group processes",
          "Learn to balance consensus with efficiency",
          "Practice conflict resolution techniques",
          "Build facilitation and meeting management skills"
        ];
        bestSituations = [
          "Complex problem-solving",
          "Innovation and creative projects",
          "Experienced and skilled teams",
          "Long-term strategic planning"
        ];
        break;

      case 'Laissez-faire':
        description = "You prefer to give team members maximum autonomy and freedom. You believe in minimal supervision and self-direction.";
        analysis = "Your laissez-faire leadership style emphasizes autonomy, independence, and self-direction. You trust your team to manage their own work effectively.";
        strengths = [
          "Encourages independence and self-motivation",
          "Allows for maximum creativity",
          "Reduces micromanagement",
          "Suitable for highly skilled teams"
        ];
        challenges = [
          "May lack direction and coordination",
          "Can lead to confusion about goals",
          "May not work with inexperienced teams",
          "Can result in missed deadlines"
        ];
        recommendations = [
          "Develop clear goal-setting and communication skills",
          "Learn to provide appropriate structure and guidance",
          "Practice regular check-ins and feedback",
          "Balance autonomy with accountability"
        ];
        bestSituations = [
          "Highly skilled and experienced teams",
          "Creative and research projects",
          "Self-motivated individuals",
          "Innovation-focused environments"
        ];
        break;

      case 'Transformational':
        description = "You inspire and motivate others through vision and personal development. You focus on transforming individuals and organizations.";
        analysis = "Your transformational leadership style emphasizes inspiration, vision, and personal development. You have the ability to motivate others to exceed expectations.";
        strengths = [
          "Strong ability to inspire and motivate",
          "Excellent at developing others",
          "Creates positive organizational culture",
          "Drives innovation and change"
        ];
        challenges = [
          "May focus too much on big picture",
          "Can be overwhelming for some team members",
          "Requires significant time investment",
          "May struggle with routine tasks"
        ];
        recommendations = [
          "Balance vision with practical implementation",
          "Develop operational and tactical skills",
          "Learn to manage day-to-day details",
          "Practice patience with team development"
        ];
        bestSituations = [
          "Organizational change and transformation",
          "Startup and growth environments",
          "Teams needing motivation and direction",
          "Innovation and creative industries"
        ];
        break;

      case 'Servant':
        description = "You prioritize serving and supporting your team members. You believe in putting others' needs first and leading through service.";
        analysis = "Your servant leadership style emphasizes serving others, supporting team growth, and putting team needs before your own. You create supportive and caring environments.";
        strengths = [
          "Strong team loyalty and trust",
          "Excellent at supporting others",
          "Creates caring work environments",
          "Focuses on long-term relationships"
        ];
        challenges = [
          "May struggle with difficult decisions",
          "Can be taken advantage of",
          "May lack assertiveness when needed",
          "Can lead to burnout from over-giving"
        ];
        recommendations = [
          "Develop assertiveness and boundary-setting skills",
          "Learn to balance serving others with self-care",
          "Practice making difficult decisions",
          "Build confidence in your leadership authority"
        ];
        bestSituations = [
          "Non-profit and service organizations",
          "Teams needing support and development",
          "Long-term relationship building",
          "Caring and supportive environments"
        ];
        break;
    }

    return {
      autocratic,
      democratic,
      laissezFaire,
      transformational,
      servant,
      primaryStyle,
      secondaryStyle,
      description,
      analysis,
      strengths,
      challenges,
      recommendations,
      bestSituations
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Leadership Style Results</h1>
            <p className="text-gray-400">Analysis of your natural leadership approach</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results Summary */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-400" />
                  Your Leadership Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{results.primaryStyle}</div>
                  <div className="text-lg text-gray-300 mb-2">Primary Style</div>
                  <div className="text-lg text-blue-400">{results.secondaryStyle}</div>
                  <div className="text-sm text-gray-400">Secondary Style</div>
                  <p className="text-gray-300 mt-4">{results.description}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="p-2 bg-red-500/20 rounded">
                      <div className="text-sm font-bold text-red-400">{results.autocratic}%</div>
                      <div className="text-xs text-gray-400">Autocratic</div>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded">
                      <div className="text-sm font-bold text-blue-400">{results.democratic}%</div>
                      <div className="text-xs text-gray-400">Democratic</div>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded">
                      <div className="text-sm font-bold text-green-400">{results.laissezFaire}%</div>
                      <div className="text-xs text-gray-400">Laissez-faire</div>
                    </div>
                    <div className="p-2 bg-purple-500/20 rounded">
                      <div className="text-sm font-bold text-purple-400">{results.transformational}%</div>
                      <div className="text-xs text-gray-400">Transformational</div>
                    </div>
                    <div className="p-2 bg-pink-500/20 rounded">
                      <div className="text-sm font-bold text-pink-400">{results.servant}%</div>
                      <div className="text-xs text-gray-400">Servant</div>
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

            {/* Strengths and Challenges */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-green-400" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
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
                      <AlertTriangle className="h-4 w-4" />
                      Challenges
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {results.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis and Recommendations */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-400" />
                Analysis & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6">{results.analysis}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Recommendations
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-purple-400 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Best Situations
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    {results.bestSituations.map((situation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        {situation}
                      </li>
                    ))}
                  </ul>
                </div>
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
                const text = `Leadership Style Test Results:\nPrimary Style: ${results.primaryStyle}\nSecondary Style: ${results.secondaryStyle}\n\nScores:\nAutocratic: ${results.autocratic}%\nDemocratic: ${results.democratic}%\nLaissez-faire: ${results.laissezFaire}%\nTransformational: ${results.transformational}%\nServant: ${results.servant}%`;
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
                const report = `Leadership Style Test Report\n\nPrimary Style: ${results.primaryStyle}\nSecondary Style: ${results.secondaryStyle}\n\nDescription:\n${results.description}\n\nScores:\n- Autocratic: ${results.autocratic}%\n- Democratic: ${results.democratic}%\n- Laissez-faire: ${results.laissezFaire}%\n- Transformational: ${results.transformational}%\n- Servant: ${results.servant}%\n\nAnalysis:\n${results.analysis}\n\nStrengths:\n${results.strengths.map((strength, i) => `${i+1}. ${strength}`).join('\n')}\n\nChallenges:\n${results.challenges.map((challenge, i) => `${i+1}. ${challenge}`).join('\n')}\n\nRecommendations:\n${results.recommendations.map((rec, i) => `${i+1}. ${rec}`).join('\n')}\n\nBest Situations:\n${results.bestSituations.map((situation, i) => `${i+1}. ${situation}`).join('\n')}`;
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'leadership-style-report.txt';
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Leadership Style Test</h1>
          <p className="text-gray-400 mb-4">Discover your natural leadership approach</p>
          
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
                Rate how much this statement applies to your leadership style
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
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-yellow-400 mb-1">About Leadership Styles</p>
              <p>
                This test measures five leadership styles: Autocratic (commanding), Democratic (collaborative), 
                Laissez-faire (hands-off), Transformational (inspiring), and Servant (supportive). 
                Each style has strengths and is effective in different situations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 