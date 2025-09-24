import { useState, useEffect } from "react";
import { GameHeader } from "@/components/GameHeader";
import { GameCard } from "@/components/GameCard";
import { QuizGame } from "@/components/QuizGame";
import { AuthModal } from "@/components/AuthModal";
import { UserProfileCard } from "@/components/UserProfile";
import { gameCategories, initialPlayerData, GameCategory } from "@/data/gameData";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Trophy, Target, User, Star, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ParentDashboard } from "@/components/ParentDashboard";
import heroCharacter from "@/assets/hero-character.jpg";

const Index = () => {
  const { user, loading } = useAuth();
  const [playerData, setPlayerData] = useState(initialPlayerData);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<"vocabulary" | "grammar" | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>(gameCategories[0]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);

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
    const game = selectedCategory.levels.find(g => g.id === gameId);
    if (game && (game.unlockLevel <= playerData.level || playerData.completedLevels.includes(gameId))) {
      setCurrentGame(gameId);
    } else if (game) {
      // Calculate how many XP points are needed
      const currentLevel = playerData.level;
      const requiredLevel = game.unlockLevel;
      const currentXP = playerData.xp;
      
      // Calculate total XP needed to reach the required level
      let totalXpNeeded = 0;
      for (let level = currentLevel; level < requiredLevel; level++) {
        totalXpNeeded += (level + 1) * 100; // Each level requires (level+1) * 100 XP
      }
      
      // Subtract current XP in this level
      const xpNeeded = totalXpNeeded - currentXP;
      
      toast.error(`המשחק נעול 🔒 - צריך להגיע לרמה ${requiredLevel}. חסר לך עוד ${xpNeeded} נקודות ניסיון!`);
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            טוען את המשחק...
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Login/Profile button */}
          <div className="absolute top-4 left-4 flex gap-2">
            {user ? (
              <>
                <Button
                  onClick={() => setShowProfile(!showProfile)}
                  className="bg-gradient-hero hover:shadow-glow"
                >
                  <User className="h-4 w-4 ml-2" />
                  {user.user_metadata?.display_name || user.email?.split('@')[0] || 'פרופיל'}
                </Button>
                <Button
                  onClick={() => setShowParentDashboard(!showParentDashboard)}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Users className="h-4 w-4 ml-2" />
                  דשבורד הורים
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <User className="h-4 w-4 ml-2" />
                התחבר
              </Button>
            )}
          </div>

          {/* User Profile Card */}
          {showProfile && user && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-background rounded-lg p-6 max-w-md w-full">
                <UserProfileCard />
                <Button
                  onClick={() => setShowProfile(false)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  סגור
                </Button>
              </div>
            </div>
          )}

          {/* Parent Dashboard Modal */}
          {showParentDashboard && user && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-background rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <ParentDashboard />
                <Button
                  onClick={() => setShowParentDashboard(false)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  סגור
                </Button>
              </div>
            </div>
          )}

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
            {!user && (
              <span className="block mt-4 text-primary font-semibold">
                התחבר כדי לשמור את ההתקדמות שלך! 🎯
              </span>
            )}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 max-w-3xl mx-auto">
            <div 
              className="flex flex-col items-center p-4 sm:p-6 bg-card rounded-lg shadow-game touch-manipulation cursor-pointer hover:bg-card/80 active:scale-95 transition-all"
              onClick={() => {
                console.log("Learn words card clicked!");
                setGameMode("vocabulary");
                setGameStarted(true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                console.log("Learn words card touched!");
                setGameMode("vocabulary");
                setGameStarted(true);
              }}
            >
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-3" />
              <h3 className="font-bold mb-2 text-base sm:text-lg">למד מילים</h3>
              <p className="text-sm text-muted-foreground text-center">
                אוצר מילים חדש וניגודים
              </p>
            </div>
            
            <div 
              className="flex flex-col items-center p-4 sm:p-6 bg-card rounded-lg shadow-game touch-manipulation cursor-pointer hover:bg-card/80 active:scale-95 transition-all"
              onClick={() => {
                console.log("Grammar card clicked!");
                setGameMode("grammar");
                setGameStarted(true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                console.log("Grammar card touched!");
                setGameMode("grammar");
                setGameStarted(true);
              }}
            >
              <Target className="w-10 h-10 sm:w-12 sm:h-12 text-success mb-3" />
              <h3 className="font-bold mb-2 text-base sm:text-lg">תרגל דקדוק</h3>
              <p className="text-sm text-muted-foreground text-center">
                הפועל to be ומבני משפט
              </p>
            </div>
            
            <div 
              className="flex flex-col items-center p-4 sm:p-6 bg-card rounded-lg shadow-game touch-manipulation cursor-pointer hover:bg-card/80 active:scale-95 transition-all"
              onClick={() => {
                console.log("Prizes card clicked!");
                setGameMode("all");
                setGameStarted(true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                console.log("Prizes card touched!");
                setGameMode("all");
                setGameStarted(true);
              }}
            >
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-accent mb-3" />
              <h3 className="font-bold mb-2 text-base sm:text-lg">זכה בפרסים</h3>
              <p className="text-sm text-muted-foreground text-center">
                עלה ברמות וצבור נקודות
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => {
              console.log("Start button clicked!");
              setGameMode("all");
              setGameStarted(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              console.log("Start button touched!");
              setGameMode("all");
              setGameStarted(true);
            }}
            size="lg"
            className="bg-gradient-hero hover:opacity-90 active:scale-95 text-lg sm:text-xl px-6 sm:px-8 py-4 sm:py-6 min-h-[60px] touch-manipulation animate-glow-pulse"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            התחל את ההרפתקה! 🚀
          </Button>

          {/* Auth Modal */}
          <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
        </div>
      </div>
    );
  }

  const currentGameData = currentGame ? selectedCategory.levels.find(g => g.id === currentGame) : null;

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

  const getFilteredGames = () => {
    if (gameMode === "vocabulary") {
      return selectedCategory.levels.filter(level => 
        level.title.includes("אוצר מילים") || level.title.includes("ניגודים")
      );
    }
    if (gameMode === "grammar") {
      return selectedCategory.levels.filter(level => 
        level.title.includes("דקדוק") || level.title.includes("השלמת משפטים")
      );
    }
    return selectedCategory.levels;
  };

  const getModeTitle = () => {
    if (gameMode === "vocabulary") return "למד מילים חדשות:";
    if (gameMode === "grammar") return "תרגל דקדוק:";
    return "בחר משחק:";
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto">
        <GameHeader {...playerData} />
        
        {/* Enhanced Score Display */}
        <div className="bg-gradient-hero p-6 rounded-lg shadow-game mb-6 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-2">הציון הכללי שלך</h2>
          <div className="text-4xl font-bold text-primary-foreground mb-2">
            {playerData.score.toLocaleString()} נקודות
          </div>
          <p className="text-primary-foreground/80">
            רמה {playerData.level} • {playerData.completedLevels.length} משחקים הושלמו
          </p>
          
          {/* XP System Explanation */}
          <div className="mt-4 p-3 bg-white/10 rounded-lg text-sm text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <span className="font-semibold">איך עובדת מערכת הניסיון?</span>
              <Star className="w-4 h-4" />
            </div>
            <p className="text-primary-foreground/90">
              בכל משחק שתשלים תזכה בנקודות ניסיון שיעזרו לך לעלות ברמה ולפתוח משחקים חדשים
            </p>
          </div>
        </div>
        
        {/* Category Selection */}
        <div className="bg-card p-4 rounded-lg shadow-game mb-6">
          <h3 className="text-lg font-bold mb-3 text-right">בחר סוג הכנה:</h3>
          <Select
            value={selectedCategory.id}
            onValueChange={(value) => {
              const category = gameCategories.find(cat => cat.id === value);
              if (category) setSelectedCategory(category);
            }}
          >
            <SelectTrigger className="w-full text-right bg-background border-2 hover:border-primary/50 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 shadow-lg z-50">
              {gameCategories.map((category) => (
                <SelectItem 
                  key={category.id} 
                  value={category.id}
                  className="text-right hover:bg-secondary/80 focus:bg-secondary/80"
                >
                  <div className="text-right">
                    <div className="font-bold">{category.title}</div>
                    <div className="text-sm opacity-80">{category.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-right">{getModeTitle()}</h2>
            {gameMode !== "all" && (
              <Button 
                variant="outline"
                onClick={() => setGameMode("all")}
                className="text-sm"
              >
                כל המשחקים
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {getFilteredGames().map((level) => (
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
