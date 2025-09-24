# הגדרת Supabase למשחק הרפתקת האנגלית

## שלב 1: עדכון פרטי החיבור
עדכן את הקובץ `src/lib/supabase.ts` עם הפרטים של פרויקט Supabase שלך:

```typescript
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'your-anon-key-here'
```

## שלב 2: יצירת הטבלאות בבסיס הנתונים
הריץ את השאילתות הבאות ב-SQL Editor של Supabase:

### 1. טבלת פרופילי המשתמשים:
```sql
CREATE TABLE user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  display_name text NOT NULL,
  total_score integer DEFAULT 0,
  games_played integer DEFAULT 0,
  current_level integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- אינדקס לחיפוש מהיר
CREATE INDEX user_profiles_user_id_idx ON user_profiles(user_id);

-- RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- משתמשים יכולים לראות ולערוך רק את הפרופיל שלהם
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
```

### 2. טבלת תוצאות המשחקים:
```sql
CREATE TABLE game_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  level integer DEFAULT 1,
  completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- אינדקס לחיפוש מהיר
CREATE INDEX game_results_user_id_idx ON game_results(user_id);
CREATE INDEX game_results_completed_at_idx ON game_results(completed_at DESC);

-- RLS (Row Level Security)
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- משתמשים יכולים לראות ולהוסיף רק תוצאות של עצמם
CREATE POLICY "Users can view own results" ON game_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own results" ON game_results FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. פונקציה לעדכון אוטומטי של updated_at:
```sql
-- פונקציה לעדכון updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- טריגר לעדכון אוטומטי
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## שלב 3: הגדרת Authentication
1. בלשונית Authentication -> Settings
2. ודא שההגדרות הבאות מופעלות:
   - Enable email confirmations: OFF (לפיתוח)
   - Enable phone confirmations: OFF
   - Enable email change confirmations: OFF

## שלב 4: URL Redirect (אופציונלי)
אם אתה רוצה להגדיר URL redirect לאחר התחברות:
1. לך ל-Authentication -> Settings -> URL Configuration
2. הוסף את הכתובת של האפליקציה שלך

## שימוש במובייל
האפליקציה תעבוד מהדפדפן במובייל. אם תרצה אפליקציה native, תוכל להשתמש ב-Capacitor.

## אבטחה
- כל הטבלאות מוגדרות עם Row Level Security (RLS)
- משתמשים יכולים לגשת רק לנתונים שלהם
- הנתונים מוצפנים בזמן העברה ובמנוחה