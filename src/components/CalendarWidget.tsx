import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Minimize2, Maximize2 } from 'lucide-react';
import { FFBCRando } from '../types';
import { formatDateShortFrench, formatDateFrench } from '../utils/formatters';

interface CalendarWidgetProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  allEvents: FFBCRando[];
  todayDate: string; // YYYY-MM-DD
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
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

  // Map of date string -> count of events
  const eventsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const ev of allEvents) {
      if (ev.date) {
        map.set(ev.date, (map.get(ev.date) || 0) + 1);
      }
    }
    return map;
  }, [allEvents]);

  // Find next upcoming date with events relative to selected date
  const nextDateWithEvent = useMemo(() => {
    const datesWithEvents = Array.from(eventsByDate.keys()).sort();
    return datesWithEvents.find(d => d > selectedDate) || datesWithEvents[0] || null;
  }, [eventsByDate, selectedDate]);

  // Total events in current viewed month
  const eventsInViewMonth = useMemo(() => {
    let count = 0;
    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    for (const [date, qty] of eventsByDate.entries()) {
      if (date.startsWith(prefix)) {
        count += qty;
      }
    }
    return count;
  }, [eventsByDate, viewYear, viewMonth]);

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

    // Monday as 0, Sunday as 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const cells: Array<{
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      eventCount: number;
    }> = [];

    // Preceding empty/previous month days
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(viewYear, viewMonth - 1, d);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
        eventCount: eventsByDate.get(dateStr) || 0,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        eventCount: eventsByDate.get(dateStr) || 0,
      });
    }

    // Trailing days to complete the 7-column grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(viewYear, viewMonth + 1, d);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
        eventCount: eventsByDate.get(dateStr) || 0,
      });
    }

    return cells;
  }, [viewYear, viewMonth, eventsByDate]);

  const selectedCount = eventsByDate.get(selectedDate) || 0;

  return (
    <div
      className="relative select-none font-sans w-[290px]"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/90 overflow-hidden w-[290px] transition-all duration-200">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <CalendarIcon className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-semibold text-sm truncate tracking-tight">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            {eventsInViewMonth > 0 && (
              <span className="text-[11px] font-medium text-slate-300 ml-1">
                ({eventsInViewMonth})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleTodayClick}
              title="Aujourd'hui"
              className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium transition-colors cursor-pointer"
            >
              Aujourd'hui
            </button>

            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMinimized ? 'Agrandir le calendrier' : 'Réduire le calendrier'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Minimized strip */}
        {isMinimized ? (
          <div
            onClick={() => setIsMinimized(false)}
            className="p-2.5 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                Jour J : {formatDateShortFrench(selectedDate)}
              </span>
              <span className="text-slate-500">
                · {selectedCount} rando{selectedCount > 1 ? 's' : ''}
              </span>
            </div>
            <span className="text-blue-600 font-medium text-[11px]">Ouvrir</span>
          </div>
        ) : (
          <div className="p-3">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Mois précédent"
                aria-label="Mois précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-xs font-medium text-slate-600">
                Sélectionnez votre <strong className="text-slate-900">Jour J</strong>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Mois suivant"
                aria-label="Mois suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekdays row */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {WEEKDAY_NAMES.map((name, i) => (
                <span
                  key={name}
                  className={`text-[11px] font-semibold py-0.5 ${
                    i >= 5 ? 'text-amber-700' : 'text-slate-400'
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell) => {
                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.dateStr === todayDate;
                const hasEvents = cell.eventCount > 0;

                let btnClass = 'relative flex flex-col items-center justify-center h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ';

                if (isSelected) {
                  btnClass += 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 scale-105 z-10';
                } else if (!cell.isCurrentMonth) {
                  btnClass += 'text-slate-300 hover:bg-slate-50 ';
                } else if (hasEvents) {
                  btnClass += 'text-slate-900 bg-sky-50/80 hover:bg-sky-100 font-semibold ';
                } else {
                  btnClass += 'text-slate-700 hover:bg-slate-100 ';
                }

                if (isToday && !isSelected) {
                  btnClass += ' ring-2 ring-sky-400 ring-offset-1';
                }

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => {
                      onSelectDate(cell.dateStr);
                      // If user clicks a day from another month, navigate to that month
                      if (!cell.isCurrentMonth) {
                        const [y, m] = cell.dateStr.split('-').map(Number);
                        setCurrentViewDate(new Date(y, m - 1, 1));
                      }
                    }}
                    className={btnClass}
                    title={`${cell.dateStr}${hasEvents ? ` (${cell.eventCount} randonnée${cell.eventCount > 1 ? 's' : ''})` : ''}`}
                  >
                    <span>{cell.dayNum}</span>
                    {hasEvents && (
                      <span
                        className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-amber-300' : 'bg-blue-600'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Summary & Helper */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-800">
                <div className="font-semibold truncate">
                  {formatDateFrench(selectedDate)}
                </div>
                <div
                  className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                    selectedCount > 0
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedCount} rando{selectedCount > 1 ? 's' : ''}
                </div>
              </div>

              {selectedCount === 0 && nextDateWithEvent && (
                <div className="mt-1.5">
                  <button
                    onClick={() => {
                      onSelectDate(nextDateWithEvent);
                      const [y, m] = nextDateWithEvent.split('-').map(Number);
                      setCurrentViewDate(new Date(y, m - 1, 1));
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>→ Voir la prochaine rando ({formatDateShortFrench(nextDateWithEvent)})</span>
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
