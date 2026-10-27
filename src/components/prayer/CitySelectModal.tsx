import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Loader2, Check } from 'lucide-react';
import { PrayerCity } from '../../types/prayer';
import { searchCities, POPULAR_CITIES } from '../../services/prayerApi';

interface CitySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCityId: string;
  onSelectCity: (cityId: string, cityName: string) => void;
}

export const CitySelectModal: React.FC<CitySelectModalProps> = ({
  isOpen,
  onClose,
  currentCityId,
  onSelectCity,
}) => {
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<PrayerCity[]>(POPULAR_CITIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setCities(POPULAR_CITIES);
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setCities(POPULAR_CITIES);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      searchCities(query).then(results => {
        setCities(results);
        setLoading(false);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E4E9F0] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E9F0] bg-[#FDFBF5]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#E8F2FF] text-[#0756C9]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#061A35] text-sm">Pilih Kota / Wilayah</h3>
              <p className="text-[11px] text-[#5E6B7C]">Jadwal salat resmi Kementerian Agama RI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#E8F2FF] text-[#5E6B7C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-[#E4E9F0]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#5E6B7C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari nama kota atau kabupaten..."
              autoFocus
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#E4E9F0] text-[#061A35] focus:outline-hidden focus:ring-2 focus:ring-[#168BFF]"
            />
          </div>
        </div>

        {/* Cities List */}
        <div className="p-3 overflow-y-auto flex-1 space-y-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#5E6B7C]">
              <Loader2 className="w-6 h-6 animate-spin text-[#0756C9]" />
              <span className="text-xs">Mencari kota...</span>
            </div>
          ) : cities.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#5E6B7C]">
              Kota tidak ditemukan. Coba kata kunci lain (contoh: "Bandung" atau "Surabaya").
            </div>
          ) : (
            cities.map(c => {
              const isSelected = c.id === currentCityId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCity(c.id, c.lokasi);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#E8F2FF] text-[#0756C9] font-bold'
                      : 'hover:bg-[#FDFBF5] text-[#061A35]'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{c.lokasi}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#0756C9]" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
