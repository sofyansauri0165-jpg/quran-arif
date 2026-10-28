import React, { useEffect, useState, useRef } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import { SurahListItem, LastRead } from '../types/quran';
import { getSurahList } from '../services/quranApi';
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
  Loader2,
  AlertCircle,
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
  const [surahs, setSurahs] = useState<SurahListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

    getSurahList()
      .then(data => {
        if (isMounted) {
          setSurahs(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Gagal memuat data surat.');
          setLoading(false);
        }
      });

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
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#061A35] text-white text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Sapaan Pengguna / Greeting Section */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-[#E4E9F0] p-5 sm:p-6 shadow-xs">
        <div className="relative z-10 max-w-md">
          <h1 className="text-xl sm:text-2xl font-black text-[#061A35] tracking-tight">
            Assalamu'alaikum
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6B7C] font-medium mt-1 flex items-center gap-1.5">
            <span>Semoga hari ini penuh keberkahan</span>
            <span role="img" aria-label="Bulan sabit">🌙</span>
          </p>
        </div>

        {/* Decorative Mosque Silhouette on the right side */}
        <div className="absolute right-0 bottom-0 top-0 pointer-events-none opacity-25 sm:opacity-35 flex items-end">
          <svg
            className="w-48 sm:w-64 h-full text-[#0756C9]"
            viewBox="0 0 240 120"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            {/* Mosque minarets and dome silhouette */}
            <path d="M120 20 C105 20, 95 45, 95 70 L95 120 L145 120 L145 70 C145 45, 135 20, 120 20 Z" />
            <path d="M120 10 L120 20 M120 8 A3 3 0 1 1 120 14 A3 3 0 0 1 120 8" stroke="currentColor" strokeWidth="2" />
            <path d="M60 40 C50 40, 42 55, 42 75 L42 120 L78 120 L78 75 C78 55, 70 40, 60 40 Z" />
            <path d="M180 40 C170 40, 162 55, 162 75 L162 120 L198 120 L198 75 C198 55, 190 40, 180 40 Z" />
            {/* Minarets */}
            <path d="M25 25 L32 25 L30 120 L27 120 Z" />
            <path d="M28.5 12 L28.5 25 M28.5 10 A2 2 0 1 1 28.5 14 A2 2 0 0 1 28.5 10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M210 25 L217 25 L215 120 L212 120 Z" />
            <path d="M213.5 12 L213.5 25 M213.5 10 A2 2 0 1 1 213.5 14 A2 2 0 0 1 213.5 10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </section>

      {/* Kartu 1: Lanjutkan Tilawah (Hero Card as in Reference Image) */}
      <section>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-r from-[#0756C9] via-[#0645A8] to-[#061A35] text-white p-5 sm:p-6 shadow-md border border-[#168BFF]/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Qur'an Book Icon Box */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>

              {/* Text Info */}
              <div className="min-w-0">
                <span className="text-xs text-blue-100 font-medium block">
                  Lanjutkan Tilawah
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate mt-0.5">
                  {lastRead ? `Surat ${lastRead.surahName}` : 'Surat Al-Baqarah'}
                </h2>
                <p className="text-xs text-blue-200 mt-0.5">
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
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#168BFF] hover:bg-[#168BFF]/85 text-white flex items-center justify-center shrink-0 shadow-md transition active:scale-95 cursor-pointer"
              aria-label="Lanjutkan Tilawah Sekarang"
              title="Buka Ayat Terakhir"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Horizontal Progress Track Indicator */}
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${surahCompletionPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-white shrink-0">
              {surahCompletionPercent}%
            </span>
          </div>
        </div>
      </section>

      {/* Kartu 2: Progres Tilawah Hari Ini (Donut Progress Card as in Reference Image) */}
      <section>
        <div
          onClick={() => onNavigate('profile')}
          className="rounded-2xl sm:rounded-3xl p-5 bg-white border border-[#E4E9F0] shadow-xs hover:border-[#0756C9]/40 hover:shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#061A35] text-sm sm:text-base group-hover:text-[#0756C9] transition">
              Progres Tilawah Hari Ini
            </h3>
            <ChevronRight className="w-5 h-5 text-[#5E6B7C] group-hover:translate-x-1 group-hover:text-[#0756C9] transition-transform" />
          </div>

          <div className="flex items-center gap-5 sm:gap-6 pt-1">
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
                  className="text-[#0756C9] transition-all duration-700 ease-out"
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
                  ? 'Target tilawah harian telah tercapai!'
                  : `Kurang ${Math.max(0, dailyTarget - dailyProgress.ayahsRead)} ayat lagi`}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('profile');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0756C9] hover:underline mt-1.5 cursor-pointer"
              >
                <span>Lihat Detail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Kartu 3: Ayat Pilihan Hari Ini (Quote Card with Audio & Actions) */}
      <section>
        <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-white border border-[#E4E9F0] shadow-xs space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#061A35] text-sm sm:text-base">
              Ayat Pilihan Hari Ini
            </h3>
            <button
              onClick={() => onNavigate('surahs')}
              className="text-xs font-semibold text-[#0756C9] hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          {/* Ayah Content */}
          <div className="py-2 text-center space-y-2.5">
            <p className="font-arabic text-2xl sm:text-3xl text-[#061A35] leading-loose text-center px-2">
              {activeDailyAyah.arabic}
            </p>
            <p className="text-xs sm:text-sm text-[#5E6B7C] italic max-w-lg mx-auto leading-relaxed">
              "{activeDailyAyah.translation}"
            </p>
            <p className="text-xs font-medium text-[#5E6B7C]">
              ({activeDailyAyah.citation})
            </p>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between border-t border-[#E4E9F0]">
            {/* Audio Play Button */}
            <button
              onClick={handleToggleAyahAudio}
              className="w-11 h-11 rounded-full bg-[#0756C9] hover:bg-[#0645A8] text-white flex items-center justify-center transition active:scale-95 shadow-sm cursor-pointer"
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
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleToggleBookmark}
                className={`p-2.5 rounded-xl transition cursor-pointer ${
                  isBookmarkedState
                    ? 'bg-[#E8F2FF] text-[#0756C9]'
                    : 'text-[#5E6B7C] hover:bg-[#E8F2FF] hover:text-[#0756C9]'
                }`}
                aria-label="Simpan ke Bookmark"
                title="Bookmark Ayat Ini"
              >
                <Bookmark className={`w-5 h-5 ${isBookmarkedState ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShareAyah}
                className="p-2.5 rounded-xl text-[#5E6B7C] hover:bg-[#E8F2FF] hover:text-[#0756C9] transition cursor-pointer"
                aria-label="Bagikan Ayat"
                title="Salin Teks Ayat"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => onOpenSurah(activeDailyAyah.surahNumber, activeDailyAyah.ayahNumber)}
                className="px-3 py-1.5 rounded-xl bg-[#E8F2FF] text-[#0756C9] text-xs font-bold hover:bg-[#D8EAFF] transition cursor-pointer"
                title="Buka di Surat Penuh"
              >
                Buka Surat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Fitur Ibadah (4 Feature Icons Grid Matching Mockup) */}
      <section className="space-y-3">
        <h3 className="font-bold text-[#061A35] text-base">
          Fitur Ibadah
        </h3>

        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {/* 1. Daftar Surat */}
          <button
            onClick={() => onNavigate('surahs')}
            className="flex flex-col items-center group cursor-pointer p-2 rounded-2xl hover:bg-white/80 transition"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center group-hover:bg-[#0756C9] group-hover:text-white transition shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-[#061A35] text-center mt-2 group-hover:text-[#0756C9] transition line-clamp-1">
              Daftar Surat
            </span>
          </button>

          {/* 2. Doa Harian */}
          <button
            onClick={() => onNavigate('dua')}
            className="flex flex-col items-center group cursor-pointer p-2 rounded-2xl hover:bg-white/80 transition"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center group-hover:bg-[#0756C9] group-hover:text-white transition shadow-2xs">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-[#061A35] text-center mt-2 group-hover:text-[#0756C9] transition line-clamp-1">
              Doa Harian
            </span>
          </button>

          {/* 3. Kompas Kiblat */}
          <button
            onClick={() => onNavigate('qibla')}
            className="flex flex-col items-center group cursor-pointer p-2 rounded-2xl hover:bg-white/80 transition"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center group-hover:bg-[#0756C9] group-hover:text-white transition shadow-2xs">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-[#061A35] text-center mt-2 group-hover:text-[#0756C9] transition line-clamp-1">
              Kompas Kiblat
            </span>
          </button>

          {/* 4. Belajar Tajwid */}
          <button
            onClick={() => onNavigate('tajwid')}
            className="flex flex-col items-center group cursor-pointer p-2 rounded-2xl hover:bg-white/80 transition"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center group-hover:bg-[#0756C9] group-hover:text-white transition shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-[#061A35] text-center mt-2 group-hover:text-[#0756C9] transition line-clamp-1">
              Belajar Tajwid
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
          <h3 className="font-bold text-[#061A35] text-base">Surat Pilihan</h3>
          <button
            onClick={() => onNavigate('surahs')}
            className="text-xs font-bold text-[#0756C9] hover:underline cursor-pointer"
          >
            Lihat Semua 114 Surat
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {popularSurahs.map(s => (
            <button
              key={s.no}
              onClick={() => onOpenSurah(s.no)}
              className="p-3.5 rounded-2xl bg-white border border-[#E4E9F0] hover:border-[#0756C9] hover:shadow-md transition text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="w-6 h-6 rounded-lg bg-[#E8F2FF] text-[#0756C9] font-bold text-[10px] flex items-center justify-center group-hover:bg-[#0756C9] group-hover:text-white transition">
                  {s.no}
                </span>
                <span className="text-[10px] text-[#5E6B7C]">{s.ayahs} ayat</span>
              </div>
              <h4 className="text-xs font-bold text-[#061A35] group-hover:text-[#0756C9] truncate">
                {s.name}
              </h4>
              <p className="text-[10px] text-[#5E6B7C] truncate">{s.meaning}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Surah List Preview */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#061A35]">Daftar Surat Al-Qur'an</h3>
            <p className="text-xs text-[#5E6B7C]">114 Surat lengkap dengan terjemahan resmi</p>
          </div>
          <button
            onClick={() => onNavigate('surahs')}
            className="px-3.5 py-1.5 rounded-xl bg-[#E8F2FF] hover:bg-[#D8EAFF] text-[#0756C9] text-xs font-bold transition cursor-pointer"
          >
            Lihat Semua
          </button>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#5E6B7C]">
            <Loader2 className="w-7 h-7 animate-spin text-[#0756C9]" />
            <p className="text-xs">Memuat daftar surat...</p>
          </div>
        ) : error ? (
          <div className="p-5 rounded-2xl bg-white border border-red-200 text-center space-y-1.5">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
            <p className="text-xs font-semibold text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {surahs.slice(0, 9).map(s => (
              <button
                key={s.nomor}
                onClick={() => onOpenSurah(s.nomor)}
                className="p-3.5 rounded-2xl bg-white border border-[#E4E9F0] hover:border-[#0756C9] hover:shadow-sm transition flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#E8F2FF] text-[#0756C9] font-extrabold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#0756C9] group-hover:text-white transition">
                    {s.nomor}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-[#061A35] group-hover:text-[#0756C9] truncate">
                      {s.namaLatin}
                    </h4>
                    <p className="text-[10px] text-[#5E6B7C] truncate">
                      {s.arti} • {s.jumlahAyat} Ayat
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-arabic text-base text-[#061A35] block">
                    {s.nama}
                  </span>
                  <span className="text-[9px] font-semibold text-[#0756C9] uppercase">
                    {s.tempatTurun}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
