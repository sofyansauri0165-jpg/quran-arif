import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import { getSettings } from '../storage/persistence';

export type AudioMode = 'ayah' | 'surah' | 'idle';

export interface PlayingState {
  mode: AudioMode;
  surahNumber: number;
  surahName: string;
  ayahNumber?: number;
  totalAyah?: number;
  title: string;
  reciterId: string;
  reciterName: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
}

interface AudioContextType {
  playingState: PlayingState;
  playAyah: (params: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    audioUrls: Record<string, string>;
    totalAyah?: number;
    autoAdvance?: boolean;
    onAyahEnd?: () => void;
  }) => void;
  playFullSurah: (params: {
    surahNumber: number;
    surahName: string;
    audioFullUrls: Record<string, string>;
    totalAyah: number;
  }) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  setReciter: (reciterId: string) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reciterId, setReciterId] = useState<string>(() => {
    return getSettings().selectedReciter || '05';
  });

  const [playingState, setPlayingState] = useState<PlayingState>({
    mode: 'idle',
    surahNumber: 0,
    surahName: '',
    title: '',
    reciterId: '05',
    reciterName: APP_CONFIG.reciters.find(r => r.id === '05')?.name || 'Misyari Rasyid Al-Afasi',
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndCallbackRef = useRef<(() => void) | null>(null);

  // Initialize single HTMLAudioElement
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setPlayingState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const onLoadedMetadata = () => {
      setPlayingState(prev => ({
        ...prev,
        duration: audio.duration || 0,
        isLoading: false,
        error: null,
      }));
    };

    const onWaiting = () => {
      setPlayingState(prev => ({ ...prev, isLoading: true }));
    };

    const onPlaying = () => {
      setPlayingState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
    };

    const onPause = () => {
      setPlayingState(prev => ({ ...prev, isPlaying: false }));
    };

    const onEnded = () => {
      setPlayingState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      if (onEndCallbackRef.current) {
        onEndCallbackRef.current();
      }
    };

    const onError = () => {
      setPlayingState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: 'Gagal memuat audio murottal. Periksa koneksi internet Anda.',
      }));
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.src = '';
    };
  }, []);

  const getReciterName = useCallback((id: string) => {
    return APP_CONFIG.reciters.find(r => r.id === id)?.name || 'Misyari Rasyid Al-Afasi';
  }, []);

  const playAyah = useCallback(
    ({
      surahNumber,
      surahName,
      ayahNumber,
      audioUrls,
      totalAyah,
      onAyahEnd,
    }: {
      surahNumber: number;
      surahName: string;
      ayahNumber: number;
      audioUrls: Record<string, string>;
      totalAyah?: number;
      autoAdvance?: boolean;
      onAyahEnd?: () => void;
    }) => {
      const audio = audioRef.current;
      if (!audio) return;

      const targetUrl = audioUrls[reciterId] || audioUrls['05'] || Object.values(audioUrls)[0];
      if (!targetUrl) {
        setPlayingState(prev => ({
          ...prev,
          error: 'Audio untuk ayat ini belum tersedia.',
        }));
        return;
      }

      onEndCallbackRef.current = onAyahEnd || null;

      audio.src = targetUrl;
      audio.currentTime = 0;
      setPlayingState({
        mode: 'ayah',
        surahNumber,
        surahName,
        ayahNumber,
        totalAyah,
        title: `QS. ${surahName}: ${ayahNumber}`,
        reciterId,
        reciterName: getReciterName(reciterId),
        isPlaying: true,
        currentTime: 0,
        duration: 0,
        isLoading: true,
        error: null,
      });

      audio.play().catch(e => {
        console.warn('Playback error:', e);
        setPlayingState(prev => ({
          ...prev,
          isPlaying: false,
          isLoading: false,
          error: 'Tidak dapat memulai pemutaran audio.',
        }));
      });
    },
    [reciterId, getReciterName]
  );

  const playFullSurah = useCallback(
    ({
      surahNumber,
      surahName,
      audioFullUrls,
      totalAyah,
    }: {
      surahNumber: number;
      surahName: string;
      audioFullUrls: Record<string, string>;
      totalAyah: number;
    }) => {
      const audio = audioRef.current;
      if (!audio) return;

      const targetUrl = audioFullUrls[reciterId] || audioFullUrls['05'] || Object.values(audioFullUrls)[0];
      if (!targetUrl) {
        setPlayingState(prev => ({
          ...prev,
          error: 'Audio lengkap surat belum tersedia.',
        }));
        return;
      }

      onEndCallbackRef.current = null;

      audio.src = targetUrl;
      audio.currentTime = 0;
      setPlayingState({
        mode: 'surah',
        surahNumber,
        surahName,
        totalAyah,
        title: `Murottal QS. ${surahName} (Penuh)`,
        reciterId,
        reciterName: getReciterName(reciterId),
        isPlaying: true,
        currentTime: 0,
        duration: 0,
        isLoading: true,
        error: null,
      });

      audio.play().catch(e => {
        console.warn('Playback error:', e);
        setPlayingState(prev => ({
          ...prev,
          isPlaying: false,
          isLoading: false,
          error: 'Tidak dapat memulai pemutaran audio.',
        }));
      });
    },
    [reciterId, getReciterName]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(e => console.warn(e));
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (playingState.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.warn(e));
    }
  }, [playingState.isPlaying]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    setPlayingState(prev => ({
      ...prev,
      mode: 'idle',
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      error: null,
    }));
  }, []);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current && Number.isFinite(seconds)) {
      audioRef.current.currentTime = seconds;
      setPlayingState(prev => ({ ...prev, currentTime: seconds }));
    }
  }, []);

  const setReciter = useCallback((newReciterId: string) => {
    setReciterId(newReciterId);
    setPlayingState(prev => ({
      ...prev,
      reciterId: newReciterId,
      reciterName: getReciterName(newReciterId),
    }));
  }, [getReciterName]);

  return (
    <AudioContext.Provider
      value={{
        playingState,
        playAyah,
        playFullSurah,
        pause,
        resume,
        togglePlay,
        stop,
        seek,
        setReciter,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
