import { useEffect, useState, useCallback } from 'react';

const DISMISS_STORAGE_KEY = 'maj_quran_pwa_dismissed_until';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type PWAInstallOutcome = 'accepted' | 'dismissed' | 'unsupported' | 'failed';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default true until verified

  // Check standalone mode and platform
  useEffect(() => {
    // 1. Detect standalone mode (already installed)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const checkStandalone = () => {
      const standaloneActive =
        mediaQuery.matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(standaloneActive);
      setIsInstalled(standaloneActive);
    };
    checkStandalone();

    // Listen to display-mode changes
    const onMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsStandalone(true);
        setIsInstalled(true);
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onMediaChange);
    } else {
      mediaQuery.addListener(onMediaChange);
    }

    // 2. Detect iOS / iPadOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad OS
    setIsIOS(isIOSDevice);

    // 3. Check snooze / dismissal status
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedUntil) {
        const untilTime = parseInt(dismissedUntil, 10);
        if (Date.now() < untilTime) {
          setIsDismissed(true);
        } else {
          localStorage.removeItem(DISMISS_STORAGE_KEY);
          setIsDismissed(false);
        }
      } else {
        setIsDismissed(false);
      }
    } catch (e) {
      setIsDismissed(false);
    }

    // 4. Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 5. Capture appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsStandalone(true);
      setDeferredPrompt(null);
      setIsInstalling(false);
      try {
        localStorage.removeItem(DISMISS_STORAGE_KEY);
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', onMediaChange);
      } else {
        mediaQuery.removeListener(onMediaChange);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Dismiss / Snooze installation banner
  const dismiss = useCallback((days: number = 7) => {
    setIsDismissed(true);
    try {
      const until = Date.now() + days * 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISS_STORAGE_KEY, until.toString());
    } catch (e) {
      // ignore
    }
  }, []);

  // Reset snooze (e.g. if user clicks install manually from header/settings)
  const resetDismissal = useCallback(() => {
    setIsDismissed(false);
    try {
      localStorage.removeItem(DISMISS_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  // Trigger installation flow
  const install = useCallback(async (): Promise<PWAInstallOutcome> => {
    if (!deferredPrompt) {
      return 'unsupported';
    }

    try {
      setIsInstalling(true);
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setIsInstalling(false);
        return 'accepted';
      } else {
        setIsInstalling(false);
        // User clicked cancel on native dialog; dismiss widget for 3 days
        dismiss(3);
        return 'dismissed';
      }
    } catch (err) {
      console.warn('PWA install error:', err);
      setIsInstalling(false);
      return 'failed';
    }
  }, [deferredPrompt, dismiss]);

  return {
    isInstallable: !!deferredPrompt || isIOS,
    canPromptNative: !!deferredPrompt,
    isInstalled: isInstalled || isStandalone,
    isIOS,
    isInstalling,
    isDismissed,
    dismiss,
    resetDismissal,
    install,
  };
}
