import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  calculateQiblaBearing,
  INDONESIAN_CITIES_COORDS,
  KAABA_COORDINATES,
  QiblaResult,
} from '../utils/qibla';
import {
  Compass,
  MapPin,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';

interface QiblaPageProps {
  onBack: () => void;
}

export const QiblaPage: React.FC<QiblaPageProps> = ({ onBack }) => {
  // Coordinates state (Default to Jakarta)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.2088,
    lng: 106.8456,
  });
  const [locationName, setLocationName] = useState<string>('DKI Jakarta (Default)');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'error'>('idle');

  // Compass heading state (degrees from True North 0-360)
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [sensorAvailable, setSensorAvailable] = useState<boolean>(false);
  const [sensorPermissionNeeded, setSensorPermissionNeeded] = useState<boolean>(false);

  // Calibration modal
  const [showCalibrationGuide, setShowCalibrationGuide] = useState<boolean>(false);

  // Geodesic Qibla calculations
  const qiblaResult: QiblaResult = calculateQiblaBearing(coords.lat, coords.lng);

  // Check if iOS DeviceOrientation requires permission
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any)?.requestPermission === 'function'
    ) {
      setSensorPermissionNeeded(true);
    }
  }, []);

  // Request browser Geolocation
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationName(`GPS: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);
        setLocationStatus('granted');
      },
      err => {
        console.warn('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Request Device Orientation Permission (specifically for iOS Safari)
  const requestSensorPermission = async () => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setSensorPermissionNeeded(false);
          startOrientationListener();
        } else {
          alert('Izin sensor orientasi ditolak oleh browser.');
        }
      } catch (err) {
        console.warn('Sensor permission error:', err);
      }
    } else {
      startOrientationListener();
    }
  };

  // Start listening to DeviceOrientation
  const startOrientationListener = useCallback(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // iOS WebKit compass heading (True North)
      if (typeof (e as any).webkitCompassHeading === 'number') {
        heading = (e as any).webkitCompassHeading;
      }
      // Android / standard alpha heading
      else if (e.alpha !== null) {
        // e.alpha represents rotation around z-axis (0 to 360)
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null && !isNaN(heading)) {
        setDeviceHeading(Math.round(heading));
        setSensorAvailable(true);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  useEffect(() => {
    if (!sensorPermissionNeeded) {
      const cleanup = startOrientationListener();
      return cleanup;
    }
  }, [sensorPermissionNeeded, startOrientationListener]);

  // Relative angle to Qibla:
  // If sensor is available, dial rotates by (qiblaBearing - deviceHeading)
  // When aligned, relative angle is 0 degrees!
  const relativeAngle = sensorAvailable
    ? (qiblaResult.bearing - deviceHeading + 360) % 360
    : qiblaResult.bearing;

  // Check if phone is aligned towards Qibla (tolerance ±4°)
  const isAligned =
    sensorAvailable &&
    (relativeAngle <= 4 || relativeAngle >= 356);

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-28">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-[#5E6B7C] hover:text-[#061A35] hover:bg-[#E8F2FF] transition cursor-pointer"
            title="Kembali ke Beranda"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-[#061A35] tracking-tight">
              Kompas Kiblat Digital
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6B7C]">
              Arah presisi menuju Ka'bah di Masjidil Haram Makkah
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCalibrationGuide(true)}
          className="p-2 rounded-xl text-[#5E6B7C] hover:text-[#0756C9] hover:bg-[#E8F2FF] transition cursor-pointer"
          title="Petunjuk & Kalibrasi"
          aria-label="Petunjuk Kalibrasi"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Location Bar & City Picker */}
      <div className="p-4 rounded-3xl bg-white border border-[#E4E9F0] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8F2FF] text-[#0756C9] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#5E6B7C] uppercase tracking-wider block">
                Lokasi Pengguna:
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#061A35]">
                {locationName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={requestLocation}
              disabled={locationStatus === 'loading'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F2FF] hover:bg-[#D4E6FF] text-[#0756C9] text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <RotateCw className={`w-3.5 h-3.5 ${locationStatus === 'loading' ? 'animate-spin' : ''}`} />
              <span>Gunakan GPS</span>
            </button>
          </div>
        </div>

        {/* Manual City Selector */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-[#5E6B7C] shrink-0">Atau pilih kota:</span>
          <select
            value={coords.lat}
            onChange={e => {
              const selectedLat = parseFloat(e.target.value);
              const found = INDONESIAN_CITIES_COORDS.find(c => c.lat === selectedLat);
              if (found) {
                setCoords({ lat: found.lat, lng: found.lng });
                setLocationName(found.name);
                setLocationStatus('granted');
              }
            }}
            className="w-full text-xs font-semibold p-2 rounded-xl border border-[#E4E9F0] bg-[#FDFBF5] text-[#061A35] focus:outline-hidden focus:ring-2 focus:ring-[#168BFF] cursor-pointer"
          >
            {INDONESIAN_CITIES_COORDS.map(c => (
              <option key={c.name} value={c.lat}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notice if permission denied */}
        {locationStatus === 'denied' && (
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Izin GPS ditolak. Sistem menggunakan koordinat kota pilihan di atas.</span>
          </div>
        )}
      </div>

      {/* Sensor Permission Banner for iOS */}
      {sensorPermissionNeeded && (
        <div className="p-4 rounded-3xl bg-[#E8F2FF] border border-[#168BFF]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-[#061A35]">
              Aktifkan Sensor Kompas (iOS)
            </h4>
            <p className="text-[11px] text-[#5E6B7C]">
              Izinkan akses sensor gerak perangkat untuk memutar kompas secara otomatis saat HP digerakkan.
            </p>
          </div>
          <button
            onClick={requestSensorPermission}
            className="px-4 py-2 rounded-xl bg-[#0756C9] hover:bg-[#0645A8] text-white text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
          >
            Izinkan Sensor
          </button>
        </div>
      )}

      {/* Main Interactive Compass Display */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-white border border-[#E4E9F0] shadow-xl text-center space-y-6 overflow-hidden">
        {/* Status Badge */}
        <div className="flex items-center justify-center">
          {isAligned ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tepat Menghadap Kiblat!</span>
            </div>
          ) : sensorAvailable ? (
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#E8F2FF] text-[#0756C9] text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>Putar perangkat ke sudut {qiblaResult.bearing}°</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>Mode Statis: {qiblaResult.bearing}° dari Utara</span>
            </div>
          )}
        </div>

        {/* Compass Visual Wheel */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
          {/* Compass Dial Outer Ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-[#E4E9F0] shadow-inner transition-transform duration-300 ease-out"
            style={{
              transform: sensorAvailable ? `rotate(${-deviceHeading}deg)` : 'none',
            }}
          >
            {/* Cardinal Marks */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-black text-red-600">U</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-[#5E6B7C]">S</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5E6B7C]">T</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5E6B7C]">B</span>

            {/* Dial Tick marks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
              <div
                key={deg}
                className="absolute w-0.5 h-2.5 bg-[#CBD5E1] left-1/2 top-0 origin-[50%_128px] sm:origin-[50%_144px]"
                style={{ transform: `rotate(${deg}deg)` }}
              />
            ))}

            {/* Kaaba Marker Pin on the Dial */}
            <div
              className="absolute left-1/2 top-0 origin-[50%_128px] sm:origin-[50%_144px] -translate-x-1/2"
              style={{ transform: `rotate(${qiblaResult.bearing}deg)` }}
            >
              <div className="flex flex-col items-center -mt-3">
                <div className="w-7 h-7 rounded-lg bg-[#061A35] text-amber-300 font-extrabold text-[10px] flex items-center justify-center shadow-lg border-2 border-amber-400">
                  كعبة
                </div>
                <div className="w-1.5 h-6 bg-[#0756C9] rounded-full shadow-xs" />
              </div>
            </div>
          </div>

          {/* Center Hub Indicator */}
          <div
            className={`w-20 h-20 rounded-full shadow-lg border-4 flex flex-col items-center justify-center transition-colors duration-300 z-10 ${
              isAligned
                ? 'bg-emerald-500 border-emerald-200 text-white animate-bounce'
                : 'bg-white border-[#E4E9F0] text-[#061A35]'
            }`}
          >
            <Compass className={`w-6 h-6 ${isAligned ? 'text-white' : 'text-[#0756C9]'}`} />
            <span className="text-[10px] font-mono font-bold mt-0.5">
              {qiblaResult.bearing}°
            </span>
          </div>
        </div>

        {/* Bearing Data Cards */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#FDFBF5] border border-[#E4E9F0]">
            <span className="text-[10px] font-bold text-[#5E6B7C] uppercase tracking-wider block">
              Arah Kiblat Geodesik
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span className="text-2xl font-black text-[#0756C9] font-mono">
                {qiblaResult.bearing}°
              </span>
            </div>
            <p className="text-[11px] text-[#5E6B7C] font-medium">
              {qiblaResult.compassDirection}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FDFBF5] border border-[#E4E9F0]">
            <span className="text-[10px] font-bold text-[#5E6B7C] uppercase tracking-wider block">
              Jarak ke Ka'bah
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-0.5">
              <span className="text-2xl font-black text-[#061A35] font-mono">
                {qiblaResult.distanceKm.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-[#5E6B7C] font-semibold">km</span>
            </div>
            <p className="text-[11px] text-[#5E6B7C] font-medium">
              Makkah al-Mukarramah
            </p>
          </div>
        </div>

        {/* Sensor Status Footer */}
        <div className="text-xs text-[#5E6B7C] space-y-1 pt-2 border-t border-[#E4E9F0]">
          <div className="flex items-center justify-center gap-1.5 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                sensorAvailable ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            <span>
              {sensorAvailable
                ? `Sensor HP Aktif • Orientasi: ${deviceHeading}°`
                : 'Sensor orientasi kompas tidak terdeteksi (Mode Panduan Derajat)'}
            </span>
          </div>
        </div>
      </div>

      {/* Realistic Environment Guidance */}
      <div className="p-4 rounded-3xl bg-[#FDFBF5] border border-[#E4E9F0] text-xs text-[#5E6B7C] space-y-2">
        <h4 className="font-bold text-[#061A35] flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#0756C9]" />
          <span>Tips Ketepatan Pengukuran Kompas:</span>
        </h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Letakkan perangkat di atas permukaan datar yang stabil atau pegang horizontal sejajar dada.</li>
          <li>Jauhkan dari benda logam, magnet, laptop, atau speaker yang dapat menimbulkan interferensi magnetik.</li>
          <li>Hasil arah kiblat dihitung presisi berdasarkan koordinat lintang & bujur lokasi Anda menuju Ka'bah (21.4225° N, 39.8262° E).</li>
        </ul>
      </div>

      {/* Calibration Guide Modal */}
      {showCalibrationGuide && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E4E9F0] space-y-4">
            <h3 className="font-bold text-[#061A35] text-base">Cara Kalibrasi Kompas HP</h3>
            <p className="text-xs text-[#5E6B7C] leading-relaxed">
              Jika arah kompas tampak tidak berputar atau tidak akurat, lakukan kalibrasi sensor magnetometer HP Anda:
            </p>
            <div className="p-4 rounded-2xl bg-[#E8F2FF] border border-[#168BFF]/20 text-center space-y-2">
              <span className="text-3xl font-extrabold text-[#0756C9] block font-mono">
                ∞
              </span>
              <p className="text-xs font-semibold text-[#061A35]">
                Gerakkan HP Anda membentuk angka delapan (∞) di udara sebanyak 3-4 kali secara perlahan.
              </p>
            </div>
            <button
              onClick={() => setShowCalibrationGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#0756C9] text-white text-xs font-bold transition cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
