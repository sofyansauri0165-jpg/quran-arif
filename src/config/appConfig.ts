/**
 * Konfigurasi Utama & Identitas Maj Qur'an
 * Terpusat dan sesuai dengan spesifikasi resmi Maj Qur'an
 */

export const APP_CONFIG = {
  appName: "Maj Qur'an",
  tagline: "Dekat dengan Al-Qur’an, Setiap Hari.",
  theme: "light",
  language: "id-ID",

  // Palet Warna Resmi Maj Qur'an
  colors: {
    primary: "#0756C9",        // Biru laut (Warna utama)
    secondary: "#0645A8",      // Biru royal (Warna sekunder)
    accent: "#168BFF",         // Biru cerah (Warna aksen)
    textPrimary: "#061A35",    // Navy gelap (Warna teks utama)
    navySecondary: "#0B2D68",  // Biru navy (Navy pendukung)
    background: "#FDFBF5",     // Putih susu (Warna latar utama)
    surface: "#FFFFFF",        // Putih bersih (Warna putih)
    surfaceBlue: "#E8F2FF",    // Biru muda (Latar sekunder / badge)
    border: "#E4E9F0",         // Abu-abu kebiruan (Border & pemisah)
    textSecondary: "#5E6B7C",  // Abu-abu netral (Teks sekunder)
    black: "#000000",          // Hitam kontras
    focusRing: "#168BFF",
  },

  // Aset Logo Resmi
  logoUrl: "/assets/aistudio/1000061660-removebg-preview_f3ec290a.png",

  // API equran.id v2
  apiBaseUrl: "https://equran.id/api/v2",

  // API Jadwal Salat Resmi (Kemenag RI via myquran.com)
  prayerApiBaseUrl: "https://api.myquran.com/v2/sholat",

  // Audio Jadwal Salat Resmi
  prayerAudios: {
    subuh: "https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/adzan_subuh.mp3",
    adzanGeneral: "https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/adzan.mp3", // Dzuhur, Ashar, Maghrib, Isya
    imsak: "https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/imsak.mp3",
    terbit: "https://wflq2j4mi1smqyku.public.blob.vercel-storage.com/ayam.mp3",
  },

  // Daftar Qari Resmi dari equran.id API
  reciters: [
    { id: "01", name: "Abdullah Al-Juhany" },
    { id: "02", name: "Abdul-Muhsin Al-Qasim" },
    { id: "03", name: "Abdurrahman as-Sudais" },
    { id: "04", name: "Ibrahim Al-Dossari" },
    { id: "05", name: "Misyari Rasyid Al-Afasi" },
    { id: "06", name: "Yasser Al-Dosari" },
  ],
} as const;
