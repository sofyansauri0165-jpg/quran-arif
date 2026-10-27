import React from 'react';
import { Home, BookOpen, Search, Bookmark } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string, params?: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  const tabs = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'surahs', label: '114 Surat', icon: BookOpen },
    { id: 'search', label: 'Cari', icon: Search },
    { id: 'bookmarks', label: 'Tersimpan', icon: Bookmark },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4E9F0] pb-safe">
      <div className="grid grid-cols-4 h-15 max-w-md mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive =
            currentTab === tab.id ||
            (tab.id === 'surahs' && currentTab === 'reader');

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
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
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
