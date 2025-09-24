import { useState } from 'react';
import { GameCard } from './GameCard';
import { Button } from './ui/button';
import { ArrowRight, MapPin, Star, Trophy, User, Map } from 'lucide-react';
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

  const resetProgress = () => {
    // Reset completed levels for current category
    const updatedPlayerData = {
      ...playerData,
      completedLevels: playerData.completedLevels.filter(levelId => 
        !selectedCategory.levels.some(level => level.id === levelId)
      )
    };
    localStorage.setItem("englishGameData", JSON.stringify(updatedPlayerData));
    // Refresh the page to update the state
    window.location.reload();
  };

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

  // Calculate path positions for a winding map-like path
  const getPathPosition = (index: number, total: number) => {
    const pathWidth = 80; // How wide the zigzag should be
    const verticalSpacing = 200; // Space between levels vertically
    
    // Create a winding path that alternates sides and curves
    const progress = index / (total - 1);
    const yPosition = index * verticalSpacing;
    
    // Create different patterns for different sections
    let xOffset = 0;
    const section = Math.floor(index / 3); // Group every 3 levels
    
    if (section % 4 === 0) {
      // Straight zigzag
      xOffset = (index % 2 === 0 ? -pathWidth : pathWidth);
    } else if (section % 4 === 1) {
      // Curved to the right
      xOffset = pathWidth * Math.sin(index * 0.8);
    } else if (section % 4 === 2) {
      // S-curve
      xOffset = pathWidth * Math.sin(index * 1.2) * (index % 2 === 0 ? 1 : -1);
    } else {
      // Curved to the left
      xOffset = -pathWidth * Math.sin(index * 0.8);
    }
    
    return { x: xOffset, y: yPosition };
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button onClick={onBack} variant="outline">
              חזור
            </Button>
            <Button 
              onClick={resetProgress} 
              variant="outline"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              🔄 התחל מחדש
            </Button>
          </div>
          <div className="text-center flex items-center gap-2">
            <Map className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                מפת ההרפתקאות
              </h1>
              <p className="text-muted-foreground mt-1">{selectedCategory.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Star className="w-5 h-5" />
            <span className="font-bold">{playerData.score.toLocaleString()}</span>
          </div>
        </div>

        {/* Adventure Map */}
        <div className="relative min-h-[800px] bg-gradient-to-b from-green-100/20 via-blue-100/20 to-purple-100/20 rounded-3xl p-8 shadow-2xl">
          {/* Map Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #10b981 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, #3b82f6 2px, transparent 2px)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          {/* Winding Path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d={(() => {
                const pathPoints = selectedCategory.levels.map((_, index) => {
                  const pos = getPathPosition(index, selectedCategory.levels.length);
                  return `${300 + pos.x},${100 + pos.y}`;
                });
                return `M ${pathPoints[0]} ${pathPoints.slice(1).map((point, i) => 
                  `Q ${pathPoints[i].split(',')[0]},${(parseInt(pathPoints[i].split(',')[1]) + parseInt(point.split(',')[1])) / 2} ${point}`
                ).join(' ')}`;
              })()}
              stroke="url(#pathGradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray="20,10"
              className="animate-pulse"
            />
          </svg>
          
          {/* Castle Goal - Always Visible */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-gradient-to-b from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-2xl border-4 border-yellow-400">
              <div className="text-center">
                <div className="text-5xl mb-2 animate-pulse">🏰</div>
                <h3 className="text-lg font-bold text-white mb-1">
                  הטירה המלכותית
                </h3>
                <p className="text-white/80 text-sm">
                  המטרה שלך! 👑
                </p>
              </div>
            </div>
          </div>

          {/* Adventure Locations */}
          <div className="relative z-10">
            {selectedCategory.levels.map((level, index) => {
              const isCompleted = playerData.completedLevels.includes(level.id);
              const isLocked = level.unlockLevel > playerData.level;
              const isCurrentPosition = index === currentPosition;
              const isAccessible = !isLocked || isCompleted;
              
              const position = getPathPosition(index, selectedCategory.levels.length);

              return (
                <div 
                  key={level.id} 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${position.x}px)`,
                    top: `${100 + position.y}px`
                  }}
                >
                  {/* Character at current position */}
                  {isCurrentPosition && !isCompleted && (
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-30">
                      <div className="relative">
                        <img 
                          src={childCharacter} 
                          alt="Adventure Character" 
                          className="w-20 h-20 rounded-full shadow-xl animate-bounce border-4 border-primary bg-white"
                        />
                        <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full p-1 text-xs animate-pulse">
                          🗺️
                        </div>
                      </div>
                      <div className="text-xs text-center mt-1 font-bold text-primary bg-white/90 rounded-full px-2 py-1 shadow-md">
                        כאן אני!
                      </div>
                    </div>
                  )}

                  {/* Location Marker */}
                  <div className={`relative z-20 ${isCurrentPosition && !isCompleted ? 'animate-pulse' : ''}`}>
                    <div className={`w-12 h-12 rounded-full border-4 shadow-xl flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-success border-success text-success-foreground shadow-success/50' 
                        : isAccessible 
                          ? 'bg-primary border-primary text-primary-foreground shadow-primary/50' 
                          : 'bg-muted border-muted-foreground text-muted-foreground shadow-muted/30'
                    }`}>
                      {isCompleted ? (
                        <div className="text-lg">✅</div>
                      ) : isAccessible ? (
                        <MapPin className="w-6 h-6" />
                      ) : (
                        <div className="text-lg">🔒</div>
                      )}
                    </div>
                    
                    {/* Step Number Badge */}
                    <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>

                  {/* Game Card */}
                  <div className={`mt-6 w-72 ${isCurrentPosition && !isCompleted ? 'ring-4 ring-primary/50 ring-offset-2' : ''}`}>
                    <GameCard
                      title={level.title}
                      description={level.description}
                      difficulty={level.difficulty}
                      xpReward={level.xpReward}
                      completed={isCompleted}
                      locked={isLocked}
                      onClick={() => onGameSelect(level.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Castle - Enhanced Victory */}
          {playerData.completedLevels.length === selectedCategory.levels.length && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-10 rounded-3xl shadow-2xl animate-bounce border-8 border-yellow-300 ring-4 ring-yellow-200">
                <div className="text-center">
                  <div className="text-8xl mb-6 animate-pulse">🏰</div>
                  <Trophy className="w-20 h-20 text-yellow-100 mx-auto mb-6 animate-spin" />
                  <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                    מזל טוב! השלמת את כל המסלול!
                  </h3>
                  <p className="text-white text-lg drop-shadow-md mb-6">
                    הגעת לטירה! אתה אמיץ אמיתי! 👑
                  </p>
                  <div className="text-6xl animate-bounce mb-4">🎉</div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={onBack}
                      className="bg-white text-yellow-600 hover:bg-yellow-50 font-bold px-6 py-3 rounded-xl shadow-lg border-2 border-yellow-300"
                    >
                      🏠 חזור להתחלה
                    </Button>
                    <Button 
                      onClick={resetProgress}
                      variant="outline"
                      className="bg-white/20 text-white border-white hover:bg-white/30 font-bold px-6 py-3 rounded-xl shadow-lg"
                    >
                      🔄 התחל מסלול מחדש
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};