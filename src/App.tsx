/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from './config/appConfig';
import { AudioProvider, useAudio } from './context/AudioContext';
import { PrayerAudioProvider } from './context/PrayerAudioContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { MiniAudioPlayer } from './components/audio/MiniAudioPlayer';
import { PrayerActiveAudioBanner } from './components/prayer/PrayerActiveAudioBanner';
import { SettingsModal } from './components/settings/SettingsModal';
import { HomePage } from './pages/HomePage';
import { SurahListPage } from './pages/SurahListPage';
import { ReaderPage } from './pages/ReaderPage';
import { SearchPage } from './pages/SearchPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { getSettings } from './storage/persistence';
import { UserSettings } from './types/quran';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<'home' | 'surahs' | 'reader' | 'search' | 'bookmarks'>('home');
  const [readerSurah, setReaderSurah] = useState<number>(1);
  const [readerAyah, setReaderAyah] = useState<number | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());

  const { pause: pauseMurottal } = useAudio();

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentTab, readerSurah]);

  const handleOpenSurah = (surahNumber: number, targetAyah?: number) => {
    setReaderSurah(surahNumber);
    setReaderAyah(targetAyah);
    setCurrentTab('reader');
  };

  const handleNavigate = (tab: string, params?: any) => {
    if (tab === 'reader' && params?.surahNumber) {
      setReaderSurah(params.surahNumber);
      setReaderAyah(params.targetAyah);
      setCurrentTab('reader');
    } else {
      setCurrentTab(tab as any);
    }
  };

  return (
    <PrayerAudioProvider onBeforeAudioPlay={pauseMurottal}>
      <div className="min-h-screen flex flex-col bg-[#FDFBF5] text-[#061A35]">
        {/* Offline notification badge */}
        <OfflineIndicator />

        {/* Active Prayer Audio Banner (Adzan / Imsak / Terbit alert) */}
        <PrayerActiveAudioBanner />

        {/* Global Sticky Header */}
        <Header
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
          {currentTab === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              onOpenSurah={handleOpenSurah}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {currentTab === 'surahs' && (
            <SurahListPage onOpenSurah={handleOpenSurah} />
          )}

          {currentTab === 'reader' && (
            <ReaderPage
              surahNumber={readerSurah}
              initialAyahNumber={readerAyah}
              settings={settings}
              onBack={() => setCurrentTab('surahs')}
              onNavigateSurah={(nextSurah, nextAyah) => {
                setReaderSurah(nextSurah);
                setReaderAyah(nextAyah);
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {currentTab === 'search' && (
            <SearchPage onOpenSurah={handleOpenSurah} />
          )}

          {currentTab === 'bookmarks' && (
            <BookmarksPage onOpenSurah={handleOpenSurah} />
          )}
        </main>

        {/* Floating Mini Player for Murottal Audio */}
        <MiniAudioPlayer />

        {/* Mobile Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onNavigate={handleNavigate}
        />

        {/* Settings Modal (Quran Tilawah + Prayer Audio) */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSettingsChange={newSettings => setSettings(newSettings)}
        />

        {/* Footer */}
        <footer className="mt-auto py-8 border-t border-[#E4E9F0] bg-white text-center text-xs text-[#5E6B7C] pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <img
                src={APP_CONFIG.logoUrl}
                alt="Maj Qur'an"
                className="w-5 h-5 object-contain rounded-full"
              />
              <span className="font-bold text-[#061A35]">{APP_CONFIG.appName}</span>
              <span>—</span>
              <span>"{APP_CONFIG.tagline}"</span>
            </div>
            <p className="text-[11px] text-[#5E6B7C]">
              Jadwal Salat & Adzan resmi Kementerian Agama RI via myquran.com. Teks Al-Qur'an bersumber dari equran.id.
            </p>
          </div>
        </footer>
      </div>
    </PrayerAudioProvider>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}
