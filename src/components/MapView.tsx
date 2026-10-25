import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FFBCRando, BasemapType } from '../types';
import { generatePopupContent, generateTooltipContent } from '../utils/popupGenerator';

interface MapViewProps {
  events: FFBCRando[];
  selectedDate: string;
  selectedRandoId?: string | null;
  onSelectRando?: (rando: FFBCRando) => void;
  basemap: BasemapType;
}

const BASEMAP_TILES: Record<BasemapType, { url: string; attribution: string; maxZoom: number }> = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  cycle: {
    // CyclOSM bicycle-oriented tiles
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '&copy; CyclOSM &amp; OpenStreetMap contributors',
    maxZoom: 18,
  },
  esri: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
};

// Smaller, more compact pin icon (22px x 28px)
function createPinIcon(rando: FFBCRando, isSelected: boolean): L.DivIcon {
  const parcoursTypes = (rando.parcours || []).map(p => (p.type || '').toUpperCase());
  const nameUpper = (rando.nom || '').toUpperCase();

  const isVtt = parcoursTypes.some(t => t.includes('VTT')) || nameUpper.includes('VTT');
  const isGravel = parcoursTypes.some(t => t.includes('GRAVEL')) || nameUpper.includes('GRAVEL');
  const isMarche = parcoursTypes.some(t => t.includes('MARCH') || t.includes('PEDESTRE')) || nameUpper.includes('MARCHE');

  let pinColor = '#2563EB'; // Route bleu
  let letter = 'R';

  if (isMarche && !isVtt && !isGravel) {
    pinColor = '#DC2626'; // Marche rouge
    letter = 'M';
  } else if (isVtt && isGravel) {
    pinColor = '#7C3AED'; // Mixed violet
    letter = '★';
  } else if (isVtt) {
    pinColor = '#16A34A'; // VTT vert
    letter = 'V';
  } else if (isGravel) {
    pinColor = '#EA580C'; // Gravel orange
    letter = 'G';
  }

  const pulseBorder = isSelected ? 'filter: drop-shadow(0 0 6px rgba(37,99,235,0.8)); transform: scale(1.15);' : '';

  const html = `
    <div style="position: relative; width: 22px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.32)); transition: transform 0.15s ease; ${pulseBorder}">
      <svg viewBox="0 0 22 28" width="22" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 0C4.925 0 0 4.925 0 11C0 18.5 9.5 26.8 10.4 27.7C10.7 28 11.3 28 11.6 27.7C12.5 26.8 22 18.5 22 11C22 4.925 17.075 0 11 0Z" fill="${pinColor}"/>
        <path d="M11 1.5C5.753 1.5 1.5 5.753 1.5 11C1.5 17.5 10 24.8 11 25.8C12 24.8 20.5 17.5 20.5 11C20.5 5.753 16.247 1.5 11 1.5Z" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.8"/>
        <circle cx="11" cy="10" r="6" fill="#ffffff"/>
      </svg>
      <div style="position: absolute; top: 4px; left: 0; right: 0; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 9px; font-weight: 900; color: ${pinColor}; line-height: 1; user-select: none; font-family: system-ui, sans-serif;">
          ${letter}
        </span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'ffbc-marker-icon-small',
    iconSize: [22, 28],
    iconAnchor: [11, 28],
    popupAnchor: [0, -26],
  });
}

export const MapView: React.FC<MapViewProps> = ({
  events,
  selectedDate,
  selectedRandoId,
  onSelectRando,
  basemap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersByIdRef = useRef<Map<string, L.Marker>>(new Map());

  // Function to update the custom scale indicator exactly as in gpx_viewer
  const updateScale = () => {
    const map = mapRef.current;
    const scaleValue = document.getElementById('scaleValue');
    const scaleDiv = document.getElementById('customScale');
    if (!map || !scaleValue || !scaleDiv) return;

    try {
      const baseWidthPx = 120;
      const p1 = map.containerPointToLatLng([0, 0]);
      const p2 = map.containerPointToLatLng([baseWidthPx, 0]);
      const metersForBaseWidth = p1.distanceTo(p2);

      const niceValues = [1, 2, 5];
      const pow = Math.pow(10, Math.floor(Math.log10(metersForBaseWidth)));
      const best = niceValues.map(v => v * pow).reduce((a, b) =>
        Math.abs(metersForBaseWidth - a) < Math.abs(metersForBaseWidth - b) ? a : b
      );

      const candidates: number[] = [];
      for (let pExp = Math.floor(Math.log10(metersForBaseWidth)) - 1; pExp <= Math.floor(Math.log10(metersForBaseWidth)) + 1; pExp++) {
        const base = Math.pow(10, pExp);
        niceValues.forEach(v => candidates.push(v * base));
      }

      const metersPerPixel = metersForBaseWidth / baseWidthPx;
      let chosen = candidates
        .map(c => ({ c, px: Math.round(c / metersPerPixel) }))
        .filter(o => o.px >= 60 && o.px <= 260);

      if (chosen.length === 0) {
        chosen = candidates
          .map(c => ({ c, px: Math.round(c / metersPerPixel) }))
          .sort((a, b) => Math.abs(a.px - 120) - Math.abs(b.px - 120));
      }

      const final = chosen[0] || { c: best, px: Math.round(best / metersPerPixel) };
      scaleDiv.style.width = final.px + 'px';
      scaleValue.textContent = final.c >= 1000 ? Math.round(final.c / 1000) + ' km' : Math.round(final.c) + ' m';
    } catch {
      // Ignore initial render calculations before map settles
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on Belgium initially
    const map = L.map(mapContainerRef.current, {
      center: [50.5039, 4.4699],
      zoom: 8,
      zoomControl: false,
      attributionControl: false,
    });

    if (map.attributionControl) {
      map.removeControl(map.attributionControl);
    }

    // Add zoom control at bottom right as requested
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer
    const config = BASEMAP_TILES[basemap] || BASEMAP_TILES.osm;
    const tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Markers layer group
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Scale listeners
    map.on('zoomend moveend resize', updateScale);

    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
      updateScale();
    }, 250);

    return () => {
      map.off('zoomend moveend resize', updateScale);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap layer when type changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const config = BASEMAP_TILES[basemap] || BASEMAP_TILES.osm;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(map);
  }, [basemap]);

  // Update Markers and fit bounds whenever events change
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear previous markers
    markersLayer.clearLayers();
    markersByIdRef.current.clear();

    const validEvents = events.filter(e => typeof e.computedLat === 'number' && typeof e.computedLng === 'number');

    if (validEvents.length === 0) {
      updateScale();
      return;
    }

    const latLngs: L.LatLng[] = [];

    validEvents.forEach((rando) => {
      const lat = rando.computedLat!;
      const lng = rando.computedLng!;
      const isSelected = rando.id === selectedRandoId;

      const marker = L.marker([lat, lng], {
        icon: createPinIcon(rando, isSelected),
        riseOnHover: true,
      });

      // Tooltip on hover
      marker.bindTooltip(generateTooltipContent(rando), {
        direction: 'top',
        offset: [0, -24],
        opacity: 0.95,
        className: 'ffbc-leaflet-tooltip',
      });

      // Rich organized popup on click
      marker.bindPopup(generatePopupContent(rando), {
        maxWidth: 360,
        className: 'ffbc-leaflet-popup',
        autoPanPadding: [50, 50],
      });

      marker.on('click', () => {
        onSelectRando?.(rando);
      });

      markersLayer.addLayer(marker);
      markersByIdRef.current.set(rando.id, marker);
      latLngs.push(L.latLng(lat, lng));
    });

    // Auto center map on all events of the day/filter, then dezoom by 1 level
    if (latLngs.length === 1) {
      map.setView(latLngs[0], 11, { animate: true });
    } else if (latLngs.length > 1) {
      const bounds = L.latLngBounds(latLngs);
      try {
        const boundsZoom = map.getBoundsZoom(bounds, false, L.point(60, 60));
        const targetZoom = Math.max(boundsZoom - 1, 6);
        map.setView(bounds.getCenter(), targetZoom, { animate: true });
      } catch {
        map.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 12,
          animate: true,
        });
      }
    }

    setTimeout(updateScale, 300);
  }, [events, selectedDate]);

  // When selected rando changes externally (e.g. from drawer/list), open its popup
  useEffect(() => {
    if (!selectedRandoId) return;
    const marker = markersByIdRef.current.get(selectedRandoId);
    if (marker && mapRef.current) {
      mapRef.current.panTo(marker.getLatLng(), { animate: true });
      marker.openPopup();
    }
  }, [selectedRandoId]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fullscreen Map container */}
      <div id="map" ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Scale container at bottom left */}
      <div id="scaleContainer">
        <div id="customScale">
          <div className="black" />
          <div className="white" />
        </div>
        <div id="scaleValue">0 m</div>
      </div>
    </div>
  );
};
