import React from 'react';
import { RotateCcw, MapPin } from 'lucide-react';
import { DisciplineFilter } from '../types';

interface FilterBarProps {
  currentFilter: DisciplineFilter;
  onFilterChange: (filter: DisciplineFilter) => void;
  counts: {
    all: number;
    route: number;
    gravel: number;
    vtt: number;
    marche: number;
  };
  selectedProvince: string;
  onProvinceChange: (province: string) => void;
  availableProvinces: string[];
  provinceCounts: Record<string, number>;
  onResetAll: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  counts,
  selectedProvince,
  onProvinceChange,
  availableProvinces,
  provinceCounts,
  onResetAll,
}) => {
  return (
    <div
      className="fixed left-2 top-1/2 -translate-y-1/2 sm:top-3 sm:left-1/2 sm:-translate-x-1/2 sm:translate-y-0 z-[1004] select-none font-sans"
    >
      {/* 
        On smartphone: ultra-slim vertical column hugging the left edge (vertical text R-o-u-t-e).
        On desktop (sm:): sleek horizontal bar at top center.
      */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/90 p-1 flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 w-auto">
        {/* Disciplines group */}
        <div className="flex flex-col sm:flex-row items-center gap-1">
          {/* 1. ROUTE */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'ROUTE' ? 'ALL' : 'ROUTE')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-1 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'ROUTE'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Filtrer Route"
          >
            {/* Dot on desktop */}
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-blue-500 shrink-0" />

            {/* Vertical text on mobile */}
            <div className="flex flex-col sm:hidden items-center text-[9px] font-bold leading-[1.05] tracking-tighter">
              <span>R</span>
              <span>o</span>
              <span>u</span>
              <span>t</span>
              <span>e</span>
            </div>

            {/* Horizontal text on desktop */}
            <span className="hidden sm:inline">Route</span>

            {/* Badge */}
            <span
              className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-bold ${
                currentFilter === 'ROUTE' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.route}
            </span>
          </button>

          {/* 2. GRAVEL */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'GRAVEL' ? 'ALL' : 'GRAVEL')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-1 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'GRAVEL'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Filtrer Gravel"
          >
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-amber-500 shrink-0" />

            <div className="flex flex-col sm:hidden items-center text-[9px] font-bold leading-[1.05] tracking-tighter">
              <span>G</span>
              <span>r</span>
              <span>a</span>
              <span>v</span>
              <span>e</span>
              <span>l</span>
            </div>

            <span className="hidden sm:inline">Gravel</span>

            <span
              className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-bold ${
                currentFilter === 'GRAVEL' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.gravel}
            </span>
          </button>

          {/* 3. VTT */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'VTT' ? 'ALL' : 'VTT')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-1 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'VTT'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Filtrer VTT"
          >
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0" />

            <div className="flex flex-col sm:hidden items-center text-[9px] font-bold leading-[1.05] tracking-tighter">
              <span>V</span>
              <span>T</span>
              <span>T</span>
            </div>

            <span className="hidden sm:inline">VTT</span>

            <span
              className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-bold ${
                currentFilter === 'VTT' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.vtt}
            </span>
          </button>

          {/* 4. MARCHE (newly added) */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'MARCHE' ? 'ALL' : 'MARCHE')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-1 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'MARCHE'
                ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Filtrer Marche"
          >
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-rose-500 shrink-0" />

            <div className="flex flex-col sm:hidden items-center text-[9px] font-bold leading-[1.05] tracking-tighter">
              <span>M</span>
              <span>a</span>
              <span>r</span>
              <span>c</span>
              <span>h</span>
              <span>e</span>
            </div>

            <span className="hidden sm:inline">Marche</span>

            <span
              className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-bold ${
                currentFilter === 'MARCHE' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.marche}
            </span>
          </button>
        </div>

        {/* Separator */}
        <div className="w-full sm:w-[1px] h-[1px] sm:h-5 bg-slate-200 my-0.5 sm:my-0" />

        {/* Province Filter Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 sm:px-1.5 sm:py-1 text-xs">
          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
          <select
            value={selectedProvince}
            onChange={(e) => onProvinceChange(e.target.value)}
            className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer text-[10px] sm:text-xs max-w-[40px] sm:max-w-none text-center sm:text-left"
            title="Filtrer par province"
          >
            <option value="ALL">Toutes</option>
            {availableProvinces.map((prov) => {
              const qty = provinceCounts[prov] || 0;
              return (
                <option key={prov} value={prov}>
                  {prov} {qty > 0 ? `(${qty})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Separator */}
        <div className="w-full sm:w-[1px] h-[1px] sm:h-5 bg-slate-200 my-0.5 sm:my-0" />

        {/* Reset Button */}
        <button
          type="button"
          onClick={onResetAll}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 px-1 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentFilter === 'ALL' && selectedProvince === 'ALL'
              ? 'bg-slate-900 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 sm:bg-transparent'
          }`}
          title="Réinitialiser tous les filtres"
        >
          <RotateCcw className="w-3 h-3" />
          <div className="flex flex-col sm:hidden items-center text-[8px] font-bold leading-none tracking-tighter">
            <span>R</span>
            <span>s</span>
            <span>t</span>
          </div>
          <span className="hidden sm:inline">Reset</span>
          <span className="text-[9px] text-slate-400 font-normal">
            ({counts.all})
          </span>
        </button>
      </div>
    </div>
  );
};
