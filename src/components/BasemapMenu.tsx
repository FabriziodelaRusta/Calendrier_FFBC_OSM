import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { BasemapType } from '../types';

interface BasemapMenuProps {
  currentBasemap: BasemapType;
  onBasemapChange: (type: BasemapType) => void;
}

interface BasemapOption {
  id: BasemapType;
  label: string;
  iconUrl: string;
  fallbackIcon: string;
}

const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: 'osm',
    label: 'OSM Standard',
    iconUrl: 'https://fabriziodelarusta.github.io/icons/OSM.png',
    fallbackIcon: '🗺️',
  },
  {
    id: 'cycle',
    label: 'CyclOSM Vélo',
    iconUrl: 'https://fabriziodelarusta.github.io/icons/velo_1.png',
    fallbackIcon: '🚴',
  },
  {
    id: 'esri',
    label: 'Satellite',
    iconUrl: 'https://fabriziodelarusta.github.io/icons/sat.png',
    fallbackIcon: '🛰️',
  },
  {
    id: 'carto',
    label: 'Clair / Minimal',
    iconUrl: 'https://fabriziodelarusta.github.io/icons/Network.png',
    fallbackIcon: '🌐',
  },
];

export const BasemapMenu: React.FC<BasemapMenuProps> = ({
  currentBasemap,
  onBasemapChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-12 right-3 z-[1002] select-none">
      <div className="relative">
        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Changer le fond de carte (OSM, Vélo, Satellite...)"
        >
          <Layers className="w-5 h-5" />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute bottom-12 right-0 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/90 p-2 w-48 flex flex-col gap-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
              Fonds de carte OSM
            </div>

            {BASEMAP_OPTIONS.map((opt) => {
              const isActive = currentBasemap === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onBasemapChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <img
                    src={opt.iconUrl}
                    alt={opt.label}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-6 h-6 rounded object-cover border border-slate-200 shrink-0"
                  />
                  <span className="truncate">{opt.label}</span>
                  {isActive && <span className="ml-auto text-blue-600 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
