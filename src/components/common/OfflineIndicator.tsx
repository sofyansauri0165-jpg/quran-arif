import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-18 right-4 z-50 flex items-center gap-2 rounded-xl bg-[#061A35] text-white px-3.5 py-2 text-xs font-medium shadow-xl border border-amber-500/30 animate-pulse">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <div>
        <p className="font-semibold text-amber-300">Mode Offline Aktif</p>
        <p className="text-[11px] text-gray-300">Menampilkan data Al-Qur’an dari cache perangkat.</p>
      </div>
    </div>
  );
};
