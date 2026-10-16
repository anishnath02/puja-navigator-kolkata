import React, { useState } from 'react';
import { Pandal, LatLng } from '../types/pandal';
import { calculateHaversineDistanceKm, formatDistance, buildExternalGoogleMapsUrl, estimateDurationMinutes, formatDurationMinutes } from '../utils/distance';
import {
  X,
  Navigation2,
  Plus,
  Check,
  Bookmark,
  Train,
  Clock,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Copy,
  Utensils,
  Calendar,
  Bus,
  Footprints,
  Ship,
} from 'lucide-react';

interface PandalDetailModalProps {
  pandal: Pandal | null;
  userLocation: LatLng | null;
  isSaved: boolean;
  isInItinerary: boolean;
  theme: 'light' | 'dark';
  onClose: () => void;
  onNavigateTo: (pandal: Pandal) => void;
  onToggleSaved: (pandal: Pandal) => void;
  onToggleItinerary: (pandal: Pandal) => void;
}

export const PandalDetailModal: React.FC<PandalDetailModalProps> = ({
  pandal,
  userLocation,
  isSaved,
  isInItinerary,
  theme,
  onClose,
  onNavigateTo,
  onToggleSaved,
  onToggleItinerary,
}) => {
  const [copied, setCopied] = useState(false);
  const isLight = theme === 'light';

  if (!pandal) return null;

  const distanceKm = userLocation ? calculateHaversineDistanceKm(userLocation, pandal.coordinates) : null;
  const estimatedDrivingMinutes = distanceKm !== null ? estimateDurationMinutes(distanceKm, 'DRIVING') : null;
  const estimatedWalkingMinutes = distanceKm !== null ? estimateDurationMinutes(distanceKm, 'WALKING') : null;
  const estimatedTransitMinutes = distanceKm !== null ? estimateDurationMinutes(distanceKm, 'TRANSIT') : null;

  const externalMapUrl = buildExternalGoogleMapsUrl({
    origin: userLocation || 'Kolkata, West Bengal',
    destination: pandal.coordinates,
    travelMode: 'TRANSIT',
  });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${pandal.name}, ${pandal.address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border transition-colors ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900'
            : 'bg-neutral-900 border-neutral-700 text-neutral-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div
          className={`relative p-6 border-b overflow-hidden ${
            isLight
              ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white border-neutral-200'
              : 'bg-gradient-to-r from-rose-950 via-amber-950 to-neutral-950 text-white border-neutral-800'
          }`}
        >
          {/* Subtle Cultural Motif */}
          <div className="absolute top-2 right-4 text-7xl opacity-15 pointer-events-none select-none">
            🪔
          </div>

          <div className="relative z-10 pr-16">
            <div className="flex items-center gap-2 text-xs text-amber-200 font-medium mb-1">
              <span>{pandal.zone}</span>
              <span aria-hidden="true">·</span>
              <span>{pandal.category}</span>
              {pandal.heritageYear && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Est. {pandal.heritageYear}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-white">
              {pandal.name}
            </h2>
            <p className="text-amber-100/80 text-sm font-sans mt-0.5">
              {pandal.bengaliName}
            </p>
          </div>

          {/* Close & Bookmark Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button
              onClick={() => onToggleSaved(pandal)}
              title={isSaved ? 'Remove from Saved' : 'Save Pandal'}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-300 text-amber-300' : ''}`} />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Distance & Travel Time Metrics (Drive, Metro/Transit, Walk) */}
          {distanceKm !== null && (
            <div
              className={`grid grid-cols-3 gap-3 p-3.5 rounded-xl border text-center ${
                isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
              }`}
            >
              <div>
                <span className={`text-[11px] block ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Distance
                </span>
                <span className="text-base font-bold font-mono text-rose-700 dark:text-amber-400 tabular-nums">
                  {formatDistance(distanceKm)}
                </span>
              </div>
              <div>
                <span className={`text-[11px] block ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  🚇 Metro & Bus
                </span>
                <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                  ~{formatDurationMinutes(estimatedTransitMinutes || 0)}
                </span>
              </div>
              <div>
                <span className={`text-[11px] block ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  🚗 Cab / Drive
                </span>
                <span className="text-base font-bold font-mono tabular-nums">
                  ~{formatDurationMinutes(estimatedDrivingMinutes || 0)}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4
              className={`text-xs uppercase tracking-wider font-semibold mb-1 ${
                isLight ? 'text-rose-900' : 'text-amber-400'
              }`}
            >
              About the Pandal & Theme
            </h4>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              {pandal.description}
            </p>
          </div>

          {/* Highlights */}
          {pandal.highlights.length > 0 && (
            <div>
              <h4
                className={`text-xs uppercase tracking-wider font-semibold mb-2 ${
                  isLight ? 'text-rose-900' : 'text-amber-400'
                }`}
              >
                Signature Highlights
              </h4>
              <ul className="space-y-1.5">
                {pandal.highlights.map((h, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-xs md:text-sm ${
                      isLight ? 'text-neutral-700' : 'text-neutral-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How to Reach Transit Guide */}
          {pandal.transit && (
            <div
              className={`rounded-xl p-4 border space-y-3 ${
                isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-neutral-950/80 border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2 border-b pb-2 border-blue-200/60 dark:border-neutral-800">
                <Train className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-serif font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  How to Reach: Train, Metro, Bus & Walking
                </h4>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* 1. Metro */}
                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] shrink-0">
                    METRO
                  </span>
                  <div>
                    <strong className="text-neutral-900 dark:text-neutral-100">
                      {pandal.transit.metro.station} ({pandal.transit.metro.line})
                    </strong>
                    <p className={isLight ? 'text-neutral-600' : 'text-neutral-300'}>
                      {pandal.transit.metro.gate ? `${pandal.transit.metro.gate} · ` : ''}
                      Walk {pandal.transit.metro.walkingDistanceMeters}m (~{pandal.transit.metro.walkingTimeMinutes} mins)
                    </p>
                  </div>
                </div>

                {/* 2. Suburban Train */}
                {pandal.transit.train && (
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-700 text-white font-bold text-[10px] shrink-0">
                      TRAIN
                    </span>
                    <div>
                      <strong className="text-neutral-900 dark:text-neutral-100">
                        {pandal.transit.train.station}
                      </strong>
                      <p className={isLight ? 'text-neutral-600' : 'text-neutral-300'}>
                        {pandal.transit.train.feederConnection}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Bus & Auto */}
                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] shrink-0">
                    BUS / AUTO
                  </span>
                  <div>
                    <strong className="text-neutral-900 dark:text-neutral-100">
                      Stop: {pandal.transit.busAndAuto.nearestBusStop}
                    </strong>
                    <p className={isLight ? 'text-neutral-600' : 'text-neutral-300'}>
                      Buses: {pandal.transit.busAndAuto.keyBusRoutes.join(', ')}
                    </p>
                    {pandal.transit.busAndAuto.sharedAutoStand && (
                      <p className="text-amber-800 dark:text-amber-400 mt-0.5">
                        Shared Auto: {pandal.transit.busAndAuto.sharedAutoStand}
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Ferry */}
                {pandal.transit.ferryGhat && (
                  <div className="flex items-start gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white font-bold text-[10px] shrink-0">
                      FERRY
                    </span>
                    <div>
                      <strong className="text-neutral-900 dark:text-neutral-100">
                        {pandal.transit.ferryGhat.ghatName}
                      </strong>
                      <p className={isLight ? 'text-neutral-600' : 'text-neutral-300'}>
                        {pandal.transit.ferryGhat.connectionFrom}
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. Walking Stretch */}
                <div className="flex items-start gap-2 pt-1.5 border-t border-blue-200/50 dark:border-neutral-800">
                  <Footprints className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                  <p className={isLight ? 'text-neutral-700' : 'text-neutral-300'}>
                    <strong className="text-neutral-900 dark:text-neutral-100">Final walking stretch:</strong>{' '}
                    {pandal.transit.walkingDirections}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cultural Anjali & Local Food Pairings */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border ${
              isLight ? 'bg-amber-50/60 border-amber-200/80' : 'bg-neutral-950/80 border-neutral-800'
            }`}
          >
            {pandal.anjaliTiming && (
              <div className="flex items-start gap-2 text-xs">
                <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 dark:text-neutral-100">Rituals & Anjali</strong>
                  <span className={isLight ? 'text-neutral-600' : 'text-neutral-300'}>
                    {pandal.anjaliTiming}
                  </span>
                </div>
              </div>
            )}

            {pandal.foodNearby && (
              <div className="flex items-start gap-2 text-xs">
                <Utensils className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 dark:text-neutral-100">Iconic Adda & Food Nearby</strong>
                  <span className={isLight ? 'text-neutral-600' : 'text-neutral-300'}>
                    {pandal.foodNearby}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Visiting & Transport Specs */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t ${
              isLight ? 'border-neutral-200' : 'border-neutral-800'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">Optimal Visiting Hours</span>
              </div>
              <p className={`text-xs pl-5 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                {pandal.bestVisitingTime}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Train className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">Nearest Metro Transit</span>
              </div>
              <p className={`text-xs pl-5 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                {pandal.nearestMetro} ({pandal.metroLine})
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">Crowd Intensity</span>
              </div>
              <p className={`text-xs pl-5 ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                Level: <span className="font-medium text-rose-600 dark:text-rose-400">{pandal.crowdLevel}</span> · {pandal.entryCost}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">Verified Coordinates</span>
              </div>
              <p className={`text-xs pl-5 font-mono ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
                {pandal.coordinates.lat.toFixed(4)}° N, {pandal.coordinates.lng.toFixed(4)}° E
              </p>
            </div>
          </div>

          {/* Traffic Tip */}
          <div
            className={`p-3.5 rounded-xl text-xs space-y-1 border ${
              isLight
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-amber-950/30 border-amber-600/30 text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Kolkata Police Traffic & Walking Notice</span>
            </div>
            <p className="leading-relaxed pl-5">{pandal.trafficTip}</p>
          </div>

          {/* Address with Copy Button */}
          <div
            className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-xs ${
              isLight
                ? 'bg-neutral-50 border-neutral-200 text-neutral-700'
                : 'bg-neutral-950/80 border-neutral-800 text-neutral-300'
            }`}
          >
            <span className="truncate">{pandal.address}</span>
            <button
              onClick={handleCopyAddress}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition cursor-pointer shrink-0 border ${
                isLight
                  ? 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Action Footer */}
          <div
            className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t ${
              isLight ? 'border-neutral-200' : 'border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <button
                onClick={() => {
                  onNavigateTo(pandal);
                  onClose();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm text-white shadow-sm transition cursor-pointer ${
                  isLight
                    ? 'bg-rose-800 hover:bg-rose-900'
                    : 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500'
                }`}
              >
                <Navigation2 className="w-4 h-4" />
                <span>Calculate Route</span>
              </button>

              <button
                onClick={() => onToggleItinerary(pandal)}
                className={`py-2.5 px-4 rounded-xl font-medium text-sm border transition cursor-pointer flex items-center gap-1.5 ${
                  isInItinerary
                    ? isLight
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-amber-500 text-neutral-950 border-amber-400 font-semibold'
                    : isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
              >
                {isInItinerary ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isInItinerary ? 'In Itinerary' : 'Add to Tour'}</span>
              </button>
            </div>

            <a
              href={externalMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-medium border transition ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Transit in Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
