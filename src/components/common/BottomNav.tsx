import React from 'react';
import { Home, BookOpen, HeartHandshake, Compass, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string, params?: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  const tabs = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'surahs', label: 'Al-Qur’an', icon: BookOpen },
    { id: 'dua', label: 'Doa', icon: HeartHandshake },
    { id: 'qibla', label: 'Kiblat', icon: Compass },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <nav
      aria-label="Navigasi Utama Bawah"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4E9F0] pb-safe"
    >
      <div className="grid grid-cols-5 h-15 max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive =
            currentTab === tab.id ||
            (tab.id === 'surahs' && (currentTab === 'surahs' || currentTab === 'reader' || currentTab === 'search'));

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              aria-label={tab.label}
              className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isActive ? 'text-[#0756C9]' : 'text-[#5E6B7C] hover:text-[#061A35]'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-[#E8F2FF] text-[#0756C9] scale-105' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] truncate max-w-full px-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
