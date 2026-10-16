import React from 'react';
import { Pandal, LatLng } from '../types/pandal';
import { calculateHaversineDistanceKm, formatDistance, estimateDurationMinutes, formatDurationMinutes } from '../utils/distance';
import { Navigation2, Plus, Check, Bookmark, Train, Clock, MapPin, Eye, Utensils } from 'lucide-react';

interface PandalCardProps {
  pandal: Pandal;
  userLocation: LatLng | null;
  isSelected: boolean;
  isSaved: boolean;
  isInItinerary: boolean;
  theme: 'light' | 'dark';
  onSelect: (pandal: Pandal) => void;
  onNavigateTo: (pandal: Pandal) => void;
  onToggleSaved: (pandal: Pandal) => void;
  onToggleItinerary: (pandal: Pandal) => void;
  onViewDetails: (pandal: Pandal) => void;
}

export const PandalCard: React.FC<PandalCardProps> = ({
  pandal,
  userLocation,
  isSelected,
  isSaved,
  isInItinerary,
  theme,
  onSelect,
  onNavigateTo,
  onToggleSaved,
  onToggleItinerary,
  onViewDetails,
}) => {
  const isLight = theme === 'light';
  const distanceKm = userLocation ? calculateHaversineDistanceKm(userLocation, pandal.coordinates) : null;
  const estimatedDrivingMinutes = distanceKm !== null ? estimateDurationMinutes(distanceKm, 'DRIVING') : null;

  return (
    <div
      onClick={() => onSelect(pandal)}
      className={`group relative rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden p-4 ${
        isLight
          ? isSelected
            ? 'bg-rose-50/50 border-rose-800 shadow-sm ring-1 ring-rose-800'
            : 'bg-white hover:bg-neutral-50/80 border-neutral-200 hover:border-neutral-300 shadow-2xs'
          : isSelected
          ? 'bg-neutral-900 border-amber-500 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/50'
          : 'bg-neutral-900/80 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Top Banner & Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          {/* Unboxed Metadata with subtle separators */}
          <div
            className={`flex items-center gap-2 text-xs font-medium mb-1 ${
              isLight ? 'text-rose-800' : 'text-amber-400/90'
            }`}
          >
            <span>{pandal.zone}</span>
            <span aria-hidden="true" className={isLight ? 'text-neutral-300' : 'text-neutral-700'}>
              ·
            </span>
            <span>{pandal.category}</span>
            {pandal.heritageYear && (
              <>
                <span aria-hidden="true" className={isLight ? 'text-neutral-300' : 'text-neutral-700'}>
                  ·
                </span>
                <span className={isLight ? 'text-neutral-500' : 'text-neutral-400'}>
                  Est. {pandal.heritageYear}
                </span>
              </>
            )}
          </div>

          <h3
            className={`font-serif font-bold text-base md:text-lg tracking-tight transition-colors truncate ${
              isLight
                ? 'text-neutral-900 group-hover:text-rose-900'
                : 'text-neutral-100 group-hover:text-amber-300'
            }`}
          >
            {pandal.name}
          </h3>

          <p
            className={`text-xs font-sans tracking-wide mt-0.5 ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            {pandal.bengaliName}
          </p>
        </div>

        {/* Bookmark quick button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSaved(pandal);
          }}
          title={isSaved ? 'Remove from Saved' : 'Save Pandal'}
          className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            isSaved
              ? isLight
                ? 'bg-rose-100 border-rose-300 text-rose-800'
                : 'bg-rose-950/60 border-rose-600/60 text-rose-400'
              : isLight
              ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-500 hover:text-neutral-800'
              : 'bg-neutral-800/80 border-neutral-700/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? (isLight ? 'fill-rose-700 text-rose-700' : 'fill-rose-400 text-rose-400') : ''}`} />
        </button>
      </div>

      {/* Famous For Highlights */}
      <p
        className={`text-xs line-clamp-2 mb-3 leading-relaxed ${
          isLight ? 'text-neutral-600' : 'text-neutral-300'
        }`}
      >
        {pandal.famousFor}
      </p>

      {/* Meta Specs (Clean, unboxed metadata with typographic separators) */}
      <div
        className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-3 pb-2.5 border-b ${
          isLight ? 'border-neutral-200 text-neutral-600' : 'border-neutral-800/80 text-neutral-400'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              pandal.metroLine === 'Blue Line' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}
          />
          <Train className="w-3.5 h-3.5 text-neutral-500" />
          <span className="truncate max-w-[160px]">{pandal.nearestMetro}</span>
        </div>

        {distanceKm !== null && (
          <>
            <span aria-hidden="true" className={isLight ? 'text-neutral-300' : 'text-neutral-700'}>
              ·
            </span>
            <div
              className={`flex items-center gap-1 font-mono tabular-nums font-semibold ${
                isLight ? 'text-rose-800' : 'text-amber-400'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{formatDistance(distanceKm)}</span>
            </div>
            <span aria-hidden="true" className={isLight ? 'text-neutral-300' : 'text-neutral-700'}>
              ·
            </span>
            <div className="flex items-center gap-1 font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 opacity-70" />
              <span>{formatDurationMinutes(estimatedDrivingMinutes || 0)}</span>
            </div>
          </>
        )}
      </div>

      {/* Transit Quick Guidance: Metro, Bus, Walking */}
      {pandal.transit && (
        <div
          className={`text-[11px] mb-2.5 flex items-center gap-1.5 truncate px-2 py-1 rounded-md border ${
            isLight
              ? 'text-blue-900 bg-blue-50/70 border-blue-200/80'
              : 'text-blue-300 bg-blue-950/40 border-blue-900/50'
          }`}
        >
          <Train className="w-3 h-3 text-blue-600 shrink-0" />
          <span className="truncate">
            Metro: {pandal.transit.metro.station.replace(' Station', '')} ({pandal.transit.metro.walkingTimeMinutes}m walk) · Bus: {pandal.transit.busAndAuto.keyBusRoutes.slice(0, 3).join(', ')}
          </span>
        </div>
      )}

      {/* Optional Cultural Food Snippet */}
      {pandal.foodNearby && (
        <div
          className={`flex items-center gap-1.5 text-[11px] mb-3 truncate ${
            isLight ? 'text-neutral-500' : 'text-neutral-400'
          }`}
        >
          <Utensils className="w-3 h-3 text-amber-600 shrink-0" />
          <span className="truncate">{pandal.foodNearby}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(pandal);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
            isLight
              ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
              : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white border-neutral-700/60'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigateTo(pandal);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
            isLight
              ? 'bg-rose-800 hover:bg-rose-900 text-white border-rose-900 shadow-2xs'
              : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border-amber-500/30'
          }`}
        >
          <Navigation2 className="w-3.5 h-3.5" />
          <span>Directions</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleItinerary(pandal);
          }}
          title={isInItinerary ? 'Remove from Hopping Plan' : 'Add to Hopping Plan'}
          className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer border shrink-0 ${
            isInItinerary
              ? isLight
                ? 'bg-emerald-600 text-white border-emerald-700 font-semibold'
                : 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold'
              : isLight
              ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-neutral-300'
              : 'bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          {isInItinerary ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
