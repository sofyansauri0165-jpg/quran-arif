import React, { useState, useEffect } from 'react';
import { Search, Loader2, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { searchQuran } from '../services/quranApi';
import { SearchResult } from '../types/quran';

interface SearchPageProps {
  onOpenSurah: (surahNumber: number, targetAyah?: number) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onOpenSurah }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute search
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setHasSearched(true);

    searchQuran(debouncedQuery)
      .then(res => {
        if (isMounted) {
          setResults(res);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.warn('Search error:', err);
          setResults([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const quickSuggestions = [
    'Al-Fatihah',
    'Yasin',
    'Al-Kahf',
    'Al-Mulk',
    '2:255',
    'Sabar',
    'Syukur',
    'Salat',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-extrabold text-[#061A35] tracking-tight">
          Pencarian Al-Qur'an
        </h1>
        <p className="text-xs sm:text-sm text-[#5E6B7C]">
          Cari surat, ayat langsung (contoh: 2:255), atau kata kunci dalam terjemahan resmi Kemenag RI.
        </p>
      </div>

      {/* Input bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-[#5E6B7C] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ketik nama surat, nomor (misal '36:1'), atau kata kunci..."
          autoFocus
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#E4E9F0] bg-white text-[#061A35] shadow-xs text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-[#168BFF]"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5E6B7C] hover:text-[#061A35]"
          >
            Bersihkan
          </button>
        )}
      </div>

      {/* Quick keywords suggestions */}
      {!hasSearched && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#5E6B7C] uppercase tracking-wider block">
            Pencarian Populer:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map(item => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E4E9F0] hover:border-[#0756C9] hover:bg-[#E8F2FF] text-[#061A35] text-xs font-semibold transition cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results view */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#5E6B7C]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0756C9]" />
          <p className="text-xs font-medium">Mencari di indeks Al-Qur'an...</p>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-white rounded-2xl border border-[#E4E9F0] p-6">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-bold text-[#061A35] text-sm">Tidak Ada Hasil Ditemukan</h3>
          <p className="text-xs text-[#5E6B7C] max-w-sm mx-auto">
            Tidak ditemukan surat atau ayat yang cocok dengan kata kunci "{debouncedQuery}". Coba gunakan variasi kata atau cari nomor surat (misal: "36" atau "2:255").
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5E6B7C]">
            <span>Ditemukan {results.length} hasil untuk "{debouncedQuery}"</span>
          </div>

          <div className="space-y-3">
            {results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onOpenSurah(item.surahNumber, item.ayahNumber)}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4E9F0] hover:border-[#0756C9] hover:shadow-md transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#E8F2FF] text-[#0756C9] font-bold text-xs flex items-center justify-center group-hover:bg-[#0756C9] group-hover:text-white transition">
                      {item.surahNumber}
                    </span>
                    <span className="font-bold text-sm text-[#061A35] group-hover:text-[#0756C9]">
                      QS. {item.surahLatin}
                    </span>
                    {item.ayahNumber && (
                      <span className="text-xs font-semibold text-[#0756C9] bg-[#E8F2FF] px-2 py-0.5 rounded-md">
                        Ayat {item.ayahNumber}
                      </span>
                    )}
                  </div>

                  <span className="font-arabic text-lg text-[#061A35]">
                    {item.surahName}
                  </span>
                </div>

                {item.arabicText && (
                  <p className="font-arabic text-xl text-[#061A35] text-right py-2 leading-loose">
                    {item.arabicText}
                  </p>
                )}

                {item.translation && (
                  <p className="text-xs sm:text-sm text-[#5E6B7C] leading-relaxed">
                    {item.translation}
                  </p>
                )}

                <div className="pt-2 flex justify-end">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0756C9] group-hover:underline">
                    <span>Buka Ayat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
