export interface GpsCoords {
  lat: number
  lng: number
  accuracy?: number  // metres
  timestamp?: number
}

/**
 * Haversine formula — great-circle distance between two GPS points in metres.
 */
export function haversineDistance(a: GpsCoords, b: GpsCoords): number {
  const R = 6_371_000 // Earth radius metres
  const φ1 = (a.lat * Math.PI) / 180
  const φ2 = (b.lat * Math.PI) / 180
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180

  const n =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  return R * 2 * Math.atan2(Math.sqrt(n), Math.sqrt(1 - n))
}

/** Return true if user is within radiusMeters of the quest location. */
export function isWithinRadius(
  userPos: GpsCoords,
  questPos: GpsCoords,
  radiusMeters = 50,
): boolean {
  return haversineDistance(userPos, questPos) <= radiusMeters
}

/**
 * Get current device GPS position wrapped in a Promise.
 * Rejects with a human-readable error string.
 */
export function getCurrentPosition(): Promise<GpsCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        }),
      err => {
        const msgs: Record<number, string> = {
          1: 'Location access denied. Please allow location permission.',
          2: 'Location unavailable. Check GPS signal.',
          3: 'Location request timed out. Try again.',
        }
        reject(new Error(msgs[err.code] ?? `GPS error: ${err.message}`))
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 },
    )
  })
}

/** Format metres as human-readable string. */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)}m`
  return `${(metres / 1000).toFixed(2)}km`
}
