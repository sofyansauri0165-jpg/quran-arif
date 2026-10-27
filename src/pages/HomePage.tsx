import React, { useEffect, useState } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import { SurahListItem, LastRead } from '../types/quran';
import { getSurahList } from '../services/quranApi';
import { getLastRead, getDailyProgress, getSettings } from '../storage/persistence';
import {
  BookOpen,
  ArrowRight,
  Search,
  Sparkles,
  Headphones,
  ScrollText,
  BookmarkCheck,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import { PrayerTimeCard } from '../components/prayer/PrayerTimeCard';

interface HomePageProps {
  onNavigate: (tab: string, params?: any) => void;
  onOpenSurah: (surahNumber: number, targetAyah?: number) => void;
  onOpenSettings?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenSurah, onOpenSettings }) => {
  const [surahs, setSurahs] = useState<SurahListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [dailyProgress, setDailyProgress] = useState({ date: '', ayahsRead: 0 });
  const [dailyTarget, setDailyTarget] = useState(20);

  useEffect(() => {
    let isMounted = true;
    setLastRead(getLastRead());
    setDailyProgress(getDailyProgress());
    setDailyTarget(getSettings().dailyAyahTarget || 20);

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
    };
  }, []);

  const progressPercent = Math.min(
    100,
    Math.round((dailyProgress.ayahsRead / (dailyTarget || 1)) * 100)
  );

  const popularSurahs = [
    { no: 1, name: 'Al-Fatihah', meaning: 'Pembukaan', ayahs: 7 },
    { no: 18, name: 'Al-Kahf', meaning: 'Penghuni Gua', ayahs: 110 },
    { no: 36, name: 'Yasin', meaning: 'Ya Sin', ayahs: 83 },
    { no: 55, name: 'Ar-Rahman', meaning: 'Yang Maha Pengasih', ayahs: 78 },
    { no: 56, name: 'Al-Waqi\'ah', meaning: 'Hari Kiamat', ayahs: 96 },
    { no: 67, name: 'Al-Mulk', meaning: 'Kerajaan', ayahs: 30 },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0756C9] via-[#0645A8] to-[#0B2D68] text-white p-6 sm:p-10 shadow-xl border border-[#168BFF]/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#168BFF]" />
              <span>Aplikasi Al-Qur'an Digital Premium</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {APP_CONFIG.appName}
            </h1>

            <p className="text-base sm:text-lg text-blue-100 font-medium leading-relaxed">
              "{APP_CONFIG.tagline}"
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              {lastRead ? (
                <button
                  onClick={() => onOpenSurah(lastRead.surahNumber, lastRead.ayahNumber)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#0756C9] font-bold text-sm shadow-md hover:bg-[#E8F2FF] transition active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Lanjut QS. {lastRead.surahName}: {lastRead.ayahNumber}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => onOpenSurah(1, 1)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#0756C9] font-bold text-sm shadow-md hover:bg-[#E8F2FF] transition active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Mulai Membaca Surat Al-Fatihah</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onNavigate('surahs')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold text-sm border border-white/20 transition cursor-pointer"
              >
                <span>Daftar 114 Surat</span>
              </button>
            </div>
          </div>

          {/* Logo Badge */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/95 p-3 shadow-2xl border-4 border-white/30 flex items-center justify-center backdrop-blur-xs">
              <img
                src={APP_CONFIG.logoUrl}
                alt="Logo Resmi Maj Qur'an"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-3">
              <PWAInstallButton variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Jadwal Salat & Audio Adzan Section */}
      <section>
        <PrayerTimeCard onOpenSettings={onOpenSettings} />
      </section>

      {/* Grid: Last Read & Daily Tilawah Progress */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last Read Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4E9F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-[11px] font-bold text-[#5E6B7C] uppercase tracking-wider block">
                Terakhir Dibaca
              </span>
              {lastRead ? (
                <>
                  <h3 className="text-xl font-extrabold text-[#061A35] mt-1">
                    QS. {lastRead.surahName}
                  </h3>
                  <p className="text-xs text-[#5E6B7C]">
                    Ayat ke-{lastRead.ayahNumber} dari {lastRead.totalAyah} ayat
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-[#061A35] mt-1">
                    Belum ada riwayat bacaan
                  </h3>
                  <p className="text-xs text-[#5E6B7C]">
                    Mulai tilawah hari ini untuk mencatat posisi ayat terakhir Anda.
                  </p>
                </>
              )}
            </div>
            <div className="p-3 rounded-xl bg-[#E8F2FF] text-[#0756C9] shrink-0">
              <BookmarkCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E9F0] flex items-center justify-between">
            <span className="text-xs text-[#5E6B7C]">
              {lastRead ? 'Tersimpan otomatis' : 'Mulai dari awal'}
            </span>
            <button
              onClick={() => onOpenSurah(lastRead ? lastRead.surahNumber : 1, lastRead ? lastRead.ayahNumber : 1)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0756C9] hover:text-[#0645A8] transition cursor-pointer"
            >
              <span>{lastRead ? 'Buka Ayat' : 'Buka Al-Fatihah'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Daily Tilawah Progress Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E4E9F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-[11px] font-bold text-[#5E6B7C] uppercase tracking-wider block">
                Progres Tilawah Hari Ini
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#061A35]">
                  {dailyProgress.ayahsRead}
                </span>
                <span className="text-xs text-[#5E6B7C] font-semibold">
                  / target {dailyTarget} ayat
                </span>
              </div>
              <p className="text-xs text-[#5E6B7C]">
                {dailyProgress.ayahsRead >= dailyTarget
                  ? 'Alhamdulillah! Target tilawah harian Anda telah tercapai.'
                  : `Kurang ${Math.max(0, dailyTarget - dailyProgress.ayahsRead)} ayat lagi untuk memenuhi target hari ini.`}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F2FF] text-[#0756C9] shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#E4E9F0]">
            <div className="w-full h-2.5 bg-[#E4E9F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0756C9] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#5E6B7C] font-semibold">
              <span>Progres harian</span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Shortcut Banner */}
      <section className="p-4 rounded-2xl bg-[#E8F2FF] border border-[#168BFF]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white text-[#0756C9] shadow-xs shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#061A35]">Cari Surat, Ayat, atau Makna Terjemahan</h4>
            <p className="text-xs text-[#5E6B7C]">Ketik nama surat (misal: "Yasin"), nomor ("36:1"), atau kata kunci terjemahan.</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('search')}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
        >
          Buka Pencarian
        </button>
      </section>

      {/* Akses Cepat Surat Pilihan */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#061A35]">Surat-Surat Pilihan</h2>
          <button
            onClick={() => onNavigate('surahs')}
            className="text-xs font-bold text-[#0756C9] hover:underline"
          >
            Lihat Semua 114 Surat
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
              <h3 className="text-xs font-bold text-[#061A35] group-hover:text-[#0756C9] truncate">
                {s.name}
              </h3>
              <p className="text-[10px] text-[#5E6B7C] truncate">{s.meaning}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#061A35]">Fitur Unggulan Maj Qur'an</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E4E9F0] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#061A35]">114 Surat Lengkap</h4>
            <p className="text-xs text-[#5E6B7C] leading-relaxed">
              Teks Arab berharakat tajam, transliterasi latin, dan terjemahan resmi Kemenag RI.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E4E9F0] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#061A35]">6 Qari Terkemuka</h4>
            <p className="text-xs text-[#5E6B7C] leading-relaxed">
              Dengarkan lantunan murottal dari Syaikh Misyari Rasyid, Sudais, Al-Juhany, dan lainnya.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E4E9F0] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center font-bold">
              <ScrollText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#061A35]">Tafsir Ringkas Kemenag</h4>
            <p className="text-xs text-[#5E6B7C] leading-relaxed">
              Penjelasan tafsir resmi per ayat untuk memudahkan pemahaman dan tadabbur kalam ilahi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E4E9F0] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#061A35]">PWA & Auto-Scroll</h4>
            <p className="text-xs text-[#5E6B7C] leading-relaxed">
              Dapat diinstal ke layar utama, mendukung cache offline, dan auto-scroll untuk kemudahan tilawah.
            </p>
          </div>
        </div>
      </section>

      {/* Surah List Preview */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#061A35]">Daftar Surat Al-Qur'an</h2>
            <p className="text-xs text-[#5E6B7C]">114 Surat diturunkan di Mekah dan Madinah</p>
          </div>
          <button
            onClick={() => onNavigate('surahs')}
            className="px-3.5 py-1.5 rounded-xl bg-[#E8F2FF] hover:bg-[#D4E6FF] text-[#0756C9] text-xs font-bold transition cursor-pointer"
          >
            Lihat Lengkap & Filter
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#5E6B7C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#0756C9]" />
            <p className="text-sm">Memuat daftar surat Al-Qur'an dari server...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-white border border-red-200 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <p className="text-xs text-[#5E6B7C]">Pastikan koneksi internet aktif untuk memuat 114 surat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {surahs.slice(0, 12).map(s => (
              <button
                key={s.nomor}
                onClick={() => onOpenSurah(s.nomor)}
                className="p-4 rounded-2xl bg-white border border-[#E4E9F0] hover:border-[#0756C9] hover:shadow-md transition flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F2FF] text-[#0756C9] font-extrabold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#0756C9] group-hover:text-white transition">
                    {s.nomor}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#061A35] group-hover:text-[#0756C9] truncate">
                      {s.namaLatin}
                    </h4>
                    <p className="text-[11px] text-[#5E6B7C] truncate">
                      {s.arti} • {s.jumlahAyat} Ayat
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-arabic text-lg text-[#061A35] block">
                    {s.nama}
                  </span>
                  <span className="text-[10px] font-semibold text-[#0756C9] uppercase">
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
