import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FFBCRando, BasemapType, DisciplineFilter } from '../types';
import { generatePopupContent, generateTooltipContent } from '../utils/popupGenerator';
import { matchDiscipline } from '../utils/dataLoader';

interface MapViewProps {
  events: FFBCRando[];
  selectedDate: string;
  selectedRandoId?: string | null;
  onSelectRando?: (rando: FFBCRando) => void;
  basemap: BasemapType;
  activeFilter?: DisciplineFilter;
}

const BASEMAP_TILES: Record<BasemapType, { url: string; attribution: string; maxZoom: number }> = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  cycle: {
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

interface SinglePinInfo {
  color: string;
  letter: string;
  type: DisciplineFilter;
  rando: FFBCRando;
}

// Generate stacked pins for multi-discipline randos or co-located events
function createLocationPinIcon(
  pins: SinglePinInfo[],
  isSelected: boolean
): L.DivIcon {
  const pinCount = pins.length;
  const offsetX = 7; // Horizontal fan shift per stacked pin
  const offsetY = 4; // Vertical fan shift per stacked pin
  const baseWidth = 22;
  const baseHeight = 28;
  const totalWidth = baseWidth + (pinCount - 1) * offsetX;
  const totalHeight = baseHeight + (pinCount - 1) * offsetY;

  const pulseStyle = isSelected
    ? 'filter: drop-shadow(0 0 7px rgba(37,99,235,0.9)); transform: scale(1.15);'
    : 'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));';

  let pinSvgs = '';
  pins.forEach((p, idx) => {
    const left = idx * offsetX;
    const bottom = (pinCount - 1 - idx) * offsetY;
    const z = 10 + idx;

    pinSvgs += `
      <div style="position: absolute; left: ${left}px; bottom: ${bottom}px; width: 22px; height: 28px; z-index: ${z}; transition: transform 0.15s ease;">
        <svg viewBox="0 0 22 28" width="22" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 0C4.925 0 0 4.925 0 11C0 18.5 9.5 26.8 10.4 27.7C10.7 28 11.3 28 11.6 27.7C12.5 26.8 22 18.5 22 11C22 4.925 17.075 0 11 0Z" fill="${p.color}"/>
          <path d="M11 1.5C5.753 1.5 1.5 5.753 1.5 11C1.5 17.5 10 24.8 11 25.8C12 24.8 20.5 17.5 20.5 11C20.5 5.753 16.247 1.5 11 1.5Z" stroke="#ffffff" stroke-width="1.3"/>
          <circle cx="11" cy="10" r="5.8" fill="#ffffff"/>
        </svg>
        <div style="position: absolute; top: 4px; left: 0; right: 0; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 9px; font-weight: 900; color: ${p.color}; line-height: 1; user-select: none; font-family: system-ui, sans-serif;">
            ${p.letter}
          </span>
        </div>
      </div>
    `;
  });

  const html = `
    <div style="position: relative; width: ${totalWidth}px; height: ${totalHeight}px; cursor: pointer; ${pulseStyle}">
      ${pinSvgs}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'ffbc-stacked-marker-icon',
    iconSize: [totalWidth, totalHeight],
    iconAnchor: [11, totalHeight],
    popupAnchor: [Math.round(totalWidth / 2) - 11, -totalHeight + 2],
  });
}

export const MapView: React.FC<MapViewProps> = ({
  events,
  selectedDate,
  selectedRandoId,
  onSelectRando,
  basemap,
  activeFilter = 'ALL',
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

  // Update Markers and fit bounds whenever events or activeFilter changes
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

    // Group events by location key (same GPS coordinates within ~10 meters)
    const locationGroups = new Map<string, { lat: number; lng: number; randos: FFBCRando[] }>();

    validEvents.forEach((rando) => {
      const lat = rando.computedLat!;
      const lng = rando.computedLng!;
      const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
      const existing = locationGroups.get(key) || { lat, lng, randos: [] };
      existing.randos.push(rando);
      locationGroups.set(key, existing);
    });

    const latLngs: L.LatLng[] = [];

    // For each location, assemble all discipline pins to stack
    locationGroups.forEach(({ lat, lng, randos }) => {
      const pins: SinglePinInfo[] = [];

      randos.forEach((rando) => {
        // Collect disciplines
        const hasRoute = matchDiscipline(rando, 'ROUTE');
        const hasGravel = matchDiscipline(rando, 'GRAVEL');
        const hasVtt = matchDiscipline(rando, 'VTT');
        const hasMarche = matchDiscipline(rando, 'MARCHE');

        if (activeFilter === 'ROUTE' && hasRoute) {
          pins.push({ color: '#2563EB', letter: 'R', type: 'ROUTE', rando });
        } else if (activeFilter === 'GRAVEL' && hasGravel) {
          pins.push({ color: '#EA580C', letter: 'G', type: 'GRAVEL', rando });
        } else if (activeFilter === 'VTT' && hasVtt) {
          pins.push({ color: '#16A34A', letter: 'V', type: 'VTT', rando });
        } else if (activeFilter === 'MARCHE' && hasMarche) {
          pins.push({ color: '#DC2626', letter: 'M', type: 'MARCHE', rando });
        } else if (activeFilter === 'ALL') {
          // Stack all disciplines present in this rando
          if (hasRoute) pins.push({ color: '#2563EB', letter: 'R', type: 'ROUTE', rando });
          if (hasGravel) pins.push({ color: '#EA580C', letter: 'G', type: 'GRAVEL', rando });
          if (hasVtt) pins.push({ color: '#16A34A', letter: 'V', type: 'VTT', rando });
          if (hasMarche) pins.push({ color: '#DC2626', letter: 'M', type: 'MARCHE', rando });
        }
      });

      if (pins.length === 0) return;

      const isSelected = randos.some(r => r.id === selectedRandoId);

      const marker = L.marker([lat, lng], {
        icon: createLocationPinIcon(pins, isSelected),
        riseOnHover: true,
      });

      // Tooltip on hover
      const tooltipContent = randos.map(r => generateTooltipContent(r)).join('<br/><div class="my-1 border-t border-slate-700"></div>');
      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -26],
        opacity: 0.95,
        className: 'ffbc-leaflet-tooltip',
      });

      // Rich popup on click
      const popupHtml = randos.length === 1
        ? generatePopupContent(randos[0])
        : `
          <div class="max-h-[80vh] overflow-y-auto space-y-3 pr-1">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              ${randos.length} randonnées au même lieu :
            </div>
            ${randos.map(r => generatePopupContent(r)).join('<div class="my-2 border-t border-slate-200"></div>')}
          </div>
        `;

      marker.bindPopup(popupHtml, {
        maxWidth: 360,
        className: 'ffbc-leaflet-popup',
        autoPanPadding: [50, 50],
      });

      marker.on('click', () => {
        onSelectRando?.(randos[0]);
      });

      markersLayer.addLayer(marker);
      randos.forEach(r => {
        markersByIdRef.current.set(r.id, marker);
      });

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
  }, [events, selectedDate, activeFilter]);

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
