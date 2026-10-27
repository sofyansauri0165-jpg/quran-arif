/**
 * Utilitas Perhitungan Kiblat Geodesik Presisi
 * Berdasarkan koordinat Ka'bah di Masjidil Haram, Makkah al-Mukarramah
 */

export const KAABA_COORDINATES = {
  latitude: 21.422487,
  longitude: 39.826206,
  name: "Ka'bah, Masjidil Haram, Makkah",
} as const;

export interface QiblaResult {
  bearing: number;        // Sudut kiblat dari Utara Sejati (0-360 derajat)
  distanceKm: number;     // Jarak ke Ka'bah dalam kilometer
  compassDirection: string; // Arah mata angin (misal: "Barat Laut", "Barat")
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Menghitung sudut arah kiblat (forward azimuth) menggunakan rumus trigonometri bola
 * dari koordinat pengguna (lat, lng) menuju Ka'bah
 */
export function calculateQiblaBearing(userLat: number, userLng: number): QiblaResult {
  const phi1 = toRadians(userLat);
  const phi2 = toRadians(KAABA_COORDINATES.latitude);
  const deltaLambda = toRadians(KAABA_COORDINATES.longitude - userLng);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let initialBearing = toDegrees(Math.atan2(y, x));
  // Normalisasi ke 0 - 360 derajat
  const bearing = (initialBearing + 360) % 360;

  // Hitung jarak menggunakan rumus Haversine
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = toRadians(KAABA_COORDINATES.latitude - userLat);
  const dLng = toRadians(KAABA_COORDINATES.longitude - userLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  // Tentukan arah mata angin
  const compassDirection = getCompassDirection(bearing);

  return {
    bearing: parseFloat(bearing.toFixed(1)),
    distanceKm,
    compassDirection,
  };
}

/**
 * Mengonversi sudut derajat ke label arah mata angin Indonesia
 */
export function getCompassDirection(degrees: number): string {
  const normalized = (degrees + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return 'Utara (U)';
  if (normalized >= 22.5 && normalized < 67.5) return 'Timur Laut (TL)';
  if (normalized >= 67.5 && normalized < 112.5) return 'Timur (T)';
  if (normalized >= 112.5 && normalized < 157.5) return 'Tenggara (TG)';
  if (normalized >= 157.5 && normalized < 202.5) return 'Selatan (S)';
  if (normalized >= 202.5 && normalized < 247.5) return 'Barat Daya (BD)';
  if (normalized >= 247.5 && normalized < 292.5) return 'Barat (B)';
  if (normalized >= 292.5 && normalized < 337.5) return 'Barat Laut (BL)';
  return 'Barat Laut (BL)';
}

export interface CityPreset {
  name: string;
  lat: number;
  lng: number;
}

export const INDONESIAN_CITIES_COORDS: CityPreset[] = [
  { name: 'DKI Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Surabaya, Jawa Timur', lat: -7.2575, lng: 112.7521 },
  { name: 'Bandung, Jawa Barat', lat: -6.9175, lng: 107.6191 },
  { name: 'Medan, Sumatera Utara', lat: 3.5952, lng: 98.6722 },
  { name: 'Semarang, Jawa Tengah', lat: -6.9667, lng: 110.4167 },
  { name: 'Yogyakarta, D.I.Y', lat: -7.7956, lng: 110.3695 },
  { name: 'Makassar, Sulawesi Selatan', lat: -5.1477, lng: 119.4327 },
  { name: 'Palembang, Sumatera Selatan', lat: -2.9761, lng: 104.7754 },
  { name: 'Denpasar, Bali', lat: -8.6705, lng: 115.2126 },
  { name: 'Balikpapan, Kalimantan Timur', lat: -1.2379, lng: 116.8289 },
  { name: 'Banda Aceh, Aceh', lat: 5.5483, lng: 95.3238 },
  { name: 'Jayapura, Papua', lat: -2.5337, lng: 140.7181 },
];
