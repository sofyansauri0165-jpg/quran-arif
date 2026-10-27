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

  return (
    <>
      <div className="rounded-3xl bg-white border border-[#E4E9F0] p-5 sm:p-6 shadow-xs space-y-5">
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E9F0]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F2FF] hover:bg-[#D4E6FF] text-[#0756C9] text-xs font-bold transition cursor-pointer"
              title="Ganti Kota / Wilayah"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{schedule?.lokasi || preferences.cityName}</span>
            </button>
            <span className="text-[11px] text-[#5E6B7C]">
              {schedule?.tanggal || 'Kemenag RI'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FDFBF5] border border-[#E4E9F0] text-xs font-mono font-bold text-[#061A35]">
              <Clock className="w-3.5 h-3.5 text-[#0756C9]" />
              <span>{currentTimeString || '--:--:--'} WIB</span>
            </div>

            {/* Audio Master status */}
            <button
              onClick={onOpenSettings}
              className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                preferences.enabled
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-gray-100 text-[#5E6B7C] hover:bg-gray-200'
              }`}
              title="Pengaturan Audio Adzan & Pengingat"
            >
              {preferences.enabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-bold hidden sm:inline">Adzan Aktif</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-gray-400" />
                  <span className="text-[11px] font-bold hidden sm:inline">Adzan Senyap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Highlight Next Prayer Countdown */}
        {nextPrayer && (
          <div className="p-4 rounded-2xl bg-linear-to-r from-[#0756C9] to-[#0645A8] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-blue-100 block">
                  Waktu Salat Berikutnya:
                </span>
                <h4 className="text-lg font-extrabold tracking-tight">
                  {nextPrayer.name} • {nextPrayer.time} WIB
                </h4>
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

        {/* Prayer Times Grid */}
        {loadingSchedule ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#5E6B7C]">
            <Loader2 className="w-6 h-6 animate-spin text-[#0756C9]" />
            <span className="text-xs">Memuat jadwal salat Kemenag RI...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {prayersList.map(item => {
              const isNext = nextPrayer?.key === item.key;
              const isAudioActive =
                item.isAudible &&
                preferences.enabled &&
                preferences.enabledPrayers[item.key as keyof typeof preferences.enabledPrayers];

              return (
                <div
                  key={item.key}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col justify-between ${
                    isNext
                      ? 'bg-[#E8F2FF] border-[#0756C9] ring-2 ring-[#0756C9]/20 shadow-xs'
                      : 'bg-[#FDFBF5] border-[#E4E9F0] hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-[11px] font-bold text-[#5E6B7C] block truncate">
                        {item.label}
                      </span>
                      {item.isAudible && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isAudioActive ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                          title={isAudioActive ? 'Audio adzan aktif' : 'Audio dimatikan'}
                        />
                      )}
                    </div>
                    <span className="text-base font-extrabold text-[#061A35] font-mono">
                      {item.time}
                    </span>
                  </div>

                  {item.isAudible && (
                    <div className="pt-2 mt-1 border-t border-[#E4E9F0]/60">
                      <button
                        onClick={() => {
                          if (item.key === 'subuh') playTestAudio('subuh');
                          else if (item.key === 'imsak') playTestAudio('imsak');
                          else if (item.key === 'terbit') playTestAudio('terbit');
                          else playTestAudio('general');
                        }}
                        className="w-full py-1 rounded-lg bg-white hover:bg-[#E8F2FF] text-[#0756C9] text-[10px] font-bold border border-[#E4E9F0] transition flex items-center justify-center gap-1 cursor-pointer"
                        title={`Uji Audio ${item.label}`}
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Uji</span>
                      </button>
                    </div>
                  )}
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
