import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Star } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  completed?: boolean;
  locked?: boolean;
  onClick: () => void;
}

export const GameCard = ({ 
  title, 
  description, 
  difficulty, 
  xpReward, 
  completed, 
  locked,
  onClick 
}: GameCardProps) => {
  const difficultyColors = {
    easy: "bg-success text-success-foreground",
    medium: "bg-warning text-warning-foreground", 
    hard: "bg-destructive text-destructive-foreground"
  };

  const difficultyLabels = {
    easy: "קל",
    medium: "בינוני",
    hard: "קשה"
  };

  return (
    <Card 
      className={`transition-all duration-300 active:scale-95 touch-manipulation cursor-pointer ${
        locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:bg-gradient-to-br active:from-card active:to-muted/30'
      } ${completed ? 'border-success bg-success/10' : ''}`}
      onClick={() => {
        console.log("Card clicked!");
        if (!locked) onClick();
      }}
    >
      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            {completed && <CheckCircle className="w-5 h-5 text-success" />}
            {locked && <Clock className="w-5 h-5 text-muted-foreground" />}
            {title}
          </CardTitle>
          <Badge className={difficultyColors[difficulty]}>
            {difficultyLabels[difficulty]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0">
        <p className="text-muted-foreground mb-4 text-right text-sm sm:text-base">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-accent">
            <Star className="w-4 h-4" />
            <span className="font-semibold text-sm sm:text-base">+{xpReward} XP</span>
          </div>
          
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              console.log("Game button clicked!");
              if (!locked) onClick();
            }}
            disabled={locked}
            variant={completed ? "secondary" : "default"}
            className="bg-gradient-hero hover:opacity-90 transition-opacity min-h-[44px] px-4 sm:px-6 text-sm sm:text-base touch-manipulation"
          >
            {completed ? "בוצע ✓" : locked ? "נעול 🔒" : "התחל"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};