import React from 'react';
import { usePrayerAudio } from '../../context/PrayerAudioContext';
import { Volume2, VolumeX, Bell, AlertTriangle, Square } from 'lucide-react';

export const PrayerActiveAudioBanner: React.FC = () => {
  const { activeAlert, autoplayBlocked, stopPrayerAudio, triggerPendingAudio } = usePrayerAudio();

  if (!activeAlert) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4 py-2 bg-[#0756C9] text-white shadow-2xl border-b border-[#168BFF]/40 animate-slide-down">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Info */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0 animate-bounce">
            <Bell className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight">
                {activeAlert.prayerName} Telah Tiba
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                Pengingat Jadwal Salat
              </span>
            </div>
            <p className="text-xs text-blue-100 font-medium">
              {activeAlert.audioTitle}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {autoplayBlocked && (
            <button
              onClick={triggerPendingAudio}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#061A35] text-xs font-bold shadow-md transition active:scale-95 cursor-pointer animate-pulse"
            >
              <Volume2 className="w-4 h-4" />
              <span>Bunyikan Audio</span>
            </button>
          )}

          <button
            onClick={stopPrayerAudio}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition active:scale-95 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Hentikan Pengingat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
