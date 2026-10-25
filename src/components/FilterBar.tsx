import React from 'react';
import { RotateCcw, MapPin, Globe } from 'lucide-react';
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

// Crisp vector icons for each discipline
const RoadBikeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Wheels */}
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    {/* Road Bike Frame with drop bars */}
    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
    <path d="M12 17.5l2.5-6h-4l-3 6" />
    <path d="M14.5 11.5L12 6h2.5c1 0 1.5.8 1.5 1.5s-.5 1.5-1 1.5" />
    <path d="M5.5 17.5L8.5 9h3" />
  </svg>
);

const GravelBikeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Sturdy knobby wheels */}
    <circle cx="5.5" cy="17.5" r="3.5" strokeDasharray="1.5 1.5" />
    <circle cx="18.5" cy="17.5" r="3.5" strokeDasharray="1.5 1.5" />
    {/* Gravel Geometry Frame */}
    <path d="M12 17.5l2.2-6.5h-4.2l-2.8 6.5" />
    <path d="M14.2 11l-2.2-6h3c.8 0 1.5.5 1.5 1.2s-.5 1.8-1.5 1.8" />
    <path d="M5.5 17.5L9 8.5h3.2" />
  </svg>
);

const MountainBikeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Fat knobby tires */}
    <circle cx="5" cy="17" r="4" />
    <circle cx="19" cy="17" r="4" />
    {/* MTB Flat Handlebars & Sloping frame */}
    <path d="M12 17l2-6h-4l-3 6" />
    <path d="M14 11l-3-6h4" />
    <path d="M5 17l3-9h3.5" />
  </svg>
);

const HikingBootIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Hiking Shoe / Boot with treaded sole */}
    <path d="M4 17h16v2H4z" fill="currentColor" fillOpacity="0.2" />
    <path d="M4 17l1-6 4-2 3 2 3-5h3l2 11H4z" />
    <path d="M10 11l2 2" />
    <path d="M8 13l2 2" />
  </svg>
);

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
        On smartphone: ultra-compact strip (moitié moins large, ~30px) with icons and tiny count badges.
        On desktop (sm:): standard horizontal bar with labels.
      */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/90 p-1 flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 w-auto">
        {/* Disciplines group */}
        <div className="flex flex-col sm:flex-row items-center gap-1">
          {/* 1. ROUTE (Blue: #2563EB) */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'ROUTE' ? 'ALL' : 'ROUTE')}
            className={`w-7 sm:w-auto h-9 sm:h-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'ROUTE'
                ? 'bg-[#2563EB] text-white shadow-sm ring-1 ring-blue-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Route (Vélo de course bleu)"
          >
            <RoadBikeIcon className={`w-4 h-4 ${currentFilter === 'ROUTE' ? 'text-white' : 'text-[#2563EB]'}`} />
            <span className="hidden sm:inline">Route</span>
            <span
              className={`text-[8px] sm:text-[10px] px-1 py-0.2 rounded font-bold leading-none ${
                currentFilter === 'ROUTE' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.route}
            </span>
          </button>

          {/* 2. GRAVEL (Orange: #EA580C) */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'GRAVEL' ? 'ALL' : 'GRAVEL')}
            className={`w-7 sm:w-auto h-9 sm:h-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'GRAVEL'
                ? 'bg-[#EA580C] text-white shadow-sm ring-1 ring-orange-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Gravel (Vélo gravel orange)"
          >
            <GravelBikeIcon className={`w-4 h-4 ${currentFilter === 'GRAVEL' ? 'text-white' : 'text-[#EA580C]'}`} />
            <span className="hidden sm:inline">Gravel</span>
            <span
              className={`text-[8px] sm:text-[10px] px-1 py-0.2 rounded font-bold leading-none ${
                currentFilter === 'GRAVEL' ? 'bg-orange-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.gravel}
            </span>
          </button>

          {/* 3. VTT (Green: #16A34A) */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'VTT' ? 'ALL' : 'VTT')}
            className={`w-7 sm:w-auto h-9 sm:h-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'VTT'
                ? 'bg-[#16A34A] text-white shadow-sm ring-1 ring-green-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="VTT (VTT vert)"
          >
            <MountainBikeIcon className={`w-4 h-4 ${currentFilter === 'VTT' ? 'text-white' : 'text-[#16A34A]'}`} />
            <span className="hidden sm:inline">VTT</span>
            <span
              className={`text-[8px] sm:text-[10px] px-1 py-0.2 rounded font-bold leading-none ${
                currentFilter === 'VTT' ? 'bg-green-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.vtt}
            </span>
          </button>

          {/* 4. MARCHE (Red: #DC2626) */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'MARCHE' ? 'ALL' : 'MARCHE')}
            className={`w-7 sm:w-auto h-9 sm:h-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'MARCHE'
                ? 'bg-[#DC2626] text-white shadow-sm ring-1 ring-red-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Marche (Chaussure de marche rouge)"
          >
            <HikingBootIcon className={`w-4 h-4 ${currentFilter === 'MARCHE' ? 'text-white' : 'text-[#DC2626]'}`} />
            <span className="hidden sm:inline">Marche</span>
            <span
              className={`text-[8px] sm:text-[10px] px-1 py-0.2 rounded font-bold leading-none ${
                currentFilter === 'MARCHE' ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.marche}
            </span>
          </button>
        </div>

        {/* Separator */}
        <div className="w-full sm:w-[1px] h-[1px] sm:h-5 bg-slate-200 my-0.5 sm:my-0" />

        {/* 5. PROVINCE (Globe / MapPin icon) */}
        <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 sm:px-1.5 sm:py-1 text-xs">
          <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <select
            value={selectedProvince}
            onChange={(e) => onProvinceChange(e.target.value)}
            className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer text-[9px] sm:text-xs max-w-[28px] sm:max-w-none text-center sm:text-left"
            title="Filtrer par province"
          >
            <option value="ALL">Tout</option>
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

        {/* 6. RESET (Reset icon) */}
        <button
          type="button"
          onClick={onResetAll}
          className={`w-7 sm:w-auto h-8 sm:h-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 p-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentFilter === 'ALL' && selectedProvince === 'ALL'
              ? 'bg-slate-900 text-white font-semibold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 sm:bg-transparent'
          }`}
          title="Réinitialiser tous les filtres"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-normal leading-none">
            ({counts.all})
          </span>
        </button>
      </div>
    </div>
  );
};
