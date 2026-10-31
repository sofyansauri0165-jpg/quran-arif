import React from 'react';
import { Home, BookOpen, HeartHandshake, Compass } from 'lucide-react';

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
  ];

  return (
    <nav
      aria-label="Navigasi Utama Bawah"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#031126]/95 backdrop-blur-md border-t border-[#29415E] pb-safe shadow-2xl"
    >
      <div className="grid grid-cols-4 h-16 max-w-md sm:max-w-lg mx-auto">
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
                isActive ? 'text-[#168BFF]' : 'text-[#AABBD0] hover:text-white'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-[#082245] text-[#168BFF] ring-1 ring-[#168BFF]/40 shadow-sm scale-105' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[9px] min-[360px]:text-[10px] sm:text-xs truncate max-w-full px-0.5 ${isActive ? 'font-bold text-[#168BFF]' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
