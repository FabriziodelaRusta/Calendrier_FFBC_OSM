import React from 'react';
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
  return (
    <div className="w-[290px] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/90 p-1.5 select-none font-sans">
      <div className="flex items-center justify-between px-1.5 py-1 mb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Fond de carte</span>
        </div>
        <span className="text-[10px] text-slate-400">
          {BASEMAP_OPTIONS.find(b => b.id === currentBasemap)?.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {BASEMAP_OPTIONS.map((opt) => {
          const isActive = currentBasemap === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onBasemapChange(opt.id)}
              className={`flex flex-col items-center p-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-sm ring-1 ring-blue-700'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/80'
              }`}
              title={`Afficher le fond ${opt.label}`}
            >
              <img
                src={opt.iconUrl}
                alt={opt.label}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className={`w-7 h-7 rounded object-cover mb-1 border ${
                  isActive ? 'border-white/50' : 'border-slate-200'
                }`}
              />
              <span className="truncate max-w-full text-[10px] leading-tight">
                {opt.id === 'osm' ? 'OSM' : opt.id === 'cycle' ? 'CyclOSM' : 'Satellite'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
