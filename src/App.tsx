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
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { Footer } from './components/common/Footer';
import { SettingsModal } from './components/settings/SettingsModal';
import { HomePage } from './pages/HomePage';
import { SurahListPage } from './pages/SurahListPage';
import { ReaderPage } from './pages/ReaderPage';
import { SearchPage } from './pages/SearchPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { DuaPage } from './pages/DuaPage';
import { QiblaPage } from './pages/QiblaPage';
import { TajwidPage } from './pages/TajwidPage';
import { getSettings } from './storage/persistence';
import { UserSettings } from './types/quran';

export type AppTabType = 'home' | 'surahs' | 'reader' | 'search' | 'bookmarks' | 'dua' | 'qibla' | 'tajwid';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<AppTabType>('home');
  const [readerSurah, setReaderSurah] = useState<number>(1);
  const [readerAyah, setReaderAyah] = useState<number | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());

  const { pause: pauseMurottal, playingState } = useAudio();
  const hasActiveAudio = playingState.mode !== 'idle';

  // Fallback protection: safely handle legacy profile tab
  useEffect(() => {
    if ((currentTab as string) === 'profile') {
      setCurrentTab('home');
    }
  }, [currentTab]);

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
    if (tab === 'profile') {
      setCurrentTab('home');
      return;
    }
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
      <div className="min-h-screen flex flex-col bg-[#031126] text-white selection:bg-[#168BFF]/40 selection:text-white relative">
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
        <main className="flex-1 w-full mx-auto px-3 sm:px-6 lg:px-[30px] pt-3 sm:pt-6 overflow-x-hidden">
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

          {currentTab === 'dua' && (
            <DuaPage onBack={() => setCurrentTab('home')} />
          )}

          {currentTab === 'qibla' && (
            <QiblaPage onBack={() => setCurrentTab('home')} />
          )}

          {currentTab === 'tajwid' && (
            <TajwidPage onBack={() => setCurrentTab('home')} />
          )}

        </main>

        {/* Smart PWA Installation Widget */}
        <PWAInstallBanner
          currentTab={currentTab}
          hasActiveAudio={hasActiveAudio}
        />

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

        {/* Footer with 3 Partner Logos & Attribution */}
        <Footer />
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
