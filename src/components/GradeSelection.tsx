import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface GradeSelectionProps {
  userId: string
  onComplete: () => void
}

export const GradeSelection = ({ userId, onComplete }: GradeSelectionProps) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  const handleGradeSelect = async () => {
    if (!selectedGrade) return

    setLoading(true)
    try {
      // Create or update user profile with grade using upsert
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({ 
          user_id: userId,
          grade: selectedGrade 
        } as any, {
          onConflict: 'user_id'
        })

      if (profileError) {
        console.error('Profile error:', profileError)
        throw profileError
      }

      // Generate initial paths
      const { data: generateData, error: generateError } = await supabase.functions.invoke('generate-initial-paths', {
        body: { grade: selectedGrade, userId }
      })

      if (generateError) {
        console.error('Generate error:', generateError)
        throw generateError
      }

      console.log('Generation result:', generateData)

      toast({
        title: 'הגדרות נשמרו',
        description: '5 מסלולים ראשונים נוצרו בהצלחה!',
      })

      onComplete()
    } catch (error) {
      console.error('Error saving grade:', error)
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בשמירת הכיתה',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/20 to-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">באיזו כיתה את/ה?</CardTitle>
          <CardDescription className="text-lg">בחר את הכיתה שלך כדי ליצור מסלולי למידה מותאמים</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {grades.map((grade) => (
              <Button
                key={grade}
                variant={selectedGrade === grade ? 'default' : 'outline'}
                size="lg"
                className="h-16 text-xl font-bold"
                onClick={() => setSelectedGrade(grade)}
              >
                {grade}
              </Button>
            ))}
          </div>
          <Button
            className="w-full h-12 text-lg"
            onClick={handleGradeSelect}
            disabled={!selectedGrade || loading}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                יוצר מסלולים...
              </>
            ) : (
              'המשך'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
