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
}

const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: 'osm',
    label: 'OSM Standard',
    iconUrl: 'https://fabriziodelarusta.github.io/icons/OSM.png',
  },
  {
    id: 'cycle',
    label: 'CyclOSM (Vélo)',
    iconUrl: 'https://fabriziodelarusta.github.io/icons/velo_1.png',
  },
  {
    id: 'esri',
    label: 'Satellite',
    iconUrl: 'https://fabriziodelarusta.github.io/icons/sat.png',
  },
];

export const BasemapMenu: React.FC<BasemapMenuProps> = ({
  currentBasemap,
  onBasemapChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-[98px] right-[14px] z-[1002] select-none font-sans">
      <div className="relative">
        {/* Floating single icon button right above the zoom controls */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border flex items-center justify-center transition-all cursor-pointer ${
            isOpen
              ? 'border-blue-500 text-blue-600 ring-2 ring-blue-400'
              : 'border-slate-200/90 text-slate-700 hover:text-blue-600 hover:bg-slate-50'
          }`}
          title="Changer le fond de carte"
        >
          <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Dropdown menu appearing above/beside the button */}
        {isOpen && (
          <div className="absolute bottom-11 right-0 bg-white/98 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200/90 p-2 w-44 flex flex-col gap-1 z-50">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-0.5">
              Fonds de carte
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
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
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
