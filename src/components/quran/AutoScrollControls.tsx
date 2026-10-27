import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, ChevronsDown, FastForward } from 'lucide-react';

interface AutoScrollControlsProps {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  initialSpeed?: number;
}

export const AutoScrollControls: React.FC<AutoScrollControlsProps> = ({
  scrollContainerRef,
  initialSpeed = 2,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<number>(initialSpeed);
  const [isOpen, setIsOpen] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Speed multiplier to pixels per second
  // speed 1 = 25px/sec, speed 2 = 50px/sec, speed 3 = 85px/sec, speed 4 = 130px/sec, speed 5 = 190px/sec
  const speedToPixelsPerSec = useCallback((s: number) => {
    switch (s) {
      case 1:
        return 22;
      case 2:
        return 45;
      case 3:
        return 80;
      case 4:
        return 125;
      case 5:
        return 180;
      default:
        return 45;
    }
  }, []);

  const stopScrolling = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastTimeRef.current = null;
    setIsActive(false);
    setIsPaused(false);
  }, []);

  const pauseScrolling = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastTimeRef.current = null;
    setIsPaused(true);
  }, []);

  const step = useCallback(
    (currentTime: number) => {
      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        stopScrolling();
        return;
      }

      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }
      const deltaSec = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const pxPerSec = speedToPixelsPerSec(speed);
      const scrollAmount = pxPerSec * deltaSec;

      const container = scrollContainerRef?.current || document.documentElement;
      const isDocument = container === document.documentElement;

      const currentScroll = isDocument ? window.scrollY : container.scrollTop;
      const maxScroll = isDocument
        ? document.documentElement.scrollHeight - window.innerHeight
        : container.scrollHeight - container.clientHeight;

      if (currentScroll >= maxScroll - 5) {
        // Reached the end of the surah
        stopScrolling();
        return;
      }

      if (isDocument) {
        window.scrollBy({ top: scrollAmount, behavior: 'instant' as ScrollBehavior });
      } else {
        container.scrollTop += scrollAmount;
      }

      animationFrameRef.current = requestAnimationFrame(step);
    },
    [scrollContainerRef, speed, speedToPixelsPerSec, stopScrolling]
  );

  const startScrolling = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    lastTimeRef.current = null;
    setIsActive(true);
    setIsPaused(false);
    animationFrameRef.current = requestAnimationFrame(step);
  }, [step]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // Update animation frame when speed changes while active
  useEffect(() => {
    if (isActive && !isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
      animationFrameRef.current = requestAnimationFrame(step);
    }
  }, [speed, isActive, isPaused, step]);

  const cycleSpeed = () => {
    setSpeed(prev => (prev >= 5 ? 1 : prev + 1));
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 left-4 z-40">
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#E4E9F0]">
        {!isActive ? (
          <button
            onClick={startScrolling}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F2FF] hover:bg-[#0756C9] hover:text-white text-[#0756C9] text-xs font-semibold transition active:scale-95 cursor-pointer shadow-xs"
            title="Mulai Auto-Scroll Tilawah"
          >
            <ChevronsDown className="w-4 h-4 animate-bounce" />
            <span>Auto-Scroll</span>
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={startScrolling}
                className="p-2 rounded-full bg-[#E8F2FF] text-[#0756C9] hover:bg-[#0756C9] hover:text-white transition active:scale-95 cursor-pointer"
                title="Lanjutkan Auto-Scroll"
              >
                <Play className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                onClick={pauseScrolling}
                className="p-2 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition active:scale-95 cursor-pointer"
                title="Jeda Auto-Scroll"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={stopScrolling}
              className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition active:scale-95 cursor-pointer"
              title="Hentikan Auto-Scroll"
            >
              <Square className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={cycleSpeed}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDFBF5] hover:bg-[#E8F2FF] text-[#061A35] text-xs font-bold border border-[#E4E9F0] transition cursor-pointer"
              title="Ubah Kecepatan Auto-Scroll"
            >
              <FastForward className="w-3.5 h-3.5 text-[#0756C9]" />
              <span>{speed}x</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
