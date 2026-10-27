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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#E4E9F0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E9F0] bg-[#FDFBF5]">
          <div>
            <h3 className="font-bold text-[#061A35] text-base">Pengaturan Aplikasi</h3>
            <p className="text-[11px] text-[#5E6B7C]">
              Sesuaikan preferensi membaca tilawah dan pengingat waktu salat
            </p>
          </div>
          <button
            onClick={() => {
              stopPrayerAudio();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-[#E8F2FF] text-[#5E6B7C] hover:text-[#061A35] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers: Tilawah vs Jadwal Salat */}
        <div className="flex items-center border-b border-[#E4E9F0] bg-[#FDFBF5]/50 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('quran')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quran'
                ? 'border-[#0756C9] text-[#0756C9]'
                : 'border-transparent text-[#5E6B7C] hover:text-[#061A35]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Al-Qur'an & Tilawah</span>
          </button>

          <button
            onClick={() => setActiveTab('prayer')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'prayer'
                ? 'border-[#0756C9] text-[#0756C9]'
                : 'border-transparent text-[#5E6B7C] hover:text-[#061A35]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Jadwal Salat & Audio Adzan</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#061A35]">
          {activeTab === 'quran' ? (
            <>
              {/* 1. Arabic Font Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#061A35] uppercase tracking-wider">
                    <Type className="w-4 h-4 text-[#0756C9]" />
                    <span>Ukuran Teks Arab</span>
                  </label>
                  <span className="text-xs font-semibold text-[#0756C9] bg-[#E8F2FF] px-2 py-0.5 rounded-md">
                    {fontSizes.find(f => f.id === current.arabicFontSize)?.label}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#FDFBF5] border border-[#E4E9F0] rounded-xl">
                  {fontSizes.map(f => (
                    <button
                      key={f.id}
                      onClick={() => updateSetting('arabicFontSize', f.id as any)}
                      className={`py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        current.arabicFontSize === f.id
                          ? 'bg-[#0756C9] text-white shadow-xs'
                          : 'text-[#5E6B7C] hover:text-[#061A35] hover:bg-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Live Preview Box */}
                <div className="p-4 rounded-xl bg-[#FDFBF5] border border-[#E4E9F0] text-right">
                  <span className="text-[10px] font-semibold text-[#5E6B7C] block mb-1 text-left uppercase">
                    Pratinjau Teks:
                  </span>
                  <p
                    className={`font-arabic text-[#061A35] ${
                      fontSizes.find(f => f.id === current.arabicFontSize)?.class || 'text-3xl'
                    }`}
                  >
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                </div>
              </div>

              {/* 2. Reciter Choice */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#061A35] uppercase tracking-wider">
                  <Volume2 className="w-4 h-4 text-[#0756C9]" />
                  <span>Qari Pilihan (Murottal Audio)</span>
                </label>
                <select
                  value={current.selectedReciter}
                  onChange={e => updateSetting('selectedReciter', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E4E9F0] text-sm text-[#061A35] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#168BFF] cursor-pointer"
                >
                  {APP_CONFIG.reciters.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Toggles for Translation & Transliteration */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-[#061A35] uppercase tracking-wider">
                  <Languages className="w-4 h-4 text-[#0756C9]" />
                  <span>Tampilan Teks</span>
                </label>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-[#E4E9F0] hover:bg-[#FDFBF5] cursor-pointer transition">
                    <div>
                      <span className="text-sm font-semibold block text-[#061A35]">
                        Terjemahan Bahasa Indonesia
                      </span>
                      <span className="text-xs text-[#5E6B7C]">
                        Tampilkan arti ayat bahasa Indonesia resmi Kemenag
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={current.showTranslation}
                      onChange={e => updateSetting('showTranslation', e.target.checked)}
                      className="w-4 h-4 accent-[#0756C9] rounded-md cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-[#E4E9F0] hover:bg-[#FDFBF5] cursor-pointer transition">
                    <div>
                      <span className="text-sm font-semibold block text-[#061A35]">
                        Transliterasi Latin
                      </span>
                      <span className="text-xs text-[#5E6B7C]">
                        Tampilkan cara baca huruf latin untuk membantu pelafalan
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={current.showTransliteration}
                      onChange={e => updateSetting('showTransliteration', e.target.checked)}
                      className="w-4 h-4 accent-[#0756C9] rounded-md cursor-pointer"
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
            </>
          ) : (
            <>
              {/* PRAYER AUDIO SETTINGS SECTION */}

              {/* 1. Master Toggle */}
              <div className="p-4 rounded-2xl bg-[#E8F2FF]/60 border border-[#168BFF]/20 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#061A35]">
                    Pengingat Suara Waktu Salat & Adzan
                  </h4>
                  <p className="text-xs text-[#5E6B7C]">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0756C9]"></div>
                </label>
              </div>

              {/* 2. Volume Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#061A35] uppercase tracking-wider">
                    <Volume2 className="w-4 h-4 text-[#0756C9]" />
                    <span>Volume Suara Adzan & Pengingat</span>
                  </label>
                  <span className="text-xs font-bold text-[#0756C9]">
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
                  className="w-full accent-[#0756C9] cursor-pointer"
                />
              </div>

              {/* 3. Audio Test Buttons for all 4 types */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#061A35] uppercase tracking-wider block">
                    Uji Coba Suara Audio
                  </label>
                  {activeAlert && (
                    <button
                      onClick={stopPrayerAudio}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Hentikan Audio Uji
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => playTestAudio('subuh')}
                    className="p-3 rounded-xl border border-[#E4E9F0] hover:border-[#0756C9] bg-white hover:bg-[#E8F2FF] text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#061A35] block group-hover:text-[#0756C9]">
                        Uji Adzan Subuh
                      </span>
                      <span className="text-[10px] text-[#5E6B7C]">Khusus waktu Subuh</span>
                    </div>
                    <Play className="w-4 h-4 text-[#0756C9] shrink-0" />
                  </button>

                  <button
                    onClick={() => playTestAudio('general')}
                    className="p-3 rounded-xl border border-[#E4E9F0] hover:border-[#0756C9] bg-white hover:bg-[#E8F2FF] text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#061A35] block group-hover:text-[#0756C9]">
                        Uji Adzan Umum
                      </span>
                      <span className="text-[10px] text-[#5E6B7C]">Dzuhur, Ashar, Maghrib, Isya</span>
                    </div>
                    <Play className="w-4 h-4 text-[#0756C9] shrink-0" />
                  </button>

                  <button
                    onClick={() => playTestAudio('imsak')}
                    className="p-3 rounded-xl border border-[#E4E9F0] hover:border-[#0756C9] bg-white hover:bg-[#E8F2FF] text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#061A35] block group-hover:text-[#0756C9]">
                        Uji Pengingat Imsak
                      </span>
                      <span className="text-[10px] text-[#5E6B7C]">Sirine waktu Imsak</span>
                    </div>
                    <Play className="w-4 h-4 text-[#0756C9] shrink-0" />
                  </button>

                  <button
                    onClick={() => playTestAudio('terbit')}
                    className="p-3 rounded-xl border border-[#E4E9F0] hover:border-[#0756C9] bg-white hover:bg-[#E8F2FF] text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#061A35] block group-hover:text-[#0756C9]">
                        Uji Suara Ayam (Terbit)
                      </span>
                      <span className="text-[10px] text-[#5E6B7C]">Pengingat waktu Syuruq</span>
                    </div>
                    <Play className="w-4 h-4 text-[#0756C9] shrink-0" />
                  </button>
                </div>
              </div>

              {/* 4. Per-prayer Enable Checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#061A35] uppercase tracking-wider block">
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
                      className="p-2.5 rounded-xl border border-[#E4E9F0] hover:bg-[#FDFBF5] flex items-center justify-between cursor-pointer transition"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#061A35] block">
                          {p.label}
                        </span>
                        <span className="text-[10px] text-[#5E6B7C]">{p.desc}</span>
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
                        className="w-4 h-4 accent-[#0756C9] rounded-md cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Device Notifications */}
              <div className="p-3.5 rounded-xl bg-[#FDFBF5] border border-[#E4E9F0] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#0756C9]" />
                    <span className="text-xs font-bold text-[#061A35]">
                      Izin Notifikasi Perangkat
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      notificationPermission === 'granted'
                        ? 'bg-emerald-100 text-emerald-700'
                        : notificationPermission === 'denied'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
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
                    className="w-full py-2 rounded-lg bg-[#0756C9] hover:bg-[#0645A8] text-white text-xs font-bold transition cursor-pointer"
                  >
                    Aktifkan Notifikasi Masuk Waktu Salat
                  </button>
                )}
              </div>

              {/* 6. Realistic Browser Policy Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Catatan Perangkat:</strong> Browser modern dan sistem operasi membatasi pemutaran audio saat tab atau aplikasi ditutup sepenuhnya. Biarkan aplikasi tetap terbuka atau berjalan di latar belakang (background) agar audio pengingat dapat berbunyi tepat waktu.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#E4E9F0] bg-[#FDFBF5] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5E6B7C] hover:text-[#061A35] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Atur Ulang Default</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Tersimpan</span>
              </span>
            )}
            <button
              onClick={() => {
                stopPrayerAudio();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
