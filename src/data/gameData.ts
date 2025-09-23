import { Question } from "@/components/QuizGame";

export interface GameCategory {
  id: string;
  title: string;
  description: string;
  levels: GameLevel[];
}

export interface GameLevel {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  questions: Question[];
  unlockLevel: number;
}

const gradeSevenLevels: GameLevel[] = [
  {
    id: "vocabulary-basics",
    title: "אוצר מילים בסיסי",
    description: "למד מילים חדשות בסיסיות באנגלית",
    difficulty: "easy",
    xpReward: 50,
    unlockLevel: 1,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "מה זה 'danger' בעברית?",
        options: ["בטוח", "מסוכן", "רחב", "גשר"],
        correctAnswer: "מסוכן",
        explanation: "Danger = סכנה, מסוכן"
      },
      {
        id: "q2", 
        type: "multiple-choice",
        question: "מה זה 'bridge' בעברית?",
        options: ["דרך", "גשר", "נהר", "עץ"],
        correctAnswer: "גשר",
        explanation: "Bridge = גשר"
      },
      {
        id: "q3",
        type: "multiple-choice", 
        question: "מה זה 'wide' בעברית?",
        options: ["צר", "גבוה", "רחב", "קטן"],
        correctAnswer: "רחב",
        explanation: "Wide = רחב, בניגוד ל-narrow (צר)"
      },
      {
        id: "q4",
        type: "multiple-choice",
        question: "מה זה 'village' בעברית?",
        options: ["עיר", "כפר", "בית", "חנות"],
        correctAnswer: "כפר",
        explanation: "Village = כפר, יישוב קטן"
      },
      {
        id: "q5",
        type: "multiple-choice",
        question: "מה זה 'imagine' בעברית?",
        options: ["לזכור", "לדמיין", "לכתוב", "לקרוא"],
        correctAnswer: "לדמיין",
        explanation: "Imagine = לדמיין, לחשוב על משהו בדמיון"
      }
    ]
  },
  {
    id: "opposites-game",
    title: "משחק הניגודים",
    description: "התאם בין מילים והפכים שלהן",
    difficulty: "easy", 
    xpReward: 60,
    unlockLevel: 1,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "מה ההפך של 'dangerous'?",
        options: ["unsafe", "safe", "wide", "narrow"],
        correctAnswer: "safe",
        explanation: "Dangerous (מסוכן) ↔ Safe (בטוח)"
      },
      {
        id: "q2",
        type: "multiple-choice", 
        question: "מה ההפך של 'wide'?",
        options: ["narrow", "big", "small", "tall"],
        correctAnswer: "narrow",
        explanation: "Wide (רחב) ↔ Narrow (צר)"
      },
      {
        id: "q3",
        type: "multiple-choice",
        question: "מה ההפך של 'continue'?", 
        options: ["go", "start", "stop", "run"],
        correctAnswer: "stop",
        explanation: "Continue (להמשיך) ↔ Stop (לעצור)"
      },
      {
        id: "q4",
        type: "multiple-choice",
        question: "מה ההפך של 'unusual'?",
        options: ["strange", "normal", "usual", "weird"],
        correctAnswer: "usual",
        explanation: "Unusual (לא רגיל) ↔ Usual (רגיל)"
      }
    ]
  },
  {
    id: "grammar-to-be",
    title: "דקדוק: הפועל To Be",
    description: "תרגל את השימוש ב-am, is, are",
    difficulty: "medium",
    xpReward: 80,
    unlockLevel: 2,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "השלם: I ___ happy.",
        options: ["am", "is", "are"],
        correctAnswer: "am",
        explanation: "I + am תמיד"
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "השלם: She ___ tall.",
        options: ["am", "is", "are"], 
        correctAnswer: "is",
        explanation: "He/She/It + is"
      },
      {
        id: "q3",
        type: "multiple-choice",
        question: "השלם: They ___ students.",
        options: ["am", "is", "are"],
        correctAnswer: "are", 
        explanation: "We/You/They + are"
      },
      {
        id: "q4",
        type: "multiple-choice",
        question: "השלם: The book ___ interesting.",
        options: ["am", "is", "are"],
        correctAnswer: "is",
        explanation: "הספר (it) + is"
      },
      {
        id: "q5",
        type: "multiple-choice",
        question: "השלם: We ___ friends.",
        options: ["am", "is", "are"],
        correctAnswer: "are",
        explanation: "We + are"
      }
    ]
  },
  {
    id: "sentence-completion",
    title: "השלמת משפטים",
    description: "השלם משפטים עם המילים הנכונות",
    difficulty: "medium",
    xpReward: 70,
    unlockLevel: 2,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "You need a _____ to cross the river.",
        options: ["road", "bridge", "car", "boat"],
        correctAnswer: "bridge",
        explanation: "צריך גשר (bridge) לחצות נהר"
      },
      {
        id: "q2", 
        type: "multiple-choice",
        question: "Please be careful, the road is _____.",
        options: ["safe", "dangerous", "wide", "narrow"],
        correctAnswer: "dangerous",
        explanation: "אם צריך להיזהר, הדרך מסוכנת (dangerous)"
      },
      {
        id: "q3",
        type: "multiple-choice",
        question: "I _____ chocolate to vanilla.",
        options: ["imagine", "prefer", "continue", "realize"],
        correctAnswer: "prefer",
        explanation: "Prefer = להעדיף"
      },
      {
        id: "q4",
        type: "multiple-choice", 
        question: "We walked _____ the park.",
        options: ["across", "prefer", "imagine", "continue"],
        correctAnswer: "across",
        explanation: "Across = מעבר ל-, חוצה את"
      }
    ]
  },
  {
    id: "reading-comprehension",
    title: "הבנת הנקרא",
    description: "קרא טקסט קצר וענה על שאלות",
    difficulty: "hard",
    xpReward: 100,
    unlockLevel: 3,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "קרא: 'Adam and his sister are in the park. They see a bridge. Adam says: The bridge is wide but dangerous.' איפה אדם ואחותו?",
        options: ["בבית", "בבית ספר", "בפארק", "ברחוב"],
        correctAnswer: "בפארק",
        explanation: "הטקסט אומר: Adam and his sister are in the park"
      },
      {
        id: "q2",
        type: "multiple-choice", 
        question: "מה הם רואים?",
        options: ["עץ", "גשר", "בית", "כלב"],
        correctAnswer: "גשר",
        explanation: "הטקסט אומר: They see a bridge"
      },
      {
        id: "q3",
        type: "multiple-choice",
        question: "מה אדם אומר על הגשר?",
        options: ["שהוא צר", "שהוא בטוח", "שהוא רחב ומסוכן", "שהוא יפה"],
        correctAnswer: "שהוא רחב ומסוכן", 
        explanation: "אדם אומר: The bridge is wide but dangerous"
      }
    ]
  }
];

const octoberLevels: GameLevel[] = [
  {
    id: "oct-vocabulary-advanced",
    title: "אוצר מילים מתקדם",
    description: "למד מילים מתקדמות לכיתה ז'",
    difficulty: "medium",
    xpReward: 70,
    unlockLevel: 1,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "מה זה 'challenge' בעברית?",
        options: ["בעיה", "אתגר", "פתרון", "תשובה"],
        correctAnswer: "אתגר",
        explanation: "Challenge = אתגר, משימה קשה"
      },
      {
        id: "q2", 
        type: "multiple-choice",
        question: "מה זה 'opportunity' בעברית?",
        options: ["הזדמנות", "בעיה", "רגע", "זמן"],
        correctAnswer: "הזדמנות",
        explanation: "Opportunity = הזדמנות"
      },
      {
        id: "q3",
        type: "multiple-choice", 
        question: "מה זה 'responsibility' בעברית?",
        options: ["חופש", "אחריות", "זכות", "כוח"],
        correctAnswer: "אחריות",
        explanation: "Responsibility = אחריות"
      },
      {
        id: "q4",
        type: "multiple-choice",
        question: "מה זה 'environment' בעברית?",
        options: ["מקום", "סביבה", "אוויר", "מים"],
        correctAnswer: "סביבה",
        explanation: "Environment = סביבה"
      },
      {
        id: "q5",
        type: "multiple-choice",
        question: "מה זה 'knowledge' בעברית?",
        options: ["ידע", "ספר", "לימוד", "מחשבה"],
        correctAnswer: "ידע",
        explanation: "Knowledge = ידע, מידע שנרכש"
      }
    ]
  },
  {
    id: "oct-opposites-advanced",
    title: "ניגודים מתקדמים",
    description: "התאם בין מילים מתקדמות והפכים שלהן",
    difficulty: "medium", 
    xpReward: 80,
    unlockLevel: 1,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "מה ההפך של 'difficult'?",
        options: ["hard", "easy", "simple", "complex"],
        correctAnswer: "easy",
        explanation: "Difficult (קשה) ↔ Easy (קל)"
      },
      {
        id: "q2",
        type: "multiple-choice", 
        question: "מה ההפך של 'advantage'?",
        options: ["benefit", "disadvantage", "profit", "gain"],
        correctAnswer: "disadvantage",
        explanation: "Advantage (יתרון) ↔ Disadvantage (חיסרון)"
      },
      {
        id: "q3",
        type: "multiple-choice",
        question: "מה ההפך של 'ancient'?", 
        options: ["old", "modern", "historical", "traditional"],
        correctAnswer: "modern",
        explanation: "Ancient (עתיק) ↔ Modern (מודרני)"
      },
      {
        id: "q4",
        type: "multiple-choice",
        question: "מה ההפך של 'generous'?",
        options: ["kind", "selfish", "giving", "helpful"],
        correctAnswer: "selfish",
        explanation: "Generous (נדיב) ↔ Selfish (אנוכי)"
      }
    ]
  },
  {
    id: "oct-grammar-advanced",
    title: "דקדוק מתקדם",
    description: "תרגל זמנים ומבנים מתקדמים",
    difficulty: "hard",
    xpReward: 100,
    unlockLevel: 2,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "השלם: She has ___ working here for 5 years.",
        options: ["been", "being", "be", "was"],
        correctAnswer: "been",
        explanation: "Present Perfect: has/have + been + V-ing"
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "השלם: If I ___ rich, I would travel the world.",
        options: ["am", "was", "were", "be"], 
        correctAnswer: "were",
        explanation: "Second Conditional: If + past (were), would + V"
      },
      {
        id: "q3",
        type: "multiple-choice",
        question: "השלם: The book ___ by millions of people.",
        options: ["reads", "is read", "reading", "read"],
        correctAnswer: "is read", 
        explanation: "Passive Voice: is/are + past participle"
      }
    ]
  }
];

const novemberLevels: GameLevel[] = [
  {
    id: "nov-vocabulary-expert",
    title: "אוצר מילים מומחה",
    description: "למד מילים מורכבות לכיתה ז'",
    difficulty: "hard",
    xpReward: 90,
    unlockLevel: 1,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "מה זה 'achievement' בעברית?",
        options: ["כישלון", "הישג", "ניסיון", "תקווה"],
        correctAnswer: "הישג",
        explanation: "Achievement = הישג, הצלחה"
      },
      {
        id: "q2", 
        type: "multiple-choice",
        question: "מה זה 'independence' בעברית?",
        options: ["תלות", "עצמאות", "חברות", "שיתוף"],
        correctAnswer: "עצמאות",
        explanation: "Independence = עצמאות"
      },
      {
        id: "q3",
        type: "multiple-choice", 
        question: "מה זה 'curiosity' בעברית?",
        options: ["סקרנות", "אדישות", "פחד", "כעס"],
        correctAnswer: "סקרנות",
        explanation: "Curiosity = סקרנות"
      },
      {
        id: "q4",
        type: "multiple-choice",
        question: "מה זה 'magnificent' בעברית?",
        options: ["רע", "נהדר", "קטן", "רגיל"],
        correctAnswer: "נהדר",
        explanation: "Magnificent = נהדר, מפואר"
      },
      {
        id: "q5",
        type: "multiple-choice",
        question: "מה זה 'determination' בעברית?",
        options: ["ספק", "נחישות", "בלבול", "עצלות"],
        correctAnswer: "נחישות",
        explanation: "Determination = נחישות, כוונה חזקה"
      }
    ]
  },
  {
    id: "nov-grammar-expert",
    title: "דקדוק מומחה",
    description: "תרגל מבנים מורכבים",
    difficulty: "hard",
    xpReward: 120,
    unlockLevel: 2,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "השלם: By next year, I ___ my studies.",
        options: ["will finish", "will have finished", "finish", "finished"],
        correctAnswer: "will have finished",
        explanation: "Future Perfect: will have + past participle"
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "השלם: She suggested ___ early.",
        options: ["to leave", "leaving", "leave", "left"], 
        correctAnswer: "leaving",
        explanation: "Suggest + V-ing (gerund)"
      },
      {
        id: "q3",
        type: "multiple-choice",
        question: "השלם: ___ it's raining, we'll stay home.",
        options: ["Although", "Because", "If", "Since"],
        correctAnswer: "Since", 
        explanation: "Since = כיוון ש, מביע סיבה"
      }
    ]
  },
  {
    id: "nov-reading-expert",
    title: "הבנת הנקרא מתקדמת",
    description: "קרא טקסטים מורכבים וענה על שאלות",
    difficulty: "hard",
    xpReward: 110,
    unlockLevel: 3,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "קרא: 'Despite the challenging circumstances, Maria achieved remarkable success through her determination and hard work. Her achievement inspired many students.' מה הביא להצלחתה של מריה?",
        options: ["מזל", "נחישות ועבודה קשה", "עזרה מאחרים", "כישרון טבעי"],
        correctAnswer: "נחישות ועבודה קשה",
        explanation: "הטקסט אומר: through her determination and hard work"
      },
      {
        id: "q2",
        type: "multiple-choice", 
        question: "מה השפיע ההישג של מריה על התלמידים?",
        options: ["לא השפיע", "העצבן אותם", "נתן השראה", "גרם לקנאה"],
        correctAnswer: "נתן השראה",
        explanation: "הטקסט אומר: Her achievement inspired many students"
      }
    ]
  }
];

export const gameCategories: GameCategory[] = [
  {
    id: "grade-seven",
    title: "הכנה למיפוי בכיתה ז'",
    description: "משחקים בסיסיים להכנה למיפוי בכיתה ז'",
    levels: gradeSevenLevels
  },
  {
    id: "october-exam",
    title: "הכנה למבחן באוקטובר",
    description: "תרגול מתקדם עם מילים ומבנים מורכבים יותר",
    levels: octoberLevels
  },
  {
    id: "november-exam",
    title: "הכנה למבחן בנובמבר",
    description: "רמת מומחה - מילים ודקדוק מתקדמים",
    levels: novemberLevels
  }
];

// For backward compatibility
export const gameLevels: GameLevel[] = gradeSevenLevels;

export const initialPlayerData = {
  playerName: "אלוף האנגלית",
  level: 1,
  xp: 0,
  xpToNext: 100,
  score: 0,
  completedLevels: [] as string[]
};