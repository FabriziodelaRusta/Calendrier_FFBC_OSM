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
    marche: number;
  };
  selectedProvince: string;
  onProvinceChange: (province: string) => void;
  availableProvinces: string[];
  provinceCounts: Record<string, number>;
  onResetAll: () => void;
}

// 1. Road symbol (symbole route avec perspective et ligne médiane en pointillés)
const RoadIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Road perspective */}
    <path d="M4 20L8.5 4h7L20 20H4z" fill="currentColor" fillOpacity="0.15" />
    <path d="M4 20L8.5 4" />
    <path d="M20 20L15.5 4" />
    {/* Dashed center lane markings */}
    <line x1="12" y1="6" x2="12" y2="8.5" strokeWidth="2" stroke="currentColor" />
    <line x1="12" y1="11.5" x2="12" y2="14.5" strokeWidth="2" stroke="currentColor" />
    <line x1="12" y1="17.5" x2="12" y2="20" strokeWidth="2" stroke="currentColor" />
  </svg>
);

// 2. Gravel Bike Icon
const GravelBikeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="5.5" cy="17.5" r="3.5" strokeDasharray="1.5 1.5" />
    <circle cx="18.5" cy="17.5" r="3.5" strokeDasharray="1.5 1.5" />
    <path d="M12 17.5l2.2-6.5h-4.2l-2.8 6.5" />
    <path d="M14.2 11l-2.2-6h3c.8 0 1.5.5 1.5 1.2s-.5 1.8-1.5 1.8" />
    <path d="M5.5 17.5L9 8.5h3.2" />
  </svg>
);

// 3. Mountain Bike (VTT) Icon
const MountainBikeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="5" cy="17" r="4" />
    <circle cx="19" cy="17" r="4" />
    <path d="M12 17l2-6h-4l-3 6" />
    <path d="M14 11l-3-6h4" />
    <path d="M5 17l3-9h3.5" />
  </svg>
);

// 4. Footprints symbol (symbole empreinte de pas pour la marche)
const FootprintsIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Left footprint */}
    <ellipse cx="8" cy="15.5" rx="2.2" ry="3.8" fill="currentColor" fillOpacity="0.25" />
    <circle cx="8" cy="9.5" r="1.3" fill="currentColor" />
    <circle cx="6.3" cy="8" r="0.75" fill="currentColor" />
    <circle cx="8" cy="7.2" r="0.75" fill="currentColor" />
    <circle cx="9.7" cy="8" r="0.75" fill="currentColor" />
    {/* Right footprint stepping forward */}
    <ellipse cx="16" cy="11.5" rx="2.2" ry="3.8" fill="currentColor" fillOpacity="0.25" />
    <circle cx="16" cy="5.5" r="1.3" fill="currentColor" />
    <circle cx="14.3" cy="4" r="0.75" fill="currentColor" />
    <circle cx="16" cy="3.2" r="0.75" fill="currentColor" />
    <circle cx="17.7" cy="4" r="0.75" fill="currentColor" />
  </svg>
);

// 5. Belgium Map Silhouette Icon
const BelgiumMapIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Stylized recognizable contour of Belgium */}
    <path
      d="M3.5 12L6 8l5-2.5 4 1 3.5 4.5-1.5 5-5 3.5-5.5-1.5L3.5 15z"
      fill="currentColor"
      fillOpacity="0.25"
    />
    <path d="M3.5 12L6 8l5-2.5 4 1 3.5 4.5-1.5 5-5 3.5-5.5-1.5L3.5 15z" />
    {/* Subtle internal flag lines */}
    <line x1="10" y1="7" x2="9" y2="17" strokeWidth="1" strokeDasharray="1 2" opacity="0.6" />
    <line x1="14" y1="8" x2="13" y2="18" strokeWidth="1" strokeDasharray="1 2" opacity="0.6" />
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
  // Truncate province to 3 letters on mobile
  const provinceLabel3 = selectedProvince === 'ALL' ? '' : selectedProvince.slice(0, 3);

  return (
    <div
      className="fixed left-2 top-1/2 -translate-y-1/2 sm:top-3 sm:left-1/2 sm:-translate-x-1/2 sm:translate-y-0 z-[1004] select-none font-sans"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/90 p-1 flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 w-auto">
        {/* Disciplines group */}
        <div className="flex flex-col sm:flex-row items-center gap-1">
          {/* 1. ROUTE (Road icon, Blue #2563EB) */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'ROUTE' ? 'ALL' : 'ROUTE')}
            className={`w-7 sm:w-auto h-9 sm:h-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'ROUTE'
                ? 'bg-[#2563EB] text-white shadow-sm ring-1 ring-blue-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-blue-50/60'
            }`}
            title="Route (Symbole route bleu)"
          >
            <RoadIcon className={`w-4 h-4 ${currentFilter === 'ROUTE' ? 'text-white' : 'text-[#2563EB]'}`} />
            <span className="hidden sm:inline">Route</span>
            <span
              className={`text-[8px] sm:text-[10px] px-1 py-0.2 rounded font-bold leading-none ${
                currentFilter === 'ROUTE'
                  ? 'bg-blue-800 text-white'
                  : 'bg-blue-100 text-[#2563EB]'
              }`}
            >
              {counts.route}
            </span>
          </button>

          {/* 2. GRAVEL (Gravel icon, Orange #EA580C) */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'GRAVEL' ? 'ALL' : 'GRAVEL')}
            className={`w-7 sm:w-auto h-9 sm:h-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'GRAVEL'
                ? 'bg-[#EA580C] text-white shadow-sm ring-1 ring-orange-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-orange-50/60'
            }`}
            title="Gravel (Vélo gravel orange)"
          >
            <GravelBikeIcon className={`w-4 h-4 ${currentFilter === 'GRAVEL' ? 'text-white' : 'text-[#EA580C]'}`} />
            <span className="hidden sm:inline">Gravel</span>
            <span
              className={`text-[8px] sm:text-[10px] px-1 py-0.2 rounded font-bold leading-none ${
                currentFilter === 'GRAVEL'
                  ? 'bg-orange-800 text-white'
                  : 'bg-orange-100 text-[#EA580C]'
              }`}
            >
              {counts.gravel}
            </span>
          </button>

          {/* 3. VTT (Mountain Bike icon, Green #16A34A) */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'VTT' ? 'ALL' : 'VTT')}
            className={`w-7 sm:w-auto h-9 sm:h-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'VTT'
                ? 'bg-[#16A34A] text-white shadow-sm ring-1 ring-green-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-green-50/60'
            }`}
            title="VTT (VTT vert)"
          >
            <MountainBikeIcon className={`w-4 h-4 ${currentFilter === 'VTT' ? 'text-white' : 'text-[#16A34A]'}`} />
            <span className="hidden sm:inline">VTT</span>
            <span
              className={`text-[8px] sm:text-[10px] px-1 py-0.2 rounded font-bold leading-none ${
                currentFilter === 'VTT'
                  ? 'bg-green-800 text-white'
                  : 'bg-green-100 text-[#16A34A]'
              }`}
            >
              {counts.vtt}
            </span>
          </button>

          {/* 4. MARCHE (Footprints icon, Red #DC2626) */}
          <button
            type="button"
            onClick={() => onFilterChange(currentFilter === 'MARCHE' ? 'ALL' : 'MARCHE')}
            className={`w-7 sm:w-auto h-9 sm:h-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentFilter === 'MARCHE'
                ? 'bg-[#DC2626] text-white shadow-sm ring-1 ring-red-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-red-50/60'
            }`}
            title="Marche (Empreinte de pas rouge)"
          >
            <FootprintsIcon className={`w-4 h-4 ${currentFilter === 'MARCHE' ? 'text-white' : 'text-[#DC2626]'}`} />
            <span className="hidden sm:inline">Marche</span>
            <span
              className={`text-[8px] sm:text-[10px] px-1 py-0.2 rounded font-bold leading-none ${
                currentFilter === 'MARCHE'
                  ? 'bg-red-800 text-white'
                  : 'bg-red-100 text-[#DC2626]'
              }`}
            >
              {counts.marche}
            </span>
          </button>
        </div>

        {/* Separator */}
        <div className="w-full sm:w-[1px] h-[1px] sm:h-5 bg-slate-200 my-0.5 sm:my-0" />

        {/* 5. PROVINCE: Belgium map icon if Tout, or 3 first letters if selected */}
        <div className="relative flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 sm:px-1.5 sm:py-1 text-xs">
          {/* On mobile: show Belgium Map Icon if ALL, or 3 letters if province selected */}
          <div className="sm:hidden flex flex-col items-center justify-center w-6 h-7">
            {selectedProvince === 'ALL' ? (
              <BelgiumMapIcon className="w-4 h-4 text-slate-700" />
            ) : (
              <span className="text-[9px] font-black text-blue-700 leading-none">
                {provinceLabel3}
              </span>
            )}
            {/* Invisible native select overlay for tap on mobile */}
            <select
              value={selectedProvince}
              onChange={(e) => onProvinceChange(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              title="Filtrer par province"
            >
              <option value="ALL">Toute la Belgique</option>
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

          {/* On desktop: show Belgium Map Icon + select dropdown */}
          <div className="hidden sm:flex items-center gap-1.5">
            <BelgiumMapIcon className="w-4 h-4 text-slate-700 shrink-0" />
            <select
              value={selectedProvince}
              onChange={(e) => onProvinceChange(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer text-xs"
              title="Filtrer par province"
            >
              <option value="ALL">Toute la Belgique</option>
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
        </div>

        {/* Separator */}
        <div className="w-full sm:w-[1px] h-[1px] sm:h-5 bg-slate-200 my-0.5 sm:my-0" />

        {/* 6. RESET */}
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
