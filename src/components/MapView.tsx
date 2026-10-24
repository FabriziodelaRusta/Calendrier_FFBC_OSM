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
  carto: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution: '&copy; CartoDB &amp; OpenStreetMap contributors',
    maxZoom: 19,
  },
};

function createPinIcon(rando: FFBCRando, isSelected: boolean): L.DivIcon {
  const parcoursTypes = (rando.parcours || []).map(p => (p.type || '').toUpperCase());
  const nameUpper = (rando.nom || '').toUpperCase();

  const isVtt = parcoursTypes.some(t => t.includes('VTT')) || nameUpper.includes('VTT');
  const isGravel = parcoursTypes.some(t => t.includes('GRAVEL')) || nameUpper.includes('GRAVEL');
  const isRoute = parcoursTypes.some(t => t.includes('ROUTE') || t.includes('CYCLO') || t.includes('EASY')) || (!isVtt && !isGravel);

  let pinColor = '#2563EB'; // Blue Route
  let typeLabel = 'ROUTE';

  if (isVtt && isGravel) {
    pinColor = '#7C3AED'; // Mixed
    typeLabel = 'MIXTE';
  } else if (isVtt) {
    pinColor = '#059669'; // Green VTT
    typeLabel = 'VTT';
  } else if (isGravel) {
    pinColor = '#D97706'; // Amber Gravel
    typeLabel = 'GRAVEL';
  }

  const pulseEffect = isSelected ? 'animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;' : '';

  const html = `
    <div style="position: relative; width: 34px; height: 42px; cursor: pointer; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.35)); transition: transform 0.15s ease;">
      <svg viewBox="0 0 34 42" width="34" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 0C7.611 0 0 7.611 0 17C0 27.5 14.5 40.5 16.2 41.9C16.65 42.27 17.35 42.27 17.8 41.9C19.5 40.5 34 27.5 34 17C34 7.611 26.389 0 17 0Z" fill="${pinColor}"/>
        <path d="M17 2C8.716 2 2 8.716 2 17C2 26 15 38 17 39.7C19 38 32 26 32 17C32 8.716 25.284 2 17 2Z" fill="${pinColor}" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.6"/>
        <circle cx="17" cy="16" r="11" fill="#ffffff"/>
      </svg>
      <div style="position: absolute; top: 7px; left: 0; right: 0; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 13px; line-height: 1; user-select: none;">🚴</span>
      </div>
      <div style="position: absolute; bottom: 13px; left: 0; right: 0; text-align: center;">
        <span style="background: ${pinColor}; color: #ffffff; font-size: 8px; font-weight: 800; padding: 1px 3px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.04em;">
          ${typeLabel}
        </span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'ffbc-marker-icon',
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
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
      // Ignore initial render calculations before map size settles
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on Belgium initially
    const map = L.map(mapContainerRef.current, {
      center: [50.5039, 4.4699],
      zoom: 8,
      zoomControl: false, // will place zoom in bottomleft explicitly
    });

    // Add zoom control at bottom left
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

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
        offset: [0, -32],
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

    // Auto center map on all events of the day/filter
    if (latLngs.length === 1) {
      map.setView(latLngs[0], 12, { animate: true });
    } else if (latLngs.length > 1) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 13,
        animate: true,
      });
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

      {/* Custom Scale container placed at bottom left next to Leaflet zoom buttons */}
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
