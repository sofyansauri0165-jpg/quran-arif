import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Edit3 } from 'lucide-react';
import { getAyahBookmark, saveBookmark, removeBookmark } from '../../storage/persistence';
import { Ayat } from '../../types/quran';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  ayat: Ayat;
  onSaved?: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  ayat,
  onSaved,
}) => {
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const existing = getAyahBookmark(surahNumber, ayat.nomorAyat);
    setNoteText(existing?.note || '');
  }, [isOpen, surahNumber, ayat]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveBookmark({
      id: `${surahNumber}:${ayat.nomorAyat}`,
      surahNumber,
      surahName,
      ayahNumber: ayat.nomorAyat,
      arabicSnippet: ayat.teksArab,
      translationSnippet: ayat.teksIndonesia,
      createdAt: Date.now(),
      note: noteText.trim() || undefined,
    });
    if (onSaved) onSaved();
    onClose();
  };

  const handleDelete = () => {
    const existing = getAyahBookmark(surahNumber, ayat.nomorAyat);
    if (existing) {
      if (existing.note && !confirm('Hapus catatan untuk ayat ini?')) return;
      saveBookmark({
        ...existing,
        note: undefined,
      });
    }
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E4E9F0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E9F0] bg-[#FDFBF5]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#E8F2FF] text-[#0756C9]">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#061A35] text-sm">
                Catatan Pribadi: QS. {surahName} : {ayat.nomorAyat}
              </h3>
              <p className="text-[11px] text-[#5E6B7C]">
                Tersimpan aman di penyimpanan lokal perangkat Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#E8F2FF] text-[#5E6B7C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ayah Reference Box */}
        <div className="p-4 bg-[#FDFBF5]/60 border-b border-[#E4E9F0] text-xs space-y-1">
          <p className="font-arabic text-sm text-[#061A35] truncate line-clamp-1">
            {ayat.teksArab}
          </p>
          <p className="text-[#5E6B7C] italic line-clamp-2">
            "{ayat.teksIndonesia}"
          </p>
        </div>

        {/* Note input */}
        <div className="p-5">
          <label className="block text-xs font-semibold text-[#061A35] mb-2">
            Tulis Refleksi atau Catatan Tilawah:
          </label>
          <textarea
            rows={5}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Tuliskan pelajaran, tadabbur, doa, atau pengingat untuk ayat ini..."
            className="w-full p-3 rounded-xl border border-[#E4E9F0] focus:outline-hidden focus:ring-2 focus:ring-[#168BFF] text-sm text-[#061A35] bg-[#FDFBF5]/30 resize-none"
          />
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-[#E4E9F0] bg-[#FDFBF5] flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[#E4E9F0] text-xs font-medium text-[#5E6B7C] hover:bg-gray-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
