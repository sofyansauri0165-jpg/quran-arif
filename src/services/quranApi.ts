import { APP_CONFIG } from '../config/appConfig';
import { SurahListItem, SurahDetail, SurahTafsir, SearchResult } from '../types/quran';
import {
  getCachedSurahs,
  setCachedSurahs,
  getCachedSurahDetail,
  setCachedSurahDetail,
} from '../storage/persistence';

const BASE_URL = APP_CONFIG.apiBaseUrl;
const REQUEST_TIMEOUT_MS = 10000;

// In-memory cache for ultra-fast tab switches and search
const memoryCache = {
  surahs: null as SurahListItem[] | null,
  surahDetails: new Map<number, SurahDetail>(),
  tafsirs: new Map<number, SurahTafsir>(),
};

/**
 * Fetch wrapper with timeout and retry logic
 */
async function fetchWithRetry<T>(url: string, retries: number = 2): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }

      const json = await response.json();
      if (!json || json.code !== 200 || !json.data) {
        throw new Error(json?.message || 'Data API Al-Qur’an tidak valid');
      }

      return json.data as T;
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;
      if (err.name === 'AbortError') {
        lastError = new Error('Koneksi timeout. Mohon periksa jaringan Anda.');
      }
      // Wait slightly before retry
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Gagal memuat data dari server Al-Qur’an');
}

/**
 * Mendapatkan daftar 114 Surat
 */
export async function getSurahList(): Promise<SurahListItem[]> {
  // 1. Check memory cache
  if (memoryCache.surahs && memoryCache.surahs.length === 114) {
    return memoryCache.surahs;
  }

  // 2. Check localStorage cache
  const localCached = getCachedSurahs();
  if (localCached && localCached.length === 114) {
    memoryCache.surahs = localCached;
    // Silently re-verify in background if online
    if (navigator.onLine) {
      fetchWithRetry<SurahListItem[]>(`${BASE_URL}/surat`, 1)
        .then(fresh => {
          if (fresh && fresh.length === 114) {
            memoryCache.surahs = fresh;
            setCachedSurahs(fresh);
          }
        })
        .catch(() => {});
    }
    return localCached;
  }

  // 3. Network fetch
  try {
    const data = await fetchWithRetry<SurahListItem[]>(`${BASE_URL}/surat`);
    if (Array.isArray(data)) {
      memoryCache.surahs = data;
      setCachedSurahs(data);
      return data;
    }
    throw new Error('Format data surat tidak sesuai');
  } catch (error) {
    // If offline fallback exists even if partial, use it
    if (localCached && localCached.length > 0) {
      return localCached;
    }
    throw error;
  }
}

/**
 * Mendapatkan detail surat beserta seluruh ayatnya
 */
export async function getSurahDetail(surahNumber: number): Promise<SurahDetail> {
  // 1. Check memory cache
  if (memoryCache.surahDetails.has(surahNumber)) {
    return memoryCache.surahDetails.get(surahNumber)!;
  }

  // 2. Check persistent local storage cache
  const localCached = getCachedSurahDetail(surahNumber);
  if (localCached && localCached.ayat && localCached.ayat.length > 0) {
    memoryCache.surahDetails.set(surahNumber, localCached);
    return localCached;
  }

  // 3. Network fetch
  const data = await fetchWithRetry<SurahDetail>(`${BASE_URL}/surat/${surahNumber}`);
  if (data && data.nomor && Array.isArray(data.ayat)) {
    memoryCache.surahDetails.set(surahNumber, data);
    setCachedSurahDetail(surahNumber, data);
    return data;
  }

  throw new Error(`Data surat #${surahNumber} tidak valid`);
}

/**
 * Mendapatkan tafsir resmi Kemenag RI dari equran.id
 */
export async function getSurahTafsir(surahNumber: number): Promise<SurahTafsir> {
  if (memoryCache.tafsirs.has(surahNumber)) {
    return memoryCache.tafsirs.get(surahNumber)!;
  }

  const data = await fetchWithRetry<SurahTafsir>(`${BASE_URL}/tafsir/${surahNumber}`);
  if (data && data.tafsir) {
    memoryCache.tafsirs.set(surahNumber, data);
    return data;
  }

  throw new Error(`Tafsir surat #${surahNumber} tidak ditemukan`);
}

/**
 * Pencarian global: mencari berdasarkan nama surat, nomor surat, kata kunci terjemahan
 */
export async function searchQuran(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return [];

  const results: SearchResult[] = [];
  const surahs = await getSurahList();

  // Check if query is a number (e.g. "36" or "2:255")
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    if (num >= 1 && num <= 114) {
      const s = surahs.find(item => item.nomor === num);
      if (s) {
        results.push({
          surahNumber: s.nomor,
          surahName: s.nama,
          surahLatin: s.namaLatin,
          translation: `Surat ke-${s.nomor} (${s.arti}) - ${s.jumlahAyat} ayat`,
          matchType: 'surah',
        });
      }
    }
  }

  // Match surah names & meanings
  for (const s of surahs) {
    const nameMatch = s.namaLatin.toLowerCase().includes(trimmed);
    const meaningMatch = s.arti.toLowerCase().includes(trimmed);
    const arabMatch = s.nama.includes(trimmed);

    if (nameMatch || meaningMatch || arabMatch) {
      if (!results.some(r => r.surahNumber === s.nomor && r.matchType === 'surah')) {
        results.push({
          surahNumber: s.nomor,
          surahName: s.nama,
          surahLatin: s.namaLatin,
          translation: `${s.arti} (${s.tempatTurun}, ${s.jumlahAyat} ayat)`,
          matchType: 'surah',
        });
      }
    }
  }

  // If query format is "surah:ayat" e.g. "2:255" or "al-baqarah:255"
  const colonMatch = trimmed.match(/^([a-z0-9\-'\s]+):(\d+)$/i);
  if (colonMatch) {
    const surahIdentifier = colonMatch[1].trim();
    const ayahNum = parseInt(colonMatch[2], 10);

    const s = surahs.find(
      item =>
        item.nomor.toString() === surahIdentifier ||
        item.namaLatin.toLowerCase().replace(/[^a-z0-9]/g, '') === surahIdentifier.replace(/[^a-z0-9]/g, '')
    );

    if (s && ayahNum >= 1 && ayahNum <= s.jumlahAyat) {
      try {
        const detail = await getSurahDetail(s.nomor);
        const ayat = detail.ayat.find(a => a.nomorAyat === ayahNum);
        if (ayat) {
          results.unshift({
            surahNumber: s.nomor,
            surahName: s.nama,
            surahLatin: s.namaLatin,
            ayahNumber: ayat.nomorAyat,
            arabicText: ayat.teksArab,
            translation: ayat.teksIndonesia,
            matchType: 'ayah',
          });
        }
      } catch (e) {
        // Continue
      }
    }
  }

  // Search through loaded verses in memory/cached surah details for translation keywords
  const detailsToSearch = Array.from(memoryCache.surahDetails.values());
  for (const detail of detailsToSearch) {
    for (const ayat of detail.ayat) {
      if (
        ayat.teksIndonesia.toLowerCase().includes(trimmed) ||
        ayat.teksLatin.toLowerCase().includes(trimmed) ||
        ayat.teksArab.includes(trimmed)
      ) {
        results.push({
          surahNumber: detail.nomor,
          surahName: detail.nama,
          surahLatin: detail.namaLatin,
          ayahNumber: ayat.nomorAyat,
          arabicText: ayat.teksArab,
          translation: ayat.teksIndonesia,
          matchType: 'ayah',
        });
        if (results.length >= 30) break; // Limit results
      }
    }
    if (results.length >= 30) break;
  }

  return results;
}
