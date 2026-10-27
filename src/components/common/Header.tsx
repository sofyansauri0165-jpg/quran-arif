import React from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { PWAInstallButton } from './PWAInstallButton';
import { BookOpen, Bookmark, Search, Settings, Home } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, params?: any) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF5]/90 backdrop-blur-md border-b border-[#E4E9F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <button
          onClick={() => onNavigate('home')}
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
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => onNavigate('home')}
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
            onClick={() => onNavigate('surahs')}
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
            onClick={() => onNavigate('search')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'search'
                ? 'bg-[#E8F2FF] text-[#0756C9] font-semibold'
                : 'text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF]/50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Pencarian</span>
          </button>

          <button
            onClick={() => onNavigate('bookmarks')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'bookmarks'
                ? 'bg-[#E8F2FF] text-[#0756C9] font-semibold'
                : 'text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF]/50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Bookmark</span>
          </button>
        </nav>

        {/* Actions & Settings & PWA */}
        <div className="flex items-center gap-2">
          <PWAInstallButton variant="header" />

          {/* Quick search shortcut on mobile */}
          <button
            onClick={() => onNavigate('search')}
            className="md:hidden p-2 rounded-xl text-[#061A35] hover:bg-[#E8F2FF] transition cursor-pointer"
            aria-label="Cari Al-Qur’an"
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
        </div>
      </div>
    </header>
  );
};
