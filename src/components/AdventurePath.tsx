import { useState } from 'react';
import { GameCard } from './GameCard';
import { Button } from './ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowRight, MapPin, Star, Trophy, User, Map, CheckCircle, Lock, Upload, Brain, BookOpen } from 'lucide-react';
import { GameCategory } from '@/data/gameData';
import { HomeworkUpload } from './HomeworkUpload';
import { AIGeneratedChallenges } from './AIGeneratedChallenges';
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
  onAIChallengeSelect?: (challenge: any) => void;
}

export const AdventurePath = ({ selectedCategory, playerData, onGameSelect, onBack, onAIChallengeSelect }: AdventurePathProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showHomeworkUpload, setShowHomeworkUpload] = useState(false);
  const [showAIChallenges, setShowAIChallenges] = useState(false);
  const [aiChallengesRefresh, setAiChallengesRefresh] = useState(0);

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
    // Find the first uncompleted level in sequential order
    for (let i = 0; i < selectedCategory.levels.length; i++) {
      const level = selectedCategory.levels[i];
      if (!playerData.completedLevels.includes(level.id)) {
        return i;
      }
    }
    // If all levels are completed, show at the last level
    return selectedCategory.levels.length - 1;
  };

  const currentPosition = getCurrentPosition();

  // Calculate path positions for a snake-like path (right to left, then down and right)
  const getPathPosition = (index: number, total: number) => {
    const containerWidth = 600; // Available width for the path
    const levelsPerRow = 4; // Number of levels per row
    const verticalSpacing = 150; // Space between rows
    const horizontalSpacing = containerWidth / (levelsPerRow + 1); // Space between levels horizontally
    
    // Calculate which row and position in row
    const row = Math.floor(index / levelsPerRow);
    const positionInRow = index % levelsPerRow;
    
    let xOffset, yOffset;
    
    if (row % 2 === 0) {
      // Even rows: go from right to left
      xOffset = containerWidth/2 - (positionInRow * horizontalSpacing);
    } else {
      // Odd rows: go from left to right
      xOffset = -containerWidth/2 + (positionInRow * horizontalSpacing);
    }
    
    yOffset = row * verticalSpacing;
    
    return { x: xOffset, y: yOffset };
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

        {/* AI Challenges Section */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-purple-600" />
                אתגרים מותאמים לשיעורי הבית שלי
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowHomeworkUpload(true)}
                  className="bg-gradient-hero hover:opacity-90 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  העלה שיעורי בית חדשים
                </Button>
                <Button
                  onClick={() => setShowAIChallenges(true)}
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20 flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  האתגרים המותאמים שלי
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Homework Upload Modal */}
        {showHomeworkUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg p-6 max-w-md w-full">
              <HomeworkUpload 
                onChallengeCreated={() => {
                  setShowHomeworkUpload(false);
                  setAiChallengesRefresh(prev => prev + 1);
                  setShowAIChallenges(true);
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
                  setShowAIChallenges(false);
                  onAIChallengeSelect?.(challenge);
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

        {/* Adventure Map */}
        <div className="relative bg-gradient-to-b from-green-100/20 via-blue-100/20 to-purple-100/20 rounded-3xl p-6 shadow-2xl" 
             style={{ height: `${Math.max(400, Math.ceil(selectedCategory.levels.length / 4) * 150 + 300)}px` }}>
          {/* Map Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #10b981 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, #3b82f6 2px, transparent 2px)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          {/* Winding Path - More Visible */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Background glow */}
            <path
              d={(() => {
                const pathPoints = selectedCategory.levels.map((_, index) => {
                  const pos = getPathPosition(index, selectedCategory.levels.length);
                  return { x: 400 + pos.x, y: 80 + pos.y };
                });
                
                if (pathPoints.length === 0) return '';
                
                let pathData = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
                
                for (let i = 1; i < pathPoints.length; i++) {
                  const current = pathPoints[i];
                  const previous = pathPoints[i-1];
                  
                  // Check if we're at the end of a row (need to go down to next row)
                  const currentRow = Math.floor((i-1) / 4);
                  const nextRow = Math.floor(i / 4);
                  
                  if (currentRow !== nextRow) {
                    // Add a curved path down to the next row
                    const midY = (previous.y + current.y) / 2;
                    pathData += ` Q ${previous.x} ${midY} ${current.x} ${current.y}`;
                  } else {
                    // Normal horizontal movement within the same row
                    pathData += ` L ${current.x} ${current.y}`;
                  }
                }
                
                // Add path to castle
                const lastPoint = pathPoints[pathPoints.length - 1];
                const castlePos = getPathPosition(selectedCategory.levels.length, selectedCategory.levels.length + 1);
                const castlePoint = { x: 400 + castlePos.x, y: 80 + castlePos.y };
                pathData += ` Q ${lastPoint.x} ${(lastPoint.y + castlePoint.y) / 2} ${castlePoint.x} ${castlePoint.y}`;
                
                return pathData;
              })()}
              stroke="hsl(var(--primary))"
              strokeWidth="20"
              fill="none"
              opacity="0.3"
              filter="url(#glow)"
            />
            
            {/* Main path */}
            <path
              d={(() => {
                const pathPoints = selectedCategory.levels.map((_, index) => {
                  const pos = getPathPosition(index, selectedCategory.levels.length);
                  return { x: 400 + pos.x, y: 80 + pos.y };
                });
                
                if (pathPoints.length === 0) return '';
                
                let pathData = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
                
                for (let i = 1; i < pathPoints.length; i++) {
                  const current = pathPoints[i];
                  const previous = pathPoints[i-1];
                  
                  // Check if we're at the end of a row (need to go down to next row)
                  const currentRow = Math.floor((i-1) / 4);
                  const nextRow = Math.floor(i / 4);
                  
                  if (currentRow !== nextRow) {
                    // Add a curved path down to the next row
                    const midY = (previous.y + current.y) / 2;
                    pathData += ` Q ${previous.x} ${midY} ${current.x} ${current.y}`;
                  } else {
                    // Normal horizontal movement within the same row
                    pathData += ` L ${current.x} ${current.y}`;
                  }
                }
                
                // Add path to castle
                const lastPoint = pathPoints[pathPoints.length - 1];
                const castlePos = getPathPosition(selectedCategory.levels.length, selectedCategory.levels.length + 1);
                const castlePoint = { x: 400 + castlePos.x, y: 80 + castlePos.y };
                pathData += ` Q ${lastPoint.x} ${(lastPoint.y + castlePoint.y) / 2} ${castlePoint.x} ${castlePoint.y}`;
                
                return pathData;
              })()}
              stroke="url(#pathGradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray="25,15"
              className="animate-pulse"
              filter="url(#glow)"
            />
          </svg>
          
          {/* Castle Goal - At the end of the path */}
          <div className="absolute transform -translate-x-1/2 z-20" 
               style={{ 
                 left: `${400 + getPathPosition(selectedCategory.levels.length, selectedCategory.levels.length + 1).x}px`,
                 top: `${80 + getPathPosition(selectedCategory.levels.length, selectedCategory.levels.length + 1).y}px` 
               }}>
            <div className="bg-gradient-to-b from-purple-500 to-indigo-600 p-4 rounded-2xl shadow-2xl border-4 border-yellow-400">
              <div className="text-center">
                <div className="text-4xl mb-2 animate-pulse">🏰</div>
                <h3 className="text-base font-bold text-white mb-1">
                  הטירה המלכותית
                </h3>
                <p className="text-white/80 text-xs">
                  המטרה שלך! 👑
                </p>
              </div>
            </div>
          </div>

          {/* Adventure Locations */}
          <div className="relative z-10">
            {selectedCategory.levels.map((level, index) => {
              const isCompleted = playerData.completedLevels.includes(level.id);
              // Simple sequential unlock: can only access if previous level is completed (or it's the first level)
              const isLocked = index > 0 && !playerData.completedLevels.includes(selectedCategory.levels[index - 1].id);
              const isCurrentPosition = index === currentPosition;
              const isAccessible = !isLocked || isCompleted;
              
              const position = getPathPosition(index, selectedCategory.levels.length);

              return (
                <div 
                  key={level.id} 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${400 + position.x}px`,
                    top: `${80 + position.y}px`
                  }}
                >
                  {/* Character at current position */}
                  {isCurrentPosition && !isCompleted && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-30">
                      <div className="relative">
                        <img 
                          src={childCharacter} 
                          alt="Adventure Character" 
                          className="w-16 h-16 rounded-full shadow-xl animate-bounce border-4 border-primary bg-white"
                        />
                        <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full p-1 text-xs animate-pulse">
                          🗺️
                        </div>
                      </div>
                      <div className="text-xs text-center mt-1 font-bold text-primary bg-white/90 rounded-full px-2 py-1 shadow-md">
                        כאן אני!
                      </div>
                    </div>
                  )}

                  {/* Location Marker with Hover Details */}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div 
                        className={`relative z-20 cursor-pointer transition-all duration-300 hover:scale-110 ${
                          isCurrentPosition && !isCompleted ? 'animate-pulse' : ''
                        } ${!isLocked ? 'hover:shadow-2xl' : ''}`}
                        onClick={() => !isLocked && onGameSelect(level.id)}
                      >
                        <div className={`w-20 h-20 rounded-full border-4 shadow-2xl flex items-center justify-center transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-success border-success text-success-foreground shadow-success/50 shadow-xl' 
                            : isAccessible 
                              ? 'bg-primary border-primary text-primary-foreground shadow-primary/50 hover:shadow-primary/70 shadow-xl' 
                              : 'bg-muted border-muted-foreground text-muted-foreground shadow-muted/30'
                        } backdrop-blur-sm ring-2 ring-white/30`}>
                          {isCompleted ? (
                            <CheckCircle className="w-8 h-8" />
                          ) : isAccessible ? (
                            <MapPin className="w-8 h-8" />
                          ) : (
                            <Lock className="w-8 h-8" />
                          )}
                        </div>
                        
                        {/* Step Number Badge */}
                        <div className="absolute -top-3 -right-3 bg-accent text-accent-foreground rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold shadow-2xl border-2 border-white">
                          {index + 1}
                        </div>
                      </div>
                    </HoverCardTrigger>
                    
                    <HoverCardContent className="w-80 p-4 bg-background border-primary/20 shadow-2xl" side="right">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {isCompleted && <CheckCircle className="w-5 h-5 text-success" />}
                            {isLocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                            <h3 className="text-lg font-bold">{level.title}</h3>
                          </div>
                          <Badge className={`${
                            level.difficulty === 'easy' ? 'bg-success text-success-foreground' :
                            level.difficulty === 'medium' ? 'bg-warning text-warning-foreground' :
                            'bg-destructive text-destructive-foreground'
                          }`}>
                            {level.difficulty === 'easy' ? 'קל' : 
                             level.difficulty === 'medium' ? 'בינוני' : 'קשה'}
                          </Badge>
                        </div>
                        
                        {/* Description */}
                        <p className="text-muted-foreground text-right">{level.description}</p>
                        
                        {/* XP Reward */}
                        <div className="flex items-center gap-2 text-accent">
                          <Star className="w-4 h-4" />
                          <span className="font-semibold">+{level.xpReward} נקודות ניסיון</span>
                        </div>
                        
                        {/* Action Button */}
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLocked) onGameSelect(level.id);
                          }}
                          disabled={isLocked}
                          variant={isCompleted ? "secondary" : "default"}
                          className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
                        >
                          {isCompleted ? "בוצע ✓" : isLocked ? "נעול 🔒" : "התחל"}
                        </Button>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
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