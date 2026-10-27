import { Bookmark, LastRead, UserSettings, DailyProgress, SurahListItem, SurahDetail } from '../types/quran';

const STORAGE_KEYS = {
  BOOKMARKS: 'maj_quran_bookmarks',
  LAST_READ: 'maj_quran_last_read',
  HISTORY: 'maj_quran_history',
  SETTINGS: 'maj_quran_settings',
  DAILY_PROGRESS: 'maj_quran_daily_progress',
  CACHE_SURAHS: 'maj_quran_cache_surahs',
  CACHE_SURAH_PREFIX: 'maj_quran_cache_surah_',
};

export const DEFAULT_SETTINGS: UserSettings = {
  arabicFontSize: 'lg',
  showTranslation: true,
  showTransliteration: true,
  selectedReciter: '05', // Misyari Rasyid Al-Afasi
  autoScrollSpeed: 2,
  dailyAyahTarget: 20,
};

// Safe localStorage wrapper
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Error reading key "${key}" from localStorage:`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`Error writing key "${key}" to localStorage:`, e);
    return false;
  }
}

// Bookmarks
export function getBookmarks(): Bookmark[] {
  return getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
}

export function saveBookmark(bookmark: Bookmark): Bookmark[] {
  const current = getBookmarks();
  const exists = current.findIndex(
    b => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber
  );

  let updated: Bookmark[];
  if (exists >= 0) {
    updated = [...current];
    updated[exists] = { ...updated[exists], ...bookmark };
  } else {
    updated = [bookmark, ...current];
  }
  setItem(STORAGE_KEYS.BOOKMARKS, updated);
  return updated;
}

export function removeBookmark(surahNumber: number, ayahNumber: number): Bookmark[] {
  const current = getBookmarks();
  const updated = current.filter(
    b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
  );
  setItem(STORAGE_KEYS.BOOKMARKS, updated);
  return updated;
}

export function isAyahBookmarked(surahNumber: number, ayahNumber: number): boolean {
  const current = getBookmarks();
  return current.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
}

export function getAyahBookmark(surahNumber: number, ayahNumber: number): Bookmark | undefined {
  const current = getBookmarks();
  return current.find(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
}

// Last Read
export function getLastRead(): LastRead | null {
  return getItem<LastRead | null>(STORAGE_KEYS.LAST_READ, null);
}

export function saveLastRead(lastRead: LastRead): void {
  setItem(STORAGE_KEYS.LAST_READ, lastRead);
  // Also push to history list
  saveHistory(lastRead);
}

// History
export function getHistory(): LastRead[] {
  return getItem<LastRead[]>(STORAGE_KEYS.HISTORY, []);
}

export function saveHistory(entry: LastRead): void {
  const current = getHistory();
  // Filter out existing same surah and ayah
  const filtered = current.filter(
    h => !(h.surahNumber === entry.surahNumber && h.ayahNumber === entry.ayahNumber)
  );
  const updated = [entry, ...filtered].slice(0, 30); // keep last 30
  setItem(STORAGE_KEYS.HISTORY, updated);
}

export function clearHistory(): void {
  setItem(STORAGE_KEYS.HISTORY, []);
}

// Settings
export function getSettings(): UserSettings {
  const stored = getItem<Partial<UserSettings>>(STORAGE_KEYS.SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function saveSettings(settings: UserSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

// Daily Progress
export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDailyProgress(): DailyProgress {
  const today = getTodayDateString();
  const current = getItem<DailyProgress>(STORAGE_KEYS.DAILY_PROGRESS, { date: today, ayahsRead: 0 });
  if (current.date !== today) {
    const fresh = { date: today, ayahsRead: 0 };
    setItem(STORAGE_KEYS.DAILY_PROGRESS, fresh);
    return fresh;
  }
  return current;
}

export function incrementDailyProgress(count: number = 1): DailyProgress {
  const today = getTodayDateString();
  const current = getDailyProgress();
  const updated = {
    date: today,
    ayahsRead: (current.ayahsRead || 0) + count,
  };
  setItem(STORAGE_KEYS.DAILY_PROGRESS, updated);
  return updated;
}

// Cache Surah List for offline availability
export function getCachedSurahs(): SurahListItem[] | null {
  return getItem<SurahListItem[] | null>(STORAGE_KEYS.CACHE_SURAHS, null);
}

export function setCachedSurahs(surahs: SurahListItem[]): void {
  setItem(STORAGE_KEYS.CACHE_SURAHS, surahs);
}

// Cache Surah Detail
export function getCachedSurahDetail(surahNumber: number): SurahDetail | null {
  return getItem<SurahDetail | null>(`${STORAGE_KEYS.CACHE_SURAH_PREFIX}${surahNumber}`, null);
}

export function setCachedSurahDetail(surahNumber: number, data: SurahDetail): void {
  setItem(`${STORAGE_KEYS.CACHE_SURAH_PREFIX}${surahNumber}`, data);
}
