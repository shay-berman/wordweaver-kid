import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, X, Clock, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Question {
  id: string;
  type: "multiple-choice" | "translation" | "grammar";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizGameProps {
  questions: Question[];
  onComplete: (score: number, xpEarned: number) => void;
  onBack: () => void;
}

export const QuizGame = ({ questions, onComplete, onBack }: QuizGameProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer();
    }
  }, [timeLeft, showResult, gameCompleted]);

  const handleAnswer = () => {
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setShowResult(false);
      setTimeLeft(30);
    } else {
      const xpEarned = score * 10 + (score === questions.length ? 50 : 0);
      setGameCompleted(true);
      onComplete(score, xpEarned);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const current = questions[currentQuestion];
  const isCorrect = selectedAnswer === current.correctAnswer;

  if (gameCompleted) {
    const percentage = (score / questions.length) * 100;
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-accent animate-bounce-gentle" />
          <h2 className="text-3xl font-bold mb-4">כל הכבוד!</h2>
          <p className="text-xl mb-6">
            ענית נכון על {score} מתוך {questions.length} שאלות
          </p>
          <div className="text-lg mb-6">
            <span className="text-accent font-bold">{percentage.toFixed(0)}%</span> הצלחה
          </div>
          <Button onClick={onBack} className="bg-gradient-hero">
            חזור למשחקים
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>שאלה {currentQuestion + 1} מתוך {questions.length}</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {timeLeft}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-6 text-right">{current.question}</h3>
        
        {current.type === "multiple-choice" && current.options && (
          <div className="space-y-3">
            {current.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? "default" : "outline"}
                className={`w-full text-right justify-end p-4 h-auto ${
                  showResult
                    ? option === current.correctAnswer
                      ? "bg-success text-success-foreground border-success"
                      : selectedAnswer === option && option !== current.correctAnswer
                      ? "bg-destructive text-destructive-foreground border-destructive"
                      : ""
                    : ""
                }`}
                onClick={() => !showResult && setSelectedAnswer(option)}
                disabled={showResult}
              >
                <div className="flex items-center gap-2">
                  {showResult && option === current.correctAnswer && (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {showResult && selectedAnswer === option && option !== current.correctAnswer && (
                    <X className="w-5 h-5" />
                  )}
                  {option}
                </div>
              </Button>
            ))}
          </div>
        )}

        {showResult && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-semibold text-success">נכון!</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-destructive" />
                  <span className="font-semibold text-destructive">
                    לא נכון. התשובה הנכונה: {current.correctAnswer}
                  </span>
                </>
              )}
            </div>
            {current.explanation && (
              <p className="text-muted-foreground text-right">{current.explanation}</p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onBack}>
            חזור
          </Button>
          
          {!showResult ? (
            <Button 
              onClick={handleAnswer}
              disabled={!selectedAnswer}
              className="bg-gradient-hero"
            >
              שלח תשובה
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="bg-gradient-hero">
              {currentQuestion + 1 < questions.length ? "שאלה הבאה" : "סיום"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};