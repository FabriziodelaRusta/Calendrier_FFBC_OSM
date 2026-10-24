import { FFBCRando, DisciplineFilter } from '../types';
import { resolveCoordinatesSync, resolveCoordinatesAsync } from './geocoder';
import fallbackDataRaw from '../data/fallbackData.json';

const REMOTE_URL = 'https://raw.githubusercontent.com/FabriziodelaRusta/Input_files/main/calendrier_ffbc.json';

export interface CalendarDataset {
  source: string;
  moisExtrait: string;
  dateExtraction: string;
  items: FFBCRando[];
  lastUpdated: Date;
  isOnline: boolean;
}

export function matchDiscipline(rando: FFBCRando, filter: DisciplineFilter): boolean {
  if (filter === 'ALL') return true;

  const parcoursTypes = (rando.parcours || []).map(p => (p.type || '').toUpperCase());
  const nameUpper = (rando.nom || '').toUpperCase();
  const remarkUpper = (rando.remarque || '').toUpperCase();
  const locUpper = (rando.localite || '').toUpperCase();

  const isVtt = parcoursTypes.some(t => t.includes('VTT')) ||
    nameUpper.includes('VTT') ||
    remarkUpper.includes('VTT') ||
    locUpper.includes('VTT');

  const isGravel = parcoursTypes.some(t => t.includes('GRAVEL')) ||
    nameUpper.includes('GRAVEL') ||
    remarkUpper.includes('GRAVEL') ||
    locUpper.includes('GRAVEL');

  const isRoute = parcoursTypes.some(t =>
    t.includes('ROUTE') || t.includes('CYCLO') || t.includes('EASY') ||
    t.includes('DIAGONALE') || t.includes('ETOILE') || t.includes('BAD')
  ) || (!isVtt && !isGravel) || nameUpper.includes('CYCLO') || nameUpper.includes('ROUTE');

  if (filter === 'VTT') return isVtt;
  if (filter === 'GRAVEL') return isGravel;
  if (filter === 'ROUTE') return isRoute;

  return true;
}

export function getDisciplineBadges(rando: FFBCRando): { isRoute: boolean; isGravel: boolean; isVtt: boolean } {
  return {
    isRoute: matchDiscipline(rando, 'ROUTE'),
    isGravel: matchDiscipline(rando, 'GRAVEL'),
    isVtt: matchDiscipline(rando, 'VTT'),
  };
}

export async function fetchFFBCData(): Promise<CalendarDataset> {
  let rawData: any = null;
  let isOnline = false;

  try {
    const res = await fetch(REMOTE_URL, { cache: 'no-cache' });
    if (res.ok) {
      rawData = await res.json();
      isOnline = true;
    }
  } catch (err) {
    console.warn('Could not fetch remote FFBC data, falling back to local dataset:', err);
  }

  if (!rawData) {
    rawData = fallbackDataRaw;
  }

  const rawList: any[] = Array.isArray(rawData)
    ? rawData
    : (rawData.randonnées || rawData.randonnees || rawData.data || []);

  const items: FFBCRando[] = rawList.map((item: any) => {
    const rando: FFBCRando = {
      ...item,
      id: String(item.id || Math.random().toString(36).substring(7)),
      nom: item.nom || 'Randonnée FFBC',
      date: item.date || '2026-10-24',
      code_postal: item.code_postal ? String(item.code_postal).trim() : null,
      localite: item.localite ? String(item.localite).trim() : null,
      lieu_depart: item.lieu_depart || null,
      adresse: item.adresse || null,
      lien_itineraire: item.lien_itineraire || null,
      club: item.club || null,
      parcours: Array.isArray(item.parcours) ? item.parcours : [],
      remarque: item.remarque || null,
      liens_externes: Array.isArray(item.liens_externes) ? item.liens_externes : [],
      latitude: typeof item.latitude === 'number' ? item.latitude : null,
      longitude: typeof item.longitude === 'number' ? item.longitude : null,
    };

    const coord = resolveCoordinatesSync(rando);
    if (coord) {
      rando.computedLat = coord.lat;
      rando.computedLng = coord.lng;
      rando.locationLabel = coord.name || `${rando.code_postal || ''} ${rando.localite || ''}`.trim();
    }

    return rando;
  });

  return {
    source: rawData.source || 'https://www.velo-liberte.be/calendrier/',
    moisExtrait: rawData.mois_extrait || '2026-10',
    dateExtraction: rawData.date_extraction || '2026-10-24',
    items,
    lastUpdated: new Date(),
    isOnline,
  };
}
