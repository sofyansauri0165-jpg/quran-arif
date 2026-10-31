import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Pause, X, Volume2, AlertCircle, Loader2 } from 'lucide-react';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const MiniAudioPlayer: React.FC = () => {
  const { playingState, togglePlay, stop, seek } = useAudio();

  if (playingState.mode === 'idle') {
    return null;
  }

  const progressPercent =
    playingState.duration > 0
      ? (playingState.currentTime / playingState.duration) * 100
      : 0;

  return (
    <div className="fixed bottom-18 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
      <div className="bg-[#082245]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#29415E] p-3.5 text-white">
        {/* Top Info row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#0c2e5b] border border-[#168BFF]/30 flex items-center justify-center text-[#168BFF] shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold truncate text-white">
                {playingState.title}
              </h4>
              <p className="text-[11px] text-[#AABBD0] truncate">
                Qari: {playingState.reciterName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={togglePlay}
              disabled={playingState.isLoading}
              className="w-8 h-8 rounded-xl bg-[#168BFF] hover:bg-[#168BFF]/85 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
              aria-label={playingState.isPlaying ? 'Jeda Audio' : 'Putar Audio'}
            >
              {playingState.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : playingState.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
            <button
              onClick={stop}
              className="p-1.5 rounded-xl hover:bg-[#0c2e5b] text-[#AABBD0] hover:text-white transition cursor-pointer"
              title="Hentikan Audio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error notice if failed */}
        {playingState.error && (
          <div className="mb-2 p-1.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
            <span className="truncate">{playingState.error}</span>
          </div>
        )}

        {/* Progress bar & Seek */}
        <div className="space-y-1">
          <div className="relative w-full h-1.5 bg-[#04152D] rounded-full overflow-hidden cursor-pointer border border-white/10">
            <input
              type="range"
              min={0}
              max={playingState.duration || 100}
              value={playingState.currentTime}
              onChange={e => seek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="h-full bg-[#168BFF] transition-all shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-[#7E95B1] font-mono">
            <span>{formatTime(playingState.currentTime)}</span>
            <span>{formatTime(playingState.duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
