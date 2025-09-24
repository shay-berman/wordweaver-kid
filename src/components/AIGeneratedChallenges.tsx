import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Play, Calendar, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIChallenge {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  questions: any;
  created_at: string;
}

interface AIGeneratedChallengesProps {
  onChallengeSelect: (challenge: AIChallenge) => void;
  refreshTrigger?: number;
}

export const AIGeneratedChallenges = ({ onChallengeSelect, refreshTrigger }: AIGeneratedChallengesProps) => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<AIChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_generated_challenges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching AI challenges:', error);
        toast.error('שגיאה בטעינת האתגרים');
        return;
      }

      setChallenges(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('שגיאה בטעינת האתגרים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [user, refreshTrigger]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'מתחיל';
      case 'intermediate':
        return 'בינוני';
      case 'advanced':
        return 'מתקדם';
      default:
        return difficulty;
    }
  };

  if (!user) {
    return (
      <div className="text-center p-8">
        <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">התחבר כדי לראות את האתגרים המותאמים שלך</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">טוען אתגרים...</p>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center p-8">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-2">עדיין לא יצרת אתגרים מותאמים</p>
        <p className="text-sm text-muted-foreground">העלה תמונה של שיעורי הבית שלך כדי ליצור אתגר חדש!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">האתגרים המותאמים שלי</h3>
      </div>

      <div className="grid gap-4">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base mb-2">{challenge.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-3">
                    {challenge.description}
                  </p>
                </div>
                <Badge className={getDifficultyColor(challenge.difficulty_level)}>
                  {getDifficultyText(challenge.difficulty_level)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {Array.isArray(challenge.questions) ? challenge.questions.length : 0} שאלות
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(challenge.created_at).toLocaleDateString('he-IL')}
                  </div>
                </div>
                <Button
                  onClick={() => onChallengeSelect(challenge)}
                  size="sm"
                  className="bg-gradient-hero hover:opacity-90"
                >
                  <Play className="h-4 w-4 ml-1" />
                  התחל
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};