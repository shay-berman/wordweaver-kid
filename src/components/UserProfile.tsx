import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type GameResult = Database['public']['Tables']['game_results']['Row']
import { Trophy, Star, Target, LogOut } from 'lucide-react'

export const UserProfileCard: React.FC = () => {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recentGames, setRecentGames] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      // Load user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Load recent games
      const { data: gamesData } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5)

      if (gamesData) {
        setRecentGames(gamesData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDisplayName = () => {
    return profile?.display_name || 
           user?.user_metadata?.display_name || 
           user?.user_metadata?.full_name || 
           user?.email?.split('@')[0] || 
           'שחקן חדש'
  }

  const getAverageScore = () => {
    if (recentGames.length === 0) return 0
    const total = recentGames.reduce((sum, game) => sum + (game.score / game.total_questions) * 100, 0)
    return Math.round(total / recentGames.length)
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse">טוען פרופיל...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 shadow-game">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 bg-gradient-hero border-2 border-primary/30">
              <AvatarFallback className="text-2xl font-bold text-primary-foreground">
                {getDisplayName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                {getDisplayName()}
              </CardTitle>
              <p className="text-muted-foreground">שחקן במשחק המילים</p>
            </div>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 ml-2" />
            יציאה
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-background/50 rounded-lg border border-primary/20">
            <Trophy className="h-8 w-8 mx-auto text-accent mb-2" />
            <div className="text-2xl font-bold text-foreground">{profile?.total_score || 0}</div>
            <div className="text-sm text-muted-foreground">נקודות כולל</div>
          </div>
          
          <div className="text-center p-4 bg-background/50 rounded-lg border border-primary/20">
            <Target className="h-8 w-8 mx-auto text-success mb-2" />
            <div className="text-2xl font-bold text-foreground">{getAverageScore()}%</div>
            <div className="text-sm text-muted-foreground">ממוצע</div>
          </div>
          
          <div className="text-center p-4 bg-background/50 rounded-lg border border-primary/20">
            <Star className="h-8 w-8 mx-auto text-warning mb-2" />
            <div className="text-2xl font-bold text-foreground">{profile?.current_level || 1}</div>
            <div className="text-sm text-muted-foreground">שלב נוכחי</div>
          </div>
        </div>

        {/* Recent Games */}
        {recentGames.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-3 text-foreground">משחקים אחרונים</h3>
            <div className="space-y-2">
              {recentGames.slice(0, 3).map((game) => (
                <div
                  key={game.id}
                  className="flex justify-between items-center p-3 bg-background/30 rounded-lg border border-primary/10"
                >
                  <div>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      שלב {game.level}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground">
                      {game.score}/{game.total_questions}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round((game.score / game.total_questions) * 100)}%
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(game.completed_at).toLocaleDateString('he-IL')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile?.games_played === 0 && (
          <div className="text-center p-6 bg-gradient-magic rounded-lg border border-accent/30">
            <Star className="h-12 w-12 mx-auto text-accent-foreground mb-3" />
            <h3 className="font-bold text-accent-foreground mb-2">ברוך הבא למשחק!</h3>
            <p className="text-accent-foreground/80">התחל לשחק כדי לראות את הסטטיסטיקות שלך</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}