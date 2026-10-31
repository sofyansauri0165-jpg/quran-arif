import React, { useState } from 'react';
import {
  X,
  Type,
  Languages,
  Volume2,
  Gauge,
  Target,
  Check,
  RotateCcw,
  Bell,
  Play,
  VolumeX,
  AlertCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { UserSettings } from '../../types/quran';
import { saveSettings, DEFAULT_SETTINGS } from '../../storage/persistence';
import { useAudio } from '../../context/AudioContext';
import { usePrayerAudio } from '../../context/PrayerAudioContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const { setReciter } = useAudio();
  const {
    preferences: prayerPrefs,
    updatePreferences: updatePrayerPrefs,
    playTestAudio,
    stopPrayerAudio,
    activeAlert,
    requestNotificationPermission,
    notificationPermission,
  } = usePrayerAudio();

  const [activeTab, setActiveTab] = useState<'quran' | 'prayer'>('quran');
  const [current, setCurrent] = useState<UserSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...current, [key]: value };
    setCurrent(updated);
    saveSettings(updated);
    onSettingsChange(updated);

    if (key === 'selectedReciter') {
      setReciter(value as string);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  const handleReset = () => {
    setCurrent(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    onSettingsChange(DEFAULT_SETTINGS);
    setReciter(DEFAULT_SETTINGS.selectedReciter);
  };

  const fontSizes = [
    { id: 'sm', label: 'Kecil', class: 'text-xl' },
    { id: 'base', label: 'Sedang', class: 'text-2xl' },
    { id: 'lg', label: 'Besar', class: 'text-3xl' },
    { id: 'xl', label: 'Ekstra', class: 'text-4xl' },
    { id: '2xl', label: 'Maksimal', class: 'text-5xl' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-[#061A35] rounded-3xl shadow-2xl border border-[#29415E] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#29415E] bg-[#082245]">
          <div>
            <h3 className="font-bold text-white text-base">Pengaturan Aplikasi</h3>
            <p className="text-[11px] text-[#AABBD0]">
              Sesuaikan preferensi membaca tilawah dan pengingat waktu salat
            </p>
          </div>
          <button
            onClick={() => {
              stopPrayerAudio();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-[#0c2f5d] text-[#AABBD0] hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers: Tilawah vs Jadwal Salat */}
        <div className="flex items-center border-b border-[#29415E] bg-[#04152D]/80 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('quran')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quran'
                ? 'border-[#168BFF] text-[#168BFF]'
                : 'border-transparent text-[#AABBD0] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Al-Qur'an & Tilawah</span>
          </button>

          <button
            onClick={() => setActiveTab('prayer')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'prayer'
                ? 'border-[#168BFF] text-[#168BFF]'
                : 'border-transparent text-[#AABBD0] hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Jadwal Salat & Audio Adzan</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-white">
          {activeTab === 'quran' ? (
            <>
              {/* 1. Arabic Font Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Type className="w-4 h-4 text-[#168BFF]" />
                    <span>Ukuran Teks Arab</span>
                  </label>
                  <span className="text-xs font-semibold text-[#168BFF] bg-[#082245] border border-[#29415E] px-2 py-0.5 rounded-md">
                    {fontSizes.find(f => f.id === current.arabicFontSize)?.label}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#04152D] border border-[#29415E] rounded-xl">
                  {fontSizes.map(f => (
                    <button
                      key={f.id}
                      onClick={() => updateSetting('arabicFontSize', f.id as any)}
                      className={`py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        current.arabicFontSize === f.id
                          ? 'bg-[#168BFF] text-white shadow-md'
                          : 'text-[#AABBD0] hover:text-white hover:bg-[#082245]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Live Preview Box */}
                <div className="p-4 rounded-xl bg-[#082245] border border-[#29415E] text-right">
                  <span className="text-[10px] font-semibold text-[#AABBD0] block mb-1 text-left uppercase">
                    Pratinjau Teks:
                  </span>
                  <p
                    className={`font-arabic text-white ${
                      fontSizes.find(f => f.id === current.arabicFontSize)?.class || 'text-3xl'
                    }`}
                  >
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                </div>
              </div>

              {/* 2. Reciter Choice */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Volume2 className="w-4 h-4 text-[#168BFF]" />
                  <span>Qari Pilihan (Murottal Audio)</span>
                </label>
                <select
                  value={current.selectedReciter}
                  onChange={e => updateSetting('selectedReciter', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#29415E] text-sm text-white bg-[#082245] focus:outline-hidden focus:ring-2 focus:ring-[#168BFF] cursor-pointer"
                >
                  {APP_CONFIG.reciters.map(r => (
                    <option key={r.id} value={r.id} className="bg-[#061A35] text-white">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Toggles for Translation & Transliteration */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Languages className="w-4 h-4 text-[#168BFF]" />
                  <span>Tampilan Teks</span>
                </label>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-[#29415E] bg-[#082245]/60 hover:bg-[#082245] cursor-pointer transition">
                    <div>
                      <span className="text-sm font-semibold block text-white">
                        Terjemahan Bahasa Indonesia
                      </span>
                      <span className="text-xs text-[#AABBD0]">
                        Tampilkan arti ayat bahasa Indonesia resmi Kemenag
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={current.showTranslation}
                      onChange={e => updateSetting('showTranslation', e.target.checked)}
                      className="w-4 h-4 accent-[#168BFF] rounded-md cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-[#29415E] bg-[#082245]/60 hover:bg-[#082245] cursor-pointer transition">
                    <div>
                      <span className="text-sm font-semibold block text-white">
                        Transliterasi Latin
                      </span>
                      <span className="text-xs text-[#AABBD0]">
                        Tampilkan cara baca huruf latin untuk membantu pelafalan
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={current.showTransliteration}
                      onChange={e => updateSetting('showTransliteration', e.target.checked)}
                      className="w-4 h-4 accent-[#168BFF] rounded-md cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* 4. Default Auto Scroll Speed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#061A35] uppercase tracking-wider">
                    <Gauge className="w-4 h-4 text-[#0756C9]" />
                    <span>Kecepatan Auto-Scroll Default</span>
                  </label>
                  <span className="text-xs font-semibold text-[#0756C9]">{current.autoScrollSpeed}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={current.autoScrollSpeed}
                  onChange={e => updateSetting('autoScrollSpeed', parseInt(e.target.value, 10))}
                  className="w-full accent-[#0756C9] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#5E6B7C]">
                  <span>1x (Lambat)</span>
                  <span>3x (Sedang)</span>
                  <span>5x (Cepat)</span>
                </div>
              </div>

              {/* 5. Daily Tilawah Target */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#061A35] uppercase tracking-wider">
                    <Target className="w-4 h-4 text-[#0756C9]" />
                    <span>Target Tilawah Harian</span>
                  </label>
                  <span className="text-xs font-semibold text-[#0756C9]">
                    {current.dailyAyahTarget} Ayat/Hari
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[10, 20, 30, 50, 100].map(targetVal => (
                    <button
                      key={targetVal}
                      onClick={() => updateSetting('dailyAyahTarget', targetVal)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        current.dailyAyahTarget === targetVal
                          ? 'bg-[#0756C9] text-white shadow-xs'
                          : 'bg-[#FDFBF5] border border-[#E4E9F0] text-[#061A35] hover:bg-[#E8F2FF]'
                      }`}
                    >
                      {targetVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. PWA Installation Section */}
              <div className="p-4 rounded-2xl bg-[#FDFBF5] border border-[#E4E9F0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0756C9]" />
                    <span className="text-xs font-bold text-[#061A35]">
                      Instalasi Aplikasi (PWA)
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#5E6B7C]">
                  Pasang Maj Qur'an ke layar utama perangkat Anda untuk akses instan tanpa bilah URL browser dan dukungan membaca offline.
                </p>
                <div className="pt-1">
                  <PWAInstallButton variant="settings" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* PRAYER AUDIO SETTINGS SECTION */}

              {/* 1. Master Toggle */}
              <div className="p-4 rounded-2xl bg-[#082245] border border-[#29415E] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Pengingat Suara Waktu Salat & Adzan
                  </h4>
                  <p className="text-xs text-[#AABBD0]">
                    Bunyikan audio secara otomatis sesuai jadwal waktu salat
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prayerPrefs.enabled}
                    onChange={e => updatePrayerPrefs({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#04152D] border border-[#29415E] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#168BFF]"></div>
                </label>
              </div>

              {/* 2. Volume Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Volume2 className="w-4 h-4 text-[#168BFF]" />
                    <span>Volume Suara Adzan & Pengingat</span>
                  </label>
                  <span className="text-xs font-bold text-[#168BFF]">
                    {Math.round(prayerPrefs.volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={prayerPrefs.volume}
                  onChange={e => updatePrayerPrefs({ volume: parseFloat(e.target.value) })}
                  className="w-full accent-[#168BFF] cursor-pointer"
                />
              </div>

              {/* 3. Audio Test Buttons for all 4 types */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider block">
                    Uji Coba Suara Audio
                  </label>
                  {activeAlert && (
                    <button
                      onClick={stopPrayerAudio}
                      className="text-xs font-bold text-red-400 hover:underline cursor-pointer"
                    >
                      Hentikan Audio Uji
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => playTestAudio('subuh')}
                    className="p-3 rounded-xl border border-[#29415E] hover:border-[#168BFF] bg-[#082245] hover:bg-[#0c2f5d] text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-[#168BFF]">
                        Uji Adzan Subuh
                      </span>
                      <span className="text-[10px] text-[#AABBD0]">Khusus waktu Subuh</span>
                    </div>
                    <Play className="w-4 h-4 text-[#168BFF] shrink-0" />
                  </button>

                  <button
                    onClick={() => playTestAudio('general')}
                    className="p-3 rounded-xl border border-[#29415E] hover:border-[#168BFF] bg-[#082245] hover:bg-[#0c2f5d] text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-[#168BFF]">
                        Uji Adzan Umum
                      </span>
                      <span className="text-[10px] text-[#AABBD0]">Dzuhur, Ashar, Maghrib, Isya</span>
                    </div>
                    <Play className="w-4 h-4 text-[#168BFF] shrink-0" />
                  </button>

                  <button
                    onClick={() => playTestAudio('imsak')}
                    className="p-3 rounded-xl border border-[#29415E] hover:border-[#168BFF] bg-[#082245] hover:bg-[#0c2f5d] text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-[#168BFF]">
                        Uji Pengingat Imsak
                      </span>
                      <span className="text-[10px] text-[#AABBD0]">Sirine waktu Imsak</span>
                    </div>
                    <Play className="w-4 h-4 text-[#168BFF] shrink-0" />
                  </button>

                  <button
                    onClick={() => playTestAudio('terbit')}
                    className="p-3 rounded-xl border border-[#29415E] hover:border-[#168BFF] bg-[#082245] hover:bg-[#0c2f5d] text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-[#168BFF]">
                        Uji Suara Ayam (Terbit)
                      </span>
                      <span className="text-[10px] text-[#AABBD0]">Pengingat waktu Syuruq</span>
                    </div>
                    <Play className="w-4 h-4 text-[#168BFF] shrink-0" />
                  </button>
                </div>
              </div>

              {/* 4. Per-prayer Enable Checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Pilih Waktu yang Membunyikan Audio
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'imsak', label: 'Imsak', desc: 'Suara Sirine Imsak' },
                    { key: 'subuh', label: 'Subuh', desc: 'Audio Adzan Subuh' },
                    { key: 'terbit', label: 'Terbit (Syuruq)', desc: 'Suara Ayam Berkokok' },
                    { key: 'dzuhur', label: 'Dzuhur', desc: 'Audio Adzan Umum' },
                    { key: 'ashar', label: 'Ashar', desc: 'Audio Adzan Umum' },
                    { key: 'maghrib', label: 'Maghrib', desc: 'Audio Adzan Umum' },
                    { key: 'isya', label: 'Isya', desc: 'Audio Adzan Umum' },
                  ].map(p => (
                    <label
                      key={p.key}
                      className="p-2.5 rounded-xl border border-[#29415E] bg-[#082245] hover:bg-[#0c2f5d] flex items-center justify-between cursor-pointer transition"
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {p.label}
                        </span>
                        <span className="text-[10px] text-[#AABBD0]">{p.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={prayerPrefs.enabledPrayers[p.key as keyof typeof prayerPrefs.enabledPrayers]}
                        onChange={e => {
                          const updated = {
                            ...prayerPrefs.enabledPrayers,
                            [p.key]: e.target.checked,
                          };
                          updatePrayerPrefs({ enabledPrayers: updated });
                        }}
                        className="w-4 h-4 accent-[#168BFF] rounded-md cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Device Notifications */}
              <div className="p-3.5 rounded-xl bg-[#082245] border border-[#29415E] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#168BFF]" />
                    <span className="text-xs font-bold text-white">
                      Izin Notifikasi Perangkat
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      notificationPermission === 'granted'
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                        : notificationPermission === 'denied'
                        ? 'bg-red-950/60 border-red-800 text-red-400'
                        : 'bg-amber-950/60 border-amber-800 text-amber-400'
                    }`}
                  >
                    {notificationPermission === 'granted'
                      ? 'Diizinkan'
                      : notificationPermission === 'denied'
                      ? 'Ditolak'
                      : 'Belum Diaktifkan'}
                  </span>
                </div>

                {notificationPermission !== 'granted' && (
                  <button
                    onClick={requestNotificationPermission}
                    className="w-full py-2 rounded-lg bg-[#168BFF] hover:bg-[#168BFF]/90 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Aktifkan Notifikasi Masuk Waktu Salat
                  </button>
                )}
              </div>

              {/* 6. Realistic Browser Policy Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-2.5 text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Catatan Perangkat:</strong> Browser modern dan sistem operasi membatasi pemutaran audio saat tab atau aplikasi ditutup sepenuhnya. Biarkan aplikasi tetap terbuka atau berjalan di latar belakang (background) agar audio pengingat dapat berbunyi tepat waktu.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#29415E] bg-[#082245] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#AABBD0] hover:text-white transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Atur Ulang Default</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Tersimpan</span>
              </span>
            )}
            <button
              onClick={() => {
                stopPrayerAudio();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#168BFF] hover:bg-[#168BFF]/90 text-white text-xs font-bold transition shadow-md cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
