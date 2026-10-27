import { APP_CONFIG } from '../config/appConfig';
import { PrayerSchedule, PrayerCity } from '../types/prayer';

const BASE_URL = APP_CONFIG.prayerApiBaseUrl;
const CACHE_PREFIX = 'maj_quran_prayer_';
const CACHE_CITIES_KEY = 'maj_quran_prayer_cities';

// Major cities for quick selection
export const POPULAR_CITIES: PrayerCity[] = [
  { id: '1301', lokasi: 'KOTA JAKARTA' },
  { id: '1638', lokasi: 'KOTA SURABAYA' },
  { id: '1219', lokasi: 'KOTA BANDUNG' },
  { id: '0228', lokasi: 'KOTA MEDAN' },
  { id: '1320', lokasi: 'KOTA SEMARANG' },
  { id: '1404', lokasi: 'KOTA YOGYAKARTA' },
  { id: '2317', lokasi: 'KOTA MAKASSAR' },
  { id: '1609', lokasi: 'KAB. MALANG' },
  { id: '1107', lokasi: 'KOTA TANGERANG' },
  { id: '1221', lokasi: 'KOTA BEKASI' },
  { id: '1222', lokasi: 'KOTA DEPOK' },
  { id: '1204', lokasi: 'KOTA BOGOR' },
];

/**
 * Mendapatkan jadwal salat untuk kota dan tanggal tertentu
 * Format tanggal: YYYY/MM/DD
 */
export async function getPrayerSchedule(
  cityId: string = '1301',
  date: Date = new Date()
): Promise<PrayerSchedule> {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const cacheKey = `${CACHE_PREFIX}${cityId}_${dateStr}`;

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.subuh && parsed.dzuhur) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const url = `${BASE_URL}/jadwal/${cityId}/${year}/${month}/${day}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const json = await response.json();
    if (json.status && json.data && json.data.jadwal) {
      const schedule: PrayerSchedule = {
        id: json.data.id,
        lokasi: json.data.lokasi,
        daerah: json.data.daerah,
        tanggal: json.data.jadwal.tanggal,
        date: json.data.jadwal.date || dateStr,
        imsak: json.data.jadwal.imsak,
        subuh: json.data.jadwal.subuh,
        terbit: json.data.jadwal.terbit,
        dhuha: json.data.jadwal.dhuha || '06:00',
        dzuhur: json.data.jadwal.dzuhur,
        ashar: json.data.jadwal.ashar,
        maghrib: json.data.jadwal.maghrib,
        isya: json.data.jadwal.isya,
      };

      try {
        localStorage.setItem(cacheKey, JSON.stringify(schedule));
      } catch (e) {
        // storage quota
      }

      return schedule;
    }
    throw new Error('Data jadwal dari server tidak valid');
  } catch (error) {
    console.warn('Gagal memuat jadwal salat dari Kemenag API, menggunakan jadwal cadangan:', error);

    // Fallback schedule calculation for Jakarta/WIB standard
    return {
      id: cityId,
      lokasi: 'KOTA JAKARTA (Perkiraan)',
      daerah: 'DKI JAKARTA',
      tanggal: date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      date: dateStr,
      imsak: '04:02',
      subuh: '04:12',
      terbit: '05:25',
      dhuha: '05:55',
      dzuhur: '11:41',
      ashar: '14:55',
      maghrib: '17:50',
      isya: '19:00',
    };
  }
}

/**
 * Mencari kota di seluruh Indonesia dari Kemenag API
 */
export async function searchCities(keyword: string): Promise<PrayerCity[]> {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) return POPULAR_CITIES;

  // Check cached full cities list
  try {
    const cached = localStorage.getItem(CACHE_CITIES_KEY);
    if (cached) {
      const list: PrayerCity[] = JSON.parse(cached);
      return list
        .filter(c => c.lokasi.toLowerCase().includes(trimmed))
        .slice(0, 15);
    }
  } catch (e) {
    // ignore
  }

  // Network fetch for city search
  try {
    const response = await fetch(`${BASE_URL}/kota/cari/${encodeURIComponent(trimmed)}`);
    if (response.ok) {
      const json = await response.json();
      if (json.status && Array.isArray(json.data)) {
        return json.data.map((item: any) => ({
          id: String(item.id),
          lokasi: item.lokasi,
        })).slice(0, 15);
      }
    }
  } catch (e) {
    // ignore
  }

  // Fallback to searching popular cities
  return POPULAR_CITIES.filter(c => c.lokasi.toLowerCase().includes(trimmed));
}
