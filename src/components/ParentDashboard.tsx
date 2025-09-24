import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'
import { CalendarDays, Trophy, TrendingUp, Clock, Star, Target } from 'lucide-react'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

type GameResult = Tables<'game_results'>
type UserProfile = Tables<'user_profiles'>

interface DailyStats {
  date: string
  gamesPlayed: number
  totalScore: number
  averageScore: number
  bestScore: number
}

export const ParentDashboard = () => {
  const [childProfiles, setChildProfiles] = useState<UserProfile[]>([])
  const [selectedChild, setSelectedChild] = useState<UserProfile | null>(null)
  const [gameResults, setGameResults] = useState<GameResult[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChildrenData()
  }, [])

  useEffect(() => {
    if (selectedChild) {
      loadChildGameResults(selectedChild.user_id)
    }
  }, [selectedChild])

  const loadChildrenData = async () => {
    try {
      // בהתחלה נטען את כל הפרופילים (בעתיד אפשר לסנן לפי הורה)
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profiles && profiles.length > 0) {
        setChildProfiles(profiles)
        setSelectedChild(profiles[0])
      }
    } catch (error) {
      console.error('Error loading children data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChildGameResults = async (childId: string) => {
    try {
      const { data: results } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', childId)
        .order('completed_at', { ascending: false })

      if (results) {
        setGameResults(results)
        calculateDailyStats(results)
      }
    } catch (error) {
      console.error('Error loading game results:', error)
    }
  }

  const calculateDailyStats = (results: GameResult[]) => {
    const statsMap = new Map<string, DailyStats>()

    results.forEach((result) => {
      const date = format(new Date(result.completed_at), 'yyyy-MM-dd')
      const scorePercentage = (result.score / result.total_questions) * 100

      if (!statsMap.has(date)) {
        statsMap.set(date, {
          date,
          gamesPlayed: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: 0,
        })
      }

      const dayStats = statsMap.get(date)!
      dayStats.gamesPlayed++
      dayStats.totalScore += scorePercentage
      dayStats.bestScore = Math.max(dayStats.bestScore, scorePercentage)
    })

    // חישוב ממוצע לכל יום
    const daily = Array.from(statsMap.values()).map((stats) => ({
      ...stats,
      averageScore: Math.round(stats.totalScore / stats.gamesPlayed),
    }))

    daily.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setDailyStats(daily.slice(0, 7)) // 7 ימים אחרונים
  }

  const getChildTotalStats = (child: UserProfile) => {
    const childResults = gameResults.filter((result) => result.user_id === child.user_id)
    if (childResults.length === 0) return { totalGames: 0, averageScore: 0, bestScore: 0 }

    const totalGames = childResults.length
    const totalScore = childResults.reduce(
      (sum, result) => sum + (result.score / result.total_questions) * 100,
      0
    )
    const averageScore = Math.round(totalScore / totalGames)
    const bestScore = Math.max(
      ...childResults.map((result) => (result.score / result.total_questions) * 100)
    )

    return { totalGames, averageScore, bestScore }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse">טוען נתונים...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 shadow-game">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            דשבורד הורים - מעקב התקדמות
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* בחירת ילד */}
          <div>
            <h3 className="font-bold text-lg mb-3">בחר ילד למעקב:</h3>
            <div className="grid gap-3">
              {childProfiles.map((child) => {
                const stats = getChildTotalStats(child)
                return (
                  <Card
                    key={child.id}
                    className={`cursor-pointer transition-all ${
                      selectedChild?.id === child.id
                        ? 'border-2 border-primary bg-primary/10'
                        : 'border border-muted hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedChild(child)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-lg">
                            {child.display_name || `שחקן ${child.id.slice(0, 8)}`}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            רמה {child.current_level} • {stats.totalGames} משחקים
                          </p>
                        </div>
                        <div className="text-left">
                          <Badge variant="outline" className="border-success/50 text-success">
                            ממוצע: {stats.averageScore}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {selectedChild && (
            <>
              {/* סטטיסטיקות כלליות */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-background/50 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 mx-auto text-accent mb-2" />
                    <div className="text-2xl font-bold">{selectedChild.total_score}</div>
                    <div className="text-sm text-muted-foreground">נקודות כולל</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-background/50 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 mx-auto text-success mb-2" />
                    <div className="text-2xl font-bold">{selectedChild.games_played}</div>
                    <div className="text-sm text-muted-foreground">משחקים הושלמו</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-background/50 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Star className="h-8 w-8 mx-auto text-warning mb-2" />
                    <div className="text-2xl font-bold">{selectedChild.current_level}</div>
                    <div className="text-sm text-muted-foreground">רמה נוכחית</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-background/50 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
                    <div className="text-2xl font-bold">
                      {getChildTotalStats(selectedChild).averageScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">ממוצע כללי</div>
                  </CardContent>
                </Card>
              </div>

              {/* סטטיסטיקות יומיות */}
              {dailyStats.length > 0 && (
                <Card className="bg-background/50 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      פעילות יומית (7 ימים אחרונים)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dailyStats.map((day) => (
                        <div
                          key={day.date}
                          className="flex justify-between items-center p-3 bg-background/30 rounded-lg"
                        >
                          <div>
                            <div className="font-bold">
                              {format(new Date(day.date), 'dd/MM', { locale: he })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {day.gamesPlayed} משחקים
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-success">
                              {day.averageScore}%
                            </div>
                            <div className="text-xs text-muted-foreground">ממוצע</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-warning">
                              {Math.round(day.bestScore)}%
                            </div>
                            <div className="text-xs text-muted-foreground">הכי טוב</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* משחקים אחרונים */}
              {gameResults.length > 0 && (
                <Card className="bg-background/50 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      משחקים אחרונים
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {gameResults.slice(0, 5).map((result) => (
                        <div
                          key={result.id}
                          className="flex justify-between items-center p-3 bg-background/30 rounded-lg"
                        >
                          <div>
                            <Badge variant="outline" className="border-primary/30">
                              שלב {result.level}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">
                              {result.score}/{result.total_questions}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Math.round((result.score / result.total_questions) * 100)}%
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(result.completed_at), 'dd/MM HH:mm', { locale: he })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {childProfiles.length === 0 && (
            <div className="text-center p-6 bg-gradient-magic rounded-lg border border-accent/30">
              <Star className="h-12 w-12 mx-auto text-accent-foreground mb-3" />
              <h3 className="font-bold text-accent-foreground mb-2">אין עדיין נתונים</h3>
              <p className="text-accent-foreground/80">לאחר שהילדים יתחילו לשחק, תוכל לראות כאן את ההתקדמות שלהם</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}