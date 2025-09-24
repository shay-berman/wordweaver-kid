import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, X, Clock, Award, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle questions and their options on first load
  const [shuffledQuestions] = useState(() => {
    return shuffleArray(questions.map(q => ({
      ...q,
      options: q.options ? shuffleArray(q.options) : q.options
    })));
  });
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [musicType, setMusicType] = useState(0); // 0 = off, 1-4 = different songs
  const [showConfetti, setShowConfetti] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const musicTypes = [
    { name: "Off", icon: "🔇" },
    { name: "Happy Adventure", icon: "🎵" },
    { name: "Magical Journey", icon: "✨" },
    { name: "Playful March", icon: "🎪" },
    { name: "Wonder Theme", icon: "🌟" }
  ];

  const encouragementMessages = [
    "כל הכבוד! ממשיך מעולה! 🌟",
    "איזה יופי! אתה מדהים! ✨", 
    "וואו! ממש חכם! 🎉",
    "מקסים! ממשיך כך! 🚀",
    "נהדר! אתה פשוט מושלם! 🏆",
    "איזה כוח! אתה גאון! 💫",
    "מדהים! ממש גאה בך! 🌈",
    "אלוף! אתה מדהים! ⭐",
    "אבא גאה בך! 👨‍👧‍👦✨"
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

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        if (showResult) {
          // If result is shown, go to next question
          nextQuestion();
        } else if (selectedAnswer) {
          // If answer is selected but result not shown yet, submit answer
          handleAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showResult, selectedAnswer, currentQuestion]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && shuffledQuestions.length > 0) {
      handleAnswer();
    }
  }, [timeLeft, showResult, gameCompleted, shuffledQuestions.length]);

  const playSuccessSound = () => {
    try {
      const audioContext = new AudioContext();
      
      // Create a magical success sound with multiple tones
      const playNote = (frequency: number, startTime: number, duration: number, volume = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const now = audioContext.currentTime;
      // Magical success chord progression
      playNote(523, now, 0.3, 0.2); // C5
      playNote(659, now + 0.1, 0.3, 0.15); // E5
      playNote(784, now + 0.2, 0.4, 0.2); // G5
      playNote(1047, now + 0.3, 0.5, 0.15); // C6
      
    } catch (error) {
      console.log('Success sound not available:', error);
    }
  };

  const speakEnglishWord = async (questionText: string, correctAnswer: string) => {
    try {
      // Extract English word from question or use correct answer
      let englishWord = '';
      
      // Try to find English word in parentheses in the question
      const englishMatch = questionText.match(/\(([^)]*[a-zA-Z][^)]*)\)/);
      if (englishMatch) {
        englishWord = englishMatch[1].trim();
      } else if (/^[a-zA-Z\s]+$/.test(correctAnswer)) {
        // If correct answer is in English
        englishWord = correctAnswer;
      } else {
        // Try to find English word in the question text
        const words = questionText.split(/[\s"'״"]+/);
        for (const word of words) {
          if (/^[a-zA-Z]+$/.test(word) && word.length > 1) {
            englishWord = word;
            break;
          }
        }
      }

      if (!englishWord) {
        console.log('No English word found to pronounce');
        return;
      }

      console.log('Speaking English word:', englishWord);

      // Call the text-to-speech function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: englishWord,
          voice: 'nova' // Clear female voice for pronunciation
        }
      });

      if (error) {
        console.error('TTS Error:', error);
        return;
      }

      // Play the audio
      if (data?.audioContent) {
        const audioBlob = new Blob([
          new Uint8Array(atob(data.audioContent).split('').map(c => c.charCodeAt(0)))
        ], { type: 'audio/mp3' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.play().catch(error => {
          console.log('Audio playback failed:', error);
        });
      }
    } catch (error) {
      console.error('Error speaking English word:', error);
    }
  };

  const renderQuestionWithClickableEnglish = (questionText: string) => {
    // Look for English words in parentheses
    const englishInParentheses = questionText.match(/\(([^)]*[a-zA-Z][^)]*)\)/);
    
    if (englishInParentheses) {
      const englishWord = englishInParentheses[1].trim();
      const beforeParentheses = questionText.substring(0, englishInParentheses.index);
      const afterParentheses = questionText.substring(englishInParentheses.index! + englishInParentheses[0].length);
      
      return (
        <span>
          {beforeParentheses}
           (<button
             onClick={() => speakEnglishWord(questionText, englishWord)}
             className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md border border-blue-200 cursor-pointer mx-1 font-medium transition-all duration-200 inline-flex items-center gap-1"
             type="button"
             title="לחץ לשמיעת ההגייה"
           >
             {englishWord}
             <span className="text-xs">🔊</span>
           </button>)
          {afterParentheses}
        </span>
      );
    }
    
    // Look for standalone English words with improved regex to handle punctuation
    const words = questionText.split(/(\s+)/);
    const processedWords: JSX.Element[] = [];
    
    words.forEach((word, index) => {
      // Match English words, potentially with punctuation at the end
      const englishMatch = word.match(/^([a-zA-Z]+)([^a-zA-Z]*)$/);
      
      if (englishMatch && englishMatch[1].length > 1) {
        const englishWord = englishMatch[1];
        const punctuation = englishMatch[2];
        
        processedWords.push(
          <span key={index}>
            <button
              onClick={() => speakEnglishWord(questionText, englishWord)}
              className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md border border-blue-200 cursor-pointer font-medium transition-all duration-200 inline-flex items-center gap-1"
              type="button"
              title="לחץ לשמיעת ההגייה"
            >
              {englishWord}
              <span className="text-xs">🔊</span>
            </button>
            {punctuation}
          </span>
        );
      } else {
        processedWords.push(<span key={index}>{word}</span>);
      }
    });
    
    // Check if we found any English words
    const hasEnglishWords = words.some(word => {
      const englishMatch = word.match(/^[a-zA-Z]+/);
      return englishMatch && englishMatch[0].length > 1;
    });
    
    if (hasEnglishWords) {
      return <span>{processedWords}</span>;
    }
    
    // No English words found, return regular text
    return questionText;
  };

  const playFailureSound = () => {
    try {
      const audioContext = new AudioContext();
      
      // Create a buzzer-like failure sound
      const playNote = (frequency: number, startTime: number, duration: number, volume = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'sawtooth'; // Harsher sound for failure
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      const now = audioContext.currentTime;
      // Descending failure sound
      playNote(220, now, 0.2, 0.15); // A3
      playNote(196, now + 0.15, 0.2, 0.15); // G3
      playNote(174, now + 0.3, 0.4, 0.2); // F3
      
    } catch (error) {
      console.log('Failure sound not available:', error);
    }
  };

  const handleAnswer = (answer?: string) => {
    const answerToCheck = answer || selectedAnswer;
    const isCorrect = answerToCheck === shuffledQuestions[currentQuestion].correctAnswer;
    if (answer) {
      setSelectedAnswer(answer);
    }
    if (isCorrect) {
      setScore(score + 1);
      setShowConfetti(true);
      playSuccessSound();
      
      // Speak the English word pronunciation
      speakEnglishWord(current.question, current.correctAnswer);
      
      // Track consecutive correct answers
      const newConsecutiveCorrect = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutiveCorrect);
      
      // Show encouragement every 2 correct answers
      if (newConsecutiveCorrect % 2 === 0) {
        const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
        setEncouragementMessage(randomMessage);
        setShowEncouragement(true);
        // Hide encouragement after 3 seconds
        setTimeout(() => setShowEncouragement(false), 3000);
      }
      
      // Auto-hide confetti after 2 seconds
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      // Reset consecutive correct counter on wrong answer
      setConsecutiveCorrect(0);
      playFailureSound();
    }
    setShowResult(true);
    
    // Auto-progress to next question
    const delay = isCorrect ? 2000 : 4000; // 2 seconds for correct, 4 seconds for incorrect
    setTimeout(() => {
      nextQuestion();
    }, delay);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < shuffledQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setShowResult(false);
      setTimeLeft(30);
    } else {
      const xpEarned = score * 10 + (score === shuffledQuestions.length ? 50 : 0);
      setGameCompleted(true);
      saveGameResult(score, shuffledQuestions.length);
      onComplete(score, xpEarned);
    }
  };

  const saveGameResult = async (finalScore: number, totalQuestions: number) => {
    if (!user) {
      console.log('User not logged in, skipping save');
      return;
    }

    setIsSaving(true);
    try {
      // Save game result
      const { error: gameError } = await supabase
        .from('game_results')
        .insert({
          user_id: user.id,
          score: finalScore,
          total_questions: totalQuestions,
          level: 1, // You can modify this based on the selected level
          completed_at: new Date().toISOString()
        });

      if (gameError) {
        console.error('Error saving game result:', gameError);
        toast({
          title: 'שגיאה בשמירה',
          description: 'לא הצלחנו לשמור את התוצאה',
          variant: 'destructive',
        });
        return;
      }

      // Update or create user profile
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const scoreToAdd = finalScore * 10;
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            total_score: existingProfile.total_score + scoreToAdd,
            games_played: existingProfile.games_played + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        }
      } else {
        // Create new profile
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'שחקן חדש',
            total_score: scoreToAdd,
            games_played: 1,
            current_level: 1
          });

        if (createError) {
          console.error('Error creating profile:', createError);
        }
      }

      toast({
        title: 'נשמר בהצלחה!',
        description: `התוצאה שלך נשמרה (${finalScore}/${totalQuestions})`,
      });

    } catch (error) {
      console.error('Error saving game data:', error);
      toast({
        title: 'שגיאה',
        description: 'משהו השתבש בשמירת התוצאות',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMusic = () => {
    setMusicType((prev) => (prev + 1) % musicTypes.length);
  };

  const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;
  const current = shuffledQuestions[currentQuestion];
  const isCorrect = selectedAnswer === current.correctAnswer;

  if (gameCompleted) {
    const percentage = (score / shuffledQuestions.length) * 100;
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 sm:p-8 text-center">
          <Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-accent animate-bounce-gentle" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">כל הכבוד!</h2>
          <p className="text-lg sm:text-xl mb-6 leading-relaxed">
            ענית נכון על {score} מתוך {shuffledQuestions.length} שאלות
          </p>
          <div className="text-base sm:text-lg mb-6">
            <span className="text-accent font-bold">{percentage.toFixed(0)}%</span> הצלחה
          </div>
          
          {/* Show save status */}
          {user && (
            <div className="mb-4 text-sm text-muted-foreground">
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  שומר תוצאות...
                </div>
              ) : (
                "התוצאות נשמרו ✓"
              )}
            </div>
          )}
          
          {!user && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-primary">
                התחבר כדי לשמור את התוצאות שלך! 💾
              </p>
            </div>
          )}
          
          <Button 
            onClick={onBack} 
            className="bg-gradient-hero min-h-[48px] px-6 sm:px-8 text-sm sm:text-base touch-manipulation"
            disabled={isSaving}
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

      {/* Encouragement Message */}
      {showEncouragement && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-2xl text-xl sm:text-2xl font-bold shadow-2xl animate-bounce-gentle border-4 border-white/30">
            {encouragementMessage}
          </div>
        </div>
      )}
      
      <Card className="max-w-2xl mx-auto mb-6">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base sm:text-lg">שאלה {currentQuestion + 1} מתוך {shuffledQuestions.length}</CardTitle>
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
        <h3 className="text-lg sm:text-xl font-semibold mb-6 text-right leading-relaxed">
          {renderQuestionWithClickableEnglish(current.question)}
        </h3>
        
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
                onClick={() => !showResult && handleAnswer(option)}
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
            
            {showResult ? (
              <Button 
                onClick={nextQuestion} 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white min-h-[48px] px-4 sm:px-6 text-sm sm:text-base touch-manipulation shadow-lg animate-pulse border-2 border-emerald-300"
              >
                {currentQuestion + 1 < questions.length ? "שאלה הבאה" : "סיום"}
              </Button>
            ) : null}
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