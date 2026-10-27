import React, { useState, useEffect, useRef } from 'react';
import { SurahDetail, Ayat, UserSettings } from '../types/quran';
import { getSurahDetail } from '../services/quranApi';
import {
  saveLastRead,
  saveBookmark,
  removeBookmark,
  isAyahBookmarked,
  incrementDailyProgress,
} from '../storage/persistence';
import { useAudio } from '../context/AudioContext';
import { TafsirModal } from '../components/quran/TafsirModal';
import { NoteModal } from '../components/quran/NoteModal';
import { AutoScrollControls } from '../components/quran/AutoScrollControls';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Bookmark,
  Share2,
  Copy,
  BookOpen,
  Edit3,
  Loader2,
  AlertCircle,
  Check,
  Play,
  Volume2
} from 'lucide-react';

interface ReaderPageProps {
  surahNumber: number;
  initialAyahNumber?: number;
  settings: UserSettings;
  onBack: () => void;
  onNavigateSurah: (surahNumber: number, targetAyah?: number) => void;
  onOpenSettings: () => void;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({
  surahNumber,
  initialAyahNumber,
  settings,
  onBack,
  onNavigateSurah,
}) => {
  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null);
  const [noteAyat, setNoteAyat] = useState<Ayat | null>(null);

  // Active / selected verse
  const [activeAyah, setActiveAyah] = useState<number>(initialAyahNumber || 1);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<number, boolean>>({});

  const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const { playAyah, playFullSurah, playingState } = useAudio();

  // Load surah detail
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getSurahDetail(surahNumber)
      .then(data => {
        if (!isMounted) return;
        setDetail(data);
        setLoading(false);

        // Update bookmark states for this surah
        const bMap: Record<number, boolean> = {};
        data.ayat.forEach(a => {
          bMap[a.nomorAyat] = isAyahBookmarked(surahNumber, a.nomorAyat);
        });
        setBookmarkedMap(bMap);

        // Record last read
        saveLastRead({
          surahNumber: data.nomor,
          surahName: data.namaLatin,
          ayahNumber: initialAyahNumber || 1,
          totalAyah: data.jumlahAyat,
          updatedAt: Date.now(),
        });
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err.message || 'Gagal memuat data ayat Al-Qur’an.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [surahNumber, initialAyahNumber]);

  // Scroll to initial ayah when loaded
  useEffect(() => {
    if (detail && initialAyahNumber && initialAyahNumber > 1) {
      setTimeout(() => {
        const el = ayahRefs.current.get(initialAyahNumber);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 400);
    }
  }, [detail, initialAyahNumber]);

  // Handle Ayah Jump
  const handleJumpToAyah = (targetNum: number) => {
    setActiveAyah(targetNum);
    const el = ayahRefs.current.get(targetNum);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (detail) {
      saveLastRead({
        surahNumber: detail.nomor,
        surahName: detail.namaLatin,
        ayahNumber: targetNum,
        totalAyah: detail.jumlahAyat,
        updatedAt: Date.now(),
      });
      incrementDailyProgress(1);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (ayat: Ayat) => {
    if (!detail) return;
    const isCurrently = bookmarkedMap[ayat.nomorAyat];
    if (isCurrently) {
      removeBookmark(surahNumber, ayat.nomorAyat);
      setBookmarkedMap(prev => ({ ...prev, [ayat.nomorAyat]: false }));
    } else {
      saveBookmark({
        id: `${surahNumber}:${ayat.nomorAyat}`,
        surahNumber,
        surahName: detail.namaLatin,
        ayahNumber: ayat.nomorAyat,
        arabicSnippet: ayat.teksArab,
        translationSnippet: ayat.teksIndonesia,
        createdAt: Date.now(),
      });
      setBookmarkedMap(prev => ({ ...prev, [ayat.nomorAyat]: true }));
    }
  };

  // Copy Ayah
  const handleCopyAyah = (ayat: Ayat) => {
    if (!detail) return;
    const text = `${ayat.teksArab}\n\n"${ayat.teksIndonesia}"\n\n(QS. ${detail.namaLatin}: ${ayat.nomorAyat}) - Maj Qur'an`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(ayat.nomorAyat);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  // Share Ayah
  const handleShareAyah = async (ayat: Ayat) => {
    if (!detail) return;
    const shareData = {
      title: `QS. ${detail.namaLatin}: ${ayat.nomorAyat} - Maj Qur'an`,
      text: `${ayat.teksArab}\n\n"${ayat.teksIndonesia}"\n\n(QS. ${detail.namaLatin}: ${ayat.nomorAyat})`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // user cancelled or share failed
      }
    } else {
      handleCopyAyah(ayat);
    }
  };

  // Play Ayah
  const handlePlayAyah = (ayat: Ayat) => {
    if (!detail) return;
    setActiveAyah(ayat.nomorAyat);
    playAyah({
      surahNumber: detail.nomor,
      surahName: detail.namaLatin,
      ayahNumber: ayat.nomorAyat,
      audioUrls: ayat.audio,
      totalAyah: detail.jumlahAyat,
      onAyahEnd: () => {
        // Auto-advance to next ayah if available
        if (ayat.nomorAyat < detail.jumlahAyat) {
          const nextAyat = detail.ayat.find(a => a.nomorAyat === ayat.nomorAyat + 1);
          if (nextAyat) {
            handlePlayAyah(nextAyat);
            const el = ayahRefs.current.get(nextAyat.nomorAyat);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      },
    });

    saveLastRead({
      surahNumber: detail.nomor,
      surahName: detail.namaLatin,
      ayahNumber: ayat.nomorAyat,
      totalAyah: detail.jumlahAyat,
      updatedAt: Date.now(),
    });
    incrementDailyProgress(1);
  };

  // Font size class mapping
  const arabicFontSizes: Record<UserSettings['arabicFontSize'], string> = {
    sm: 'text-2xl sm:text-3xl',
    base: 'text-3xl sm:text-4xl',
    lg: 'text-4xl sm:text-5xl',
    xl: 'text-5xl sm:text-6xl',
    '2xl': 'text-6xl sm:text-7xl',
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3 text-[#5E6B7C]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0756C9]" />
        <p className="text-sm font-semibold">Memuat Surat Al-Qur’an...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-[#061A35]">Gagal Membuka Surat</h3>
        <p className="text-sm text-[#5E6B7C]">{error || 'Surat tidak ditemukan.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0756C9] text-white text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Surat</span>
        </button>
      </div>
    );
  }

  const isSurahPlaying =
    playingState.mode === 'surah' &&
    playingState.surahNumber === detail.nomor &&
    playingState.isPlaying;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28">
      {/* Top Header & Navigation bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#E4E9F0] shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Daftar Surat</span>
        </button>

        {/* Jump selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="jump-ayah" className="text-xs font-medium text-[#5E6B7C] hidden sm:inline">
            Lompat ke Ayat:
          </label>
          <select
            id="jump-ayah"
            value={activeAyah}
            onChange={e => handleJumpToAyah(parseInt(e.target.value, 10))}
            className="p-1.5 text-xs font-semibold rounded-xl border border-[#E4E9F0] bg-[#FDFBF5] text-[#061A35] cursor-pointer"
          >
            {detail.ayat.map(a => (
              <option key={a.nomorAyat} value={a.nomorAyat}>
                Ayat {a.nomorAyat}
              </option>
            ))}
          </select>
        </div>

        {/* Surah Audio & Tafsir Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              playFullSurah({
                surahNumber: detail.nomor,
                surahName: detail.namaLatin,
                audioFullUrls: detail.audioFull,
                totalAyah: detail.jumlahAyat,
              })
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isSurahPlaying
                ? 'bg-[#0756C9] text-white animate-pulse'
                : 'bg-[#E8F2FF] text-[#0756C9] hover:bg-[#D4E6FF]'
            }`}
            title="Dengarkan Surat Penuh"
          >
            <Headphones className="w-4 h-4" />
            <span className="hidden sm:inline">{isSurahPlaying ? 'Memutar' : 'Murottal'}</span>
          </button>

          <button
            onClick={() => setTafsirAyah(activeAyah || 1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FDFBF5] hover:bg-[#E8F2FF] text-[#061A35] text-xs font-semibold border border-[#E4E9F0] transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#0756C9]" />
            <span className="hidden sm:inline">Tafsir</span>
          </button>
        </div>
      </div>

      {/* Surah Hero Card Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-[#E8F2FF] to-white border border-[#168BFF]/20 p-6 sm:p-8 text-center space-y-4 shadow-xs">
        <div className="inline-block px-3 py-1 rounded-full bg-white text-[#0756C9] font-bold text-xs shadow-xs border border-[#E4E9F0]">
          Surat ke-{detail.nomor} • {detail.tempatTurun} • {detail.jumlahAyat} Ayat
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#061A35] tracking-tight">
            {detail.namaLatin}
          </h1>
          <p className="text-sm font-semibold text-[#0756C9] mt-1">
            "{detail.arti}"
          </p>
        </div>

        {/* Bismillah Header (Except At-Taubah #9) */}
        {detail.nomor !== 9 && (
          <div className="pt-2">
            <p className="font-arabic text-3xl sm:text-4xl text-[#061A35] font-bold">
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
          </div>
        )}
      </div>

      {/* Verses Container */}
      <div className="space-y-4">
        {detail.ayat.map(ayat => {
          const isSelected = activeAyah === ayat.nomorAyat;
          const isPlayingThisAyah =
            playingState.mode === 'ayah' &&
            playingState.surahNumber === detail.nomor &&
            playingState.ayahNumber === ayat.nomorAyat &&
            playingState.isPlaying;
          const isSaved = bookmarkedMap[ayat.nomorAyat];

          return (
            <div
              key={ayat.nomorAyat}
              ref={el => {
                if (el) ayahRefs.current.set(ayat.nomorAyat, el);
                else ayahRefs.current.delete(ayat.nomorAyat);
              }}
              onClick={() => {
                setActiveAyah(ayat.nomorAyat);
                saveLastRead({
                  surahNumber: detail.nomor,
                  surahName: detail.namaLatin,
                  ayahNumber: ayat.nomorAyat,
                  totalAyah: detail.jumlahAyat,
                  updatedAt: Date.now(),
                });
              }}
              className={`p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-200 cursor-default ${
                isPlayingThisAyah
                  ? 'border-[#0756C9] ring-2 ring-[#0756C9]/20 shadow-md bg-blue-50/20'
                  : isSelected
                  ? 'border-[#168BFF] shadow-xs'
                  : 'border-[#E4E9F0] hover:border-gray-300'
              }`}
            >
              {/* Verse action header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E9F0]/80">
                {/* Verse badge */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center transition ${
                      isPlayingThisAyah
                        ? 'bg-[#0756C9] text-white shadow-xs'
                        : isSelected
                        ? 'bg-[#E8F2FF] text-[#0756C9] font-bold'
                        : 'bg-[#FDFBF5] text-[#5E6B7C] border border-[#E4E9F0]'
                    }`}
                  >
                    {detail.nomor}:{ayat.nomorAyat}
                  </div>
                  {isPlayingThisAyah && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#0756C9] animate-pulse">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Sedang Tilawah</span>
                    </span>
                  )}
                </div>

                {/* Ayat buttons: Play, Bookmark, Note, Copy, Share, Tafsir */}
                <div className="flex items-center gap-1 text-[#5E6B7C]">
                  {/* Play Ayah Audio */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handlePlayAyah(ayat);
                    }}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      isPlayingThisAyah
                        ? 'bg-[#0756C9] text-white'
                        : 'hover:bg-[#E8F2FF] hover:text-[#0756C9]'
                    }`}
                    title="Putar Audio Ayat Ini"
                  >
                    <Play className="w-4 h-4 ml-0.5" />
                  </button>

                  {/* Bookmark Toggle */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleBookmark(ayat);
                    }}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      isSaved
                        ? 'text-[#0756C9] bg-[#E8F2FF]'
                        : 'hover:bg-[#E8F2FF] hover:text-[#061A35]'
                    }`}
                    title={isSaved ? 'Hapus dari Tersimpan' : 'Simpan Ayat'}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isSaved ? 'fill-[#0756C9]' : ''}`}
                    />
                  </button>

                  {/* Personal Note */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setNoteAyat(ayat);
                    }}
                    className="p-2 rounded-xl hover:bg-[#E8F2FF] hover:text-[#061A35] transition cursor-pointer"
                    title="Tambah / Baca Catatan Pribadi"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Tafsir Per Ayat */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setTafsirAyah(ayat.nomorAyat);
                    }}
                    className="p-2 rounded-xl hover:bg-[#E8F2FF] hover:text-[#0756C9] transition cursor-pointer"
                    title="Tafsir Kemenag RI Ayat Ini"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>

                  {/* Copy Ayah */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleCopyAyah(ayat);
                    }}
                    className="p-2 rounded-xl hover:bg-[#E8F2FF] hover:text-[#061A35] transition cursor-pointer"
                    title="Salin Teks Arab & Terjemahan"
                  >
                    {copiedAyah === ayat.nomorAyat ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Share Ayah */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleShareAyah(ayat);
                    }}
                    className="p-2 rounded-xl hover:bg-[#E8F2FF] hover:text-[#061A35] transition cursor-pointer"
                    title="Bagikan Ayat"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Arabic Verse Text */}
              <div className="py-6 sm:py-8">
                <p
                  className={`font-arabic text-[#061A35] ${
                    arabicFontSizes[settings.arabicFontSize] || 'text-4xl'
                  }`}
                >
                  {ayat.teksArab}
                </p>
              </div>

              {/* Transliteration (if enabled) */}
              {settings.showTransliteration && ayat.teksLatin && (
                <div className="pt-2 text-xs sm:text-sm text-[#0756C9] font-medium leading-relaxed italic">
                  {ayat.teksLatin}
                </div>
              )}

              {/* Translation (if enabled) */}
              {settings.showTranslation && (
                <div className="pt-2 text-xs sm:text-sm text-[#5E6B7C] leading-relaxed border-t border-[#E4E9F0]/50 mt-3">
                  {ayat.teksIndonesia}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Surah Navigation Footer: Previous & Next Surah */}
      <div className="flex items-center justify-between gap-3 pt-6 border-t border-[#E4E9F0]">
        {typeof detail.suratSebelumnya === 'object' && detail.suratSebelumnya ? (
          <button
            onClick={() => {
              if (typeof detail.suratSebelumnya === 'object' && detail.suratSebelumnya) {
                onNavigateSurah(detail.suratSebelumnya.nomor);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E4E9F0] hover:border-[#0756C9] hover:bg-[#E8F2FF] text-[#061A35] text-xs font-bold transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#0756C9]" />
            <div className="text-left">
              <span className="text-[10px] text-[#5E6B7C] block font-normal">Surat Sebelumnya</span>
              <span>{detail.suratSebelumnya.namaLatin}</span>
            </div>
          </button>
        ) : (
          <div />
        )}

        {typeof detail.suratSelanjutnya === 'object' && detail.suratSelanjutnya ? (
          <button
            onClick={() => {
              if (typeof detail.suratSelanjutnya === 'object' && detail.suratSelanjutnya) {
                onNavigateSurah(detail.suratSelanjutnya.nomor);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E4E9F0] hover:border-[#0756C9] hover:bg-[#E8F2FF] text-[#061A35] text-xs font-bold transition cursor-pointer"
          >
            <div className="text-right">
              <span className="text-[10px] text-[#5E6B7C] block font-normal">Surat Berikutnya</span>
              <span>{detail.suratSelanjutnya.namaLatin}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#0756C9]" />
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Auto-Scroll Floating Controls */}
      <AutoScrollControls initialSpeed={settings.autoScrollSpeed} />

      {/* Tafsir Modal */}
      <TafsirModal
        isOpen={tafsirAyah !== null}
        onClose={() => setTafsirAyah(null)}
        surahNumber={detail.nomor}
        surahName={detail.namaLatin}
        targetAyahNumber={tafsirAyah || 1}
      />

      {/* Note Modal */}
      {noteAyat && (
        <NoteModal
          isOpen={true}
          onClose={() => setNoteAyat(null)}
          surahNumber={detail.nomor}
          surahName={detail.namaLatin}
          ayat={noteAyat}
          onSaved={() => {
            setBookmarkedMap(prev => ({ ...prev, [noteAyat.nomorAyat]: true }));
          }}
        />
      )}
    </div>
  );
};
