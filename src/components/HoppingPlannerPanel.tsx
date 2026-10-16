import React from 'react';
import { Pandal, LatLng, TravelMode } from '../types/pandal';
import { buildExternalGoogleMapsUrl, formatDistance, formatDurationMinutes } from '../utils/distance';
import {
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Wand2,
  ExternalLink,
  Plus,
  Car,
  Footprints,
  Train,
  RotateCcw,
} from 'lucide-react';

interface HoppingPlannerPanelProps {
  pandals: Pandal[];
  itinerary: Pandal[];
  userLocation: LatLng | null;
  travelMode: TravelMode;
  theme: 'light' | 'dark';
  onTravelModeChange: (mode: TravelMode) => void;
  onRemoveStop: (index: number) => void;
  onMoveStop: (index: number, direction: 'up' | 'down') => void;
  onOptimizeRoute: () => void;
  onClearItinerary: () => void;
  onAddPandalToItinerary: (pandal: Pandal) => void;
  onLoadPredefinedCircuit: (circuitIds: string[]) => void;
  routeData: {
    totalDistanceMeters: number;
    totalDurationMillis: number;
    legs: Array<{
      fromName: string;
      toName: string;
      distanceMeters: number;
      durationMillis: number;
      distanceText: string;
      durationText: string;
    }>;
  } | null;
  isLoadingRoute: boolean;
}

const PREDEFINED_CIRCUITS = [
  {
    title: 'South Kolkata Heritage Trail',
    subtitle: 'Ekdalia Evergreen → Singhi Park → Ballygunge Cultural → Tridhara → Badamtala',
    ids: ['ekdalia-evergreen', 'singhi-park', 'ballygunge-cultural', 'tridhara-sammilani', 'badamtala-ashar-sangha'],
    tag: 'Classic Walking Circuit',
  },
  {
    title: 'North Kolkata Heritage Walk',
    subtitle: 'Bagbazar → Kumartuli Park → Ahiritola → College Square',
    ids: ['bagbazar', 'kumartuli-park', 'ahiritola-sarbojanin', 'college-square'],
    tag: 'Old Calcutta Culture',
  },
  {
    title: 'Grand Palace & Architectural Trail',
    subtitle: 'Sreebhumi → Santosh Mitra Square → Mohammad Ali Park → FD Block Salt Lake',
    ids: ['sreebhumi', 'santosh-mitra-square', 'mohammad-ali-park', 'fd-block-saltlake'],
    tag: 'Mega Spectacle',
  },
];

export const HoppingPlannerPanel: React.FC<HoppingPlannerPanelProps> = ({
  pandals,
  itinerary,
  userLocation,
  travelMode,
  theme,
  onTravelModeChange,
  onRemoveStop,
  onMoveStop,
  onOptimizeRoute,
  onClearItinerary,
  onAddPandalToItinerary,
  onLoadPredefinedCircuit,
  routeData,
  isLoadingRoute,
}) => {
  const isLight = theme === 'light';

  const externalMapUrl =
    itinerary.length >= 2
      ? buildExternalGoogleMapsUrl({
          origin: userLocation || itinerary[0].coordinates,
          destination: itinerary[itinerary.length - 1].coordinates,
          waypoints: itinerary.slice(1, -1).map((p) => p.coordinates),
          travelMode,
        })
      : null;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Title */}
      <div className="flex items-start justify-between">
        <div>
          <h2
            className={`text-xl font-serif font-bold flex items-center gap-2 ${
              isLight ? 'text-neutral-900' : 'text-neutral-100'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${isLight ? 'text-rose-800' : 'text-amber-400'}`} />
            <span>Pandal-Hopping Itinerary</span>
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            Build multi-stop pandal hopping routes and optimize visiting order to eliminate backtracking.
          </p>
        </div>

        {itinerary.length > 0 && (
          <button
            onClick={onClearItinerary}
            className={`flex items-center gap-1 text-xs transition cursor-pointer ${
              isLight ? 'text-neutral-500 hover:text-rose-800' : 'text-neutral-400 hover:text-rose-400'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Mode Selector */}
      <div
        className={`flex items-center gap-1 p-1 rounded-xl border ${
          isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <button
          onClick={() => onTravelModeChange('DRIVING')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
            travelMode === 'DRIVING'
              ? isLight
                ? 'bg-white text-rose-900 font-semibold shadow-2xs border border-neutral-200'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : isLight
              ? 'text-neutral-600 hover:text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Drive</span>
        </button>

        <button
          onClick={() => onTravelModeChange('TRANSIT')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
            travelMode === 'TRANSIT'
              ? isLight
                ? 'bg-white text-rose-900 font-semibold shadow-2xs border border-neutral-200'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : isLight
              ? 'text-neutral-600 hover:text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Train className="w-3.5 h-3.5 text-blue-600" />
          <span>Metro/Bus</span>
        </button>

        <button
          onClick={() => onTravelModeChange('WALKING')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
            travelMode === 'WALKING'
              ? isLight
                ? 'bg-white text-rose-900 font-semibold shadow-2xs border border-neutral-200'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : isLight
              ? 'text-neutral-600 hover:text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Footprints className="w-3.5 h-3.5" />
          <span>Walk</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      {itinerary.length >= 2 && routeData && (
        <div
          className={`rounded-xl p-4 border transition-colors ${
            isLight
              ? 'bg-amber-50/70 border-amber-200 text-neutral-900 shadow-2xs'
              : 'bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`text-[11px] uppercase tracking-wider block font-medium ${
                  isLight ? 'text-amber-900' : 'text-amber-400'
                }`}
              >
                Tour Summary · {itinerary.length} Stops
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xl font-bold font-mono tabular-nums">
                  {formatDistance(routeData.totalDistanceMeters / 1000)}
                </span>
                <span aria-hidden="true" className={isLight ? 'text-neutral-300' : 'text-neutral-700'}>
                  ·
                </span>
                <span
                  className={`text-xl font-bold font-mono tabular-nums ${
                    isLight ? 'text-rose-800' : 'text-amber-300'
                  }`}
                >
                  {formatDurationMinutes(routeData.totalDurationMillis / 60000)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOptimizeRoute}
                title="Automatically reorder stops to minimize travel time"
                className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  isLight
                    ? 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-300 shadow-2xs'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Optimize Order</span>
              </button>

              {externalMapUrl && (
                <a
                  href={externalMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold shadow-sm transition ${
                    isLight
                      ? 'bg-rose-800 hover:bg-rose-900 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white'
                  }`}
                >
                  <span>Open Tour</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Itinerary List */}
      {itinerary.length > 0 ? (
        <div className="space-y-2">
          <div
            className={`flex items-center justify-between text-xs font-medium px-1 ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            <span>VISITING SEQUENCE</span>
            <span>{itinerary.length} Pandals Selected</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {itinerary.map((pandal, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === itinerary.length - 1;
              const legInfo = routeData?.legs[idx];

              return (
                <div key={pandal.id} className="space-y-1">
                  <div
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition ${
                      isLight
                        ? 'bg-white border-neutral-200 hover:border-neutral-300 shadow-2xs'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                          isFirst
                            ? 'bg-emerald-600 text-white'
                            : isLast
                            ? 'bg-rose-700 text-white'
                            : isLight
                            ? 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                            : 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`text-xs md:text-sm font-semibold truncate ${
                            isLight ? 'text-neutral-900' : 'text-neutral-100'
                          }`}
                        >
                          {pandal.name}
                        </h4>
                        <p
                          className={`text-[11px] truncate ${
                            isLight ? 'text-neutral-500' : 'text-neutral-400'
                          }`}
                        >
                          {pandal.neighborhood} · {pandal.nearestMetro}
                        </p>
                      </div>
                    </div>

                    {/* Reorder and Delete controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onMoveStop(idx, 'up')}
                        disabled={isFirst}
                        title="Move Up"
                        className={`p-1 disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                          isLight ? 'text-neutral-400 hover:text-neutral-800' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onMoveStop(idx, 'down')}
                        disabled={isLast}
                        title="Move Down"
                        className={`p-1 disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                          isLight ? 'text-neutral-400 hover:text-neutral-800' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onRemoveStop(idx)}
                        title="Remove Stop"
                        className="p-1 text-neutral-400 hover:text-rose-600 cursor-pointer ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Leg Distance Indicator */}
                  {legInfo && (
                    <div
                      className={`flex items-center gap-2 pl-6 py-0.5 text-[11px] font-mono ${
                        isLight ? 'text-neutral-500' : 'text-neutral-400'
                      }`}
                    >
                      <span className="text-amber-600 font-bold">↓</span>
                      <span>{legInfo.distanceText}</span>
                      <span aria-hidden="true" className={isLight ? 'text-neutral-300' : 'text-neutral-700'}>
                        ·
                      </span>
                      <span>~{legInfo.durationText}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Add Dropdown */}
          <div className="pt-2">
            <select
              value=""
              onChange={(e) => {
                const found = pandals.find((p) => p.id === e.target.value);
                if (found) onAddPandalToItinerary(found);
              }}
              className={`w-full border border-dashed rounded-xl px-3 py-2.5 text-xs focus:outline-none cursor-pointer transition ${
                isLight
                  ? 'bg-neutral-50 border-neutral-300 hover:border-rose-700 text-neutral-700'
                  : 'bg-neutral-900 border-neutral-700 hover:border-amber-500/60 text-neutral-300'
              }`}
            >
              <option value="" disabled>
                + Add another pandal to this itinerary...
              </option>
              {pandals
                .filter((p) => !itinerary.some((item) => item.id === p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.neighborhood})
                  </option>
                ))}
            </select>
          </div>
        </div>
      ) : (
        /* Empty State with Curated Circuits */
        <div className="space-y-4">
          <div
            className={`p-4 rounded-xl text-center border ${
              isLight
                ? 'bg-neutral-50 border-neutral-200'
                : 'bg-neutral-900/60 border-neutral-800'
            }`}
          >
            <Sparkles className="w-8 h-8 text-amber-600 mx-auto mb-2 opacity-80" />
            <h3
              className={`text-sm font-semibold ${
                isLight ? 'text-neutral-900' : 'text-neutral-200'
              }`}
            >
              Your Itinerary is Empty
            </h3>
            <p
              className={`text-xs mt-1 max-w-sm mx-auto ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              Add pandals while exploring the map, or select one of Kolkata’s curated signature trails below.
            </p>
          </div>

          {/* Curated Pre-built Circuits */}
          <div className="space-y-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wider block ${
                isLight ? 'text-rose-900' : 'text-amber-500'
              }`}
            >
              Curated Pandal-Hopping Circuits
            </span>

            {PREDEFINED_CIRCUITS.map((circuit, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                  isLight
                    ? 'bg-white hover:bg-rose-50/40 border-neutral-200 hover:border-rose-300 shadow-2xs'
                    : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 hover:border-amber-500/50'
                }`}
                onClick={() => onLoadPredefinedCircuit(circuit.ids)}
              >
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs md:text-sm font-semibold ${
                      isLight ? 'text-neutral-900' : 'text-neutral-200'
                    }`}
                  >
                    {circuit.title}
                  </h4>
                  <span
                    className={`text-[10px] font-mono ${
                      isLight ? 'text-rose-800' : 'text-amber-400/90'
                    }`}
                  >
                    {circuit.tag}
                  </span>
                </div>
                <p
                  className={`text-[11px] leading-snug ${
                    isLight ? 'text-neutral-600' : 'text-neutral-400'
                  }`}
                >
                  {circuit.subtitle}
                </p>
                <div
                  className={`flex items-center gap-1 text-[11px] font-medium pt-1 ${
                    isLight ? 'text-rose-800' : 'text-amber-400'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Load this {circuit.ids.length}-pandal route</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
