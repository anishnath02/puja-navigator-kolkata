import React, { useCallback, useRef } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { Pandal, LatLng, TravelMode } from '../types/pandal';
import { CustomPandalMarker, UserLocationMarker } from './CustomPandalMarker';
import { RouteRenderer, RoutePoint } from './RouteRenderer';
import { LocateFixed, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { KOLKATA_CENTER } from '../data/pandals';

interface MapContainerProps {
  apiKey: string;
  pandals: Pandal[];
  selectedPandal: Pandal | null;
  onSelectPandal: (pandal: Pandal) => void;
  itineraryPandals: Pandal[];
  userLocation: LatLng | null;
  routePoints: RoutePoint[];
  travelMode: TravelMode;
  theme: 'light' | 'dark';
  onRouteComputed?: (data: {
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
  }) => void;
  onRouteLoading?: (isLoading: boolean) => void;
  onRouteError?: (err: string | null) => void;
}

// Inner helper component to control map camera programmatically
function MapControls({
  userLocation,
  selectedPandal,
  theme,
}: {
  userLocation: LatLng | null;
  selectedPandal: Pandal | null;
  theme: 'light' | 'dark';
}) {
  const map = useMap();
  const prevPandalId = useRef<string | null>(null);
  const isLight = theme === 'light';

  React.useEffect(() => {
    if (!map || !selectedPandal) return;
    if (selectedPandal.id !== prevPandalId.current) {
      prevPandalId.current = selectedPandal.id;
      map.panTo(selectedPandal.coordinates);
      map.setZoom(15);
    }
  }, [map, selectedPandal]);

  const handleZoomIn = useCallback(() => {
    if (map) map.setZoom((map.getZoom() || 12) + 1);
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) map.setZoom((map.getZoom() || 12) - 1);
  }, [map]);

  const handleRecenterKolkata = useCallback(() => {
    if (map) {
      map.panTo(KOLKATA_CENTER);
      map.setZoom(12);
    }
  }, [map]);

  const handleGoToUserLocation = useCallback(() => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(15);
    }
  }, [map, userLocation]);

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <div
        className={`rounded-xl shadow-md border backdrop-blur-md flex flex-col p-1 transition-colors ${
          isLight ? 'bg-white/95 border-neutral-200' : 'bg-neutral-900/90 border-neutral-700/80'
        }`}
      >
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom in on map"
          className={`p-2 rounded-lg transition cursor-pointer ${
            isLight
              ? 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom out on map"
          className={`p-2 rounded-lg transition cursor-pointer border-t ${
            isLight
              ? 'border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              : 'border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      <div
        className={`rounded-xl shadow-md border backdrop-blur-md flex flex-col p-1 transition-colors ${
          isLight ? 'bg-white/95 border-neutral-200' : 'bg-neutral-900/90 border-neutral-700/80'
        }`}
      >
        <button
          onClick={handleRecenterKolkata}
          title="Recenter to Central Kolkata"
          aria-label="Recenter to Central Kolkata"
          className={`p-2 rounded-lg transition cursor-pointer ${
            isLight
              ? 'text-neutral-700 hover:text-rose-850 hover:bg-neutral-100'
              : 'text-neutral-300 hover:text-amber-400 hover:bg-neutral-800'
          }`}
        >
          <Compass className="w-4 h-4" />
        </button>

        {userLocation && (
          <button
            onClick={handleGoToUserLocation}
            title="Focus on My Location"
            aria-label="Focus on my current location"
            className={`p-2 rounded-lg transition cursor-pointer border-t ${
              isLight
                ? 'border-neutral-200 text-sky-700 hover:text-sky-900 hover:bg-neutral-100'
                : 'border-neutral-800 text-sky-400 hover:text-sky-300 hover:bg-neutral-800'
            }`}
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export const MapContainer: React.FC<MapContainerProps> = ({
  apiKey,
  pandals,
  selectedPandal,
  onSelectPandal,
  itineraryPandals,
  userLocation,
  routePoints,
  travelMode,
  theme,
  onRouteComputed,
  onRouteLoading,
  onRouteError,
}) => {
  const itineraryIds = new Set(itineraryPandals.map((p) => p.id));
  const isLight = theme === 'light';

  return (
    <div
      className={`relative w-full h-full min-h-[400px] overflow-hidden transition-colors ${
        isLight ? 'bg-neutral-100' : 'bg-neutral-950'
      }`}
    >
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={KOLKATA_CENTER}
          defaultZoom={12}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* User Location Radar Marker */}
          {userLocation && <UserLocationMarker coordinates={userLocation} />}

          {/* All Durga Puja Pandal Markers */}
          {pandals.map((pandal) => {
            const isSelected = selectedPandal?.id === pandal.id;
            const isInItinerary = itineraryIds.has(pandal.id);
            const itineraryIndex = isInItinerary
              ? itineraryPandals.findIndex((p) => p.id === pandal.id)
              : undefined;

            return (
              <CustomPandalMarker
                key={pandal.id}
                pandal={pandal}
                isSelected={isSelected}
                isInItinerary={isInItinerary}
                itineraryIndex={itineraryIndex}
                theme={theme}
                onClick={onSelectPandal}
              />
            );
          })}

          {/* Route Renderer for paths */}
          {routePoints.length >= 2 && (
            <RouteRenderer
              points={routePoints}
              travelMode={travelMode}
              onRouteComputed={onRouteComputed}
              onError={onRouteError}
              onLoading={onRouteLoading}
            />
          )}

          {/* Map Controls */}
          <MapControls
            userLocation={userLocation}
            selectedPandal={selectedPandal}
            theme={theme}
          />
        </Map>
      </APIProvider>
    </div>
  );
};
