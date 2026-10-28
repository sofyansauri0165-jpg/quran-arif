import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import { UserSettings, LastRead } from '../types/quran';
import {
  getLastRead,
  getDailyProgress,
  getBookmarks,
  getHistory,
  clearHistory,
  getFavoriteDuaIds,
  getTajwidProgress,
  getSettings,
  saveSettings,
} from '../storage/persistence';
import { usePrayerAudio } from '../context/PrayerAudioContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import {
  User,
  BookOpen,
  BookmarkCheck,
  Heart,
  Sparkles,
  History,
  Trash2,
  Settings,
  Volume2,
  VolumeX,
  Play,
  Square,
  CheckCircle2,
  ArrowRight,
  Download,
  Share2,
  Edit2,
  Check,
  ExternalLink,
  ShieldCheck,
  Target,
  Sliders,
  Compass,
} from 'lucide-react';

interface ProfilePageProps {
  onOpenSurah: (surahNumber: number, targetAyah?: number) => void;
  onNavigate: (tab: string, params?: any) => void;
  onOpenSettingsModal: () => void;
  onSettingsUpdate?: (newSettings: UserSettings) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onOpenSurah,
  onNavigate,
  onOpenSettingsModal,
  onSettingsUpdate,
}) => {
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('maj_quran_user_name') || 'Sahabat Maj Qur’an';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // Real statistics
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [dailyProgress, setDailyProgress] = useState({ date: '', ayahsRead: 0 });
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [historyList, setHistoryList] = useState<LastRead[]>([]);
  const [favoriteDuasCount, setFavoriteDuasCount] = useState(0);
  const [tajwidProgress, setTajwidProgress] = useState({ totalAnswered: 0, correctAnswers: 0, lastScorePercent: 0 });
  const [settings, setSettingsState] = useState<UserSettings>(() => getSettings());
  const [copiedAppShare, setCopiedAppShare] = useState(false);

  // Prayer audio context
  const { preferences: prayerConfig, activeAlert, playTestAudio, stopPrayerAudio } = usePrayerAudio();
  const isPrayerAudioPlaying = activeAlert !== null;
  const { isInstalled } = usePWAInstall();

  useEffect(() => {
    setLastRead(getLastRead());
    setDailyProgress(getDailyProgress());
    setBookmarksCount(getBookmarks().length);
    setHistoryList(getHistory());
    setFavoriteDuasCount(getFavoriteDuaIds().length);
    const tp = getTajwidProgress();
    setTajwidProgress({
      totalAnswered: tp.totalAnswered,
      correctAnswers: tp.correctAnswers,
      lastScorePercent: tp.lastScorePercent,
    });
    setSettingsState(getSettings());
  }, []);

  const handleSaveName = () => {
    const trimmed = tempName.trim() || 'Sahabat Maj Qur’an';
    setUserName(trimmed);
    localStorage.setItem('maj_quran_user_name', trimmed);
    setIsEditingName(false);
  };

  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat bacaan tilawah?')) {
      clearHistory();
      setHistoryList([]);
    }
  };

  const handleUpdateTarget = (target: number) => {
    const updated = { ...settings, dailyAyahTarget: target };
    setSettingsState(updated);
    saveSettings(updated);
    if (onSettingsUpdate) onSettingsUpdate(updated);
  };

  const handleUpdateFontSize = (size: UserSettings['arabicFontSize']) => {
    const updated = { ...settings, arabicFontSize: size };
    setSettingsState(updated);
    saveSettings(updated);
    if (onSettingsUpdate) onSettingsUpdate(updated);
  };

  const handleToggleTranslation = () => {
    const updated = { ...settings, showTranslation: !settings.showTranslation };
    setSettingsState(updated);
    saveSettings(updated);
    if (onSettingsUpdate) onSettingsUpdate(updated);
  };

  const handleToggleTransliteration = () => {
    const updated = { ...settings, showTransliteration: !settings.showTransliteration };
    setSettingsState(updated);
    saveSettings(updated);
    if (onSettingsUpdate) onSettingsUpdate(updated);
  };

  const handleShareApp = async () => {
    const shareData = {
      title: `${APP_CONFIG.appName} — Digital Al-Qur'an & PWA`,
      text: `${APP_CONFIG.appName}: ${APP_CONFIG.tagline}. Dilengkapi 114 Surat, Jadwal Salat Kemenag, Doa Harian, Kompas Kiblat, dan Belajar Tajwid.`,
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // user dismissed
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      setCopiedAppShare(true);
      setTimeout(() => setCopiedAppShare(false), 2000);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round((dailyProgress.ayahsRead / (settings.dailyAyahTarget || 1)) * 100)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-28">
      {/* Profile Header Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0756C9] via-[#0645A8] to-[#061A35] text-white p-6 sm:p-8 shadow-xl border border-[#168BFF]/20">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/95 p-2 shadow-2xl border-2 border-white/40 flex items-center justify-center shrink-0">
              <img
                src={APP_CONFIG.logoUrl}
                alt="Logo Maj Qur'an"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100">
                <Sparkles className="w-3.5 h-3.5 text-[#168BFF]" />
                <span>Profil Pembaca Maj Qur’an</span>
              </div>

              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    maxLength={30}
                    className="px-3 py-1.5 rounded-xl bg-white text-[#061A35] text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-[#168BFF]"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2 rounded-xl bg-white text-[#0756C9] hover:bg-blue-50 transition cursor-pointer"
                    title="Simpan Nama"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {userName}
                  </h1>
                  <button
                    onClick={() => {
                      setTempName(userName);
                      setIsEditingName(true);
                    }}
                    className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Ubah Nama"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-xs sm:text-sm text-blue-100 font-medium">
                “{APP_CONFIG.tagline}”
              </p>
            </div>
          </div>

          {/* Share App Action */}
          <button
            onClick={handleShareApp}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition cursor-pointer shrink-0"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedAppShare ? 'Tautan Disalin!' : 'Bagikan Aplikasi'}</span>
          </button>
        </div>
      </section>

      {/* Real Statistics Grid */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#061A35] flex items-center gap-2">
          <Target className="w-5 h-5 text-[#0756C9]" />
          <span>Statistik Tilawah & Ibadah Anda</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Card 1: Today Progress */}
          <div className="p-4 rounded-2xl bg-white border border-[#E4E9F0] shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-[#5E6B7C] uppercase tracking-wider block">
              Ayat Hari Ini
            </span>
            <div className="my-2">
              <span className="text-2xl font-extrabold text-[#0756C9]">
                {dailyProgress.ayahsRead}
              </span>
              <span className="text-xs text-[#5E6B7C] font-medium ml-1">
                / {settings.dailyAyahTarget} ayat
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#E4E9F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0756C9] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Card 2: Bookmarks */}
          <button
            onClick={() => onNavigate('bookmarks')}
            className="p-4 rounded-2xl bg-white border border-[#E4E9F0] shadow-xs flex flex-col justify-between text-left hover:border-[#0756C9] transition cursor-pointer group"
          >
            <span className="text-[11px] font-bold text-[#5E6B7C] uppercase tracking-wider block">
              Bookmark
            </span>
            <div className="my-2">
              <span className="text-2xl font-extrabold text-[#061A35] group-hover:text-[#0756C9] transition">
                {bookmarksCount}
              </span>
              <span className="text-xs text-[#5E6B7C] font-medium ml-1">tersimpan</span>
            </div>
            <span className="text-[11px] text-[#0756C9] font-bold flex items-center gap-1">
              Buka Bookmark <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Card 3: Favorite Duas */}
          <button
            onClick={() => onNavigate('dua')}
            className="p-4 rounded-2xl bg-white border border-[#E4E9F0] shadow-xs flex flex-col justify-between text-left hover:border-[#0756C9] transition cursor-pointer group"
          >
            <span className="text-[11px] font-bold text-[#5E6B7C] uppercase tracking-wider block">
              Doa Favorit
            </span>
            <div className="my-2">
              <span className="text-2xl font-extrabold text-[#061A35] group-hover:text-[#0756C9] transition">
                {favoriteDuasCount}
              </span>
              <span className="text-xs text-[#5E6B7C] font-medium ml-1">doa</span>
            </div>
            <span className="text-[11px] text-[#0756C9] font-bold flex items-center gap-1">
              Buka Kumpulan Doa <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Card 4: Tajwid Progress */}
          <button
            onClick={() => onNavigate('tajwid')}
            className="p-4 rounded-2xl bg-white border border-[#E4E9F0] shadow-xs flex flex-col justify-between text-left hover:border-[#0756C9] transition cursor-pointer group"
          >
            <span className="text-[11px] font-bold text-[#5E6B7C] uppercase tracking-wider block">
              Skor Kuis Tajwid
            </span>
            <div className="my-2">
              <span className="text-2xl font-extrabold text-[#061A35] group-hover:text-[#0756C9] transition">
                {tajwidProgress.lastScorePercent}%
              </span>
              <span className="text-xs text-[#5E6B7C] font-medium ml-1">
                ({tajwidProgress.correctAnswers} benar)
              </span>
            </div>
            <span className="text-[11px] text-[#0756C9] font-bold flex items-center gap-1">
              Latihan Tajwid <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      </section>

      {/* Target Tilawah Adjustment */}
      <section className="p-5 rounded-3xl bg-white border border-[#E4E9F0] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-[#061A35] text-sm sm:text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-[#0756C9]" />
              <span>Target Tilawah Harian</span>
            </h3>
            <p className="text-xs text-[#5E6B7C]">
              Tentukan target jumlah ayat yang ingin Anda baca setiap hari untuk istiqomah.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[10, 20, 30, 50].map(target => (
              <button
                key={target}
                onClick={() => handleUpdateTarget(target)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  settings.dailyAyahTarget === target
                    ? 'bg-[#0756C9] text-white shadow-xs'
                    : 'bg-[#FDFBF5] text-[#061A35] border border-[#E4E9F0] hover:bg-[#E8F2FF]'
                }`}
              >
                {target} Ayat
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Last Read Position Detail */}
      <section className="p-5 rounded-3xl bg-white border border-[#E4E9F0] shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#5E6B7C] uppercase tracking-wider block">
              Posisi Terakhir Dibaca
            </span>
            {lastRead ? (
              <div className="mt-1">
                <h3 className="text-lg font-extrabold text-[#061A35]">
                  QS. {lastRead.surahName} (Ayat {lastRead.ayahNumber})
                </h3>
                <p className="text-xs text-[#5E6B7C]">
                  Surat ke-{lastRead.surahNumber} • Total {lastRead.totalAyah} ayat
                </p>
              </div>
            ) : (
              <div className="mt-1">
                <h3 className="text-base font-bold text-[#061A35]">
                  Belum ada bacaan tersimpan
                </h3>
                <p className="text-xs text-[#5E6B7C]">
                  Buka surat Al-Fatihah atau surat lain untuk mulai mencatat posisi tilawah Anda.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onOpenSurah(lastRead ? lastRead.surahNumber : 1, lastRead ? lastRead.ayahNumber : 1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white text-xs font-bold shadow-md shadow-[#0756C9]/20 transition active:scale-95 cursor-pointer shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>{lastRead ? 'Lanjutkan Membaca' : 'Mulai Membaca'}</span>
          </button>
        </div>
      </section>

      {/* Reading History */}
      <section className="p-5 rounded-3xl bg-white border border-[#E4E9F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#0756C9]" />
            <h3 className="font-extrabold text-[#061A35] text-base">
              Riwayat Bacaan Terakhir
            </h3>
          </div>

          {historyList.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded-lg transition cursor-pointer"
              title="Bersihkan riwayat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          )}
        </div>

        {historyList.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#5E6B7C]">
            Belum ada riwayat bacaan. Setiap ayat yang Anda baca akan otomatis tercatat di sini.
          </div>
        ) : (
          <div className="divide-y divide-[#E4E9F0]">
            {historyList.slice(0, 8).map((item, idx) => (
              <div
                key={`${item.surahNumber}-${item.ayahNumber}-${idx}`}
                className="py-3 flex items-center justify-between gap-3 hover:bg-[#FDFBF5] px-2 rounded-xl transition"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#061A35]">
                    QS. {item.surahName}
                  </h4>
                  <p className="text-xs text-[#5E6B7C]">
                    Ayat ke-{item.ayahNumber} dari {item.totalAyah} ayat
                  </p>
                </div>
                <button
                  onClick={() => onOpenSurah(item.surahNumber, item.ayahNumber)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0756C9] hover:text-[#0645A8] p-1.5 rounded-lg hover:bg-[#E8F2FF] transition cursor-pointer"
                >
                  <span>Buka</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Tilawah & Audio Settings */}
      <section className="p-5 rounded-3xl bg-white border border-[#E4E9F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#0756C9]" />
            <h3 className="font-extrabold text-[#061A35] text-base">
              Preferensi Tampilan & Bacaan
            </h3>
          </div>
          <button
            onClick={onOpenSettingsModal}
            className="inline-flex items-center gap-1.5 text-xs text-[#0756C9] font-bold hover:underline cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan Lengkap</span>
          </button>
        </div>

        <div className="space-y-4 pt-2">
          {/* Font Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#061A35]">
                Ukuran Font Teks Arab:
              </label>
              <span className="text-xs text-[#5E6B7C] uppercase font-semibold">
                {settings.arabicFontSize}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(['sm', 'base', 'lg', 'xl', '2xl'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => handleUpdateFontSize(size)}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    settings.arabicFontSize === size
                      ? 'bg-[#0756C9] text-white shadow-xs'
                      : 'bg-[#FDFBF5] text-[#5E6B7C] border border-[#E4E9F0] hover:bg-[#E8F2FF]'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FDFBF5] border border-[#E4E9F0]">
              <div>
                <span className="text-xs font-bold text-[#061A35] block">
                  Terjemahan Indonesia
                </span>
                <span className="text-[11px] text-[#5E6B7C]">
                  Kementerian Agama RI
                </span>
              </div>
              <button
                onClick={handleToggleTranslation}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  settings.showTranslation ? 'bg-[#0756C9]' : 'bg-gray-300'
                }`}
                aria-label="Toggle Terjemahan"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settings.showTranslation ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FDFBF5] border border-[#E4E9F0]">
              <div>
                <span className="text-xs font-bold text-[#061A35] block">
                  Transliterasi Latin
                </span>
                <span className="text-[11px] text-[#5E6B7C]">
                  Panduan pelafalan ayat
                </span>
              </div>
              <button
                onClick={handleToggleTransliteration}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  settings.showTransliteration ? 'bg-[#0756C9]' : 'bg-gray-300'
                }`}
                aria-label="Toggle Transliterasi"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    settings.showTransliteration ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Prayer Audio Quick Test */}
      <section className="p-5 rounded-3xl bg-white border border-[#E4E9F0] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-[#061A35] text-base flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#0756C9]" />
              <span>Pengingat Adzan & Jadwal Salat</span>
            </h3>
            <p className="text-xs text-[#5E6B7C]">
              Status Audio: {prayerConfig.enabled ? 'Aktif' : 'Nonaktif'} • Volume:{' '}
              {Math.round(prayerConfig.volume * 100)}%
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isPrayerAudioPlaying) {
                  stopPrayerAudio();
                } else {
                  playTestAudio('general');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E8F2FF] hover:bg-[#D4E6FF] text-[#0756C9] text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              {isPrayerAudioPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Hentikan Uji Audio</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Uji Suara Adzan</span>
                </>
              )}
            </button>
            <button
              onClick={onOpenSettingsModal}
              className="p-2 rounded-xl text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF] transition cursor-pointer"
              title="Atur Jadwal & Audio"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* PWA & System Information */}
      <section className="p-5 rounded-3xl bg-white border border-[#E4E9F0] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0756C9]" />
            <h3 className="font-extrabold text-[#061A35] text-base">
              Informasi Aplikasi & PWA
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F2FF] text-[#0756C9]">
            v2.5 PWA
          </span>
        </div>

        <div className="text-xs text-[#5E6B7C] space-y-2 pt-1">
          <p>
            <strong className="text-[#061A35]">Status Instalasi:</strong>{' '}
            {isInstalled ? 'Terpasang sebagai PWA di perangkat Anda' : 'Berjalan di peramban web (Tersedia instalasi PWA)'}
          </p>
          <p>
            <strong className="text-[#061A35]">Sumber Data Teks Al-Qur’an:</strong>{' '}
            API Resmi equran.id (Lengkap 114 Surat & Tafsir Kemenag RI).
          </p>
          <p>
            <strong className="text-[#061A35]">Sumber Jadwal Salat:</strong>{' '}
            Kementerian Agama Republik Indonesia (Bimas Islam).
          </p>
        </div>

        {!isInstalled && (
          <div className="pt-2">
            <PWAInstallButton variant="hero" />
          </div>
        )}
      </section>
    </div>
  );
};
