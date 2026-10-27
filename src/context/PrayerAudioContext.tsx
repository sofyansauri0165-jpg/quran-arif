import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import {
  PrayerKey,
  PrayerSchedule,
  PrayerAudioPreferences,
  ActivePrayerAlert,
} from '../types/prayer';
import { getPrayerSchedule } from '../services/prayerApi';

const PREFS_STORAGE_KEY = 'maj_quran_prayer_prefs';
const TRIGGERED_STORAGE_KEY = 'maj_quran_prayer_triggered';

export const DEFAULT_PRAYER_PREFS: PrayerAudioPreferences = {
  enabled: true,
  volume: 0.85,
  autoStopAfterSeconds: 240, // 4 minutes
  enabledPrayers: {
    imsak: true,
    subuh: true,
    terbit: true,
    dzuhur: true,
    ashar: true,
    maghrib: true,
    isya: true,
  },
  cityId: '1301',
  cityName: 'KOTA JAKARTA',
};

export const PRAYER_NAMES: Record<PrayerKey, string> = {
  imsak: 'Imsak',
  subuh: 'Subuh',
  terbit: 'Terbit (Syuruq)',
  dhuha: 'Dhuha',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya',
};

interface NextPrayerInfo {
  key: PrayerKey;
  name: string;
  time: string;
  remainingSeconds: number;
}

interface PrayerAudioContextType {
  schedule: PrayerSchedule | null;
  loadingSchedule: boolean;
  preferences: PrayerAudioPreferences;
  activeAlert: ActivePrayerAlert | null;
  nextPrayer: NextPrayerInfo | null;
  currentTimeString: string;
  autoplayBlocked: boolean;
  updatePreferences: (newPrefs: Partial<PrayerAudioPreferences>) => void;
  playTestAudio: (type: 'subuh' | 'general' | 'imsak' | 'terbit') => void;
  stopPrayerAudio: () => void;
  triggerPendingAudio: () => void;
  refreshSchedule: (cityId?: string, cityName?: string) => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  notificationPermission: NotificationPermission | 'unsupported';
}

const PrayerAudioContext = createContext<PrayerAudioContextType | undefined>(undefined);

// Helper to get audio URL for prayer
export function getPrayerAudioUrl(key: PrayerKey): string {
  switch (key) {
    case 'subuh':
      return APP_CONFIG.prayerAudios.subuh;
    case 'imsak':
      return APP_CONFIG.prayerAudios.imsak;
    case 'terbit':
      return APP_CONFIG.prayerAudios.terbit;
    case 'dzuhur':
    case 'ashar':
    case 'maghrib':
    case 'isya':
    default:
      return APP_CONFIG.prayerAudios.adzanGeneral;
  }
}

export function getPrayerAudioTitle(key: PrayerKey): string {
  switch (key) {
    case 'subuh':
      return 'Adzan Subuh (Lengkap)';
    case 'imsak':
      return 'Sirine / Pengingat Waktu Imsak';
    case 'terbit':
      return 'Suara Ayam Berkokok (Waktu Terbit)';
    case 'dzuhur':
    case 'ashar':
    case 'maghrib':
    case 'isya':
      return `Adzan ${PRAYER_NAMES[key]} (Waktu Salat Fardhu)`;
    default:
      return 'Pengingat Waktu Salat';
  }
}

export const PrayerAudioProvider: React.FC<{
  children: React.ReactNode;
  onBeforeAudioPlay?: () => void; // Used to pause Quran murottal
}> = ({ children, onBeforeAudioPlay }) => {
  const [preferences, setPreferences] = useState<PrayerAudioPreferences>(() => {
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY);
      if (stored) return { ...DEFAULT_PRAYER_PREFS, ...JSON.parse(stored) };
    } catch (e) {
      // ignore
    }
    return DEFAULT_PRAYER_PREFS;
  });

  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [activeAlert, setActiveAlert] = useState<ActivePrayerAlert | null>(null);
  const [currentTimeString, setCurrentTimeString] = useState<string>('');
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingAudioPlayRef = useRef<(() => void) | null>(null);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = preferences.volume;
    audioRef.current = audio;

    const onEnded = () => {
      setActiveAlert(null);
      setAutoplayBlocked(false);
    };

    const onError = (e: any) => {
      console.warn('Prayer audio playback error:', e);
      setActiveAlert(null);
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.src = '';
    };
  }, []);

  // Sync volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = preferences.volume;
    }
  }, [preferences.volume]);

  // Load schedule on mount or city change
  const refreshSchedule = useCallback(
    async (cityId?: string, cityName?: string) => {
      const targetCityId = cityId || preferences.cityId;
      setLoadingSchedule(true);
      try {
        const data = await getPrayerSchedule(targetCityId);
        setSchedule(data);
        if (cityName) {
          const updated = { ...preferences, cityId: targetCityId, cityName };
          setPreferences(updated);
          localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
        }
      } catch (err) {
        console.warn('Error fetching prayer schedule:', err);
      } finally {
        setLoadingSchedule(false);
      }
    },
    [preferences]
  );

  useEffect(() => {
    refreshSchedule();
  }, [preferences.cityId]);

  // Update preferences helper
  const updatePreferences = (newPrefs: Partial<PrayerAudioPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  // Request system notification permission
  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return false;
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (e) {
      return false;
    }
  };

  // Send desktop/device notification if permitted
  const sendNotification = (title: string, body: string) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: APP_CONFIG.logoUrl,
          badge: '/pwa-192x192.png',
          tag: 'prayer-alert',
        });
      } catch (e) {
        // Notification failed or blocked in iframe
      }
    }
  };

  // Stop prayer audio
  const stopPrayerAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    setActiveAlert(null);
    setAutoplayBlocked(false);
    pendingAudioPlayRef.current = null;
  }, []);

  // Play prayer audio core function
  const playAudio = useCallback(
    (url: string, title: string, prayerKey: PrayerKey | 'test', prayerName: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      // Pause Quran murottal so audio never overlaps
      if (onBeforeAudioPlay) {
        onBeforeAudioPlay();
      }

      audio.pause();
      audio.currentTime = 0;
      audio.src = url;
      audio.volume = preferences.volume;

      const alertData: ActivePrayerAlert = {
        prayerKey,
        prayerName,
        audioTitle: title,
        audioUrl: url,
        startedAt: Date.now(),
      };
      setActiveAlert(alertData);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAutoplayBlocked(false);
            pendingAudioPlayRef.current = null;
          })
          .catch(err => {
            console.warn('Autoplay prevented by browser:', err);
            // Autoplay blocked: user interaction required
            setAutoplayBlocked(true);
            pendingAudioPlayRef.current = () => {
              audio.play().catch(e => console.warn(e));
              setAutoplayBlocked(false);
            };
          });
      }
    },
    [onBeforeAudioPlay, preferences.volume]
  );

  // Trigger pending audio on user click
  const triggerPendingAudio = useCallback(() => {
    if (pendingAudioPlayRef.current) {
      pendingAudioPlayRef.current();
      pendingAudioPlayRef.current = null;
    } else if (activeAlert) {
      audioRef.current?.play().catch(e => console.warn(e));
      setAutoplayBlocked(false);
    }
  }, [activeAlert]);

  // Test Audio Handler for all 4 audio types
  const playTestAudio = useCallback(
    (type: 'subuh' | 'general' | 'imsak' | 'terbit') => {
      let url: string = APP_CONFIG.prayerAudios.adzanGeneral;
      let title = 'Uji Adzan Umum (Dzuhur/Ashar/Maghrib/Isya)';
      let name = 'Adzan Umum (Uji Coba)';

      if (type === 'subuh') {
        url = APP_CONFIG.prayerAudios.subuh;
        title = 'Uji Adzan Subuh (Asshalatu khairum minan naum)';
        name = 'Adzan Subuh';
      } else if (type === 'imsak') {
        url = APP_CONFIG.prayerAudios.imsak;
        title = 'Uji Sirine / Pengingat Imsak';
        name = 'Imsak';
      } else if (type === 'terbit') {
        url = APP_CONFIG.prayerAudios.terbit;
        title = 'Uji Suara Ayam Berkokok (Terbit Fajar)';
        name = 'Terbit (Syuruq)';
      }

      playAudio(url, title, 'test', name);
    },
    [playAudio]
  );

  // Calculate next prayer and execute schedule timer check
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentSeconds = String(now.getSeconds()).padStart(2, '0');
      const currentTimeHM = `${currentHours}:${currentMinutes}`;
      setCurrentTimeString(`${currentTimeHM}:${currentSeconds}`);

      if (!schedule) return;

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayDate = `${year}-${month}-${day}`;

      // Refresh schedule if date changed
      if (schedule.date && schedule.date !== todayDate) {
        refreshSchedule();
        return;
      }

      const prayersOrder: PrayerKey[] = [
        'imsak',
        'subuh',
        'terbit',
        'dhuha',
        'dzuhur',
        'ashar',
        'maghrib',
        'isya',
      ];

      // Find next prayer and remaining seconds
      let foundNext: NextPrayerInfo | null = null;
      const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      for (const pKey of prayersOrder) {
        const timeStr = schedule[pKey];
        if (!timeStr) continue;
        const [pHours, pMins] = timeStr.split(':').map(n => parseInt(n, 10));
        const pTotalSeconds = pHours * 3600 + pMins * 60;

        if (pTotalSeconds > nowSeconds) {
          foundNext = {
            key: pKey,
            name: PRAYER_NAMES[pKey],
            time: timeStr,
            remainingSeconds: pTotalSeconds - nowSeconds,
          };
          break;
        }
      }

      // If past Isya, next prayer is Imsak tomorrow
      if (!foundNext && schedule.imsak) {
        const [iHours, iMins] = schedule.imsak.split(':').map(n => parseInt(n, 10));
        const iTotalSeconds = iHours * 3600 + iMins * 60;
        const remainingToMidnight = 86400 - nowSeconds;
        foundNext = {
          key: 'imsak',
          name: 'Imsak (Besok)',
          time: schedule.imsak,
          remainingSeconds: remainingToMidnight + iTotalSeconds,
        };
      }
      setNextPrayer(foundNext);

      // Check if current minute matches any scheduled prayer
      // Allowed keys for audio alerts
      const auditablePrayers: (keyof typeof preferences.enabledPrayers)[] = [
        'imsak',
        'subuh',
        'terbit',
        'dzuhur',
        'ashar',
        'maghrib',
        'isya',
      ];

      for (const pKey of auditablePrayers) {
        const scheduledTime = schedule[pKey];
        if (!scheduledTime) continue;

        if (scheduledTime === currentTimeHM) {
          // Unique key for preventing duplicate trigger: date_prayerKey
          const triggerKey = `${todayDate}_${pKey}`;

          let triggeredMap: Record<string, boolean> = {};
          try {
            const raw = localStorage.getItem(TRIGGERED_STORAGE_KEY);
            if (raw) triggeredMap = JSON.parse(raw);
          } catch (e) {
            // ignore
          }

          // Trigger MAXIMAL ONCE per scheduled time!
          if (!triggeredMap[triggerKey]) {
            // Mark as triggered immediately
            triggeredMap[triggerKey] = true;
            try {
              localStorage.setItem(TRIGGERED_STORAGE_KEY, JSON.stringify(triggeredMap));
            } catch (e) {
              // ignore
            }

            // Check if audio is enabled
            if (preferences.enabled && preferences.enabledPrayers[pKey]) {
              const url = getPrayerAudioUrl(pKey);
              const title = getPrayerAudioTitle(pKey);
              const pName = PRAYER_NAMES[pKey];

              sendNotification(
                `Waktu ${pName} Telah Tiba!`,
                `Waktu salat ${pName} untuk wilayah ${schedule.lokasi} telah tiba (${scheduledTime} WIB).`
              );

              playAudio(url, title, pKey, pName);
            }
          }
        }
      }
    };

    // Run immediately
    checkSchedule();
    // Run interval every 1 second
    const interval = setInterval(checkSchedule, 1000);

    return () => clearInterval(interval);
  }, [schedule, preferences, playAudio, refreshSchedule]);

  return (
    <PrayerAudioContext.Provider
      value={{
        schedule,
        loadingSchedule,
        preferences,
        activeAlert,
        nextPrayer,
        currentTimeString,
        autoplayBlocked,
        updatePreferences,
        playTestAudio,
        stopPrayerAudio,
        triggerPendingAudio,
        refreshSchedule,
        requestNotificationPermission,
        notificationPermission,
      }}
    >
      {children}
    </PrayerAudioContext.Provider>
  );
};

export function usePrayerAudio() {
  const context = useContext(PrayerAudioContext);
  if (!context) {
    throw new Error('usePrayerAudio must be used within a PrayerAudioProvider');
  }
  return context;
}
