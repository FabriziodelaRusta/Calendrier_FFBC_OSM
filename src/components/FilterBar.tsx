import React from 'react';
import { RotateCcw } from 'lucide-react';
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
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[1005] select-none"
      style={{ maxWidth: 'calc(100vw - 32px)' }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/90 p-1 flex items-center gap-1">
        {/* Route Button */}
        <button
          type="button"
          onClick={() => onFilterChange(currentFilter === 'ROUTE' ? 'ALL' : 'ROUTE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            currentFilter === 'ROUTE'
              ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-700'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Filtrer les sorties cyclotourisme et route"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Route</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded font-bold ${
              currentFilter === 'ROUTE' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {counts.route}
          </span>
        </button>

        {/* Gravel Button */}
        <button
          type="button"
          onClick={() => onFilterChange(currentFilter === 'GRAVEL' ? 'ALL' : 'GRAVEL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            currentFilter === 'GRAVEL'
              ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-700'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Filtrer les parcours Gravel"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Gravel</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded font-bold ${
              currentFilter === 'GRAVEL' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {counts.gravel}
          </span>
        </button>

        {/* VTT Button */}
        <button
          type="button"
          onClick={() => onFilterChange(currentFilter === 'VTT' ? 'ALL' : 'VTT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            currentFilter === 'VTT'
              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Filtrer les randos VTT"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>VTT</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded font-bold ${
              currentFilter === 'VTT' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {counts.vtt}
          </span>
        </button>

        {/* Separator */}
        <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

        {/* Reset / All itineraries button */}
        <button
          type="button"
          onClick={() => onFilterChange('ALL')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            currentFilter === 'ALL'
              ? 'bg-slate-900 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Réinitialiser pour afficher tous les itinéraires disponibles"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Réinitialiser</span>
          <span className="text-[11px] text-slate-400 font-normal">
            ({counts.all})
          </span>
        </button>
      </div>
    </div>
  );
};
