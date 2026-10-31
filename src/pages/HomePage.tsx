import React, { useEffect, useState, useRef } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import { LastRead } from '../types/quran';
import {
  getLastRead,
  getDailyProgress,
  getSettings,
  saveBookmark,
  removeBookmark,
  isAyahBookmarked,
} from '../storage/persistence';
import {
  BookOpen,
  ArrowRight,
  ChevronRight,
  HeartHandshake,
  Compass,
  GraduationCap,
  Play,
  Pause,
  Bookmark,
  Share2,
  Check,
  Search,
  Headphones,
  ScrollText,
  Sparkles,
} from 'lucide-react';
import { PrayerTimeCard } from '../components/prayer/PrayerTimeCard';

interface HomePageProps {
  onNavigate: (tab: string, params?: any) => void;
  onOpenSurah: (surahNumber: number, targetAyah?: number) => void;
  onOpenSettings?: () => void;
}

// Quran Juz calculation helper
function getJuzFromSurahAndAyah(surah: number, ayah: number): number {
  if (surah === 1) return 1;
  if (surah === 2) {
    if (ayah <= 141) return 1;
    if (ayah <= 252) return 2;
    return 3;
  }
  if (surah === 3) {
    if (ayah <= 92) return 3;
    return 4;
  }
  if (surah === 4) {
    if (ayah <= 23) return 4;
    if (ayah <= 147) return 5;
    return 6;
  }
  if (surah === 5) {
    if (ayah <= 81) return 6;
    return 7;
  }
  if (surah === 6) {
    if (ayah <= 110) return 7;
    return 8;
  }
  if (surah === 7) {
    if (ayah <= 87) return 8;
    return 9;
  }
  if (surah === 8) {
    if (ayah <= 40) return 9;
    return 10;
  }
  if (surah === 9) {
    if (ayah <= 92) return 10;
    return 11;
  }
  if (surah === 10) return 11;
  if (surah === 11) {
    if (ayah <= 5) return 11;
    return 12;
  }
  if (surah === 12) {
    if (ayah <= 52) return 12;
    return 13;
  }
  if (surah <= 14) return 13;
  if (surah <= 16) return 14;
  if (surah <= 18) {
    if (surah === 18 && ayah > 74) return 16;
    return 15;
  }
  if (surah <= 20) return 16;
  if (surah <= 22) return 17;
  if (surah <= 25) {
    if (surah === 25 && ayah > 20) return 19;
    return 18;
  }
  if (surah <= 27) return 19;
  if (surah <= 29) return 20;
  if (surah <= 33) return 21;
  if (surah <= 36) return 22;
  if (surah <= 39) return 23;
  if (surah <= 41) return 24;
  if (surah <= 45) return 25;
  if (surah <= 51) return 26;
  if (surah <= 57) return 27;
  if (surah <= 66) return 28;
  if (surah <= 77) return 29;
  return 30;
}

// Verified daily inspirational ayahs
const DAILY_AYAH_LIST = [
  {
    surahNumber: 20,
    surahName: 'Taha',
    ayahNumber: 114,
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    translation: 'Ya Tuhanku, tambahkanlah kepadaku ilmu.',
    citation: 'QS. Taha: 114',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2462.mp3',
  },
  {
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    ayahNumber: 153,
    arabic: 'يٰٓاَيُّهَا الَّذِيْنَ اٰمَنُوا اسْتَعِيْنُوْا بِالصَّبْرِ وَالصَّلٰوةِ ۗ اِنَّ اللّٰهَ مَعَ الصّٰبِرِيْنَ',
    translation: 'Wahai orang-orang yang beriman! Mohonlah pertolongan (kepada Allah) dengan sabar dan salat. Sungguh, Allah beserta orang-orang yang sabar.',
    citation: 'QS. Al-Baqarah: 153',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/160.mp3',
  },
  {
    surahNumber: 94,
    surahName: 'Al-Insyirah',
    ayahNumber: 6,
    arabic: 'اِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Sesungguhnya beserta kesulitan ada kemudahan.',
    citation: 'QS. Al-Insyirah: 6',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6096.mp3',
  },
  {
    surahNumber: 14,
    surahName: 'Ibrahim',
    ayahNumber: 7,
    arabic: 'لَىِٕنْ شَكَرْتُمْ لَاَزِيْدَنَّكُمْ وَلَىِٕنْ كَفَرْتُمْ اِنَّ عَذَابِيْ لَشَدِيْدٌ',
    translation: 'Jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu, tetapi jika kamu mengingkari (nikmat-Ku), maka pasti azab-Ku sangat berat.',
    citation: 'QS. Ibrahim: 7',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1757.mp3',
  },
  {
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    ayahNumber: 286,
    arabic: 'لَا يُكَلِّفُ اللّٰهُ نَفْسًا اِلَّا وُسْعَهَا',
    translation: 'Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.',
    citation: 'QS. Al-Baqarah: 286',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/293.mp3',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenSurah, onOpenSettings }) => {
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [dailyProgress, setDailyProgress] = useState({ date: '', ayahsRead: 0 });
  const [dailyTarget, setDailyTarget] = useState(20);

  // Daily Ayah state
  const [dailyAyahIndex, setDailyAyahIndex] = useState(0);
  const [isPlayingAyahAudio, setIsPlayingAyahAudio] = useState(false);
  const [isBookmarkedState, setIsBookmarkedState] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const lr = getLastRead();
    setLastRead(lr);
    setDailyProgress(getDailyProgress());
    setDailyTarget(getSettings().dailyAyahTarget || 20);

    // Pick daily ayah deterministically (or default to 0 for QS. Taha: 114)
    const dayIndex = new Date().getDate() % DAILY_AYAH_LIST.length;
    setDailyAyahIndex(dayIndex);

    const activeAyah = DAILY_AYAH_LIST[dayIndex];
    setIsBookmarkedState(isAyahBookmarked(activeAyah.surahNumber, activeAyah.ayahNumber));

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const activeDailyAyah = DAILY_AYAH_LIST[dailyAyahIndex];

  // Daily progress percent
  const progressPercent = Math.min(
    100,
    Math.round((dailyProgress.ayahsRead / (dailyTarget || 1)) * 100)
  );

  // Tilawah surah completion percent
  const surahCompletionPercent = lastRead && lastRead.totalAyah > 0
    ? Math.min(100, Math.max(1, Math.round((lastRead.ayahNumber / lastRead.totalAyah) * 100)))
    : 42;

  // Juz calculation for last read
  const currentJuz = lastRead
    ? getJuzFromSurahAndAyah(lastRead.surahNumber, lastRead.ayahNumber)
    : 2;

  // Audio Playback Handler for Daily Ayah
  const handleToggleAyahAudio = () => {
    if (isPlayingAyahAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingAyahAudio(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(activeDailyAyah.audioUrl);
        audioRef.current.onended = () => setIsPlayingAyahAudio(false);
        audioRef.current.onerror = () => {
          setIsPlayingAyahAudio(false);
          showToast('Tidak dapat memuat audio ayat.');
        };
      }
      audioRef.current.play()
        .then(() => setIsPlayingAyahAudio(true))
        .catch(err => {
          console.warn('Autoplay prevented or network error:', err);
          setIsPlayingAyahAudio(false);
          showToast('Ketuk layar untuk memutar audio.');
        });
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = () => {
    if (isBookmarkedState) {
      removeBookmark(activeDailyAyah.surahNumber, activeDailyAyah.ayahNumber);
      setIsBookmarkedState(false);
      showToast('Ayat dihapus dari bookmark');
    } else {
      saveBookmark({
        id: `daily_${activeDailyAyah.surahNumber}_${activeDailyAyah.ayahNumber}`,
        surahNumber: activeDailyAyah.surahNumber,
        surahName: activeDailyAyah.surahName,
        ayahNumber: activeDailyAyah.ayahNumber,
        arabicSnippet: activeDailyAyah.arabic,
        translationSnippet: activeDailyAyah.translation,
        createdAt: Date.now(),
      });
      setIsBookmarkedState(true);
      showToast('Ayat disimpan ke bookmark');
    }
  };

  // Share / Copy Handler
  const handleShareAyah = async () => {
    const textToShare = `${activeDailyAyah.arabic}\n\n"${activeDailyAyah.translation}"\n(${activeDailyAyah.citation}) - Maj Qur'an`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToShare);
        showToast('Ayat berhasil disalin ke papan klip');
      } else {
        showToast('Teks ayat siap disalin');
      }
    } catch {
      showToast('Ayat berhasil disalin');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2500);
  };

  const popularSurahs = [
    { no: 1, name: 'Al-Fatihah', meaning: 'Pembukaan', ayahs: 7 },
    { no: 18, name: 'Al-Kahf', meaning: 'Penghuni Gua', ayahs: 110 },
    { no: 36, name: 'Yasin', meaning: 'Ya Sin', ayahs: 83 },
    { no: 55, name: 'Ar-Rahman', meaning: 'Yang Maha Pengasih', ayahs: 78 },
    { no: 56, name: 'Al-Waqi\'ah', meaning: 'Hari Kiamat', ayahs: 96 },
    { no: 67, name: 'Al-Mulk', meaning: 'Kerajaan', ayahs: 30 },
  ];

  // Donut SVG circumference calculation
  const donutRadius = 26;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset = donutCircumference - (progressPercent / 100) * donutCircumference;

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 md:pb-16 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#082245] border border-[#168BFF]/50 text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Sapaan Pengguna / Greeting Section (Premium Islamic Dark Blue) */}
      <section className="relative overflow-hidden rounded-[24px] bg-linear-to-r from-[#031B3A] via-[#05264E] to-[#063A70] border border-[#168BFF]/35 p-4 min-[360px]:p-5 sm:p-6 shadow-xl shadow-[#021024]/60">
        {/* Subtle ambient light aura on top right */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-[#168BFF]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content Container: Left Text & Right Space */}
        <div className="relative z-10 flex items-center justify-between gap-2 min-[360px]:gap-3">
          {/* Sisi Kiri: Logo, Tagline, dan Teks Sapaan */}
          <div className="max-w-[62%] sm:max-w-[65%] min-w-0 py-0.5">
            {/* Logo and Tagline row */}
            <div className="flex items-center gap-2 min-[360px]:gap-2.5 mb-2 sm:mb-3">
              <div className="w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-9 sm:h-9 rounded-full bg-white p-0.5 shadow-md border border-[#168BFF]/40 flex items-center justify-center shrink-0">
                <img
                  src={APP_CONFIG.logoUrl}
                  alt="Logo Maj Qur'an"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs min-[360px]:text-sm sm:text-base text-[#FFFFFF] tracking-tight leading-tight block truncate">
                  {APP_CONFIG.appName}
                </span>
                <span className="block text-[9px] min-[360px]:text-[10px] sm:text-[11px] text-[#B7CCE5] leading-tight truncate mt-0.5">
                  {APP_CONFIG.tagline}
                </span>
              </div>
            </div>

            {/* Sapaan Utama */}
            <h1 className="text-xl min-[360px]:text-2xl sm:text-3xl font-black text-[#FFFFFF] tracking-tight leading-tight">
              Assalamu'alaikum
            </h1>
            <p className="text-[11px] min-[360px]:text-xs sm:text-sm text-[#B7CCE5] font-medium mt-1 sm:mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span>Semoga hari ini penuh keberkahan</span>
              <span className="text-[#FFD233] drop-shadow-[0_0_8px_rgba(255,210,51,0.5)]">🌙</span>
            </p>
          </div>

          {/* Spacer to guarantee breathing room for illustration */}
          <div className="w-14 min-[360px]:w-24 sm:w-44 md:w-56 shrink-0 h-16 min-[360px]:h-20 sm:h-24 pointer-events-none" aria-hidden="true" />
        </div>

        {/* Sisi Kanan: Ilustrasi Siluet Masjid, Kubah, Menara & Bulan Sabit Bercahaya */}
        <div className="absolute right-0 top-0 bottom-0 w-[46%] sm:w-[50%] md:w-[44%] max-w-[340px] pointer-events-none overflow-hidden flex items-end justify-end select-none">
          <svg
            viewBox="0 0 320 180"
            className="w-full h-full object-cover"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMaxYMax meet"
          >
            <defs>
              {/* Radial glow aura */}
              <radialGradient id="cardSkyAura" cx="75%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#168BFF" stopOpacity="0.38" />
                <stop offset="50%" stopColor="#0756C9" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#031B3A" stopOpacity="0" />
              </radialGradient>

              {/* Moon glow */}
              <radialGradient id="cardMoonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E2F0FF" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#60A5FA" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#168BFF" stopOpacity="0" />
              </radialGradient>

              {/* Linear gradients for mosque silhouette layers */}
              <linearGradient id="cardBgMosqueGrad" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="0%" stopColor="#0b3260" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#041832" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="cardMidMosqueGrad" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="0%" stopColor="#09284d" />
                <stop offset="100%" stopColor="#031429" />
              </linearGradient>

              <linearGradient id="cardFgDomeGrad" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="0%" stopColor="#0e3a6c" />
                <stop offset="60%" stopColor="#062243" />
                <stop offset="100%" stopColor="#020e1d" />
              </linearGradient>
            </defs>

            {/* Soft night sky illumination */}
            <rect width="320" height="180" fill="url(#cardSkyAura)" />

            {/* Twinkling stars */}
            <g opacity="0.85">
              <circle cx="140" cy="28" r="1" fill="#FFFFFF" opacity="0.6" />
              <circle cx="170" cy="18" r="1.3" fill="#BAE6FD" opacity="0.8" />
              <circle cx="210" cy="38" r="0.8" fill="#FFFFFF" opacity="0.5" />
              <circle cx="240" cy="14" r="1.2" fill="#FFFFFF" opacity="0.9" />
              <circle cx="290" cy="26" r="1" fill="#BAE6FD" opacity="0.7" />
              <circle cx="195" cy="52" r="0.9" fill="#FFFFFF" opacity="0.6" />
              <circle cx="275" cy="48" r="1.1" fill="#E0F2FE" opacity="0.8" />
              {/* Star sparkles */}
              <path d="M170 18 L171 14 L172 18 L176 19 L172 20 L171 24 L170 20 L166 19 Z" fill="#FFFFFF" opacity="0.85" />
              <path d="M240 14 L240.7 11 L241.4 14 L244.4 14.7 L241.4 15.4 L240.7 18.4 L240 15.4 L237 14.7 Z" fill="#BAE6FD" opacity="0.9" />
            </g>

            {/* Luminous Crescent Moon */}
            <g transform="translate(256, 26)">
              <circle cx="14" cy="14" r="22" fill="url(#cardMoonGlow)" />
              <path
                d="M23 4 C15 5.5 9 12.5 10 21 C11 29.5 18 35.5 26.5 35.5 C29.5 35.5 31.5 34.5 33 33.5 C24 35 15.5 28.5 14.5 19.5 C13.5 12 18 5.5 23 4 Z"
                fill="#FFFFFF"
              />
            </g>

            {/* Layer 1: Distant Background Mosque Silhouettes & Minarets */}
            <g fill="url(#cardBgMosqueGrad)">
              {/* Distant Left Minaret */}
              <path d="M152 48 L154 48 L155 180 L151 180 Z" />
              <path d="M150 48 L156 48 L154.5 40 L151.5 40 Z" />
              <path d="M153 32 L153 40 M153 30 A1.5 1.5 0 1 1 153 33" stroke="#38BDF8" strokeWidth="1" />

              {/* Distant Dome at Center-Right */}
              <path d="M175 180 L175 105 C175 80 195 65 210 65 C225 65 245 80 245 105 L245 180 Z" />
              <path d="M210 52 L210 65 M210 50 A2 2 0 1 1 210 54" stroke="#38BDF8" strokeWidth="1.2" />

              {/* Distant Tall Minaret */}
              <path d="M280 42 L282.5 42 L284 180 L278.5 180 Z" />
              <path d="M277 42 L285.5 42 L283 34 L279.5 34 Z" />
              <path d="M281.25 24 L281.25 34 M281.25 22 A1.5 1.5 0 1 1 281.25 25" stroke="#38BDF8" strokeWidth="1" />
            </g>

            {/* Layer 2: Midground Mosque Structure */}
            <g fill="url(#cardMidMosqueGrad)">
              {/* Midground Minaret */}
              <path d="M172 62 L176 62 L178 180 L170 180 Z" />
              <path d="M169 62 L179 62 L176 52 L172 52 Z" />
              <path d="M174 42 L174 52 M174 40 A1.8 1.8 0 1 1 174 44" stroke="#60A5FA" strokeWidth="1.2" />

              {/* Midground Dome */}
              <path d="M140 180 L140 125 C140 100 155 88 168 88 C181 88 196 100 196 125 L196 180 Z" />
            </g>

            {/* Layer 3: Foreground Grand Mosque Architecture */}
            <g fill="url(#cardFgDomeGrad)">
              {/* Left Foreground Minaret */}
              <path d="M198 55 L204 55 L206 180 L196 180 Z" />
              <path d="M195 85 L207 85 L206 88 L196 88 Z" fill="#0c325e" />
              <path d="M194 55 L208 55 L205 45 L197 45 Z" />
              <path d="M201 32 L201 45" stroke="#7DD3FC" strokeWidth="1.5" />
              <path d="M201 30 A2 2 0 1 1 201 34" stroke="#7DD3FC" strokeWidth="1.5" fill="none" />

              {/* Main Grand Dome */}
              <path d="M218 180 L218 112 C218 72 242 54 266 54 C290 54 314 72 314 112 L314 180 Z" />
              
              {/* Dome spire & crescent */}
              <path d="M266 38 L266 54" stroke="#7DD3FC" strokeWidth="2" />
              <path d="M266 35 A3 3 0 1 1 266 41" stroke="#7DD3FC" strokeWidth="1.5" fill="none" />
              <circle cx="266" cy="35" r="1.5" fill="#E0F2FE" />

              {/* Arched Windows on Grand Dome */}
              <g fill="#04152b" stroke="#168BFF" strokeWidth="0.75" opacity="0.85">
                <path d="M236 120 C236 114 240 110 244 110 C248 110 252 114 252 120 L252 130 L236 130 Z" />
                <path d="M258 118 C258 112 262 108 266 108 C270 108 274 112 274 118 L274 130 L258 130 Z" />
                <path d="M280 120 C280 114 284 110 288 110 C292 110 296 114 296 120 L296 130 L280 130 Z" />
              </g>

              {/* Right Minaret */}
              <path d="M308 65 L314 65 L316 180 L306 180 Z" />
              <path d="M305 65 L317 65 L314 55 L308 55 Z" />
              <path d="M311 44 L311 55" stroke="#7DD3FC" strokeWidth="1.5" />
              <path d="M311 42 A2 2 0 1 1 311 46" stroke="#7DD3FC" strokeWidth="1.2" fill="none" />

              {/* Base facade arches */}
              <g fill="#020c1a" opacity="0.9">
                <path d="M225 180 L225 158 C225 152 228 148 232 148 C236 148 239 152 239 158 L239 180 Z" />
                <path d="M246 180 L246 154 C246 146 251 142 256 142 C261 142 266 146 266 154 L266 180 Z" />
                <path d="M273 180 L273 154 C273 146 278 142 283 142 C288 142 293 146 293 154 L293 180 Z" />
                <path d="M300 180 L300 158 C300 152 303 148 307 148 C311 148 314 152 314 180 Z" />
              </g>
            </g>
          </svg>
        </div>
      </section>

      {/* Responsive Grid for Lanjutkan Tilawah & Progres Tilawah */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* Kartu 1: Lanjutkan Tilawah (Hero Card - Konsep 2 Elegan Premium) */}
        <section className="md:col-span-7 lg:col-span-8 flex flex-col">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#082245] via-[#092c57] to-[#04152D] text-white p-5 sm:p-6 shadow-xl border border-[#29415E] h-full flex flex-col justify-between group">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Qur'an Book Icon Box */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-linear-to-tr from-[#0756C9] to-[#168BFF] ring-2 ring-[#168BFF]/40 flex items-center justify-center shrink-0 shadow-lg text-white">
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>

                {/* Text Info */}
                <div className="min-w-0">
                  <span className="text-xs text-[#93B4D7] font-medium block">
                    Lanjutkan Tilawah
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate mt-0.5">
                    {lastRead ? `Surat ${lastRead.surahName}` : 'Surat Al-Baqarah'}
                  </h2>
                  <p className="text-xs text-[#7E95B1] mt-0.5 truncate">
                    {lastRead
                      ? `Ayat ${lastRead.ayahNumber} • Juz ${currentJuz}`
                      : 'Ayat 153 • Juz 2'}
                  </p>
                </div>
              </div>

              {/* Circular Action Button */}
              <button
                onClick={() => {
                  if (lastRead) {
                    onOpenSurah(lastRead.surahNumber, lastRead.ayahNumber);
                  } else {
                    onOpenSurah(2, 153);
                  }
                }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#168BFF] hover:bg-[#168BFF]/90 text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#168BFF]/20 transition active:scale-95 cursor-pointer"
                aria-label="Lanjutkan Tilawah Sekarang"
                title="Buka Ayat Terakhir"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Horizontal Progress Track Indicator */}
            <div className="mt-4 pt-3 border-t border-[#29415E]/80 flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#04152D] rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-linear-to-r from-[#0756C9] to-[#168BFF] rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${surahCompletionPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white shrink-0">
                {surahCompletionPercent}%
              </span>
            </div>
          </div>
        </section>

        {/* Kartu 2: Progres Tilawah Hari Ini (Contrasting Card - Konsep 2) */}
        <section className="md:col-span-5 lg:col-span-4 flex flex-col">
          <div
            onClick={() => (onOpenSettings ? onOpenSettings() : onNavigate('surahs'))}
            className="rounded-3xl p-5 sm:p-6 bg-[#FDFBF5] text-[#061A35] shadow-xl border border-white/20 hover:shadow-2xl transition cursor-pointer group h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[#061A35] text-sm sm:text-base group-hover:text-[#0756C9] transition">
                Progres Tilawah Hari Ini
              </h3>
              <ChevronRight className="w-5 h-5 text-[#5E6B7C] group-hover:translate-x-1 group-hover:text-[#0756C9] transition-transform" />
            </div>

            <div className="flex items-center gap-4 sm:gap-5 pt-1">
              {/* SVG Circular Donut Ring */}
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r={donutRadius}
                    className="text-[#E4E9F0]"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r={donutRadius}
                    className="text-[#168BFF] transition-all duration-700 ease-out"
                    strokeWidth="5"
                    strokeDasharray={donutCircumference}
                    strokeDashoffset={donutOffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute font-black text-xs sm:text-sm text-[#061A35]">
                  {progressPercent}%
                </span>
              </div>

              {/* Read Stats Info & Link */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-[#061A35]">
                    {dailyProgress.ayahsRead}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#5E6B7C]">
                    / {dailyTarget} ayat
                  </span>
                </div>
                <p className="text-[11px] text-[#5E6B7C] mt-0.5 truncate">
                  {dailyProgress.ayahsRead >= dailyTarget
                    ? 'Target tilawah tercapai!'
                    : `Kurang ${Math.max(0, dailyTarget - dailyProgress.ayahsRead)} ayat lagi`}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenSettings) {
                      onOpenSettings();
                    } else {
                      onNavigate('surahs');
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0756C9] hover:underline mt-1 cursor-pointer"
                >
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Kartu 3: Ayat Pilihan Hari Ini (Elegan Dark Navy Card) */}
      <section>
        <div className="rounded-3xl p-5 sm:p-6 bg-[#061A35] border border-[#29415E] shadow-xl space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm sm:text-base">
              Ayat Pilihan Hari Ini
            </h3>
            <button
              onClick={() => onNavigate('surahs')}
              className="text-xs font-semibold text-[#168BFF] hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          {/* Ayah Content */}
          <div className="py-2 text-center space-y-2.5">
            <p className="font-arabic text-2xl sm:text-3xl text-white leading-loose text-center px-2">
              {activeDailyAyah.arabic}
            </p>
            <p className="text-xs sm:text-sm text-[#AABBD0] italic max-w-lg mx-auto leading-relaxed">
              "{activeDailyAyah.translation}"
            </p>
            <p className="text-xs font-medium text-[#7E95B1]">
              ({activeDailyAyah.citation})
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between border-t border-[#29415E]">
            {/* Audio Play Button */}
            <button
              onClick={handleToggleAyahAudio}
              className="w-11 h-11 rounded-full bg-[#168BFF] hover:bg-[#168BFF]/90 text-white flex items-center justify-center transition active:scale-95 shadow-lg shadow-[#168BFF]/20 cursor-pointer"
              aria-label={isPlayingAyahAudio ? 'Jeda Audio Ayat' : 'Putar Audio Ayat'}
              title="Dengarkan Lantunan Ayat"
            >
              {isPlayingAyahAudio ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Right Action Icons: Bookmark & Share */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleToggleBookmark}
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  isBookmarkedState
                    ? 'bg-[#082245] border-[#168BFF] text-[#168BFF]'
                    : 'bg-[#082245] border-[#29415E] text-[#AABBD0] hover:text-white hover:border-[#168BFF]'
                }`}
                aria-label="Simpan ke Bookmark"
                title="Bookmark Ayat Ini"
              >
                <Bookmark className={`w-5 h-5 ${isBookmarkedState ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShareAyah}
                className="p-2.5 rounded-xl bg-[#082245] border border-[#29415E] text-[#AABBD0] hover:text-white hover:border-[#168BFF] transition cursor-pointer"
                aria-label="Bagikan Ayat"
                title="Salin Teks Ayat"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => onOpenSurah(activeDailyAyah.surahNumber, activeDailyAyah.ayahNumber)}
                className="px-3.5 py-1.5 rounded-xl bg-[#082245] border border-[#29415E] text-[#168BFF] text-xs font-bold hover:bg-[#0c2f5d] transition cursor-pointer"
                title="Buka di Surat Penuh"
              >
                Buka Surat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Fitur Ibadah (Konsep 2 - Glowing Soft Navy Cards with Vibrant Blue Icons) */}
      <section className="space-y-3">
        <h3 className="font-bold text-white text-base">
          Fitur Ibadah
        </h3>

        <div className="grid grid-cols-4 gap-1.5 min-[360px]:gap-2 sm:gap-4 md:gap-6">
          {/* 1. Daftar Surat */}
          <button
            onClick={() => onNavigate('surahs')}
            aria-label="Daftar Surat"
            title="Buka Daftar Surat"
            className="flex flex-col items-center group cursor-pointer p-1.5 min-[360px]:p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-[#082245]/90 border border-[#29415E] hover:border-[#168BFF] hover:bg-[#0c2f5d] transition shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168BFF]"
          >
            <div className="w-11 h-11 min-[360px]:w-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#0c2e5b] text-[#168BFF] flex items-center justify-center group-hover:bg-[#168BFF] group-hover:text-white transition-all shadow-md border border-[#168BFF]/20 group-hover:scale-105">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] min-[360px]:text-xs sm:text-sm font-semibold text-[#E2EDF8] text-center mt-1.5 sm:mt-2 group-hover:text-[#168BFF] transition leading-tight break-words max-w-full px-0.5">
              Daftar Surat
            </span>
          </button>

          {/* 2. Doa Harian */}
          <button
            onClick={() => onNavigate('dua')}
            aria-label="Doa Harian"
            title="Buka Doa Harian"
            className="flex flex-col items-center group cursor-pointer p-1.5 min-[360px]:p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-[#082245]/90 border border-[#29415E] hover:border-[#168BFF] hover:bg-[#0c2f5d] transition shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168BFF]"
          >
            <div className="w-11 h-11 min-[360px]:w-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#0c2e5b] text-[#168BFF] flex items-center justify-center group-hover:bg-[#168BFF] group-hover:text-white transition-all shadow-md border border-[#168BFF]/20 group-hover:scale-105">
              <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] min-[360px]:text-xs sm:text-sm font-semibold text-[#E2EDF8] text-center mt-1.5 sm:mt-2 group-hover:text-[#168BFF] transition leading-tight break-words max-w-full px-0.5">
              Doa Harian
            </span>
          </button>

          {/* 3. Kompas Kiblat (Label singkat: Kiblat) */}
          <button
            onClick={() => onNavigate('qibla')}
            aria-label="Kompas Kiblat"
            title="Buka Kompas Kiblat"
            className="flex flex-col items-center group cursor-pointer p-1.5 min-[360px]:p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-[#082245]/90 border border-[#29415E] hover:border-[#168BFF] hover:bg-[#0c2f5d] transition shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168BFF]"
          >
            <div className="w-11 h-11 min-[360px]:w-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#0c2e5b] text-[#168BFF] flex items-center justify-center group-hover:bg-[#168BFF] group-hover:text-white transition-all shadow-md border border-[#168BFF]/20 group-hover:scale-105">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] min-[360px]:text-xs sm:text-sm font-semibold text-[#E2EDF8] text-center mt-1.5 sm:mt-2 group-hover:text-[#168BFF] transition leading-tight break-words max-w-full px-0.5">
              Kiblat
            </span>
          </button>

          {/* 4. Belajar Tajwid (Label singkat: Tajwid) */}
          <button
            onClick={() => onNavigate('tajwid')}
            aria-label="Belajar Tajwid"
            title="Buka Belajar Tajwid"
            className="flex flex-col items-center group cursor-pointer p-1.5 min-[360px]:p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-[#082245]/90 border border-[#29415E] hover:border-[#168BFF] hover:bg-[#0c2f5d] transition shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#168BFF]"
          >
            <div className="w-11 h-11 min-[360px]:w-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#0c2e5b] text-[#168BFF] flex items-center justify-center group-hover:bg-[#168BFF] group-hover:text-white transition-all shadow-md border border-[#168BFF]/20 group-hover:scale-105">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] min-[360px]:text-xs sm:text-sm font-semibold text-[#E2EDF8] text-center mt-1.5 sm:mt-2 group-hover:text-[#168BFF] transition leading-tight break-words max-w-full px-0.5">
              Tajwid
            </span>
          </button>
        </div>
      </section>

      {/* Jadwal Salat & Audio Adzan Card */}
      <section>
        <PrayerTimeCard onOpenSettings={onOpenSettings} />
      </section>

      {/* Akses Cepat Surat Pilihan */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Surat Pilihan</h3>
          <button
            onClick={() => onNavigate('surahs')}
            className="text-xs font-bold text-[#168BFF] hover:underline cursor-pointer"
          >
            Lihat Semua 114 Surat
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {popularSurahs.map(s => (
            <button
              key={s.no}
              onClick={() => onOpenSurah(s.no)}
              className="p-3.5 rounded-2xl bg-[#061A35] border border-[#29415E] hover:border-[#168BFF] hover:shadow-lg transition text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="w-6 h-6 rounded-lg bg-[#082245] text-[#168BFF] border border-[#29415E] font-bold text-[10px] flex items-center justify-center group-hover:bg-[#168BFF] group-hover:text-white transition">
                  {s.no}
                </span>
                <span className="text-[10px] text-[#7E95B1]">{s.ayahs} ayat</span>
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-[#168BFF] truncate">
                {s.name}
              </h4>
              <p className="text-[10px] text-[#7E95B1] truncate">{s.meaning}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
