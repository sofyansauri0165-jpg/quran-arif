export interface DuaItem {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  arabic: string;
  latin: string;
  translation: string;
  reference: string; // e.g. "HR. Bukhari no. 6312", "QS. Al-Baqarah: 201"
  context?: string;   // e.g. "Dibaca saat bangun di pagi hari"
  audioUrl?: string;
  sourceType: 'quran' | 'hadits' | 'umum';
}

export interface DuaCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  count?: number;
}
