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
    <div className="w-full mx-auto space-y-6 pb-28">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Tersimpan & Catatan
        </h1>
        <p className="text-xs sm:text-sm text-[#AABBD0]">
          Kelola ayat favorit, tadabbur pribadi, dan riwayat tilawah Anda
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#082245] rounded-2xl border border-[#29415E]">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'bg-[#168BFF] text-white shadow-md'
              : 'text-[#AABBD0] hover:text-white'
          }`}
        >
          <BookmarkIcon className="w-3.5 h-3.5" />
          <span className="truncate">Ayat Tersimpan ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-[#168BFF] text-white shadow-md'
              : 'text-[#AABBD0] hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="truncate">Catatan ({notesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#168BFF] text-white shadow-md'
              : 'text-[#AABBD0] hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span className="truncate">Riwayat ({history.length})</span>
        </button>
      </div>

      {/* Tab 1: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div>
          {bookmarks.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-[#061A35] rounded-2xl border border-[#29415E] p-6">
              <BookmarkIcon className="w-10 h-10 text-[#7E95B1]/50 mx-auto" />
              <h3 className="text-base font-bold text-white">Belum Ada Ayat Tersimpan</h3>
              <p className="text-xs text-[#AABBD0] max-w-sm mx-auto">
                Tandai ayat favorit saat membaca Al-Qur’an dengan menekan tombol bookmark pada ayat.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 items-stretch">
              {bookmarks.map(b => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-[#061A35] border border-[#29415E] hover:border-[#168BFF] hover:shadow-xl transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#082245] text-[#168BFF] border border-[#29415E] font-bold text-xs flex items-center justify-center">
                          {b.surahNumber}
                        </span>
                        <span className="font-bold text-sm text-white">
                          QS. {b.surahName}
                        </span>
                        <span className="text-xs font-semibold text-[#168BFF] bg-[#082245] border border-[#168BFF]/30 px-2 py-0.5 rounded-md">
                          Ayat {b.ayahNumber}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteBookmark(b.surahNumber, b.ayahNumber)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/50 transition cursor-pointer"
                        title="Hapus Bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="font-arabic text-xl text-white text-right py-1 leading-loose">
                      {b.arabicSnippet}
                    </p>

                    <p className="text-xs sm:text-sm text-[#AABBD0] leading-relaxed italic">
                      "{b.translationSnippet}"
                    </p>

                    {b.note && (
                      <div className="p-3 rounded-xl bg-[#082245] border border-[#29415E] text-xs space-y-1">
                        <span className="font-bold text-[#168BFF] block">Catatan Anda:</span>
                        <p className="text-[#E2EDF8]">{b.note}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onOpenSurah(b.surahNumber, b.ayahNumber)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#168BFF] hover:bg-[#168BFF]/90 text-white text-xs font-bold transition cursor-pointer shadow-md"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Buka Ayat Ini</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Personal Notes */}
      {activeTab === 'notes' && (
        <div>
          {notesList.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-[#061A35] rounded-2xl border border-[#29415E] p-6">
              <FileText className="w-10 h-10 text-[#7E95B1]/50 mx-auto" />
              <h3 className="text-base font-bold text-white">Belum Ada Catatan Tilawah</h3>
              <p className="text-xs text-[#AABBD0] max-w-sm mx-auto">
                Tulis refleksi, doa, atau tadabbur ayat langsung di layar pembaca dengan ikon pena.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 items-stretch">
              {notesList.map(n => (
                <div
                  key={n.id}
                  className="p-5 rounded-2xl bg-[#061A35] border border-[#29415E] hover:border-[#168BFF] transition space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          QS. {n.surahName} : Ayat {n.ayahNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenSurah(n.surahNumber, n.ayahNumber)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#168BFF] hover:underline cursor-pointer"
                      >
                        <span>Buka Ayat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#082245] border border-[#168BFF]/30">
                      <p className="text-sm text-[#E2EDF8] font-medium leading-relaxed whitespace-pre-line">
                        {n.note}
                      </p>
                    </div>

                    <p className="text-xs text-[#AABBD0] italic truncate">
                      "{n.translationSnippet}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Riwayat</span>
              </button>
            </div>
          )}

          {history.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-[#061A35] rounded-2xl border border-[#29415E] p-6">
              <History className="w-10 h-10 text-[#7E95B1]/50 mx-auto" />
              <h3 className="text-base font-bold text-white">Riwayat Bacaan Kosong</h3>
              <p className="text-xs text-[#AABBD0] max-w-sm mx-auto">
                Setiap ayat yang Anda baca atau buka akan otomatis tercatat di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              {history.map((h, idx) => (
                <div
                  key={idx}
                  onClick={() => onOpenSurah(h.surahNumber, h.ayahNumber)}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#061A35] border border-[#29415E] hover:border-[#168BFF] hover:bg-[#082245] transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#082245] text-[#168BFF] border border-[#29415E] font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#168BFF] group-hover:text-white transition">
                      {h.surahNumber}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#168BFF] truncate">
                        QS. {h.surahName}
                      </h4>
                      <p className="text-xs text-[#AABBD0] truncate">
                        Ayat {h.ayahNumber} dari {h.totalAyah} ayat
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#7E95B1] shrink-0">
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
                    <ArrowRight className="w-4 h-4 text-[#168BFF]" />
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
