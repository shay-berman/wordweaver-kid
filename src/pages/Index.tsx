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
import { AdventurePath } from "@/components/AdventurePath";
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

  const handleGameComplete = (gameId: string, score: number, xpEarned: number, totalQuestions: number) => {
    const percentage = (score / totalQuestions) * 100;
    const passThreshold = 70; // צריך לקבל לפחות 70% כדי לעבור
    
    const newPlayerData = {
      ...playerData,
      xp: playerData.xp + xpEarned,
      score: playerData.score + score * 10,
      completedLevels: percentage >= passThreshold 
        ? [...playerData.completedLevels, gameId]
        : playerData.completedLevels
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
    
    if (percentage >= passThreshold) {
      toast.success(`כל הכבוד! עברת את השלב עם ${percentage.toFixed(0)}%! זכית ב-${xpEarned} נקודות ניסיון! ⭐`);
    } else {
      toast.error(`צריך לפחות ${passThreshold}% כדי לעבור. קיבלת ${percentage.toFixed(0)}%. נסה שוב! 🔄`);
    }
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
      const xpToNext = playerData.xpToNext;
      
      // Calculate total XP needed to reach the required level
      let totalXpNeeded = 0;
      
      // First, complete current level
      totalXpNeeded += xpToNext - currentXP;
      
      // Then add XP for all intermediate levels
      for (let level = currentLevel + 1; level < requiredLevel; level++) {
        totalXpNeeded += level * 100; // Each level requires level * 100 XP
      }
      
      toast.error(`המשחק נעול 🔒 - צריך להגיע לרמה ${requiredLevel}. חסר לך עוד ${totalXpNeeded} נקודות ניסיון!`);
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
          
          {/* Course Selection Dropdown */}
          <div className="mb-8 max-w-md mx-auto">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              בחר מסלול לימוד:
            </label>
            <Select value={selectedCategory.id} onValueChange={(categoryId) => {
              const category = gameCategories.find(cat => cat.id === categoryId);
              if (category) setSelectedCategory(category);
            }}>
              <SelectTrigger className="w-full bg-background/80 backdrop-blur border-primary/20 hover:border-primary/40 min-h-[50px] text-right z-50">
                <SelectValue placeholder="בחר מסלול" />
              </SelectTrigger>
              <SelectContent className="bg-background border-primary/20 shadow-xl z-50">
                {gameCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-right cursor-pointer hover:bg-primary/10">
                    <div className="text-right">
                      <div className="font-medium">{category.title}</div>
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            onComplete={(score, xpEarned) => handleGameComplete(currentGame, score, xpEarned, currentGameData.questions.length)}
            onBack={() => setCurrentGame(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <AdventurePath 
      selectedCategory={selectedCategory}
      playerData={playerData}
      onGameSelect={startGame}
      onBack={() => setGameStarted(false)}
    />
  );
};

export default Index;
