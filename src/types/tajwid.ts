export interface TajwidExample {
  arabic: string;
  latin: string;
  meaning: string;
  surahRef: string; // e.g. "QS. Al-Baqarah: 6"
  highlightedPart: string;
}

export interface TajwidRule {
  id: string;
  name: string;
  category: 'nun_sukun' | 'mim_sukun' | 'mad' | 'lainnya';
  categoryName: string;
  description: string;
  letters: string[];
  lettersArabic: string;
  condition: string;
  pronunciation: string;
  colorHex: string;
  badgeBg: string;
  examples: TajwidExample[];
}

export interface TajwidQuizQuestion {
  id: string;
  question: string;
  exampleSnippet: string;
  surahRef?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TajwidQuizProgress {
  totalAnswered: number;
  correctAnswers: number;
  completedRuleIds: string[];
  lastScorePercent: number;
}
