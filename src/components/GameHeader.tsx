import { Trophy, Star, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface GameHeaderProps {
  playerName: string;
  level: number;
  xp: number;
  xpToNext: number;
  score: number;
}

export const GameHeader = ({ playerName, level, xp, xpToNext, score }: GameHeaderProps) => {
  const xpProgress = (xp / xpToNext) * 100;

  return (
    <div className="bg-gradient-hero p-6 rounded-lg shadow-game mb-6">
      <div className="flex items-center justify-between text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-3">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{playerName}</h2>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Zap className="w-4 h-4" />
              Level {level}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
            <Trophy className="w-4 h-4 mr-1" />
            {score} נקודות
          </Badge>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm text-primary-foreground/80 mb-1">
          <span>ניסיון</span>
          <span>{xp} / {xpToNext}</span>
        </div>
        <Progress value={xpProgress} className="h-2 bg-white/20" />
      </div>
    </div>
  );
};