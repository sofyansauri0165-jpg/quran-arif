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
  User,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, params?: any) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, onOpenSettings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF5]/95 backdrop-blur-md border-b border-[#E4E9F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#168BFF] rounded-xl p-1 -ml-1 transition group cursor-pointer"
        >
          <img
            src={APP_CONFIG.logoUrl}
            alt="Logo Maj Qur'an"
            className="w-10 h-10 object-contain rounded-full bg-white shadow-xs border border-[#E4E9F0] group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl text-[#061A35] tracking-tight group-hover:text-[#0756C9] transition-colors">
                {APP_CONFIG.appName}
              </span>
              <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-[#0756C9] bg-[#E8F2FF] rounded-md border border-[#168BFF]/20">
                Digital
              </span>
            </div>
            <p className="text-[11px] text-[#5E6B7C] hidden sm:block font-medium truncate max-w-[240px]">
              {APP_CONFIG.tagline}
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'home'
                ? 'bg-[#E8F2FF] text-[#0756C9] font-semibold'
                : 'text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF]/50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => handleNavClick('surahs')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'surahs' || currentTab === 'reader'
                ? 'bg-[#E8F2FF] text-[#0756C9] font-semibold'
                : 'text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF]/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>114 Surat</span>
          </button>

          <button
            onClick={() => handleNavClick('dua')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'dua'
                ? 'bg-[#E8F2FF] text-[#0756C9] font-semibold'
                : 'text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF]/50'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Doa Harian</span>
          </button>

          <button
            onClick={() => handleNavClick('qibla')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'qibla'
                ? 'bg-[#E8F2FF] text-[#0756C9] font-semibold'
                : 'text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF]/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Kiblat</span>
          </button>

          <button
            onClick={() => handleNavClick('tajwid')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'tajwid'
                ? 'bg-[#E8F2FF] text-[#0756C9] font-semibold'
                : 'text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF]/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tajwid</span>
          </button>

          <button
            onClick={() => handleNavClick('bookmarks')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'bookmarks'
                ? 'bg-[#E8F2FF] text-[#0756C9] font-semibold'
                : 'text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF]/50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Bookmark</span>
          </button>

          <button
            onClick={() => handleNavClick('profile')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-[#E8F2FF] text-[#0756C9] font-semibold'
                : 'text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF]/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil</span>
          </button>
        </nav>

        {/* Actions & Settings & PWA */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <PWAInstallButton variant="header" />

          {/* Quick search button */}
          <button
            onClick={() => handleNavClick('search')}
            className="p-2 rounded-xl text-[#061A35] hover:bg-[#E8F2FF] transition cursor-pointer"
            aria-label="Cari Al-Qur’an"
            title="Pencarian Surat & Ayat"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-[#061A35] hover:bg-[#E8F2FF] hover:text-[#0756C9] transition cursor-pointer"
            aria-label="Pengaturan"
            title="Pengaturan Tampilan & Audio"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile Avatar Button (as in reference design) */}
          <button
            onClick={() => handleNavClick('profile')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs ${
              currentTab === 'profile'
                ? 'bg-[#0756C9] text-white ring-2 ring-[#168BFF]/40'
                : 'bg-[#061A35] text-white hover:bg-[#0756C9]'
            }`}
            aria-label="Profil Pengguna"
            title="Profil & Tilawah Pengguna"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#061A35] hover:bg-[#E8F2FF] transition cursor-pointer"
            aria-label="Menu Navigasi"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#0756C9]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E4E9F0] bg-white px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
            <button
              onClick={() => handleNavClick('home')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-[#E8F2FF] text-[#0756C9]'
                  : 'bg-[#FDFBF5] text-[#061A35] hover:bg-[#E8F2FF]/60'
              }`}
            >
              <Home className="w-4 h-4 text-[#0756C9]" />
              <span>Beranda</span>
            </button>

            <button
              onClick={() => handleNavClick('surahs')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'surahs' || currentTab === 'reader'
                  ? 'bg-[#E8F2FF] text-[#0756C9]'
                  : 'bg-[#FDFBF5] text-[#061A35] hover:bg-[#E8F2FF]/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#0756C9]" />
              <span>114 Surat</span>
            </button>

            <button
              onClick={() => handleNavClick('dua')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'dua'
                  ? 'bg-[#E8F2FF] text-[#0756C9]'
                  : 'bg-[#FDFBF5] text-[#061A35] hover:bg-[#E8F2FF]/60'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-[#0756C9]" />
              <span>Doa Harian</span>
            </button>

            <button
              onClick={() => handleNavClick('qibla')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'qibla'
                  ? 'bg-[#E8F2FF] text-[#0756C9]'
                  : 'bg-[#FDFBF5] text-[#061A35] hover:bg-[#E8F2FF]/60'
              }`}
            >
              <Compass className="w-4 h-4 text-[#0756C9]" />
              <span>Kompas Kiblat</span>
            </button>

            <button
              onClick={() => handleNavClick('tajwid')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'tajwid'
                  ? 'bg-[#E8F2FF] text-[#0756C9]'
                  : 'bg-[#FDFBF5] text-[#061A35] hover:bg-[#E8F2FF]/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#0756C9]" />
              <span>Belajar Tajwid</span>
            </button>

            <button
              onClick={() => handleNavClick('bookmarks')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'bookmarks'
                  ? 'bg-[#E8F2FF] text-[#0756C9]'
                  : 'bg-[#FDFBF5] text-[#061A35] hover:bg-[#E8F2FF]/60'
              }`}
            >
              <Bookmark className="w-4 h-4 text-[#0756C9]" />
              <span>Bookmark</span>
            </button>

            <button
              onClick={() => handleNavClick('profile')}
              className={`p-3 rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                currentTab === 'profile'
                  ? 'bg-[#E8F2FF] text-[#0756C9]'
                  : 'bg-[#FDFBF5] text-[#061A35] hover:bg-[#E8F2FF]/60'
              }`}
            >
              <User className="w-4 h-4 text-[#0756C9]" />
              <span>Profil Saya</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
