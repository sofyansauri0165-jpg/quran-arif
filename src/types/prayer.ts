export type PrayerKey = 'imsak' | 'subuh' | 'terbit' | 'dhuha' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

export interface PrayerSchedule {
  id: string | number;
  lokasi: string;
  daerah: string;
  tanggal: string;
  date: string; // YYYY-MM-DD
  imsak: string; // HH:mm
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface PrayerCity {
  id: string;
  lokasi: string;
}

export interface PrayerAudioPreferences {
  enabled: boolean; // Master toggle
  volume: number; // 0.0 - 1.0
  autoStopAfterSeconds?: number;
  enabledPrayers: {
    imsak: boolean;
    subuh: boolean;
    terbit: boolean;
    dzuhur: boolean;
    ashar: boolean;
    maghrib: boolean;
    isya: boolean;
  };
  cityId: string;
  cityName: string;
}

export interface ActivePrayerAlert {
  prayerKey: PrayerKey | 'test';
  prayerName: string;
  audioTitle: string;
  audioUrl: string;
  startedAt: number;
}
