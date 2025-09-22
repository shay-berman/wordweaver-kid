import { Question } from "@/components/QuizGame";

export interface GameLevel {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  questions: Question[];
  unlockLevel: number;
}

export const gameLevels: GameLevel[] = [
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

export const initialPlayerData = {
  playerName: "אלוף האנגלית",
  level: 1,
  xp: 0,
  xpToNext: 100,
  score: 0,
  completedLevels: [] as string[]
};