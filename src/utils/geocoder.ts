import { FFBCRando } from '../types';
import { EVENT_COORDINATES, POSTAL_CODE_COORDINATES, Coordinates } from '../data/coordinatesDb';
import bePostalCodesRaw from '../data/postalCodesBelgium.json';

const bePostalCodes: Record<string, Coordinates> = bePostalCodesRaw as Record<string, Coordinates>;

// In-memory cache for dynamic geocoded queries
const dynamicCache = new Map<string, Coordinates>();

/**
 * Cleans address strings, especially handling double slashes "//", "/ /", or irregular separators
 */
export function cleanAddressString(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\/\s*\//g, ' ')
    .replace(/\/+/g, ' ')
    .replace(/["']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts a searchable address or query from the FFBC rando record
 */
export function extractAddressQuery(rando: FFBCRando): string {
  if (rando.lien_itineraire) {
    try {
      const url = new URL(rando.lien_itineraire);
      const queryParam = url.searchParams.get('query');
      if (queryParam) {
        return cleanAddressString(queryParam);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  const parts = [
    cleanAddressString(rando.adresse || ''),
    cleanAddressString(rando.localite || ''),
    rando.code_postal ? String(rando.code_postal).trim() : '',
  ].filter(Boolean);

  return parts.join(' ').trim();
}

/**
 * Synchronous resolver: uses complete Belgian postal codes database + event database
 */
export function resolveCoordinatesSync(rando: FFBCRando): Coordinates | null {
  // 1. Direct match by event ID
  if (EVENT_COORDINATES[rando.id]) {
    return EVENT_COORDINATES[rando.id];
  }

  // 2. Direct match if already has valid numeric latitude and longitude
  if (typeof rando.latitude === 'number' && typeof rando.longitude === 'number' && !isNaN(rando.latitude)) {
    return {
      lat: rando.latitude,
      lng: rando.longitude,
      name: `${rando.code_postal || ''} ${rando.localite || ''}`.trim() || rando.nom,
    };
  }

  const addressQuery = cleanAddressString(extractAddressQuery(rando));

  // 3. Extract postal code: first check code_postal, then search in addressQuery and localite
  let cp: string | null = null;
  if (rando.code_postal && /^\d{4,5}$/.test(String(rando.code_postal).trim())) {
    cp = String(rando.code_postal).trim();
  }

  if (!cp || cp === '1212' || cp === '0000') {
    const cpMatch = addressQuery.match(/\b([1-9]\d{3,4})\b/);
    if (cpMatch) {
      cp = cpMatch[1];
    }
  }

  // 4. Check complete Belgian postal codes database
  if (cp && bePostalCodes[cp]) {
    return bePostalCodes[cp];
  }

  // 5. Check supplemental coordinates DB
  if (cp && POSTAL_CODE_COORDINATES[cp]) {
    return POSTAL_CODE_COORDINATES[cp];
  }

  // 6. Check dynamic cache
  if (cp && dynamicCache.has(cp)) {
    return dynamicCache.get(cp)!;
  }

  // 7. Check by locality name or full address text
  const fullText = (addressQuery + ' ' + (rando.localite || '') + ' ' + (rando.nom || '')).toUpperCase();
  if (fullText.includes('VAISON') || fullText.includes('84110')) {
    return { lat: 44.2408, lng: 5.0747, name: 'Vaison-la-Romaine (France)' };
  }
  if (fullText.includes('CAVAILLON') || fullText.includes('84300')) {
    return { lat: 43.8378, lng: 5.0381, name: 'Cavaillon (France)' };
  }
  if (fullText.includes('ORCHIES') || fullText.includes('59310')) {
    return { lat: 50.4747, lng: 3.2433, name: 'Orchies (France)' };
  }
  if (fullText.includes('SEVILLE') || fullText.includes('SÉVILLE') || fullText.includes('41001')) {
    return { lat: 37.3891, lng: -5.9845, name: 'Séville (Espagne)' };
  }
  if (fullText.includes('MARRAKECH') || fullText.includes('40000')) {
    return { lat: 31.6295, lng: -7.9811, name: 'Marrakech (Maroc)' };
  }

  // 8. If special Diagonales/Traces without fix, fallback to center of Belgium
  if (rando.nom && rando.nom.toLowerCase().includes('diagonale')) {
    return { lat: 50.5039, lng: 4.4699, name: 'Belgique (Sur parcours)' };
  }

  return null;
}

/**
 * Asynchronous resolver:
 * "si toujours pas de position trouvee pour la carte utiliser le code postal seulement avec pays belgique et si toujours rien code postal avec pays france"
 */
export async function resolveCoordinatesAsync(rando: FFBCRando): Promise<Coordinates | null> {
  // 1. Try sync resolution first
  const syncResult = resolveCoordinatesSync(rando);
  if (syncResult) return syncResult;

  // 2. Extract postal code
  let cp: string | null = null;
  if (rando.code_postal && /^\d{4,5}$/.test(String(rando.code_postal).trim())) {
    cp = String(rando.code_postal).trim();
  }
  if (!cp) {
    const text = cleanAddressString(extractAddressQuery(rando));
    const m = text.match(/\b([1-9]\d{3,4})\b/);
    if (m) cp = m[1];
  }

  if (!cp) return null;

  if (dynamicCache.has(cp)) {
    return dynamicCache.get(cp)!;
  }

  // 3. Fallback: Query Nominatim with postal code only in Belgium
  try {
    const urlBe = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(cp)}&country=belgium&format=json&limit=1`;
    const resBe = await fetch(urlBe, { headers: { 'Accept': 'application/json' } });
    if (resBe.ok) {
      const dataBe = await resBe.json();
      if (Array.isArray(dataBe) && dataBe.length > 0) {
        const coord: Coordinates = {
          lat: parseFloat(dataBe[0].lat),
          lng: parseFloat(dataBe[0].lon),
          name: `${cp} (Belgique)`,
        };
        dynamicCache.set(cp, coord);
        return coord;
      }
    }
  } catch {
    // Continue to France fallback
  }

  // 4. Fallback: Query Nominatim with postal code only in France
  try {
    const urlFr = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(cp)}&country=france&format=json&limit=1`;
    const resFr = await fetch(urlFr, { headers: { 'Accept': 'application/json' } });
    if (resFr.ok) {
      const dataFr = await resFr.json();
      if (Array.isArray(dataFr) && dataFr.length > 0) {
        const coord: Coordinates = {
          lat: parseFloat(dataFr[0].lat),
          lng: parseFloat(dataFr[0].lon),
          name: `${cp} (France)`,
        };
        dynamicCache.set(cp, coord);
        return coord;
      }
    }
  } catch {
    // Ignore error
  }

  return null;
}
