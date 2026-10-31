import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { APP_CONFIG } from '../../config/appConfig';
import { PWAInstructionsModal } from './PWAInstructionsModal';
import { Download, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface PWAInstallBannerProps {
  currentTab: string;
  hasActiveAudio?: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  currentTab,
  hasActiveAudio = false,
}) => {
  const {
    isInstalled,
    isDismissed,
    isIOS,
    canPromptNative,
    isInstalling,
    install,
    dismiss,
  } = usePWAInstall();

  const [isVisible, setIsVisible] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Delay appearance by 2.5 seconds after page load to prioritize content render
  useEffect(() => {
    if (isInstalled || isDismissed) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isInstalled, isDismissed]);

  // NEVER show floating banner when user is in the Quran Reader
  // (Requirement: Jangan mengganggu pengguna saat membaca ayat)
  if (currentTab === 'reader') {
    return null;
  }

  // If already installed, dismissed, or not ready, render nothing
  if (isInstalled || isDismissed || !isVisible) {
    return null;
  }

  const handleInstallClick = async () => {
    if (canPromptNative) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => setIsVisible(false), 2000);
      }
    } else {
      // iOS Safari or browser without beforeinstallprompt
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    dismiss(7); // Snooze for 7 days
  };

  return (
    <>
      {/* Floating PWA Card */}
      <div
        role="region"
        aria-label="Ajakan Instalasi Maj Qur'an"
        className={`fixed left-4 right-4 md:left-6 md:right-auto md:w-[420px] max-w-[calc(100%-32px)] z-45 transition-all duration-300 ${
          hasActiveAudio
            ? 'bottom-42 md:bottom-6' // Raised above mini-player on mobile
            : 'bottom-20 md:bottom-6' // Elevated above bottom nav on mobile
        }`}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="bg-[#082245]/98 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-2xl border border-[#29415E] text-white relative animate-slide-up">
          {/* Close button (accessible) */}
          <button
            onClick={handleDismiss}
            aria-label="Tutup ajakan instalasi"
            className="absolute right-3.5 top-3.5 p-1 rounded-xl text-[#AABBD0] hover:text-white hover:bg-[#0c2e5b] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top content row */}
          <div className="flex items-start gap-3.5 pr-6">
            {/* Logo */}
            <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-white/20 shadow-xs shrink-0 flex items-center justify-center">
              <img
                src={APP_CONFIG.logoUrl}
                alt="Logo Maj Qur'an"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
                  Install Maj Qur’an
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#168BFF]/20 text-[#168BFF] font-bold text-[10px] border border-[#168BFF]/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>PWA</span>
                </span>
              </div>
              <p className="text-xs text-[#AABBD0] leading-snug line-clamp-2">
                Akses Al-Qur’an lebih praktis langsung dari layar utama perangkat Anda.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 pt-3 border-t border-[#29415E] flex items-center justify-end gap-2.5">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#AABBD0] hover:text-white hover:bg-[#0c2e5b] transition cursor-pointer"
            >
              Nanti
            </button>

            <button
              onClick={handleInstallClick}
              disabled={isInstalling || installSuccess}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#168BFF] hover:bg-[#168BFF]/90 text-white text-xs font-bold shadow-lg shadow-[#168BFF]/20 transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {installSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Berhasil Terpasang!</span>
                </>
              ) : isInstalling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyiapkan...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Install Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* iOS & Desktop Instruction Modal */}
      <PWAInstructionsModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        isIOS={isIOS}
      />
    </>
  );
};
