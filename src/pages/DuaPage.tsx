import React, { useState, useMemo, useEffect } from 'react';
import { DUA_ITEMS, DUA_CATEGORIES } from '../data/duaData';
import { DuaItem } from '../types/dua';
import {
  getFavoriteDuaIds,
  toggleFavoriteDua,
} from '../storage/persistence';
import {
  Search,
  Bookmark,
  Share2,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Heart,
  SlidersHorizontal,
} from 'lucide-react';

interface DuaPageProps {
  onBack: () => void;
}

export const DuaPage: React.FC<DuaPageProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setFavoriteIds(getFavoriteDuaIds());
  }, []);

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteDua(id);
    setFavoriteIds(updated);
  };

  const handleCopy = (dua: DuaItem) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\n"${dua.translation}"\n\n(Rujukan: ${dua.reference}) — Maj Qur'an`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (dua: DuaItem) => {
    const shareData = {
      title: `${dua.title} — Maj Qur'an`,
      text: `${dua.title}\n\n${dua.arabic}\n\n"${dua.translation}"\n\n(Rujukan: ${dua.reference})`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // user dismissed
      }
    } else {
      handleCopy(dua);
    }
  };

  // Filter logic
  const filteredDuas = useMemo(() => {
    let list = DUA_ITEMS;

    if (onlyFavorites) {
      list = list.filter(d => favoriteIds.includes(d.id));
    } else if (selectedCategory !== 'semua') {
      list = list.filter(d => d.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        d =>
          d.title.toLowerCase().includes(q) ||
          d.translation.toLowerCase().includes(q) ||
          d.latin.toLowerCase().includes(q) ||
          (d.context && d.context.toLowerCase().includes(q)) ||
          d.reference.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, searchQuery, onlyFavorites, favoriteIds]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28">
      {/* Header bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF] transition cursor-pointer"
            title="Kembali ke Beranda"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-[#061A35] tracking-tight">
              Doa Harian & Kumpulan Doa
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6B7C]">
              Doa ma’tsur sahih bersumber dari Al-Qur’an dan As-Sunnah
            </p>
          </div>
        </div>

        {/* Favorite filter toggle */}
        <button
          onClick={() => setOnlyFavorites(prev => !prev)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
            onlyFavorites
              ? 'bg-[#0756C9] text-white border-[#0756C9] shadow-xs'
              : 'bg-white border-[#E4E9F0] text-[#061A35] hover:bg-[#E8F2FF]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : 'text-[#0756C9]'}`} />
          <span>Favorit Saya ({favoriteIds.length})</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#5E6B7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari nama doa, arti, konteks (misal: 'tidur', 'orang tua', 'kesulitan')..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E4E9F0] bg-white text-sm text-[#061A35] placeholder:text-[#5E6B7C] focus:outline-hidden focus:ring-2 focus:ring-[#168BFF] shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#5E6B7C] hover:text-[#061A35]"
          >
            Hapus
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroll */}
      {!onlyFavorites && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {DUA_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0756C9] text-white border-[#0756C9] shadow-xs'
                    : 'bg-white border-[#E4E9F0] text-[#5E6B7C] hover:text-[#061A35] hover:border-gray-300'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#5E6B7C] font-semibold px-1">
        <span>Menampilkan {filteredDuas.length} doa</span>
        {onlyFavorites && (
          <button
            onClick={() => setOnlyFavorites(false)}
            className="text-[#0756C9] hover:underline"
          >
            Tampilkan Semua Kategori
          </button>
        )}
      </div>

      {/* Duas List */}
      {filteredDuas.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E4E9F0] space-y-3">
          <BookOpen className="w-10 h-10 text-[#5E6B7C]/40 mx-auto" />
          <h3 className="font-bold text-[#061A35] text-base">Tidak Ada Doa Ditemukan</h3>
          <p className="text-xs text-[#5E6B7C] max-w-sm mx-auto">
            {onlyFavorites
              ? 'Anda belum menandai doa favorit. Tekan ikon hati pada kartu doa untuk menyimpannya di sini.'
              : `Tidak ada doa yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci umum seperti 'makan', 'tidur', atau 'sakit'.`}
          </p>
          {onlyFavorites && (
            <button
              onClick={() => setOnlyFavorites(false)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#0756C9] text-white text-xs font-bold cursor-pointer"
            >
              Jelajahi Semua Doa
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDuas.map(dua => {
            const isFavorite = favoriteIds.includes(dua.id);
            const isCopied = copiedId === dua.id;

            return (
              <div
                key={dua.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E4E9F0] hover:border-[#0756C9]/40 hover:shadow-md transition space-y-4 group"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E4E9F0]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F2FF] text-[#0756C9] border border-[#168BFF]/20">
                        {dua.categoryName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dua.sourceType === 'quran'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {dua.sourceType === 'quran' ? 'Al-Qur’an' : 'Hadits Sahih'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#061A35] group-hover:text-[#0756C9] transition">
                      {dua.title}
                    </h3>

                    {dua.context && (
                      <p className="text-xs text-[#5E6B7C] mt-0.5 italic">
                        {dua.context}
                      </p>
                    )}
                  </div>

                  {/* Actions: Favorite, Copy, Share */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleFavorite(dua.id)}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        isFavorite
                          ? 'bg-red-50 text-red-600'
                          : 'text-[#5E6B7C] hover:bg-[#E8F2FF] hover:text-[#061A35]'
                      }`}
                      title={isFavorite ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleCopy(dua)}
                      className="p-2 rounded-xl text-[#5E6B7C] hover:bg-[#E8F2FF] hover:text-[#061A35] transition cursor-pointer"
                      title="Salin Teks Doa"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleShare(dua)}
                      className="p-2 rounded-xl text-[#5E6B7C] hover:bg-[#E8F2FF] hover:text-[#061A35] transition cursor-pointer"
                      title="Bagikan Doa"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="py-2 text-right">
                  <p className="font-arabic text-2xl sm:text-3xl text-[#061A35] leading-loose">
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <div className="text-xs sm:text-sm text-[#0756C9] font-medium italic leading-relaxed">
                  {dua.latin}
                </div>

                {/* Translation */}
                <div className="text-xs sm:text-sm text-[#061A35] leading-relaxed pt-2 border-t border-[#E4E9F0]/60">
                  <span className="font-semibold block text-[11px] text-[#5E6B7C] uppercase tracking-wider mb-0.5">
                    Artinya:
                  </span>
                  "{dua.translation}"
                </div>

                {/* Reference footer */}
                <div className="pt-2 text-[11px] text-[#5E6B7C] flex items-center justify-between">
                  <span className="font-medium bg-[#FDFBF5] px-2.5 py-1 rounded-lg border border-[#E4E9F0]">
                    Rujukan: {dua.reference}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
