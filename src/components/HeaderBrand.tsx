import React, { useState } from 'react';
import { RefreshCw, List } from 'lucide-react';

interface HeaderBrandProps {
  onRefresh: () => void;
  isLoading: boolean;
  onOpenList?: () => void;
  itemsCount: number;
  totalEventsCount: number;
}

export const HeaderBrand: React.FC<HeaderBrandProps> = ({
  onRefresh,
  isLoading,
  onOpenList,
  itemsCount,
  totalEventsCount,
}) => {
  const [logoLoaded, setLogoLoaded] = useState(true);

  return (
    <div className="fixed top-3 left-3 z-[1005] select-none">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/90 p-2.5 flex items-center gap-3">
        {/* Club Logo */}
        <div className="w-12 h-14 shrink-0 flex items-center justify-center relative">
          {logoLoaded ? (
            <img
              src="https://fabriziodelarusta.github.io/icons/logo-RPA_bleu.png"
              alt="Logo Club RPA"
              referrerPolicy="no-referrer"
              onError={() => setLogoLoaded(false)}
              className="max-h-full max-w-full object-contain filter drop-shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
              RPA
            </div>
          )}
        </div>

        {/* Title & Subtitle */}
        <div className="pr-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              Calendrier FFBC
            </h1>
          </div>
          <p className="text-xs font-semibold text-blue-600 leading-snug">
            Où vais-je aller ?
          </p>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span>{itemsCount} rando{itemsCount > 1 ? 's' : ''} le jour J</span>
            <span>·</span>
            <span>{totalEventsCount} au total</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex flex-col gap-1 border-l border-slate-100 pl-2">
          {onOpenList && (
            <button
              onClick={onOpenList}
              title="Afficher la liste des randonnées"
              className="p-1 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Recharger le calendrier depuis GitHub"
            className="p-1 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
