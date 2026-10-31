import React from 'react';
import { APP_CONFIG } from '../../config/appConfig';

interface PartnerLogo {
  id: string;
  name: string;
  alt: string;
  src: string;
  aspectClass?: string;
  subtext?: string;
}

const PARTNER_LOGOS: PartnerLogo[] = [
  {
    id: 'pondok-mandiri',
    name: 'Yayasan Karya Pondok Mandiri',
    alt: 'Logo Yayasan Karya Pondok Mandiri',
    src: '/assets/partners/logo-pondok-mandiri.png',
    aspectClass: 'max-h-12 sm:max-h-14 w-auto',
    subtext: 'Yayasan Karya Pondok Mandiri',
  },
  {
    id: 'bbpvp-bekasi',
    name: 'BBPVP Bekasi',
    alt: 'Logo BBPVP Bekasi',
    src: '/assets/partners/logo-bbpvp-bekasi.png',
    aspectClass: 'max-h-9 sm:max-h-11 w-auto max-w-[120px] sm:max-w-[140px]',
    subtext: 'BBPVP Bekasi',
  },
  {
    id: 'embi-tech',
    name: 'EMBI TECH COMPUTINDO',
    alt: 'Logo EMBI TECH COMPUTINDO',
    src: '/assets/partners/logo-embi-tech.png',
    aspectClass: 'max-h-12 sm:max-h-14 w-auto',
    subtext: 'EMBI TECH COMPUTINDO',
  },
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      aria-label="Footer Maj Qur'an"
      className="mt-auto border-t border-[#29415E] bg-[#031126] text-[#AABBD0] pt-8 sm:pt-10 pb-28 md:pb-10 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 text-center">
        {/* Bagian Atas Footer (Branding Maj Qur'an) */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center gap-2.5 px-3 py-1.5 rounded-full bg-[#082245] border border-[#29415E]">
            <img
              src={APP_CONFIG.logoUrl}
              alt="Logo Maj Qur'an"
              className="w-5 h-5 object-contain rounded-full shadow-xs"
              loading="lazy"
            />
            <span className="font-bold text-white text-sm tracking-tight">
              {APP_CONFIG.appName}
            </span>
            <span className="text-[#29415E] text-xs">•</span>
            <span className="text-xs text-[#AABBD0] italic">
              "{APP_CONFIG.tagline}"
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-[#7E95B1] max-w-lg mx-auto leading-relaxed">
            Jadwal Salat & Adzan resmi Kementerian Agama RI via myquran.com. Teks Al-Qur'an bersumber dari equran.id.
          </p>
        </div>

        {/* Bagian Tengah Footer (Mitra dan Pendukung) */}
        <div className="pt-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-[1px] w-8 sm:w-16 bg-[#29415E]" />
            <h3 className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#AABBD0] uppercase">
              Didukung oleh
            </h3>
            <span className="h-[1px] w-8 sm:w-16 bg-[#29415E]" />
          </div>

          {/* Grid 3 Logo Mitra */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-lg mx-auto items-stretch">
            {PARTNER_LOGOS.map((partner) => (
              <div
                key={partner.id}
                className="group relative flex flex-col items-center justify-center p-2.5 sm:p-3 bg-white rounded-2xl border border-white/20 hover:border-[#168BFF] shadow-md hover:shadow-lg transition-all duration-200"
                title={partner.name}
              >
                <div className="h-12 sm:h-14 w-full flex items-center justify-center">
                  <img
                    src={partner.src}
                    alt={partner.alt}
                    className={`${partner.aspectClass} object-contain transition-transform duration-200 group-hover:scale-105`}
                    loading="lazy"
                  />
                </div>
                <span className="mt-1.5 text-[9px] sm:text-[10px] text-[#061A35] font-semibold leading-tight text-center line-clamp-1 w-full">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bagian Bawah Footer (Hak Cipta) */}
        <div className="pt-3 border-t border-[#29415E]/60 space-y-1">
          <p className="text-[11px] sm:text-xs text-[#AABBD0]">
            &copy; {currentYear} {APP_CONFIG.appName}. Hak Cipta Dilindungi.
          </p>
          <p className="text-[10px] text-[#7E95B1]">
            Aplikasi Al-Qur'an Digital & Pengingat Waktu Salat Modern
          </p>
        </div>
      </div>
    </footer>
  );
};
