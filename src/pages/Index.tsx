import { useState, useEffect } from "react";
import { GameHeader } from "@/components/GameHeader";
import { GameCard } from "@/components/GameCard";
import { QuizGame } from "@/components/QuizGame";
import { gameLevels, initialPlayerData } from "@/data/gameData";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Target } from "lucide-react";
import { toast } from "sonner";
import heroCharacter from "@/assets/hero-character.jpg";

const Index = () => {
  const [playerData, setPlayerData] = useState(initialPlayerData);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("englishGameData");
    if (saved) {
      setPlayerData(JSON.parse(saved));
    }
  }, []);

  const savePlayerData = (data: typeof playerData) => {
    setPlayerData(data);
    localStorage.setItem("englishGameData", JSON.stringify(data));
  };

  const handleGameComplete = (gameId: string, score: number, xpEarned: number) => {
    const newPlayerData = {
      ...playerData,
      xp: playerData.xp + xpEarned,
      score: playerData.score + score * 10,
      completedLevels: [...playerData.completedLevels, gameId]
    };

    // Level up logic
    if (newPlayerData.xp >= newPlayerData.xpToNext) {
      newPlayerData.level += 1;
      newPlayerData.xp = newPlayerData.xp - newPlayerData.xpToNext;
      newPlayerData.xpToNext = newPlayerData.level * 100;
      toast.success(`עלית לרמה ${newPlayerData.level}! 🎉`);
    }

    savePlayerData(newPlayerData);
    setCurrentGame(null);
    
    toast.success(`כל הכבוד! זכית ב-${xpEarned} נקודות ניסיון! ⭐`);
  };

  const startGame = (gameId: string) => {
    const game = gameLevels.find(g => g.id === gameId);
    if (game && (game.unlockLevel <= playerData.level || playerData.completedLevels.includes(gameId))) {
      setCurrentGame(gameId);
    } else {
      toast.error(`צריך להגיע לרמה ${game?.unlockLevel} כדי לפתוח את המשחק הזה`);
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src={heroCharacter} 
              alt="English Adventure Hero" 
              className="w-full max-w-2xl mx-auto rounded-2xl shadow-glow"
            />
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
            הרפתקת האנגלית
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ברוכים הבאים למשחק ההרפתקאות באנגלית! פה תלמדו מילים חדשות, דקדוק, 
            ותשחקו משחקים מגניבים שיעזרו לכם להשתפר באנגלית.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-4 sm:p-6 bg-card rounded-lg shadow-game touch-manipulation">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-3" />
              <h3 className="font-bold mb-2 text-base sm:text-lg">למד מילים</h3>
              <p className="text-sm text-muted-foreground text-center">
                אוצר מילים חדש וניגודים
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 sm:p-6 bg-card rounded-lg shadow-game touch-manipulation">
              <Target className="w-10 h-10 sm:w-12 sm:h-12 text-success mb-3" />
              <h3 className="font-bold mb-2 text-base sm:text-lg">תרגל דקדוק</h3>
              <p className="text-sm text-muted-foreground text-center">
                הפועל to be ומבני משפט
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 sm:p-6 bg-card rounded-lg shadow-game touch-manipulation">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-accent mb-3" />
              <h3 className="font-bold mb-2 text-base sm:text-lg">זכה בפרסים</h3>
              <p className="text-sm text-muted-foreground text-center">
                עלה ברמות וצבור נקודות
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => setGameStarted(true)}
            size="lg"
            className="bg-gradient-hero hover:opacity-90 text-lg sm:text-xl px-6 sm:px-8 py-4 sm:py-6 min-h-[60px] touch-manipulation animate-glow-pulse"
          >
            התחל את ההרפתקה! 🚀
          </Button>
        </div>
      </div>
    );
  }

  const currentGameData = currentGame ? gameLevels.find(g => g.id === currentGame) : null;

  if (currentGame && currentGameData) {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto">
          <GameHeader {...playerData} />
          <QuizGame
            questions={currentGameData.questions}
            onComplete={(score, xpEarned) => handleGameComplete(currentGame, score, xpEarned)}
            onBack={() => setCurrentGame(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto">
        <GameHeader {...playerData} />
        
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-right">בחר משחק:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {gameLevels.map((level) => (
              <GameCard
                key={level.id}
                title={level.title}
                description={level.description}
                difficulty={level.difficulty}
                xpReward={level.xpReward}
                completed={playerData.completedLevels.includes(level.id)}
                locked={level.unlockLevel > playerData.level}
                onClick={() => startGame(level.id)}
              />
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => {
              localStorage.removeItem("englishGameData");
              setPlayerData(initialPlayerData);
              toast.success("ההתקדמות אופסה!");
            }}
          >
            איפוס התקדמות
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
