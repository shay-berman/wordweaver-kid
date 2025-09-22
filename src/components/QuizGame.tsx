import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, X, Clock, Award, Volume2 } from "lucide-react";
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
  const [musicType, setMusicType] = useState(0); // 0 = off, 1-4 = different songs
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const musicTypes = [
    { name: "Off", icon: "🔇" },
    { name: "Happy Adventure", icon: "🎵" },
    { name: "Magical Journey", icon: "✨" },
    { name: "Playful March", icon: "🎪" },
    { name: "Wonder Theme", icon: "🌟" }
  ];

  // Initialize background music
  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let isPlaying = false;

    const playBackgroundMusic = async () => {
      if (musicType === 0 || isPlaying) return;
      
      try {
        audioContext = new AudioContext();
        isPlaying = true;
        
        // Create Disney-style melodies
        const createNote = (frequency: number, startTime: number, duration: number, volume = 0.08) => {
          const oscillator = audioContext!.createOscillator();
          const gainNode = audioContext!.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext!.destination);
          
          oscillator.frequency.setValueAtTime(frequency, startTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
          gainNode.gain.linearRampToValueAtTime(volume * 0.7, startTime + duration * 0.8);
          gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };

        const getMelodyPattern = (type: number) => {
          const patterns = {
            1: [ // Happy Adventure - "Twinkle Twinkle" style
              { note: 262, duration: 0.5 }, { note: 262, duration: 0.5 }, { note: 392, duration: 0.5 }, { note: 392, duration: 0.5 },
              { note: 440, duration: 0.5 }, { note: 440, duration: 0.5 }, { note: 392, duration: 1.0 },
              { note: 349, duration: 0.5 }, { note: 349, duration: 0.5 }, { note: 330, duration: 0.5 }, { note: 330, duration: 0.5 },
              { note: 294, duration: 0.5 }, { note: 294, duration: 0.5 }, { note: 262, duration: 1.0 }
            ],
            2: [ // Magical Journey - "Mary Had a Little Lamb" style
              { note: 330, duration: 0.5 }, { note: 294, duration: 0.5 }, { note: 262, duration: 0.5 }, { note: 294, duration: 0.5 },
              { note: 330, duration: 0.5 }, { note: 330, duration: 0.5 }, { note: 330, duration: 1.0 },
              { note: 294, duration: 0.5 }, { note: 294, duration: 0.5 }, { note: 294, duration: 1.0 },
              { note: 330, duration: 0.5 }, { note: 392, duration: 0.5 }, { note: 392, duration: 1.0 }
            ],
            3: [ // Playful March - "London Bridge" style
              { note: 392, duration: 0.5 }, { note: 440, duration: 0.5 }, { note: 392, duration: 0.5 }, { note: 349, duration: 0.5 },
              { note: 330, duration: 0.5 }, { note: 349, duration: 0.5 }, { note: 392, duration: 1.0 },
              { note: 262, duration: 0.5 }, { note: 330, duration: 0.5 }, { note: 349, duration: 0.5 }, { note: 330, duration: 0.5 },
              { note: 349, duration: 0.5 }, { note: 392, duration: 0.5 }, { note: 392, duration: 1.0 }
            ],
            4: [ // Wonder Theme - "Happy Birthday" style
              { note: 262, duration: 0.3 }, { note: 262, duration: 0.2 }, { note: 294, duration: 0.5 }, { note: 262, duration: 0.5 },
              { note: 349, duration: 0.5 }, { note: 330, duration: 1.0 },
              { note: 262, duration: 0.3 }, { note: 262, duration: 0.2 }, { note: 294, duration: 0.5 }, { note: 262, duration: 0.5 },
              { note: 392, duration: 0.5 }, { note: 349, duration: 1.0 }
            ]
          };
          return patterns[type as keyof typeof patterns] || [];
        };

        // Create a cheerful melody pattern
        const playPattern = () => {
          if (!audioContext || musicType === 0) return;
          
          const now = audioContext.currentTime;
          const melody = getMelodyPattern(musicType);
          let currentTime = now;
          
          melody.forEach(({ note, duration }) => {
            createNote(note, currentTime, duration * 0.8);
            currentTime += duration;
          });
          
          // Schedule next pattern
          setTimeout(() => {
            if (musicType > 0 && audioContext) {
              playPattern();
            }
          }, melody.reduce((sum, { duration }) => sum + duration, 0) * 1000 + 500);
        };

        playPattern();
      } catch (error) {
        console.log('Audio context not available:', error);
      }
    };

    const stopMusic = () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        audioContext = null;
        isPlaying = false;
      }
    };

    if (musicType > 0) {
      // Start music after a short delay to avoid immediate context issues
      setTimeout(playBackgroundMusic, 100);
    } else {
      stopMusic();
    }

    return () => {
      stopMusic();
    };
  }, [musicType]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && questions.length > 0) {
      handleAnswer();
    }
  }, [timeLeft, showResult, gameCompleted, questions.length]);

  const handleAnswer = () => {
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      setShowConfetti(true);
      // Auto-hide confetti after 2 seconds
      setTimeout(() => setShowConfetti(false), 2000);
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

  const toggleMusic = () => {
    setMusicType((prev) => (prev + 1) % musicTypes.length);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const current = questions[currentQuestion];
  const isCorrect = selectedAnswer === current.correctAnswer;

  if (gameCompleted) {
    const percentage = (score / questions.length) * 100;
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 sm:p-8 text-center">
          <Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-accent animate-bounce-gentle" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">כל הכבוד!</h2>
          <p className="text-lg sm:text-xl mb-6 leading-relaxed">
            ענית נכון על {score} מתוך {questions.length} שאלות
          </p>
          <div className="text-base sm:text-lg mb-6">
            <span className="text-accent font-bold">{percentage.toFixed(0)}%</span> הצלחה
          </div>
          <Button 
            onClick={onBack} 
            className="bg-gradient-hero min-h-[48px] px-6 sm:px-8 text-sm sm:text-base touch-manipulation"
          >
            חזור למשחקים
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="confetti-container">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`confetti confetti-${i % 5}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      <Card className="max-w-2xl mx-auto mb-6">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base sm:text-lg">שאלה {currentQuestion + 1} מתוך {questions.length}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMusic}
              className="w-8 h-8 relative"
              title={`Music: ${musicTypes[musicType].name}`}
            >
              <Volume2 className={`w-4 h-4 ${musicType > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="absolute -top-1 -right-1 text-xs">
                {musicTypes[musicType].icon}
              </span>
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {timeLeft}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pb-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-6 text-right leading-relaxed">{current.question}</h3>
        
        {current.type === "multiple-choice" && current.options && (
          <div className="space-y-3 sm:space-y-4">
            {current.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === option ? "default" : "outline"}
                className={`w-full text-right justify-end p-4 sm:p-5 h-auto min-h-[56px] text-sm sm:text-base touch-manipulation ${
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
                  <span className="leading-relaxed">{option}</span>
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Submit button moved higher for mobile visibility */}
        <div className="mt-6 mb-4">
          <div className="flex justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="min-h-[48px] px-4 sm:px-6 text-sm sm:text-base touch-manipulation"
            >
              חזור
            </Button>
            
            {!showResult ? (
              <Button 
                onClick={handleAnswer}
                disabled={!selectedAnswer}
                className="bg-gradient-hero min-h-[48px] px-4 sm:px-6 text-sm sm:text-base touch-manipulation shadow-lg"
              >
                שלח תשובה
              </Button>
            ) : (
              <Button 
                onClick={nextQuestion} 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white min-h-[48px] px-4 sm:px-6 text-sm sm:text-base touch-manipulation shadow-lg animate-pulse border-2 border-emerald-300"
              >
                {currentQuestion + 1 < questions.length ? "שאלה הבאה" : "סיום"}
              </Button>
            )}
          </div>
        </div>

        {showResult && (
          <div className="p-4 bg-muted rounded-lg">
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
      </CardContent>
    </Card>
    </div>
  );
};