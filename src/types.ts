export interface ParcoursItem {
  type: string;
  distance_km: number | null;
  denivele: number | null;
  difficulte: string | null;
  horaires: string | null;
  ravitaillement: string | null;
  tarif: string | null;
}

export interface ExternalLink {
  libelle: string;
  url: string;
}

export interface FFBCRando {
  id: string;
  nom: string;
  date: string; // YYYY-MM-DD
  province: string | null;
  code_postal: string | null;
  localite: string | null;
  texte_calendrier?: string | null;
  lieu_depart?: string | null;
  adresse?: string | null;
  lien_itineraire?: string | null;
  club?: string | null;
  parcours?: ParcoursItem[];
  remarque?: string | null;
  liens_externes?: ExternalLink[];
  latitude?: number | null;
  longitude?: number | null;
  computedLat?: number;
  computedLng?: number;
  locationLabel?: string;
}

export type DisciplineFilter = 'ALL' | 'ROUTE' | 'GRAVEL' | 'VTT';

export type BasemapType = 'osm' | 'cycle' | 'esri';
