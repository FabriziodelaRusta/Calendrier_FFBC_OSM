import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Minimize2, Maximize2 } from 'lucide-react';
import { FFBCRando } from '../types';
import { formatDateShortFrench } from '../utils/formatters';
import { matchDiscipline } from '../utils/dataLoader';

interface CalendarWidgetProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  allEvents: FFBCRando[];
  todayDate: string; // YYYY-MM-DD
}

interface DateDisciplines {
  count: number;
  hasRoute: boolean;
  hasGravel: boolean;
  hasVtt: boolean;
  hasMarche: boolean;
}

// Exactly 3 letters for month names as requested
const MONTH_NAMES_3 = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
];

const WEEKDAY_NAMES = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate,
  onSelectDate,
  allEvents,
  todayDate,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Initialize current view month and year based on selectedDate or todayDate
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    const d = selectedDate || todayDate || '2026-10-24';
    const [y, m] = d.split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const viewYear = currentViewDate.getFullYear();
  const viewMonth = currentViewDate.getMonth();

  // Map of date string -> disciplines summary (including Marche)
  const disciplinesByDate = useMemo(() => {
    const map = new Map<string, DateDisciplines>();
    for (const ev of allEvents) {
      if (ev.date) {
        const current = map.get(ev.date) || {
          count: 0,
          hasRoute: false,
          hasGravel: false,
          hasVtt: false,
          hasMarche: false,
        };
        current.count += 1;
        if (matchDiscipline(ev, 'ROUTE')) current.hasRoute = true;
        if (matchDiscipline(ev, 'GRAVEL')) current.hasGravel = true;
        if (matchDiscipline(ev, 'VTT')) current.hasVtt = true;
        if (matchDiscipline(ev, 'MARCHE')) current.hasMarche = true;
        map.set(ev.date, current);
      }
    }
    return map;
  }, [allEvents]);

  // Find next upcoming date with events relative to selected date
  const nextDateWithEvent = useMemo(() => {
    const datesWithEvents = Array.from(disciplinesByDate.keys()).sort();
    return datesWithEvents.find(d => d > selectedDate) || datesWithEvents[0] || null;
  }, [disciplinesByDate, selectedDate]);

  // Total events in current viewed month
  const eventsInViewMonth = useMemo(() => {
    let count = 0;
    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    for (const [date, info] of disciplinesByDate.entries()) {
      if (date.startsWith(prefix)) {
        count += info.count;
      }
    }
    return count;
  }, [disciplinesByDate, viewYear, viewMonth]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleTodayClick = () => {
    onSelectDate(todayDate);
    const [y, m] = todayDate.split('-').map(Number);
    setCurrentViewDate(new Date(y, m - 1, 1));
  };

  // Generate calendar days
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const cells: Array<{
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      disciplines: DateDisciplines;
    }> = [];

    const emptyDisciplines: DateDisciplines = {
      count: 0,
      hasRoute: false,
      hasGravel: false,
      hasVtt: false,
      hasMarche: false,
    };

    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(viewYear, viewMonth - 1, d);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
        disciplines: disciplinesByDate.get(dateStr) || emptyDisciplines,
      });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        disciplines: disciplinesByDate.get(dateStr) || emptyDisciplines,
      });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(viewYear, viewMonth + 1, d);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
        disciplines: disciplinesByDate.get(dateStr) || emptyDisciplines,
      });
    }

    return cells;
  }, [viewYear, viewMonth, disciplinesByDate]);

  const selectedDisciplines = disciplinesByDate.get(selectedDate) || {
    count: 0,
    hasRoute: false,
    hasGravel: false,
    hasVtt: false,
    hasMarche: false,
  };

  return (
    <div
      className="fixed top-2 right-2 sm:top-3 sm:right-3 z-[1005] select-none font-sans w-[48vw] sm:w-[280px]"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/90 overflow-hidden w-full transition-all duration-200">
        {/* Header Bar: Month name in 3 letters only */}
        <div className="bg-slate-900 text-white px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0">
            <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs truncate tracking-tight uppercase">
              {MONTH_NAMES_3[viewMonth]} {viewYear}
            </span>
            {eventsInViewMonth > 0 && (
              <span className="text-[10px] text-slate-300 font-bold shrink-0">
                ({eventsInViewMonth})
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              onClick={handleTodayClick}
              title="Aujourd'hui"
              className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium transition-colors cursor-pointer"
            >
              Aj.
            </button>

            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMinimized ? 'Agrandir' : 'Réduire'}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Minimized strip */}
        {isMinimized ? (
          <div
            onClick={() => setIsMinimized(false)}
            className="p-1.5 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 text-[10px]"
          >
            <div className="flex items-center gap-1 truncate">
              <span className="font-bold text-slate-800 truncate">
                J : {formatDateShortFrench(selectedDate)}
              </span>
              <span className="text-blue-600 font-bold">
                ({selectedDisciplines.count})
              </span>
            </div>
            <span className="text-blue-600 font-medium text-[9px] ml-1 shrink-0">Ouvrir</span>
          </div>
        ) : (
          <div className="p-1.5 sm:p-2.5">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={handlePrevMonth}
                className="p-0.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Mois précédent"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="text-[10px] sm:text-xs font-semibold text-slate-700 truncate px-1">
                Jour J
              </div>

              <button
                onClick={handleNextMonth}
                className="p-0.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Mois suivant"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Weekdays row */}
            <div className="grid grid-cols-7 gap-0.5 text-center mb-0.5">
              {WEEKDAY_NAMES.map((name, i) => (
                <span
                  key={name}
                  className={`text-[9px] sm:text-[10px] font-semibold py-0.2 ${
                    i >= 5 ? 'text-amber-700' : 'text-slate-400'
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarCells.map((cell) => {
                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.dateStr === todayDate;
                const hasEvents = cell.disciplines.count > 0;

                let btnClass = 'relative flex flex-col items-center justify-start pt-0.5 h-6 sm:h-7 rounded text-[9px] sm:text-[11px] font-medium transition-all cursor-pointer ';

                if (isSelected) {
                  btnClass += 'bg-blue-600 text-white font-bold shadow-sm scale-105 z-10';
                } else if (!cell.isCurrentMonth) {
                  btnClass += 'text-slate-300 hover:bg-slate-50 ';
                } else if (hasEvents) {
                  btnClass += 'text-slate-900 bg-sky-50/90 hover:bg-sky-100 font-bold ';
                } else {
                  btnClass += 'text-slate-700 hover:bg-slate-100 ';
                }

                if (isToday && !isSelected) {
                  btnClass += ' ring-1 ring-sky-400';
                }

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => {
                      onSelectDate(cell.dateStr);
                      if (!cell.isCurrentMonth) {
                        const [y, m] = cell.dateStr.split('-').map(Number);
                        setCurrentViewDate(new Date(y, m - 1, 1));
                      }
                    }}
                    className={btnClass}
                    title={`${cell.dateStr}${hasEvents ? ` (${cell.disciplines.count} rando${cell.disciplines.count > 1 ? 's' : ''})` : ''}`}
                  >
                    <span>{cell.dayNum}</span>

                    {/* Colored dots for route (blue), gravel (amber), vtt (green), marche (rose) */}
                    {hasEvents && (
                      <div className="absolute bottom-0.5 flex items-center justify-center gap-[1.5px] max-w-full overflow-hidden px-0.5">
                        {cell.disciplines.hasRoute && (
                          <span
                            className={`w-1 h-1 rounded-full ${
                              isSelected ? 'bg-sky-200' : 'bg-blue-600'
                            }`}
                            title="Route"
                          />
                        )}
                        {cell.disciplines.hasGravel && (
                          <span
                            className={`w-1 h-1 rounded-full ${
                              isSelected ? 'bg-amber-300' : 'bg-amber-500'
                            }`}
                            title="Gravel"
                          />
                        )}
                        {cell.disciplines.hasVtt && (
                          <span
                            className={`w-1 h-1 rounded-full ${
                              isSelected ? 'bg-emerald-300' : 'bg-emerald-600'
                            }`}
                            title="VTT"
                          />
                        )}
                        {cell.disciplines.hasMarche && (
                          <span
                            className={`w-1 h-1 rounded-full ${
                              isSelected ? 'bg-pink-300' : 'bg-rose-500'
                            }`}
                            title="Marche"
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Summary */}
            <div className="mt-1.5 pt-1 border-t border-slate-100 text-[10px]">
              <div className="flex items-center justify-between text-slate-800 gap-1">
                <div className="font-semibold truncate text-[9px] sm:text-[11px]">
                  {formatDateShortFrench(selectedDate)}
                </div>
                <div
                  className={`font-bold px-1 py-0.2 rounded text-[9px] shrink-0 ${
                    selectedDisciplines.count > 0
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedDisciplines.count} rando{selectedDisciplines.count > 1 ? 's' : ''}
                </div>
              </div>

              {selectedDisciplines.count === 0 && nextDateWithEvent && (
                <div className="mt-1">
                  <button
                    onClick={() => {
                      onSelectDate(nextDateWithEvent);
                      const [y, m] = nextDateWithEvent.split('-').map(Number);
                      setCurrentViewDate(new Date(y, m - 1, 1));
                    }}
                    className="text-[9px] sm:text-[10px] text-blue-600 hover:underline truncate block w-full text-left font-medium cursor-pointer"
                  >
                    → Prochaine : {formatDateShortFrench(nextDateWithEvent)}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
