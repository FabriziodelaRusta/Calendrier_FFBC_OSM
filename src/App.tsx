/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FFBCRando, DisciplineFilter, BasemapType } from './types';
import { fetchFFBCData, matchDiscipline } from './utils/dataLoader';
import { MapView } from './components/MapView';
import { CalendarWidget } from './components/CalendarWidget';
import { FilterBar } from './components/FilterBar';
import { HeaderBrand } from './components/HeaderBrand';
import { BasemapMenu } from './components/BasemapMenu';
import { RandoListDrawer } from './components/RandoListDrawer';

export default function App() {
  // Format today's date (defaults to 2026-10-24 matching dataset environment)
  const todayDateStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    // If runtime year is 2026, use actual date; otherwise match October 24, 2026 dataset extraction
    return y === 2026 ? `${y}-${m}-${day}` : '2026-10-24';
  }, []);

  const [allEvents, setAllEvents] = useState<FFBCRando[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilter>('ALL');
  const [selectedRandoId, setSelectedRandoId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [basemap, setBasemap] = useState<BasemapType>('osm');
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const dataset = await fetchFFBCData();
      setAllEvents(dataset.items);
    } catch (err) {
      console.error('Failed to load FFBC calendar:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Events on the chosen "Jour J"
  const dayEvents = useMemo(() => {
    return allEvents.filter(ev => ev.date === selectedDate);
  }, [allEvents, selectedDate]);

  // Discipline counts for the chosen day
  const dayCounts = useMemo(() => {
    let route = 0;
    let gravel = 0;
    let vtt = 0;

    for (const ev of dayEvents) {
      if (matchDiscipline(ev, 'ROUTE')) route++;
      if (matchDiscipline(ev, 'GRAVEL')) gravel++;
      if (matchDiscipline(ev, 'VTT')) vtt++;
    }

    return {
      all: dayEvents.length,
      route,
      gravel,
      vtt,
    };
  }, [dayEvents]);

  // Filtered events displayed on map
  const displayedEvents = useMemo(() => {
    return dayEvents.filter(ev => matchDiscipline(ev, disciplineFilter));
  }, [dayEvents, disciplineFilter]);

  // Reset selected rando when date or filter changes if no longer visible
  useEffect(() => {
    if (selectedRandoId) {
      const stillVisible = displayedEvents.some(e => e.id === selectedRandoId);
      if (!stillVisible) {
        setSelectedRandoId(null);
      }
    }
  }, [displayedEvents, selectedRandoId]);

  const handleSelectRando = (rando: FFBCRando) => {
    setSelectedRandoId(rando.id);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      {/* 1. Header with RPA Club logo and title (top left) */}
      <HeaderBrand
        onRefresh={loadData}
        isLoading={isLoading}
        onOpenList={() => setIsDrawerOpen(true)}
        itemsCount={displayedEvents.length}
        totalEventsCount={allEvents.length}
      />

      {/* 2. Filter buttons for Route, Gravel, VTT & Reset (top center) */}
      <FilterBar
        currentFilter={disciplineFilter}
        onFilterChange={setDisciplineFilter}
        counts={dayCounts}
      />

      {/* 3. Monthly calendar widget for choosing Jour J (top right) */}
      <CalendarWidget
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        allEvents={allEvents}
        todayDate={todayDateStr}
      />

      {/* 4. Fullscreen OpenStreetMap View with pins and bottom-left zoom & scale */}
      <MapView
        events={displayedEvents}
        selectedDate={selectedDate}
        selectedRandoId={selectedRandoId}
        onSelectRando={handleSelectRando}
        basemap={basemap}
      />

      {/* 5. Basemap switcher (OSM, Cycle, Satellite, Carto) */}
      <BasemapMenu
        currentBasemap={basemap}
        onBasemapChange={setBasemap}
      />

      {/* 6. Slide-out list drawer for inspecting the day's events */}
      <RandoListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        events={displayedEvents}
        selectedDate={selectedDate}
        selectedRandoId={selectedRandoId}
        onSelectRando={handleSelectRando}
      />

      {/* 7. Exact requested footer in bottom center */}
      <div id="footer">
        v<sub id="version">1.25</sub> — Fabrizio de la Rusta
      </div>
    </div>
  );
}
