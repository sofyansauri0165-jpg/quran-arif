import React, { useState, useEffect } from 'react';
import { Bookmark, LastRead } from '../types/quran';
import {
  getBookmarks,
  removeBookmark,
  getHistory,
  clearHistory,
} from '../storage/persistence';
import {
  Bookmark as BookmarkIcon,
  Trash2,
  BookOpen,
  History,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface BookmarksPageProps {
  onOpenSurah: (surahNumber: number, targetAyah?: number) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ onOpenSurah }) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes' | 'history'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<LastRead[]>([]);

  const reloadData = () => {
    setBookmarks(getBookmarks());
    setHistory(getHistory());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleDeleteBookmark = (surahNumber: number, ayahNumber: number) => {
    removeBookmark(surahNumber, ayahNumber);
    reloadData();
  };

  const handleClearHistory = () => {
    if (confirm('Bersihkan semua riwayat bacaan Al-Qur’an?')) {
      clearHistory();
      reloadData();
    }
  };

  const notesList = bookmarks.filter(b => b.note && b.note.trim().length > 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#061A35] tracking-tight">
          Tersimpan & Catatan
        </h1>
        <p className="text-xs sm:text-sm text-[#5E6B7C]">
          Kelola ayat favorit, tadabbur pribadi, dan riwayat tilawah Anda
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#E4E9F0]">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'bg-[#0756C9] text-white shadow-xs'
              : 'text-[#5E6B7C] hover:text-[#061A35]'
          }`}
        >
          <BookmarkIcon className="w-3.5 h-3.5" />
          <span>Ayat Tersimpan ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-[#0756C9] text-white shadow-xs'
              : 'text-[#5E6B7C] hover:text-[#061A35]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Catatan ({notesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#0756C9] text-white shadow-xs'
              : 'text-[#5E6B7C] hover:text-[#061A35]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Riwayat ({history.length})</span>
        </button>
      </div>

      {/* Tab 1: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-[#E4E9F0] p-6">
              <BookmarkIcon className="w-10 h-10 text-[#5E6B7C]/40 mx-auto" />
              <h3 className="text-base font-bold text-[#061A35]">Belum Ada Ayat Tersimpan</h3>
              <p className="text-xs text-[#5E6B7C] max-w-sm mx-auto">
                Tandai ayat favorit saat membaca Al-Qur’an dengan menekan tombol bookmark pada ayat.
              </p>
            </div>
          ) : (
            bookmarks.map(b => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-white border border-[#E4E9F0] hover:border-[#0756C9] hover:shadow-md transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#E8F2FF] text-[#0756C9] font-bold text-xs flex items-center justify-center">
                      {b.surahNumber}
                    </span>
                    <span className="font-bold text-sm text-[#061A35]">
                      QS. {b.surahName}
                    </span>
                    <span className="text-xs font-semibold text-[#0756C9] bg-[#E8F2FF] px-2 py-0.5 rounded-md">
                      Ayat {b.ayahNumber}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteBookmark(b.surahNumber, b.ayahNumber)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="Hapus Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="font-arabic text-xl text-[#061A35] text-right py-1 leading-loose">
                  {b.arabicSnippet}
                </p>

                <p className="text-xs sm:text-sm text-[#5E6B7C] leading-relaxed italic">
                  "{b.translationSnippet}"
                </p>

                {b.note && (
                  <div className="p-3 rounded-xl bg-[#FDFBF5] border border-[#E4E9F0] text-xs space-y-1">
                    <span className="font-bold text-[#0756C9] block">Catatan Anda:</span>
                    <p className="text-[#061A35]">{b.note}</p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onOpenSurah(b.surahNumber, b.ayahNumber)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white text-xs font-bold transition cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Buka Ayat Ini</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Personal Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {notesList.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-[#E4E9F0] p-6">
              <FileText className="w-10 h-10 text-[#5E6B7C]/40 mx-auto" />
              <h3 className="text-base font-bold text-[#061A35]">Belum Ada Catatan Tilawah</h3>
              <p className="text-xs text-[#5E6B7C] max-w-sm mx-auto">
                Tulis refleksi, doa, atau tadabbur ayat langsung di layar pembaca dengan ikon pena.
              </p>
            </div>
          ) : (
            notesList.map(n => (
              <div
                key={n.id}
                className="p-5 rounded-2xl bg-white border border-[#E4E9F0] hover:border-[#0756C9] transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#061A35]">
                      QS. {n.surahName} : Ayat {n.ayahNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenSurah(n.surahNumber, n.ayahNumber)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0756C9] hover:underline"
                  >
                    <span>Buka Ayat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#E8F2FF]/50 border border-[#168BFF]/20">
                  <p className="text-sm text-[#061A35] font-medium leading-relaxed whitespace-pre-line">
                    {n.note}
                  </p>
                </div>

                <p className="text-xs text-[#5E6B7C] italic truncate">
                  "{n.translationSnippet}"
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleClearHistory}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Riwayat</span>
              </button>
            </div>
          )}

          {history.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-[#E4E9F0] p-6">
              <History className="w-10 h-10 text-[#5E6B7C]/40 mx-auto" />
              <h3 className="text-base font-bold text-[#061A35]">Riwayat Bacaan Kosong</h3>
              <p className="text-xs text-[#5E6B7C] max-w-sm mx-auto">
                Setiap ayat yang Anda baca atau buka akan otomatis tercatat di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((h, idx) => (
                <div
                  key={idx}
                  onClick={() => onOpenSurah(h.surahNumber, h.ayahNumber)}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E4E9F0] hover:border-[#0756C9] hover:bg-[#FDFBF5] transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F2FF] text-[#0756C9] font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#0756C9] group-hover:text-white transition">
                      {h.surahNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#061A35] group-hover:text-[#0756C9]">
                        QS. {h.surahName}
                      </h4>
                      <p className="text-xs text-[#5E6B7C]">
                        Ayat {h.ayahNumber} dari {h.totalAyah} ayat
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#5E6B7C]">
                    <div className="text-right text-[11px] hidden sm:block">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(h.updatedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#0756C9]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
