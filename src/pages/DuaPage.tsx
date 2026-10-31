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
    <div className="w-full mx-auto space-y-6 pb-28">
      {/* Header bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-[#AABBD0] hover:text-white hover:bg-[#082245] border border-transparent hover:border-[#29415E] transition cursor-pointer"
            title="Kembali ke Beranda"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Doa Harian & Kumpulan Doa
            </h1>
            <p className="text-xs sm:text-sm text-[#AABBD0]">
              Doa ma’tsur sahih bersumber dari Al-Qur’an dan As-Sunnah
            </p>
          </div>
        </div>

        {/* Favorite filter toggle */}
        <button
          onClick={() => setOnlyFavorites(prev => !prev)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
            onlyFavorites
              ? 'bg-[#168BFF] text-white border-[#168BFF] shadow-md'
              : 'bg-[#082245] border-[#29415E] text-[#AABBD0] hover:text-white hover:border-[#168BFF]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-white' : 'text-[#168BFF]'}`} />
          <span>Favorit Saya ({favoriteIds.length})</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#7E95B1] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari nama doa, arti, konteks (misal: 'tidur', 'orang tua', 'kesulitan')..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#29415E] bg-[#082245] text-sm text-white placeholder:text-[#7E95B1] focus:outline-hidden focus:ring-2 focus:ring-[#168BFF] shadow-md"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7E95B1] hover:text-white cursor-pointer"
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
                    ? 'bg-[#168BFF] text-white border-[#168BFF] shadow-md'
                    : 'bg-[#082245] border-[#29415E] text-[#AABBD0] hover:text-white hover:border-[#168BFF]/50'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#AABBD0] font-semibold px-1">
        <span>Menampilkan {filteredDuas.length} doa</span>
        {onlyFavorites && (
          <button
            onClick={() => setOnlyFavorites(false)}
            className="text-[#168BFF] hover:underline cursor-pointer"
          >
            Tampilkan Semua Kategori
          </button>
        )}
      </div>

      {/* Duas List */}
      {filteredDuas.length === 0 ? (
        <div className="p-12 text-center bg-[#061A35] rounded-3xl border border-[#29415E] space-y-3">
          <BookOpen className="w-10 h-10 text-[#7E95B1] mx-auto" />
          <h3 className="font-bold text-white text-base">Tidak Ada Doa Ditemukan</h3>
          <p className="text-xs text-[#AABBD0] max-w-sm mx-auto">
            {onlyFavorites
              ? 'Anda belum menandai doa favorit. Tekan ikon hati pada kartu doa untuk menyimpannya di sini.'
              : `Tidak ada doa yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci umum seperti 'makan', 'tidur', atau 'sakit'.`}
          </p>
          {onlyFavorites && (
            <button
              onClick={() => setOnlyFavorites(false)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#168BFF] text-white text-xs font-bold cursor-pointer hover:bg-[#168BFF]/90 transition"
            >
              Jelajahi Semua Doa
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {filteredDuas.map(dua => {
            const isFavorite = favoriteIds.includes(dua.id);
            const isCopied = copiedId === dua.id;

            return (
              <div
                key={dua.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#061A35] border border-[#29415E] hover:border-[#168BFF] hover:shadow-xl transition space-y-4 group flex flex-col justify-between"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#29415E]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#082245] text-[#168BFF] border border-[#168BFF]/30">
                        {dua.categoryName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dua.sourceType === 'quran'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-[#082245] text-[#168BFF] border border-[#29415E]'
                        }`}
                      >
                        {dua.sourceType === 'quran' ? 'Al-Qur’an' : 'Hadits Sahih'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#168BFF] transition">
                      {dua.title}
                    </h3>

                    {dua.context && (
                      <p className="text-xs text-[#AABBD0] mt-0.5 italic">
                        {dua.context}
                      </p>
                    )}
                  </div>

                  {/* Actions: Favorite, Copy, Share */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleFavorite(dua.id)}
                      className={`p-2 rounded-xl transition cursor-pointer border ${
                        isFavorite
                          ? 'bg-red-950/60 text-red-400 border-red-800'
                          : 'text-[#AABBD0] hover:bg-[#082245] hover:text-white border-transparent'
                      }`}
                      title={isFavorite ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleCopy(dua)}
                      className="p-2 rounded-xl text-[#AABBD0] hover:bg-[#082245] hover:text-white transition cursor-pointer"
                      title="Salin Teks Doa"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleShare(dua)}
                      className="p-2 rounded-xl text-[#AABBD0] hover:bg-[#082245] hover:text-white transition cursor-pointer"
                      title="Bagikan Doa"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="py-2 text-right">
                  <p className="font-arabic text-2xl sm:text-3xl text-white leading-loose">
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <div className="text-xs sm:text-sm text-[#168BFF] font-medium italic leading-relaxed">
                  {dua.latin}
                </div>

                {/* Translation */}
                <div className="text-xs sm:text-sm text-[#E2EDF8] leading-relaxed pt-2 border-t border-[#29415E]">
                  <span className="font-semibold block text-[11px] text-[#AABBD0] uppercase tracking-wider mb-0.5">
                    Artinya:
                  </span>
                  "{dua.translation}"
                </div>

                {/* Reference footer */}
                <div className="pt-2 text-[11px] text-[#AABBD0] flex items-center justify-between">
                  <span className="font-medium bg-[#082245] px-2.5 py-1 rounded-lg border border-[#29415E]">
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
