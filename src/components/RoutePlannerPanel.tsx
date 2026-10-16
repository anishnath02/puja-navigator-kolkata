import React from 'react';
import { Pandal, LatLng, TravelMode } from '../types/pandal';
import { POPULAR_START_HUBS } from '../data/pandals';
import { buildExternalGoogleMapsUrl } from '../utils/distance';
import {
  ArrowUpDown,
  Car,
  Footprints,
  Train,
  Bus,
  ExternalLink,
  Navigation2,
  Clock,
  MapPin,
  ShieldAlert,
  Loader2,
  Ship,
  Sparkles,
} from 'lucide-react';

interface RoutePlannerPanelProps {
  pandals: Pandal[];
  userLocation: LatLng | null;
  startPoint: { type: 'user' | 'hub' | 'pandal'; id?: string; name: string; coordinates: LatLng } | null;
  destinationPandal: Pandal | null;
  travelMode: TravelMode;
  theme: 'light' | 'dark';
  onStartPointChange: (point: { type: 'user' | 'hub' | 'pandal'; id?: string; name: string; coordinates: LatLng } | null) => void;
  onDestinationChange: (pandal: Pandal | null) => void;
  onTravelModeChange: (mode: TravelMode) => void;
  onSwapPoints: () => void;
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
  routeError: string | null;
}

export const RoutePlannerPanel: React.FC<RoutePlannerPanelProps> = ({
  pandals,
  userLocation,
  startPoint,
  destinationPandal,
  travelMode,
  theme,
  onStartPointChange,
  onDestinationChange,
  onTravelModeChange,
  onSwapPoints,
  routeData,
  isLoadingRoute,
  routeError,
}) => {
  const isLight = theme === 'light';

  const externalMapUrl =
    startPoint && destinationPandal
      ? buildExternalGoogleMapsUrl({
          origin: startPoint.coordinates,
          destination: destinationPandal.coordinates,
          travelMode,
        })
      : null;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Title & Description */}
      <div>
        <h2
          className={`text-xl font-serif font-bold flex items-center gap-2 ${
            isLight ? 'text-neutral-900' : 'text-neutral-100'
          }`}
        >
          <Navigation2 className={`w-5 h-5 ${isLight ? 'text-rose-800' : 'text-amber-400'}`} />
          <span>Point-to-Point Route Planner</span>
        </h2>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Calculate distance and travel times by Metro, Bus, Train, Cab, or Walking.
        </p>
      </div>

      {/* Origin & Destination Selector Box */}
      <div
        className={`relative rounded-xl p-4 space-y-3 border transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        {/* Origin */}
        <div>
          <label
            className={`text-[11px] font-medium uppercase tracking-wider block mb-1 ${
              isLight ? 'text-neutral-600' : 'text-neutral-400'
            }`}
          >
            Origin / Starting Point
          </label>
          <select
            value={
              startPoint?.type === 'user'
                ? 'user'
                : startPoint?.type === 'hub'
                ? `hub:${startPoint.name}`
                : startPoint?.id
                ? `pandal:${startPoint.id}`
                : ''
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'user' && userLocation) {
                onStartPointChange({
                  type: 'user',
                  name: 'My Current Location',
                  coordinates: userLocation,
                });
              } else if (val.startsWith('hub:')) {
                const hubName = val.replace('hub:', '');
                const found = POPULAR_START_HUBS.find((h) => h.name === hubName);
                if (found) {
                  onStartPointChange({
                    type: 'hub',
                    name: found.name,
                    coordinates: { lat: found.lat, lng: found.lng },
                  });
                }
              } else if (val.startsWith('pandal:')) {
                const pId = val.replace('pandal:', '');
                const found = pandals.find((p) => p.id === pId);
                if (found) {
                  onStartPointChange({
                    type: 'pandal',
                    id: found.id,
                    name: found.name,
                    coordinates: found.coordinates,
                  });
                }
              }
            }}
            className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition border ${
              isLight
                ? 'bg-neutral-50 text-neutral-900 border-neutral-300 focus:border-rose-800'
                : 'bg-neutral-950 text-neutral-100 border-neutral-700 focus:border-amber-500'
            }`}
          >
            {userLocation ? (
              <option value="user">📍 My Current Location (GPS)</option>
            ) : (
              <option value="" disabled>Select Starting Location</option>
            )}

            <optgroup label="Popular Kolkata Transit Hubs">
              {POPULAR_START_HUBS.map((hub) => (
                <option key={hub.name} value={`hub:${hub.name}`}>
                  🚇 {hub.name}
                </option>
              ))}
            </optgroup>

            <optgroup label="Or Start From a Durga Puja Pandal">
              {pandals.map((p) => (
                <option key={p.id} value={`pandal:${p.id}`}>
                  🪔 {p.name} ({p.neighborhood})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-end pr-3 -my-1">
          <button
            onClick={onSwapPoints}
            title="Swap Origin and Destination"
            className={`p-1.5 rounded-full border transition cursor-pointer ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300 hover:text-amber-400'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination */}
        <div>
          <label
            className={`text-[11px] font-medium uppercase tracking-wider block mb-1 ${
              isLight ? 'text-neutral-600' : 'text-neutral-400'
            }`}
          >
            Destination Pandal
          </label>
          <select
            value={destinationPandal ? destinationPandal.id : ''}
            onChange={(e) => {
              const selected = pandals.find((p) => p.id === e.target.value) || null;
              onDestinationChange(selected);
            }}
            className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition border ${
              isLight
                ? 'bg-neutral-50 text-neutral-900 border-neutral-300 focus:border-rose-800'
                : 'bg-neutral-950 text-neutral-100 border-neutral-700 focus:border-amber-500'
            }`}
          >
            <option value="" disabled>Select Destination Pandal</option>
            {pandals.map((p) => (
              <option key={p.id} value={p.id}>
                🪔 {p.name} ({p.neighborhood})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Travel Mode Selector: Driving, Public Transit (Metro/Bus/Train), Walking */}
      <div
        className={`flex items-center gap-1 p-1 rounded-xl border ${
          isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <button
          onClick={() => onTravelModeChange('DRIVING')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
            travelMode === 'DRIVING'
              ? isLight
                ? 'bg-white text-rose-900 font-semibold shadow-2xs border border-neutral-200'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : isLight
              ? 'text-neutral-600 hover:text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Drive / Cab</span>
        </button>

        <button
          onClick={() => onTravelModeChange('TRANSIT')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
            travelMode === 'TRANSIT'
              ? isLight
                ? 'bg-white text-rose-900 font-semibold shadow-2xs border border-neutral-200'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : isLight
              ? 'text-neutral-600 hover:text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Train className="w-4 h-4 text-blue-600" />
          <span>Metro & Bus</span>
        </button>

        <button
          onClick={() => onTravelModeChange('WALKING')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition cursor-pointer ${
            travelMode === 'WALKING'
              ? isLight
                ? 'bg-white text-rose-900 font-semibold shadow-2xs border border-neutral-200'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : isLight
              ? 'text-neutral-600 hover:text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Footprints className="w-4 h-4" />
          <span>Walking</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoadingRoute && (
        <div
          className={`p-4 rounded-xl flex items-center justify-center gap-2.5 text-sm border ${
            isLight
              ? 'bg-neutral-50 border-neutral-200 text-neutral-700'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
          }`}
        >
          <Loader2 className={`w-4 h-4 animate-spin ${isLight ? 'text-rose-700' : 'text-amber-400'}`} />
          <span>Calculating route with Google Maps Routes API...</span>
        </div>
      )}

      {/* Error State */}
      {routeError && (
        <div
          className={`p-3.5 rounded-xl text-xs border ${
            isLight
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          {routeError}
        </div>
      )}

      {/* Calculated Route Results */}
      {routeData && !isLoadingRoute && (
        <div
          className={`rounded-xl p-4 space-y-4 border ${
            isLight
              ? 'bg-white border-rose-200 shadow-2xs'
              : 'bg-neutral-900 border-amber-500/30'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-neutral-200' : 'border-neutral-800'
            }`}
          >
            <div>
              <span
                className={`text-[11px] uppercase tracking-wider block font-medium ${
                  isLight ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              >
                Estimated Journey ({travelMode === 'TRANSIT' ? 'Public Transit' : travelMode})
              </span>
              <div className="flex items-center gap-3 mt-0.5">
                <span
                  className={`text-xl font-bold font-mono tabular-nums ${
                    isLight ? 'text-rose-800' : 'text-amber-400'
                  }`}
                >
                  {(routeData.totalDistanceMeters / 1000).toFixed(1)} km
                </span>
                <span aria-hidden="true" className={isLight ? 'text-neutral-300' : 'text-neutral-700'}>
                  ·
                </span>
                <span className="text-xl font-bold font-mono tabular-nums flex items-center gap-1">
                  <Clock className={`w-4 h-4 ${isLight ? 'text-rose-800' : 'text-amber-400'}`} />
                  {Math.round(routeData.totalDurationMillis / 60000)} min
                </span>
              </div>
            </div>

            {externalMapUrl && (
              <a
                href={externalMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold shadow-2xs transition ${
                  isLight
                    ? 'bg-rose-800 hover:bg-rose-900 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                }`}
              >
                <span>Live Navigation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Leg Breakdown */}
          <div className="space-y-2 text-xs">
            {routeData.legs.map((leg, idx) => (
              <div
                key={idx}
                className={`flex items-start justify-between gap-3 ${
                  isLight ? 'text-neutral-700' : 'text-neutral-300'
                }`}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <MapPin className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? 'text-rose-700' : 'text-amber-400'}`} />
                  <span className="truncate">{leg.fromName} → {leg.toName}</span>
                </div>
                <div className={`font-mono shrink-0 tabular-nums ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {leg.distanceText} · {leg.durationText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multimodal Transit "How to Reach" Guide for Destination Pandal */}
      {destinationPandal?.transit && (
        <div
          className={`rounded-xl p-4 space-y-3.5 border transition-colors ${
            isLight
              ? 'bg-blue-50/60 border-blue-200 text-neutral-900'
              : 'bg-neutral-900/90 border-neutral-700 text-neutral-100'
          }`}
        >
          <div className="flex items-center gap-2 border-b pb-2.5 border-blue-200/60 dark:border-neutral-800">
            <Train className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-serif font-bold text-sm">
              Transit & Transit Options to {destinationPandal.name}
            </h3>
          </div>

          {/* 1. Metro */}
          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 text-[11px] font-bold">
              M
            </div>
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <span>{destinationPandal.transit.metro.station}</span>
                <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">
                  ({destinationPandal.transit.metro.line})
                </span>
              </div>
              <p className={`mt-0.5 ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
                {destinationPandal.transit.metro.gate ? `${destinationPandal.transit.metro.gate} · ` : ''}
                {destinationPandal.transit.metro.walkingDistanceMeters}m walk (~{destinationPandal.transit.metro.walkingTimeMinutes} mins)
              </p>
            </div>
          </div>

          {/* 2. Suburban Local Train */}
          {destinationPandal.transit.train && (
            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-md bg-amber-700 text-white flex items-center justify-center shrink-0 text-[11px] font-bold">
                RL
              </div>
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {destinationPandal.transit.train.station}
                </div>
                <p className={`mt-0.5 ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
                  {destinationPandal.transit.train.feederConnection}
                </p>
              </div>
            </div>
          )}

          {/* 3. Bus & Shared Auto */}
          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bus className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                Bus Stop: {destinationPandal.transit.busAndAuto.nearestBusStop}
              </div>
              <p className={`mt-0.5 ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
                Key Buses: {destinationPandal.transit.busAndAuto.keyBusRoutes.join(', ')}
              </p>
              {destinationPandal.transit.busAndAuto.sharedAutoStand && (
                <p className="mt-0.5 text-amber-800 dark:text-amber-400 font-medium">
                  Auto Stand: {destinationPandal.transit.busAndAuto.sharedAutoStand}
                </p>
              )}
            </div>
          </div>

          {/* 4. Ferry (if available) */}
          {destinationPandal.transit.ferryGhat && (
            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-md bg-sky-600 text-white flex items-center justify-center shrink-0">
                <Ship className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Ferry: {destinationPandal.transit.ferryGhat.ghatName}
                </div>
                <p className={`mt-0.5 ${isLight ? 'text-neutral-600' : 'text-neutral-300'}`}>
                  {destinationPandal.transit.ferryGhat.connectionFrom}
                </p>
              </div>
            </div>
          )}

          {/* 5. Walking Guidance */}
          <div className="flex items-start gap-2.5 text-xs pt-1 border-t border-blue-200/50 dark:border-neutral-800">
            <Footprints className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              <strong className="text-neutral-900 dark:text-neutral-100">Walking path:</strong>{' '}
              {destinationPandal.transit.walkingDirections}
            </p>
          </div>
        </div>
      )}

      {/* Traffic notice */}
      <div
        className={`p-3 rounded-lg text-[11px] flex items-start gap-2 border ${
          isLight
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-neutral-950/70 border-neutral-800 text-neutral-400'
        }`}
      >
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          During Durga Puja, Metro and Walking are the fastest ways to hop pandals. Kolkata Metro operates round-the-clock trains on Saptami, Ashtami, and Navami nights.
        </span>
      </div>
    </div>
  );
};
