import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (isLogin) {
        result = await signIn(email, password)
      } else {
        result = await signUp(email, password, displayName)
      }

      if (result.error) {
        toast({
          title: 'שגיאה',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: isLogin ? 'ברוך הבא!' : 'רשום בהצלחה!',
          description: isLogin ? 'התחברת בהצלחה למשחק' : 'נרשמת בהצלחה! ברוך הבא למשחק',
        })
        onOpenChange(false)
        setEmail('')
        setPassword('')
        setDisplayName('')
      }
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'משהו השתבש, נסה שוב',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-hero bg-clip-text text-transparent">
            {isLogin ? 'כניסה למשחק' : 'הרשמה למשחק'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-foreground font-medium">
                השם שלך במשחק
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="הכנס את השם שלך"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="bg-background/50 border-primary/30 focus:border-primary"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              דואר אלקטרוני
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="הכנס דואר אלקטרוני"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/50 border-primary/30 focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              סיסמה
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="הכנס סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background/50 border-primary/30 focus:border-primary"
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 font-bold text-lg py-6"
          >
            {loading ? 'ממתין...' : (isLogin ? 'התחבר למשחק' : 'הרשם למשחק')}
          </Button>
          
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary-glow"
            >
              {isLogin ? 'עדיין אין לך חשבון? הרשם כאן' : 'כבר יש לך חשבון? התחבר כאן'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}