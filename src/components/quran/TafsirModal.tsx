import React, { useEffect, useState } from 'react';
import { X, BookMarked, Loader2, AlertCircle } from 'lucide-react';
import { getSurahTafsir } from '../../services/quranApi';
import { TafsirItem } from '../../types/quran';

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  targetAyahNumber?: number;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  targetAyahNumber,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tafsirList, setTafsirList] = useState<TafsirItem[]>([]);
  const [selectedAyah, setSelectedAyah] = useState<number>(targetAyahNumber || 1);

  useEffect(() => {
    if (!isOpen || !surahNumber) return;

    if (targetAyahNumber) {
      setSelectedAyah(targetAyahNumber);
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getSurahTafsir(surahNumber)
      .then(data => {
        if (!isMounted) return;
        if (data && data.tafsir && data.tafsir.length > 0) {
          setTafsirList(data.tafsir);
        } else {
          setError('Tafsir untuk surat ini belum tersedia dari server resmi.');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err.message || 'Gagal memuat tafsir dari server.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, surahNumber, targetAyahNumber]);

  if (!isOpen) return null;

  const currentTafsir = tafsirList.find(t => t.ayat === selectedAyah);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#E4E9F0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E9F0] bg-[#FDFBF5]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E8F2FF] text-[#0756C9]">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#061A35] text-base">
                Tafsir QS. {surahName}
              </h3>
              <p className="text-[11px] text-[#5E6B7C]">
                Sumber: Tafsir Ringkas Kementerian Agama RI (Kemenag)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#E8F2FF] text-[#5E6B7C] hover:text-[#061A35] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ayah selector pills */}
        {tafsirList.length > 0 && (
          <div className="px-5 py-2.5 border-b border-[#E4E9F0] bg-[#FDFBF5]/50 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-[#5E6B7C] shrink-0">Pilih Ayat:</span>
            {tafsirList.map(t => (
              <button
                key={t.ayat}
                onClick={() => setSelectedAyah(t.ayat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                  selectedAyah === t.ayat
                    ? 'bg-[#0756C9] text-white shadow-xs'
                    : 'bg-white border border-[#E4E9F0] text-[#061A35] hover:bg-[#E8F2FF]'
                }`}
              >
                Ayat {t.ayat}
              </button>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-[#061A35]">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#5E6B7C]">
              <Loader2 className="w-8 h-8 animate-spin text-[#0756C9]" />
              <p className="text-sm">Memuat tafsir Kemenag RI...</p>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-[#5E6B7C]">
              <AlertCircle className="w-10 h-10 text-amber-500" />
              <p className="text-sm font-semibold text-[#061A35]">{error}</p>
              <p className="text-xs max-w-sm">
                Pastikan perangkat Anda terhubung ke internet untuk mengunduh data tafsir.
              </p>
            </div>
          ) : currentTafsir ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F2FF] text-[#0756C9] text-xs font-bold">
                Ayat {selectedAyah}
              </div>
              <div className="prose prose-sm max-w-none text-sm text-[#061A35] leading-relaxed whitespace-pre-line">
                {currentTafsir.teks}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#5E6B7C] text-center py-10">
              Pilih ayat di atas untuk membaca tafsir.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E4E9F0] bg-[#FDFBF5] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white text-xs font-semibold transition cursor-pointer"
          >
            Tutup Tafsir
          </button>
        </div>
      </div>
    </div>
  );
};
