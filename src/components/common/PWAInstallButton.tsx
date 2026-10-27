import React, { useState } from 'react';
import { Download, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstructionsModal } from './PWAInstructionsModal';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'hero' | 'settings' }> = ({
  variant = 'header',
}) => {
  const { isInstalled, isIOS, canPromptNative, isInstalling, install, resetDismissal } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed and running in standalone mode
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Aplikasi Sudah Terpasang (Mode Standalone)</span>
        </div>
      );
    }
    if (variant === 'hero') {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white font-semibold text-xs border border-white/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>Aplikasi Terpasang di Perangkat</span>
        </div>
      );
    }
    return null;
  }

  const handleTriggerInstall = async () => {
    resetDismissal();
    if (canPromptNative) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setJustInstalled(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  // Variant: Hero
  if (variant === 'hero') {
    return (
      <>
        <button
          onClick={handleTriggerInstall}
          disabled={isInstalling || justInstalled}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0756C9]/20 transition active:scale-95 cursor-pointer disabled:opacity-60"
        >
          {justInstalled ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Berhasil Terpasang!</span>
            </>
          ) : isInstalling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Install Maj Qur’an</span>
            </>
          )}
        </button>

        <PWAInstructionsModal
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
          isIOS={isIOS}
        />
      </>
    );
  }

  // Variant: Settings
  if (variant === 'settings') {
    return (
      <>
        <button
          onClick={handleTriggerInstall}
          disabled={isInstalling}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Aplikasi (PWA)</span>
        </button>

        <PWAInstructionsModal
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
          isIOS={isIOS}
        />
      </>
    );
  }

  // Variant: Header (Default)
  return (
    <>
      <button
        onClick={handleTriggerInstall}
        disabled={isInstalling}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F2FF] hover:bg-[#D4E6FF] text-[#0756C9] font-bold text-xs border border-[#168BFF]/20 transition active:scale-95 cursor-pointer"
        title="Pasang aplikasi ke layar utama"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      <PWAInstructionsModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        isIOS={isIOS}
      />
    </>
  );
};
