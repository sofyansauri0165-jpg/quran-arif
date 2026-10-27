import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'hero' | 'settings' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running in standalone mode, do not show
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'hero') {
      return (
        <button
          onClick={install}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white font-medium text-sm shadow-md shadow-[#0756C9]/20 transition active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Pasang Maj Qur'an (PWA)</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F2FF] hover:bg-[#D4E6FF] text-[#0756C9] font-medium text-xs border border-[#168BFF]/20 transition active:scale-95 cursor-pointer"
        title="Pasang aplikasi ke layar utama"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Pasang PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F2FF] hover:bg-[#D4E6FF] text-[#0756C9] font-medium text-xs border border-[#168BFF]/20 transition cursor-pointer"
          title="Petunjuk Pasang di iPhone/iPad"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pasang di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#E4E9F0]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E9F0]">
                <h3 className="text-base font-bold text-[#061A35]">Pasang di iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-[#E8F2FF] text-[#5E6B7C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[#061A35]">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FDFBF5] border border-[#E4E9F0]">
                  <div className="p-2 rounded-lg bg-[#E8F2FF] text-[#0756C9] shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[#5E6B7C]">Langkah 1</span>
                    <p className="text-xs">Tekan tombol <strong>Share</strong> (Bagikan) di baris bawah Safari.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FDFBF5] border border-[#E4E9F0]">
                  <div className="p-2 rounded-lg bg-[#E8F2FF] text-[#0756C9] shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[#5E6B7C]">Langkah 2</span>
                    <p className="text-xs">Gulir ke bawah dan pilih <strong>Add to Home Screen</strong> (Tambah ke Layar Utama).</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#0756C9] hover:bg-[#0645A8] py-2.5 text-sm font-semibold text-white transition cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
