import React, { useState, useEffect, useMemo } from 'react';
import { SurahListItem } from '../types/quran';
import { getSurahList } from '../services/quranApi';
import { Search, Loader2, AlertCircle, Headphones, BookOpen } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface SurahListPageProps {
  onOpenSurah: (surahNumber: number) => void;
}

export const SurahListPage: React.FC<SurahListPageProps> = ({ onOpenSurah }) => {
  const [surahs, setSurahs] = useState<SurahListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'makkiyyah' | 'madaniyyah' | 'juz30'>('all');

  const { playFullSurah, playingState } = useAudio();

  useEffect(() => {
    let isMounted = true;
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

  const filteredSurahs = useMemo(() => {
    let list = surahs;

    if (filterTab === 'makkiyyah') {
      list = list.filter(s => s.tempatTurun.toLowerCase() === 'mekah');
    } else if (filterTab === 'madaniyyah') {
      list = list.filter(s => s.tempatTurun.toLowerCase() === 'madinah');
    } else if (filterTab === 'juz30') {
      list = list.filter(s => s.nomor >= 78);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        s =>
          s.namaLatin.toLowerCase().includes(q) ||
          s.arti.toLowerCase().includes(q) ||
          s.nama.includes(q) ||
          s.nomor.toString() === q
      );
    }

    return list;
  }, [surahs, filterTab, searchQuery]);

  return (
    <div className="space-y-6 pb-20">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#061A35] tracking-tight">
            114 Surat Al-Qur'an
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6B7C]">
            Kitab suci Al-Qur'an lengkap dari Al-Fatihah sampai An-Nas
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#5E6B7C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama, nomor, arti..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E4E9F0] bg-white text-sm text-[#061A35] placeholder:text-[#5E6B7C] focus:outline-hidden focus:ring-2 focus:ring-[#168BFF]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filterTab === 'all'
              ? 'bg-[#0756C9] text-white shadow-xs'
              : 'bg-white border border-[#E4E9F0] text-[#5E6B7C] hover:text-[#061A35]'
          }`}
        >
          Semua (114)
        </button>
        <button
          onClick={() => setFilterTab('makkiyyah')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filterTab === 'makkiyyah'
              ? 'bg-[#0756C9] text-white shadow-xs'
              : 'bg-white border border-[#E4E9F0] text-[#5E6B7C] hover:text-[#061A35]'
          }`}
        >
          Makkiyyah
        </button>
        <button
          onClick={() => setFilterTab('madaniyyah')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filterTab === 'madaniyyah'
              ? 'bg-[#0756C9] text-white shadow-xs'
              : 'bg-white border border-[#E4E9F0] text-[#5E6B7C] hover:text-[#061A35]'
          }`}
        >
          Madaniyyah
        </button>
        <button
          onClick={() => setFilterTab('juz30')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filterTab === 'juz30'
              ? 'bg-[#0756C9] text-white shadow-xs'
              : 'bg-white border border-[#E4E9F0] text-[#5E6B7C] hover:text-[#061A35]'
          }`}
        >
          Juz 'Amma (37 Surat)
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#5E6B7C]">
          <Loader2 className="w-9 h-9 animate-spin text-[#0756C9]" />
          <p className="text-sm font-medium">Memuat 114 surat Al-Qur'an...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-white border border-red-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="font-bold text-[#061A35]">Gagal Memuat Surat</h3>
          <p className="text-xs text-[#5E6B7C] max-w-md mx-auto">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-[#0756C9] text-white text-xs font-bold cursor-pointer"
          >
            Muat Ulang
          </button>
        </div>
      ) : filteredSurahs.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-white rounded-2xl border border-[#E4E9F0] p-6">
          <p className="text-sm font-semibold text-[#061A35]">Surat tidak ditemukan</p>
          <p className="text-xs text-[#5E6B7C]">
            Tidak ada surat yang sesuai dengan kata kunci "{searchQuery}".
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-[#0756C9] hover:underline pt-2"
          >
            Hapus filter pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSurahs.map(s => {
            const isPlayingThisSurah =
              playingState.mode === 'surah' &&
              playingState.surahNumber === s.nomor &&
              playingState.isPlaying;

            return (
              <div
                key={s.nomor}
                className="group relative p-4 rounded-2xl bg-white border border-[#E4E9F0] hover:border-[#0756C9] hover:shadow-md transition flex flex-col justify-between"
              >
                <div
                  onClick={() => onOpenSurah(s.nomor)}
                  className="flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Number Badge */}
                    <div className="w-10 h-10 rounded-xl bg-[#E8F2FF] text-[#0756C9] font-extrabold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#0756C9] group-hover:text-white transition">
                      {s.nomor}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#061A35] group-hover:text-[#0756C9] transition truncate">
                        {s.namaLatin}
                      </h3>
                      <p className="text-[11px] text-[#5E6B7C] truncate">
                        {s.arti}
                      </p>
                    </div>
                  </div>

                  {/* Arabic Name */}
                  <div className="text-right shrink-0">
                    <span className="font-arabic text-xl font-bold text-[#061A35] block leading-none mb-1">
                      {s.nama}
                    </span>
                    <span className="text-[10px] font-semibold text-[#0756C9] uppercase">
                      {s.tempatTurun}
                    </span>
                  </div>
                </div>

                {/* Bottom details & quick actions */}
                <div className="mt-4 pt-3 border-t border-[#E4E9F0] flex items-center justify-between text-xs">
                  <span className="text-[#5E6B7C] font-medium text-[11px]">
                    {s.jumlahAyat} Ayat
                  </span>

                  <div className="flex items-center gap-1.5">
                    {s.audioFull && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          playFullSurah({
                            surahNumber: s.nomor,
                            surahName: s.namaLatin,
                            audioFullUrls: s.audioFull!,
                            totalAyah: s.jumlahAyat,
                          });
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isPlayingThisSurah
                            ? 'bg-[#0756C9] text-white animate-pulse'
                            : 'bg-[#E8F2FF] text-[#0756C9] hover:bg-[#D4E6FF]'
                        }`}
                        title="Dengarkan Murottal Penuh"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenSurah(s.nomor)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#FDFBF5] hover:bg-[#E8F2FF] text-[#0756C9] font-bold text-xs border border-[#E4E9F0] transition cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Baca</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
