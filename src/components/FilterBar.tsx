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
      className="fixed left-2 top-1/2 -translate-y-1/2 sm:top-3 sm:left-1/2 sm:-translate-x-1/2 sm:translate-y-0 z-[1004] select-none"
    >
      {/* Container: Vertical on smartphone (left side), Horizontal on desktop (top center) */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/90 p-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-1.5 w-[140px] sm:w-auto">
        {/* Disciplines group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1">
          {/* Route */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'ROUTE' ? 'ALL' : 'ROUTE')}
            className={`flex items-center justify-between sm:justify-start gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentFilter === 'ROUTE'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Filtrer les parcours Route"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span>Route</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                currentFilter === 'ROUTE' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.route}
            </span>
          </button>

          {/* Gravel */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'GRAVEL' ? 'ALL' : 'GRAVEL')}
            className={`flex items-center justify-between sm:justify-start gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentFilter === 'GRAVEL'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Filtrer les parcours Gravel"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>Gravel</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                currentFilter === 'GRAVEL' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.gravel}
            </span>
          </button>

          {/* VTT */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'VTT' ? 'ALL' : 'VTT')}
            className={`flex items-center justify-between sm:justify-start gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentFilter === 'VTT'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Filtrer les randos VTT"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>VTT</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                currentFilter === 'VTT' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.vtt}
            </span>
          </button>
        </div>

        {/* Separator */}
        <div className="h-[1px] sm:h-5 w-full sm:w-[1px] bg-slate-200 my-0.5 sm:my-0" />

        {/* Province Filter Dropdown */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-xs">
          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
          <select
            value={selectedProvince}
            onChange={(e) => onProvinceChange(e.target.value)}
            className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer text-[11px] sm:text-xs w-full truncate"
            title="Filtrer par province"
          >
            <option value="ALL">Toutes prov.</option>
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
        <div className="h-[1px] sm:h-5 w-full sm:w-[1px] bg-slate-200 my-0.5 sm:my-0" />

        {/* Reset Button */}
        <button
          type="button"
          onClick={onResetAll}
          className={`flex items-center justify-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            currentFilter === 'ALL' && selectedProvince === 'ALL'
              ? 'bg-slate-900 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 sm:bg-transparent'
          }`}
          title="Réinitialiser tous les filtres"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
          <span className="text-[10px] text-slate-400 font-normal">
            ({counts.all})
          </span>
        </button>
      </div>
    </div>
  );
};
