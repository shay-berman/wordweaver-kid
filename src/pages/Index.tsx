import { useState, useEffect } from "react";
import { GameHeader } from "@/components/GameHeader";
import { GameCard } from "@/components/GameCard";
import { QuizGame } from "@/components/QuizGame";
import { AuthModal } from "@/components/AuthModal";
import { UserProfileCard } from "@/components/UserProfile";
import { HomeworkUpload } from "@/components/HomeworkUpload";
import { AIGeneratedChallenges } from "@/components/AIGeneratedChallenges";
import { gameCategories, initialPlayerData, GameCategory } from "@/data/gameData";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Trophy, Target, User, Star, Users, Brain, Upload, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ParentDashboard } from "@/components/ParentDashboard";
import { AdventurePath } from "@/components/AdventurePath";
import { supabase } from "@/integrations/supabase/client";
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
  const [showHomeworkUpload, setShowHomeworkUpload] = useState(false);
  const [showAIChallenges, setShowAIChallenges] = useState(false);
  const [currentAIChallenge, setCurrentAIChallenge] = useState<any>(null);
  const [aiChallengesRefresh, setAiChallengesRefresh] = useState(0);
  const [allCategories, setAllCategories] = useState<GameCategory[]>(gameCategories);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);

  const loadUserChallenges = async () => {
    if (!user) return;
    
    try {
      const { data: challenges, error } = await supabase
        .from('ai_generated_challenges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading user challenges:', error);
        return;
      }
      
      setUserChallenges(challenges || []);
    } catch (error) {
      console.error('Error loading user challenges:', error);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("englishGameData");
    if (saved) {
      setPlayerData(JSON.parse(saved));
    }
    
    // Load custom categories from localStorage
    const savedCategories = localStorage.getItem("customCategories");
    if (savedCategories) {
      const customCategories = JSON.parse(savedCategories);
      setAllCategories([...gameCategories, ...customCategories]);
    }

    // Load user challenges when user is available
    if (user) {
      loadUserChallenges();
    }
  }, [user]);

  // Update categories when user challenges change
  useEffect(() => {
    const savedCategories = localStorage.getItem("customCategories");
    const customCategories = savedCategories ? JSON.parse(savedCategories) : [];
    
    // Convert user challenges to category format
    const userChallengeCategories = userChallenges.map((challenge) => ({
      id: `ai_${challenge.id}`,
      title: `🤖 ${challenge.title}`,
      description: challenge.description,
      color: "from-purple-500 to-pink-600",
      icon: "brain",
      estimatedTime: "15 דקות",
      levels: [
        {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          difficulty: "easy" as const,
          unlockLevel: 1,
          estimatedMinutes: 15,
          xpReward: 50,
          questions: challenge.questions || []
        }
      ]
    }));
    
    setAllCategories([...gameCategories, ...customCategories, ...userChallengeCategories]);
  }, [userChallenges]);

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
    // Check if this is an AI challenge
    if (selectedCategory.id.startsWith('ai_')) {
      const challenge = userChallenges.find(c => c.id === gameId);
      if (challenge) {
        setCurrentAIChallenge(challenge);
        return;
      }
    }

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
                <Button
                  onClick={() => setShowHomeworkUpload(!showHomeworkUpload)}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Upload className="h-4 w-4 ml-2" />
                  העלה שיעורי בית
                </Button>
                <Button
                  onClick={() => setShowAIChallenges(!showAIChallenges)}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Brain className="h-4 w-4 ml-2" />
                  האתגרים שלי
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

          {/* Homework Upload Modal */}
          {showHomeworkUpload && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-background rounded-lg p-6 max-w-md w-full">
                <HomeworkUpload 
                  onChallengeCreated={() => {
                    setShowHomeworkUpload(false);
                    setAiChallengesRefresh(prev => prev + 1);
                    loadUserChallenges(); // Reload user challenges to update dropdown
                    toast.success('אתגר חדש נוצר! ניתן לבחור אותו מרשימת המסלולים');
                  }}
                />
                <Button
                  onClick={() => setShowHomeworkUpload(false)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  סגור
                </Button>
              </div>
            </div>
          )}

          {/* AI Challenges Modal */}
          {showAIChallenges && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <AIGeneratedChallenges 
                  onChallengeSelect={(challenge) => {
                    setCurrentAIChallenge(challenge);
                    setShowAIChallenges(false);
                  }}
                  refreshTrigger={aiChallengesRefresh}
                />
                <Button
                  onClick={() => setShowAIChallenges(false)}
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
              const category = allCategories.find(cat => cat.id === categoryId);
              if (category) setSelectedCategory(category);
            }}>
              <SelectTrigger className="w-full bg-background/80 backdrop-blur border-primary/20 hover:border-primary/40 min-h-[50px] text-right z-50">
                <SelectValue placeholder="בחר מסלול" />
              </SelectTrigger>
              <SelectContent className="bg-background border-primary/20 shadow-xl z-50">
                {/* Default categories section */}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50">
                  מסלולי ברירת מחדל
                </div>
                {gameCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-right cursor-pointer hover:bg-primary/10">
                    <div className="text-right">
                      <div className="font-medium flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {category.title}
                      </div>
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    </div>
                  </SelectItem>
                ))}
                
                {/* User challenges section */}
                {userChallenges.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50 mt-2">
                      המסלולים שלי (מהעלאת שיעורי בית)
                    </div>
                    {allCategories
                      .filter(cat => cat.id.startsWith('ai_'))
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-right cursor-pointer hover:bg-primary/10">
                          <div className="text-right">
                            <div className="font-medium flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-purple-500" />
                              {category.title}
                            </div>
                            <div className="text-sm text-muted-foreground">{category.description}</div>
                          </div>
                        </SelectItem>
                      ))
                    }
                  </>
                )}
                
                {/* Custom categories section */}
                {allCategories.some(cat => !gameCategories.some(gc => gc.id === cat.id) && !cat.id.startsWith('ai_')) && (
                  <>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50 mt-2">
                      מסלולים דומים שנוצרו
                    </div>
                    {allCategories
                      .filter(cat => !gameCategories.some(gc => gc.id === cat.id) && !cat.id.startsWith('ai_'))
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-right cursor-pointer hover:bg-primary/10">
                          <div className="text-right">
                            <div className="font-medium flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-500" />
                              {category.title}
                            </div>
                            <div className="text-sm text-muted-foreground">{category.description}</div>
                          </div>
                        </SelectItem>
                      ))
                    }
                  </>
                )}
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

  // Handle AI Challenge
  if (currentAIChallenge) {
    // Convert AI questions to the format expected by QuizGame
    const formattedQuestions = Array.isArray(currentAIChallenge.questions) 
      ? currentAIChallenge.questions.map((q: any, index: number) => ({
          id: `ai_question_${index}`,
          type: q.type || "multiple-choice" as const,
          question: q.question || "",
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
          explanation: q.explanation || "",
          sentence: q.sentence || "", // For highlight and fill_blank types
          targetWord: q.targetWord || "" // For highlight type
        }))
      : [];

    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="max-w-4xl mx-auto">
          <GameHeader {...playerData} />
          <QuizGame
            questions={formattedQuestions}
            onComplete={(score, xpEarned) => {
              const totalQuestions = formattedQuestions.length;
              handleGameComplete(`ai_${currentAIChallenge.id}`, score, xpEarned, totalQuestions);
              setCurrentAIChallenge(null);
            }}
            onBack={() => setCurrentAIChallenge(null)}
          />
        </div>
      </div>
    );
  }

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
      onAIChallengeSelect={setCurrentAIChallenge}
      onSimilarPathCreated={(newCategory) => {
        // Save the new category to localStorage
        const savedCategories = localStorage.getItem("customCategories");
        const existingCustomCategories = savedCategories ? JSON.parse(savedCategories) : [];
        const updatedCustomCategories = [...existingCustomCategories, newCategory];
        localStorage.setItem("customCategories", JSON.stringify(updatedCustomCategories));
        
        // Update the state to include the new category
        setAllCategories([...gameCategories, ...updatedCustomCategories]);
        
        toast.success('מסלול חדש נוצר! עכשיו אפשר לבחור אותו מרשימת המסלולים');
        setGameStarted(false); // Go back to category selection to show new option
      }}
    />
  );
};

export default Index;
