import { LatLng, Pandal, TravelMode } from '../types/pandal';

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates straight-line distance in kilometers between two coordinates using the Haversine formula.
 */
export function calculateHaversineDistanceKm(coord1: LatLng, coord2: LatLng): number {
  const dLat = degreesToRadians(coord2.lat - coord1.lat);
  const dLng = degreesToRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(coord1.lat)) *
      Math.cos(degreesToRadians(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Estimated travel duration based on mode and Kolkata festival traffic conditions
 */
export function estimateDurationMinutes(km: number, mode: TravelMode, festivalTrafficMultiplier = 1.4): number {
  let avgSpeedKmh: number;

  switch (mode) {
    case 'WALKING':
      avgSpeedKmh = 4.2; // approx 4.2 km/h walking in Kolkata crowds
      return Math.round((km / avgSpeedKmh) * 60);
    case 'TRANSIT':
      avgSpeedKmh = 18; // Metro / bus combined
      return Math.round((km / avgSpeedKmh) * 60 + 8); // +8 min platform / waiting
    case 'DRIVING':
    default:
      // In Durga Puja Kolkata, vehicular speed is around 12-16 km/h on main roads
      avgSpeedKmh = 14 / festivalTrafficMultiplier;
      return Math.max(5, Math.round((km / avgSpeedKmh) * 60));
  }
}

export function formatDurationMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${Math.max(1, Math.round(totalMinutes))} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
}

/**
 * Optimizes the visiting sequence of a list of pandals using the Nearest Neighbor algorithm
 * starting from an initial location (user location or first pandal).
 */
export function optimizeItinerarySequence(
  startLocation: LatLng,
  stops: Pandal[]
): Pandal[] {
  if (stops.length <= 2) return [...stops];

  const remaining = [...stops];
  const ordered: Pandal[] = [];
  let currentPos = startLocation;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = calculateHaversineDistanceKm(currentPos, remaining[i].coordinates);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nextStop = remaining.splice(nearestIndex, 1)[0];
    ordered.push(nextStop);
    currentPos = nextStop.coordinates;
  }

  return ordered;
}

/**
 * Generates an official external Google Maps Directions URL
 */
export function buildExternalGoogleMapsUrl({
  origin,
  destination,
  waypoints = [],
  travelMode = 'DRIVING',
}: {
  origin: LatLng | string;
  destination: LatLng | string;
  waypoints?: LatLng[];
  travelMode?: TravelMode;
}): string {
  const originStr =
    typeof origin === 'string'
      ? encodeURIComponent(origin)
      : `${origin.lat},${origin.lng}`;

  const destStr =
    typeof destination === 'string'
      ? encodeURIComponent(destination)
      : `${destination.lat},${destination.lng}`;

  let url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}`;

  if (waypoints.length > 0) {
    const waypointsStr = waypoints.map(w => `${w.lat},${w.lng}`).join('|');
    url += `&waypoints=${encodeURIComponent(waypointsStr)}`;
  }

  let modeParam = 'driving';
  if (travelMode === 'WALKING') modeParam = 'walking';
  if (travelMode === 'TRANSIT') modeParam = 'transit';

  url += `&travelmode=${modeParam}`;
  return url;
}
