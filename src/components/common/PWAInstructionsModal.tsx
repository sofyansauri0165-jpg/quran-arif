import React from 'react';
import { X, Share, PlusSquare, ArrowUpRight, Check, Smartphone, Monitor } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

interface PWAInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
}

export const PWAInstructionsModal: React.FC<PWAInstructionsModalProps> = ({
  isOpen,
  onClose,
  isIOS,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-[#E4E9F0] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E9F0] bg-[#FDFBF5]">
          <div className="flex items-center gap-3">
            <img
              src={APP_CONFIG.logoUrl}
              alt="Logo Maj Qur'an"
              className="w-9 h-9 object-contain rounded-full bg-white p-0.5 border border-[#E4E9F0] shadow-xs"
            />
            <div>
              <h3 className="font-bold text-[#061A35] text-sm sm:text-base">
                Pasang {APP_CONFIG.appName}
              </h3>
              <p className="text-[11px] text-[#5E6B7C]">
                {isIOS ? 'Panduan Pengguna iPhone & iPad' : 'Panduan Pasang Aplikasi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup panduan"
            className="p-1.5 rounded-xl hover:bg-[#E8F2FF] text-[#5E6B7C] hover:text-[#061A35] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-[#061A35]">
          {isIOS ? (
            <div className="space-y-3">
              <p className="text-xs text-[#5E6B7C] leading-relaxed">
                Browser Safari di iOS menggunakan mekanisme instalasi resmi bawaan Apple. Ikuti 2 langkah mudah berikut:
              </p>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FDFBF5] border border-[#E4E9F0]">
                <div className="w-9 h-9 rounded-xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#0756C9] tracking-wider block">
                    Langkah 1
                  </span>
                  <p className="text-xs font-semibold text-[#061A35]">
                    Tekan tombol <strong>Share</strong> (ikon bagikan dengan panah ke atas) pada bilah navigasi Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FDFBF5] border border-[#E4E9F0]">
                <div className="w-9 h-9 rounded-xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#0756C9] tracking-wider block">
                    Langkah 2
                  </span>
                  <p className="text-xs font-semibold text-[#061A35]">
                    Gulir ke bawah pada menu, lalu pilih <strong>Add to Home Screen</strong> (Tambahkan ke Layar Utama).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FDFBF5] border border-[#E4E9F0]">
                <div className="w-9 h-9 rounded-xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#0756C9] tracking-wider block">
                    Langkah 3
                  </span>
                  <p className="text-xs font-semibold text-[#061A35]">
                    Tekan <strong>Add</strong> di pojok kanan atas. Ikon Maj Qur’an akan langsung muncul di layar utama Anda.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#5E6B7C] leading-relaxed">
                Untuk memasang aplikasi melalui browser desktop atau Android:
              </p>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FDFBF5] border border-[#E4E9F0]">
                <div className="w-9 h-9 rounded-xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center shrink-0">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#0756C9] tracking-wider block">
                    Chrome / Edge / Brave
                  </span>
                  <p className="text-xs text-[#061A35]">
                    Klik ikon instalasi di sebelah kanan bilah URL (address bar), atau buka <strong>Menu ⋮ &rarr; Simpan & Bagikan &rarr; Pasang Maj Qur’an</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FDFBF5] border border-[#E4E9F0]">
                <div className="w-9 h-9 rounded-xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#0756C9] tracking-wider block">
                    Browser Lainnya
                  </span>
                  <p className="text-xs text-[#061A35]">
                    Buka menu browser dan pilih <strong>Tambahkan ke Layar Utama</strong> (Add to Home Screen).
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-[#E8F2FF]/60 border border-[#168BFF]/20 text-[11px] text-[#0756C9] flex items-center gap-2">
            <span className="font-bold">Keuntungan:</span>
            <span>Aplikasi dibuka tanpa address bar, lebih hemat kuota, dan dapat dibaca offline.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#E4E9F0] bg-[#FDFBF5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
