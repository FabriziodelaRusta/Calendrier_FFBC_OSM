import { FFBCRando } from '../types';
import { EVENT_COORDINATES, POSTAL_CODE_COORDINATES, LocationCoord } from '../data/coordinatesDb';

const GEOCODE_CACHE_KEY = 'ffbc_geocode_cache_v1';

function getStoredCache(): Record<string, LocationCoord> {
  try {
    const raw = localStorage.getItem(GEOCODE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToCache(key: string, coord: LocationCoord) {
  try {
    const cache = getStoredCache();
    cache[key] = coord;
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage quota
  }
}

/**
 * Extracts address query from lien_itineraire or falls back to adresse
 */
export function extractAddressQuery(rando: FFBCRando): string {
  let query = '';
  if (rando.lien_itineraire) {
    try {
      const url = new URL(rando.lien_itineraire);
      query = url.searchParams.get('query') || '';
    } catch {
      const match = rando.lien_itineraire.match(/query=([^&]+)/);
      if (match) {
        query = decodeURIComponent(match[1]);
      }
    }
  }

  if (!query || query.trim() === '' || query.includes('/ /')) {
    query = rando.adresse || '';
  }

  query = query.replace(/\/ \//g, '').trim();

  // If still empty or contains placeholder
  if (!query && rando.code_postal) {
    query = `${rando.code_postal} ${rando.localite || ''}`.trim();
  }

  return query;
}

/**
 * Synchronous resolver using precomputed database & postal codes
 */
export function resolveCoordinatesSync(rando: FFBCRando): LocationCoord | null {
  // 1. If explicit latitude & longitude in JSON
  if (typeof rando.latitude === 'number' && typeof rando.longitude === 'number' && !isNaN(rando.latitude) && !isNaN(rando.longitude)) {
    return {
      lat: rando.latitude,
      lng: rando.longitude,
      name: rando.localite || rando.lieu_depart || undefined
    };
  }

  // 2. Check curated event ID coordinates
  if (EVENT_COORDINATES[rando.id]) {
    return EVENT_COORDINATES[rando.id];
  }

  // 3. Check localStorage cache
  const addressQuery = extractAddressQuery(rando);
  const cache = getStoredCache();
  if (addressQuery && cache[addressQuery]) {
    return cache[addressQuery];
  }

  // 4. Check postal code
  if (rando.code_postal && POSTAL_CODE_COORDINATES[rando.code_postal]) {
    return POSTAL_CODE_COORDINATES[rando.code_postal];
  }

  // 5. Postal code from address string if 4 digits
  const cpMatch = addressQuery.match(/\b([1-9]\d{3})\b/);
  if (cpMatch && POSTAL_CODE_COORDINATES[cpMatch[1]]) {
    return POSTAL_CODE_COORDINATES[cpMatch[1]];
  }

  return null;
}

/**
 * Async resolver with Photon fallback for dynamically added events
 */
export async function resolveCoordinatesAsync(rando: FFBCRando): Promise<LocationCoord | null> {
  const sync = resolveCoordinatesSync(rando);
  if (sync) return sync;

  const query = extractAddressQuery(rando);
  if (!query) return null;

  try {
    const cleanQ = query.replace(/^x\s+/i, '').replace(/^-\s+/i, '').trim();
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&limit=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        const coord: LocationCoord = {
          lat,
          lng: lon,
          name: data.features[0].properties?.name || data.features[0].properties?.city || cleanQ
        };
        saveToCache(query, coord);
        return coord;
      }
    }
  } catch {
    // Geocode fallback failed
  }

  return null;
}
