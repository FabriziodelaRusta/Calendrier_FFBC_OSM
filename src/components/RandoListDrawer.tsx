import React from 'react';
import { X, MapPin, ChevronRight, Navigation, Clock, Calendar } from 'lucide-react';
import { FFBCRando } from '../types';
import { formatDateFrench } from '../utils/formatters';

interface RandoListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: FFBCRando[];
  selectedDate: string;
  selectedRandoId?: string | null;
  onSelectRando: (rando: FFBCRando) => void;
}

export const RandoListDrawer: React.FC<RandoListDrawerProps> = ({
  isOpen,
  onClose,
  events,
  selectedDate,
  selectedRandoId,
  onSelectRando,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-[1010] w-full sm:w-[380px] bg-white/98 backdrop-blur-md shadow-2xl border-r border-slate-200 flex flex-col font-sans transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
            Randonnées du jour
          </div>
          <h2 className="text-sm font-bold text-white capitalize mt-0.5">
            {formatDateFrench(selectedDate)}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Fermer la liste"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Subheader stats */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <span>
          <strong className="text-slate-900 font-semibold">{events.length}</strong> randonnée{events.length > 1 ? 's' : ''} trouvée{events.length > 1 ? 's' : ''}
        </span>
        <span className="text-[11px] text-slate-500">
          Cliquez pour localiser sur la carte
        </span>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              Aucune randonnée ce jour
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto">
              Utilisez le calendrier en haut à droite pour choisir une autre date ou naviguer de mois en mois.
            </p>
          </div>
        ) : (
          events.map((rando) => {
            const isSelected = rando.id === selectedRandoId;
            const parcours = rando.parcours || [];
            const distances = parcours
              .map(p => p.distance_km ? `${p.distance_km} km` : null)
              .filter(Boolean);

            return (
              <div
                key={rando.id}
                onClick={() => onSelectRando(rando)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-400 shadow-sm ring-1 ring-blue-300'
                    : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {/* Title & Province */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                    {rando.nom}
                  </h4>
                  {rando.province && (
                    <span className="text-[10px] font-semibold text-slate-500 shrink-0 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded">
                      {rando.province}
                    </span>
                  )}
                </div>

                {/* Club */}
                {rando.club && (
                  <div className="text-xs text-blue-700 font-medium mt-1 truncate">
                    {rando.club}
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">
                    {rando.lieu_depart ? `${rando.lieu_depart} — ` : ''}
                    {rando.localite || rando.code_postal || 'Belgique'}
                  </span>
                </div>

                {/* Distances & Parcours */}
                {distances.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {distances.map((dist, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800"
                      >
                        {dist}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer action */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px]">
                    {parcours.length} circuit{parcours.length > 1 ? 's' : ''}
                  </span>
                  <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                    <span>Centrer sur la carte</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
