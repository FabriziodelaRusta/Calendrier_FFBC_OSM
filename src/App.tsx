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
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
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

  // Extract distinct list of provinces from all events (with 'Inconnu' fallback)
  const availableProvinces = useMemo(() => {
    const set = new Set<string>();
    for (const ev of allEvents) {
      const prov = ev.province && ev.province.trim() !== '' ? ev.province.trim() : 'Inconnu';
      set.add(prov);
    }
    const list = Array.from(set);
    // Put standard provinces in order, then 'Inconnu'
    return list.sort((a, b) => {
      if (a === 'Inconnu') return 1;
      if (b === 'Inconnu') return -1;
      return a.localeCompare(b, 'fr');
    });
  }, [allEvents]);

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

  // Province counts for the chosen day
  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ev of dayEvents) {
      const prov = ev.province && ev.province.trim() !== '' ? ev.province.trim() : 'Inconnu';
      counts[prov] = (counts[prov] || 0) + 1;
    }
    return counts;
  }, [dayEvents]);

  // Filtered events displayed on map (both discipline and province)
  const displayedEvents = useMemo(() => {
    return dayEvents.filter(ev => {
      const matchDisc = matchDiscipline(ev, disciplineFilter);
      const evProv = ev.province && ev.province.trim() !== '' ? ev.province.trim() : 'Inconnu';
      const matchProv = selectedProvince === 'ALL' || evProv === selectedProvince;
      return matchDisc && matchProv;
    });
  }, [dayEvents, disciplineFilter, selectedProvince]);

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

  const handleResetAll = () => {
    setDisciplineFilter('ALL');
    setSelectedProvince('ALL');
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

      {/* 2. Filter buttons for Route, Gravel, VTT + Province dropdown + Reset (top center) */}
      <FilterBar
        currentFilter={disciplineFilter}
        onFilterChange={setDisciplineFilter}
        counts={dayCounts}
        selectedProvince={selectedProvince}
        onProvinceChange={setSelectedProvince}
        availableProvinces={availableProvinces}
        provinceCounts={provinceCounts}
        onResetAll={handleResetAll}
      />

      {/* 3. Right column: Monthly calendar widget + Basemap chooser directly beneath it */}
      <div
        className="fixed top-3 right-3 z-[1005] flex flex-col items-end gap-2"
        style={{ maxWidth: 'calc(100vw - 24px)' }}
      >
        <CalendarWidget
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          allEvents={allEvents}
          todayDate={todayDateStr}
        />

        <BasemapMenu
          currentBasemap={basemap}
          onBasemapChange={setBasemap}
        />
      </div>

      {/* 4. Fullscreen OpenStreetMap View with pins, bottom-left scale, and bottom-right zoom */}
      <MapView
        events={displayedEvents}
        selectedDate={selectedDate}
        selectedRandoId={selectedRandoId}
        onSelectRando={handleSelectRando}
        basemap={basemap}
      />

      {/* 5. Slide-out list drawer for inspecting the day's events */}
      <RandoListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        events={displayedEvents}
        selectedDate={selectedDate}
        selectedRandoId={selectedRandoId}
        onSelectRando={handleSelectRando}
      />

      {/* 6. Exact requested footer in bottom center */}
      <div id="footer">
        v<sub id="version">0.1</sub> — Fabrizio de la Rusta
      </div>
    </div>
  );
}
