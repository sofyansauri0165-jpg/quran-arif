export interface SurahListItem {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull?: Record<string, string>;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

export interface SurahDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
  ayat: Ayat[];
  suratSelanjutnya?: {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
  } | false;
  suratSebelumnya?: {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
  } | false;
}

export interface TafsirItem {
  ayat: number;
  teks: string;
}

export interface SurahTafsir {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
  tafsir: TafsirItem[];
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicSnippet: string;
  translationSnippet: string;
  createdAt: number;
  note?: string;
}

export interface LastRead {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  totalAyah: number;
  updatedAt: number;
}

export interface UserSettings {
  arabicFontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  showTranslation: boolean;
  showTransliteration: boolean;
  selectedReciter: string;
  autoScrollSpeed: number; // 1 to 5
  dailyAyahTarget: number;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  ayahsRead: number;
}

export interface SearchResult {
  surahNumber: number;
  surahName: string;
  surahLatin: string;
  ayahNumber?: number;
  arabicText?: string;
  translation?: string;
  matchType: 'surah' | 'ayah';
}
