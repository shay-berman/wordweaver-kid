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
    <Card className={`transition-all duration-300 hover:scale-105 hover:shadow-game ${
      locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gradient-to-br hover:from-card hover:to-muted/30'
    } ${completed ? 'border-success bg-success/10' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {completed && <CheckCircle className="w-5 h-5 text-success" />}
            {locked && <Clock className="w-5 h-5 text-muted-foreground" />}
            {title}
          </CardTitle>
          <Badge className={difficultyColors[difficulty]}>
            {difficultyLabels[difficulty]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground mb-4 text-right">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-accent">
            <Star className="w-4 h-4" />
            <span className="font-semibold">+{xpReward} XP</span>
          </div>
          
          <Button 
            onClick={onClick}
            disabled={locked}
            variant={completed ? "secondary" : "default"}
            className="bg-gradient-hero hover:opacity-90 transition-opacity"
          >
            {completed ? "בוצע ✓" : locked ? "נעול 🔒" : "התחל"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};