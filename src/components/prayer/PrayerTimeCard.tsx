import React, { useState } from 'react';
import { usePrayerAudio, PRAYER_NAMES } from '../../context/PrayerAudioContext';
import { PrayerKey } from '../../types/prayer';
import { CitySelectModal } from './CitySelectModal';
import {
  Clock,
  MapPin,
  Volume2,
  VolumeX,
  Play,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const PrayerTimeCard: React.FC<{ onOpenSettings?: () => void }> = ({ onOpenSettings }) => {
  const {
    schedule,
    loadingSchedule,
    preferences,
    nextPrayer,
    currentTimeString,
    playTestAudio,
    refreshSchedule,
  } = usePrayerAudio();

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  // Format seconds to HH:mm:ss countdown
  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '00:00:00';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const prayersList: { key: PrayerKey; label: string; time: string; isAudible: boolean }[] = [
    { key: 'imsak', label: 'Imsak', time: schedule?.imsak || '--:--', isAudible: true },
    { key: 'subuh', label: 'Subuh', time: schedule?.subuh || '--:--', isAudible: true },
    { key: 'terbit', label: 'Terbit', time: schedule?.terbit || '--:--', isAudible: true },
    { key: 'dhuha', label: 'Dhuha', time: schedule?.dhuha || '--:--', isAudible: false },
    { key: 'dzuhur', label: 'Dzuhur', time: schedule?.dzuhur || '--:--', isAudible: true },
    { key: 'ashar', label: 'Ashar', time: schedule?.ashar || '--:--', isAudible: true },
    { key: 'maghrib', label: 'Maghrib', time: schedule?.maghrib || '--:--', isAudible: true },
    { key: 'isya', label: 'Isya', time: schedule?.isya || '--:--', isAudible: true },
  ];

  const mainPrayers: { key: PrayerKey; label: string; time: string; isAudible: boolean }[] = [
    { key: 'subuh', label: 'Subuh', time: schedule?.subuh || '--:--', isAudible: true },
    { key: 'dzuhur', label: 'Dzuhur', time: schedule?.dzuhur || '--:--', isAudible: true },
    { key: 'ashar', label: 'Ashar', time: schedule?.ashar || '--:--', isAudible: true },
    { key: 'maghrib', label: 'Maghrib', time: schedule?.maghrib || '--:--', isAudible: true },
    { key: 'isya', label: 'Isya', time: schedule?.isya || '--:--', isAudible: true },
  ];

  return (
    <>
      <div className="rounded-3xl bg-[#082245] border border-[#29415E] p-3.5 min-[380px]:p-5 sm:p-6 shadow-xl space-y-4 text-white">
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#29415E]">
          <div className="flex items-center gap-3">
            {/* Mosque Badge Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0c2e5b] text-[#168BFF] border border-[#168BFF]/30 flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-[#168BFF]" />
            </div>

            <div>
              <h4 className="font-bold text-white text-sm sm:text-base tracking-tight">
                Jadwal Shalat
              </h4>
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-[#8FA7C4] hover:text-[#168BFF] transition cursor-pointer"
                title="Ganti Wilayah / Kota"
              >
                <MapPin className="w-3 h-3 text-[#168BFF]" />
                <span className="font-medium underline decoration-dotted">{schedule?.lokasi || preferences.cityName}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#04152D] border border-[#29415E] text-xs font-mono font-bold text-[#168BFF]">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentTimeString || '--:--:--'} WIB</span>
            </div>

            {/* Audio Master status */}
            <button
              onClick={onOpenSettings}
              className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer border ${
                preferences.enabled
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                  : 'bg-[#04152D] text-[#7E95B1] border-[#29415E] hover:text-white'
              }`}
              title="Pengaturan Audio Adzan & Pengingat"
            >
              {preferences.enabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-bold hidden sm:inline">Adzan Aktif</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="text-[11px] font-bold hidden sm:inline">Adzan Senyap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Highlight Next Prayer Countdown */}
        {nextPrayer && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-linear-to-r from-[#0756C9] to-[#04152D] border border-[#168BFF]/40 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-blue-200 block">
                  Waktu Salat Berikutnya:
                </span>
                <h5 className="text-base sm:text-lg font-extrabold tracking-tight">
                  {nextPrayer.name} • {nextPrayer.time} WIB
                </h5>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[10px] text-blue-200 block font-semibold uppercase tracking-wider">
                Hitung Mundur
              </span>
              <span className="text-xl sm:text-2xl font-mono font-black tracking-tight text-amber-300">
                {formatCountdown(nextPrayer.remainingSeconds)}
              </span>
            </div>
          </div>
        )}

        {/* 5 Prayer Times Horizontal Columns matching mockup */}
        {loadingSchedule ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-[#7E95B1]">
            <Loader2 className="w-6 h-6 animate-spin text-[#168BFF]" />
            <span className="text-xs">Memuat jadwal salat Kemenag RI...</span>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-1 min-[360px]:gap-1.5 sm:gap-3 text-center">
            {mainPrayers.map(item => {
              const isNext = nextPrayer?.key === item.key;
              return (
                <div
                  key={item.key}
                  className={`p-1.5 min-[360px]:p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition flex flex-col justify-between ${
                    isNext
                      ? 'bg-[#0c2e5b] border-[#168BFF] ring-2 ring-[#168BFF]/30 shadow-md'
                      : 'bg-[#04152D]/80 border-[#29415E] hover:border-[#168BFF]/40'
                  }`}
                >
                  <span className={`text-[9px] min-[360px]:text-[11px] sm:text-xs font-semibold block truncate ${
                    isNext ? 'text-[#168BFF] font-bold' : 'text-[#8FA7C4]'
                  }`}>
                    {item.label}
                  </span>
                  <span className={`text-xs min-[360px]:text-sm sm:text-base font-extrabold font-mono mt-0.5 sm:mt-1 ${
                    isNext ? 'text-[#168BFF] font-black scale-105' : 'text-white'
                  }`}>
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* City Select Modal */}
      <CitySelectModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentCityId={preferences.cityId}
        onSelectCity={(cityId, cityName) => refreshSchedule(cityId, cityName)}
      />
    </>
  );
};
