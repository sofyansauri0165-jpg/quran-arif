import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { PWAInstallButton } from './PWAInstallButton';
import {
  BookOpen,
  Bookmark,
  Search,
  Settings,
  Home,
  HeartHandshake,
  Compass,
  Sparkles,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, params?: any) => void;
  onOpenSettings: () => void;
}

const getMobilePageTitle = (tab: string) => {
  switch (tab) {
    case 'surahs':
      return '114 Surat';
    case 'reader':
      return 'Baca Al-Qur’an';
    case 'dua':
      return 'Doa Harian';
    case 'qibla':
      return 'Kompas Kiblat';
    case 'tajwid':
      return 'Belajar Tajwid';
    case 'bookmarks':
      return 'Tersimpan';
    case 'search':
      return 'Pencarian';
    default:
      return APP_CONFIG.appName;
  }
};

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, onOpenSettings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#031126]/95 backdrop-blur-md border-b border-[#29415E]">
      <div className="w-full px-3 sm:px-6 lg:px-[30px] h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Desktop Brand Logo & Text (Always visible on desktop md+) */}
        <button
          onClick={() => handleNavClick('home')}
          className="hidden md:flex items-center gap-2.5 lg:gap-3 text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#168BFF] rounded-xl p-1 -ml-1 transition group cursor-pointer min-w-0 shrink-0"
        >
          <img
            src={APP_CONFIG.logoUrl}
            alt="Logo Maj Qur'an"
            className="w-9 h-9 lg:w-10 lg:h-10 object-contain rounded-full bg-white shadow-xs border border-[#29415E] group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="min-w-0">
            <span className="font-extrabold text-base lg:text-lg text-white tracking-tight group-hover:text-[#168BFF] transition-colors truncate block">
              {APP_CONFIG.appName}
            </span>
            <p className="text-[11px] text-[#AABBD0] hidden xl:block font-medium truncate max-w-[240px]">
              {APP_CONFIG.tagline}
            </p>
          </div>
        </button>

        {/* Mobile Brand / Page Title: Icon logo and text ONLY on 'home' (Beranda), other pages show Back + Title */}
        <div className="md:hidden flex items-center min-w-0">
          {currentTab === 'home' ? (
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={APP_CONFIG.logoUrl}
                alt="Logo Maj Qur'an"
                className="w-8 h-8 object-contain rounded-full bg-white shadow-xs border border-[#29415E] shrink-0"
              />
              <span className="font-extrabold text-base text-white tracking-tight truncate">
                {APP_CONFIG.appName}
              </span>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 text-left focus:outline-hidden rounded-xl py-1 -ml-1 transition group cursor-pointer min-w-0"
              aria-label="Kembali ke Beranda"
              title="Kembali ke Beranda"
            >
              <div className="w-8 h-8 rounded-xl bg-[#082245] border border-[#29415E] flex items-center justify-center text-[#168BFF] group-hover:bg-[#168BFF] group-hover:text-white transition shrink-0 shadow-xs">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-white truncate max-w-[190px]">
                {getMobilePageTitle(currentTab)}
              </span>
            </button>
          )}
        </div>

        {/* Tablet & Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1.5 text-xs lg:text-sm font-medium">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'home'
                ? 'bg-[#082245] text-[#168BFF] font-semibold border border-[#29415E]'
                : 'text-[#AABBD0] hover:text-white hover:bg-[#082245]/60'
            }`}
          >
            <Home className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => handleNavClick('surahs')}
            className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'surahs' || currentTab === 'reader'
                ? 'bg-[#082245] text-[#168BFF] font-semibold border border-[#29415E]'
                : 'text-[#AABBD0] hover:text-white hover:bg-[#082245]/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span>114 Surat</span>
          </button>

          <button
            onClick={() => handleNavClick('dua')}
            className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'dua'
                ? 'bg-[#082245] text-[#168BFF] font-semibold border border-[#29415E]'
                : 'text-[#AABBD0] hover:text-white hover:bg-[#082245]/60'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span>Doa Harian</span>
          </button>

          <button
            onClick={() => handleNavClick('qibla')}
            className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'qibla'
                ? 'bg-[#082245] text-[#168BFF] font-semibold border border-[#29415E]'
                : 'text-[#AABBD0] hover:text-white hover:bg-[#082245]/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span>Kiblat</span>
          </button>

          <button
            onClick={() => handleNavClick('tajwid')}
            className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'tajwid'
                ? 'bg-[#082245] text-[#168BFF] font-semibold border border-[#29415E]'
                : 'text-[#AABBD0] hover:text-white hover:bg-[#082245]/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span>Tajwid</span>
          </button>

          <button
            onClick={() => handleNavClick('bookmarks')}
            className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'bookmarks'
                ? 'bg-[#082245] text-[#168BFF] font-semibold border border-[#29415E]'
                : 'text-[#AABBD0] hover:text-white hover:bg-[#082245]/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden xl:inline">Bookmark</span>
            <span className="xl:hidden">Saved</span>
          </button>
        </nav>

        {/* Actions & Settings & PWA */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <PWAInstallButton variant="header" />

          {/* Quick search button */}
          <button
            onClick={() => handleNavClick('search')}
            className="p-1.5 sm:p-2 rounded-xl text-[#AABBD0] hover:text-white hover:bg-[#082245] transition cursor-pointer"
            aria-label="Cari Al-Qur’an"
            title="Pencarian Surat & Ayat"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-xl text-[#AABBD0] hover:text-[#168BFF] hover:bg-[#082245] transition cursor-pointer"
            aria-label="Pengaturan"
            title="Pengaturan Tampilan & Audio"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Mobile menu toggle button (visible on smartphone < 768px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-xl text-[#AABBD0] hover:text-white hover:bg-[#082245] transition cursor-pointer"
            aria-label="Menu Navigasi"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#168BFF]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#29415E] bg-[#031126] px-4 py-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
            <button
              onClick={() => handleNavClick('home')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-[#082245] text-[#168BFF] border border-[#29415E]'
                  : 'bg-[#061A35] text-[#AABBD0] border border-[#29415E]/50 hover:bg-[#082245]'
              }`}
            >
              <Home className="w-4 h-4 text-[#168BFF]" />
              <span>Beranda</span>
            </button>

            <button
              onClick={() => handleNavClick('surahs')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'surahs' || currentTab === 'reader'
                  ? 'bg-[#082245] text-[#168BFF] border border-[#29415E]'
                  : 'bg-[#061A35] text-[#AABBD0] border border-[#29415E]/50 hover:bg-[#082245]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#168BFF]" />
              <span>114 Surat</span>
            </button>

            <button
              onClick={() => handleNavClick('dua')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'dua'
                  ? 'bg-[#082245] text-[#168BFF] border border-[#29415E]'
                  : 'bg-[#061A35] text-[#AABBD0] border border-[#29415E]/50 hover:bg-[#082245]'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-[#168BFF]" />
              <span>Doa Harian</span>
            </button>

            <button
              onClick={() => handleNavClick('qibla')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'qibla'
                  ? 'bg-[#082245] text-[#168BFF] border border-[#29415E]'
                  : 'bg-[#061A35] text-[#AABBD0] border border-[#29415E]/50 hover:bg-[#082245]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#168BFF]" />
              <span>Kompas Kiblat</span>
            </button>

            <button
              onClick={() => handleNavClick('tajwid')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'tajwid'
                  ? 'bg-[#082245] text-[#168BFF] border border-[#29415E]'
                  : 'bg-[#061A35] text-[#AABBD0] border border-[#29415E]/50 hover:bg-[#082245]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#168BFF]" />
              <span>Belajar Tajwid</span>
            </button>

            <button
              onClick={() => handleNavClick('bookmarks')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'bookmarks'
                  ? 'bg-[#082245] text-[#168BFF] border border-[#29415E]'
                  : 'bg-[#061A35] text-[#AABBD0] border border-[#29415E]/50 hover:bg-[#082245]'
              }`}
            >
              <Bookmark className="w-4 h-4 text-[#168BFF]" />
              <span>Bookmark</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
