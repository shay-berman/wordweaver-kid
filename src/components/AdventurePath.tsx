import { useState } from 'react';
import { GameCard } from './GameCard';
import { Button } from './ui/button';
import { ArrowRight, MapPin, Star, Trophy, User } from 'lucide-react';
import { GameCategory } from '@/data/gameData';
import childCharacter from '@/assets/child-character.png';

interface AdventurePathProps {
  selectedCategory: GameCategory;
  playerData: {
    level: number;
    xp: number;
    score: number;
    completedLevels: string[];
    xpToNext: number;
  };
  onGameSelect: (gameId: string) => void;
  onBack: () => void;
}

export const AdventurePath = ({ selectedCategory, playerData, onGameSelect, onBack }: AdventurePathProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // Find the player's current position in the adventure
  const getCurrentPosition = () => {
    // Find the first uncompleted level that the player can access
    for (let i = 0; i < selectedCategory.levels.length; i++) {
      const level = selectedCategory.levels[i];
      if (!playerData.completedLevels.includes(level.id) && 
          level.unlockLevel <= playerData.level) {
        return i;
      }
    }
    // If all accessible levels are completed, show at the last completed level
    for (let i = selectedCategory.levels.length - 1; i >= 0; i--) {
      const level = selectedCategory.levels[i];
      if (playerData.completedLevels.includes(level.id)) {
        return i;
      }
    }
    return 0; // Default to first level
  };

  const currentPosition = getCurrentPosition();

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline">
            חזור
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              {selectedCategory.title}
            </h1>
            <p className="text-muted-foreground mt-2">{selectedCategory.description}</p>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Star className="w-5 h-5" />
            <span className="font-bold">{playerData.score.toLocaleString()}</span>
          </div>
        </div>

        {/* Adventure Path */}
        <div className="relative">
          {/* Path Line */}
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-primary/30 to-accent/30 h-full -z-10"></div>
          
          {/* Adventure Steps */}
          <div className="space-y-8">
            {selectedCategory.levels.map((level, index) => {
              const isCompleted = playerData.completedLevels.includes(level.id);
              const isLocked = level.unlockLevel > playerData.level;
              const isCurrentPosition = index === currentPosition;
              const isAccessible = !isLocked || isCompleted;

              return (
                <div key={level.id} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  {/* Character Avatar (only show at current position) */}
                  {isCurrentPosition && !isCompleted && (
                    <div className={`absolute top-0 ${index % 2 === 0 ? 'left-1/2 ml-8' : 'right-1/2 mr-8'} z-20`}>
                      <div className="relative">
                        <img 
                          src={childCharacter} 
                          alt="Adventure Character" 
                          className="w-16 h-16 rounded-full shadow-lg animate-bounce border-4 border-primary bg-white"
                        />
                        <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full p-1 text-xs">
                          🚀
                        </div>
                      </div>
                      <div className="text-xs text-center mt-1 font-bold text-primary">
                        כאן אני!
                      </div>
                    </div>
                  )}

                  {/* Path Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div className={`w-6 h-6 rounded-full border-4 ${
                      isCompleted 
                        ? 'bg-success border-success-foreground' 
                        : isAccessible 
                          ? 'bg-primary border-primary-foreground' 
                          : 'bg-muted border-muted-foreground'
                    }`}>
                      {isCompleted && <div className="w-full h-full flex items-center justify-center text-success-foreground text-xs">✓</div>}
                    </div>
                  </div>

                  {/* Game Card */}
                  <div className={`w-full max-w-md ${index % 2 === 0 ? 'ml-16' : 'mr-16'}`}>
                    <div className={`relative ${isCurrentPosition && !isCompleted ? 'ring-4 ring-primary/50 ring-offset-2' : ''}`}>
                      <GameCard
                        title={level.title}
                        description={level.description}
                        difficulty={level.difficulty}
                        xpReward={level.xpReward}
                        completed={isCompleted}
                        locked={isLocked}
                        onClick={() => onGameSelect(level.id)}
                      />
                      
                      {/* Step Number */}
                      <div className="absolute -top-3 -right-3 bg-accent text-accent-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                        {index + 1}
                      </div>

                      {/* Progress Arrow */}
                      {index < selectedCategory.levels.length - 1 && (
                        <div className={`absolute top-1/2 ${index % 2 === 0 ? '-right-12' : '-left-12'} transform -translate-y-1/2`}>
                          <ArrowRight className={`w-8 h-8 text-muted-foreground ${index % 2 !== 0 ? 'rotate-180' : ''}`} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Trophy */}
          {playerData.completedLevels.length === selectedCategory.levels.length && (
            <div className="mt-12 text-center">
              <div className="bg-gradient-hero p-8 rounded-lg shadow-game animate-scale-in">
                <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">
                  מזל טוב! השלמת את כל המסלול!
                </h3>
                <p className="text-primary-foreground/80">
                  אתה אמיץ אמיתי! המשך למסלול הבא
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};