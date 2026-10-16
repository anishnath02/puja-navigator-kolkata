import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Pandal } from '../types/pandal';

interface CustomPandalMarkerProps {
  pandal: Pandal;
  isSelected: boolean;
  isInItinerary: boolean;
  itineraryIndex?: number;
  theme?: 'light' | 'dark';
  onClick: (pandal: Pandal) => void;
}

export const CustomPandalMarker: React.FC<CustomPandalMarkerProps> = ({
  pandal,
  isSelected,
  isInItinerary,
  itineraryIndex,
  theme = 'light',
  onClick,
}) => {
  const isLight = theme === 'light';

  return (
    <AdvancedMarker
      position={pandal.coordinates}
      title={pandal.name}
      onClick={() => onClick(pandal)}
      zIndex={isSelected ? 60 : isInItinerary ? 40 : 15}
    >
      <div
        className={`group relative cursor-pointer select-none transition-transform duration-200 ${
          isSelected ? 'scale-125 -translate-y-2' : 'hover:scale-110 -translate-y-1'
        }`}
      >
        {/* Outer Highlight */}
        {isSelected && (
          <div className="absolute -inset-1.5 bg-rose-500/40 rounded-full blur-xs animate-pulse" />
        )}

        {/* Marker Body */}
        <div
          className={`relative flex items-center justify-center px-2 py-1 rounded-full shadow-md border backdrop-blur-xs transition-all ${
            isSelected
              ? isLight
                ? 'bg-rose-800 border-rose-900 text-white font-bold ring-2 ring-amber-300'
                : 'bg-gradient-to-r from-amber-500 to-rose-600 border-amber-300 text-white font-bold'
              : isInItinerary
              ? isLight
                ? 'bg-amber-100 border-amber-400 text-amber-950 font-semibold'
                : 'bg-amber-950/90 border-amber-400 text-amber-200 font-semibold'
              : isLight
              ? 'bg-white hover:bg-neutral-50 border-neutral-300 hover:border-rose-700 text-neutral-800'
              : 'bg-neutral-900/95 border-neutral-700 hover:border-amber-500 text-neutral-200'
          }`}
        >
          {/* Index / Diya Motif */}
          {typeof itineraryIndex === 'number' ? (
            <span
              className={`w-4 h-4 rounded-full text-[10px] font-mono font-bold flex items-center justify-center mr-1 ${
                isLight ? 'bg-rose-800 text-white' : 'bg-amber-400 text-neutral-950'
              }`}
            >
              {itineraryIndex + 1}
            </span>
          ) : (
            <span className="text-xs mr-1">🪔</span>
          )}

          <span className="text-[11px] font-medium tracking-tight max-w-[115px] truncate">
            {pandal.name.replace(/ Sarbojanin| Durgotsav| Club| Association/g, '')}
          </span>
        </div>

        {/* Pin Stem Indicator */}
        <div
          className={`w-0 h-0 mx-auto border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] shadow-2xs ${
            isSelected
              ? isLight
                ? 'border-t-rose-800'
                : 'border-t-amber-500'
              : isLight
              ? 'border-t-neutral-400'
              : 'border-t-neutral-600'
          }`}
        />
      </div>
    </AdvancedMarker>
  );
};

export const UserLocationMarker: React.FC<{ coordinates: { lat: number; lng: number } }> = ({ coordinates }) => {
  return (
    <AdvancedMarker position={coordinates} zIndex={100} title="Your Current Location">
      <div className="relative flex items-center justify-center">
        {/* Pulsing radar */}
        <div className="absolute w-8 h-8 bg-sky-500/35 rounded-full animate-ping" />
        {/* Solid Center */}
        <div className="relative w-5 h-5 bg-sky-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      </div>
    </AdvancedMarker>
  );
};
