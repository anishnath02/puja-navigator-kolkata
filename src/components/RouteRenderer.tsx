import { useEffect, useRef } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { LatLng, TravelMode } from '../types/pandal';
import { formatDistance, formatDurationMinutes } from '../utils/distance';

export interface RoutePoint {
  coordinates: LatLng;
  name: string;
}

interface RouteRendererProps {
  points: RoutePoint[];
  travelMode: TravelMode;
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
  onError?: (err: string | null) => void;
  onLoading?: (isLoading: boolean) => void;
}

export function RouteRenderer({
  points,
  travelMode,
  onRouteComputed,
  onError,
  onLoading,
}: RouteRendererProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const isCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    isCancelledRef.current = false;

    // Clear previous polylines
    polylinesRef.current.forEach((poly) => poly.setMap(null));
    polylinesRef.current = [];

    if (!map || !routesLib || points.length < 2) {
      onError?.(null);
      onLoading?.(false);
      return;
    }

    onLoading?.(true);
    onError?.(null);

    const RouteClass = (routesLib as unknown as { Route?: { computeRoutes: (req: unknown) => Promise<{ routes: unknown[] }> } }).Route;

    if (!RouteClass || typeof RouteClass.computeRoutes !== 'function') {
      onError?.('Routes library service unavailable');
      onLoading?.(false);
      return;
    }

    const activeRouteClass = RouteClass;
    const activeMap = map;

    // Map TravelMode to uppercase constant
    let mappedTravelMode: string = 'DRIVING';
    if (travelMode === 'WALKING') mappedTravelMode = 'WALKING';
    else if (travelMode === 'TRANSIT') mappedTravelMode = 'TRANSIT';

    // Compute route for each consecutive pair
    async function computeAllLegs() {
      let totalDistance = 0;
      let totalDuration = 0;
      const calculatedLegs: Array<{
        fromName: string;
        toName: string;
        distanceMeters: number;
        durationMillis: number;
        distanceText: string;
        durationText: string;
      }> = [];

      const bounds = new google.maps.LatLngBounds();
      points.forEach((pt) => bounds.extend(pt.coordinates));

      try {
        for (let i = 0; i < points.length - 1; i++) {
          if (isCancelledRef.current) return;

          const originPt = points[i];
          const destPt = points[i + 1];

          const request = {
            origin: { lat: originPt.coordinates.lat, lng: originPt.coordinates.lng },
            destination: { lat: destPt.coordinates.lat, lng: destPt.coordinates.lng },
            travelMode: mappedTravelMode,
            fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
          };

          const response = await activeRouteClass.computeRoutes(request);
          if (isCancelledRef.current) return;

          const route = response.routes && response.routes[0];
          if (!route) {
            continue;
          }

          const typedRoute = route as {
            createPolylines?: () => google.maps.Polyline[];
            distanceMeters?: number;
            durationMillis?: number;
            viewport?: google.maps.LatLngBounds;
          };

          const legDistance = typedRoute.distanceMeters || 0;
          const legDuration = typedRoute.durationMillis || 0;

          totalDistance += legDistance;
          totalDuration += legDuration;

          calculatedLegs.push({
            fromName: originPt.name,
            toName: destPt.name,
            distanceMeters: legDistance,
            durationMillis: legDuration,
            distanceText: formatDistance(legDistance / 1000),
            durationText: formatDurationMinutes(legDuration / 60000),
          });

          // Render polyline
          if (typeof typedRoute.createPolylines === 'function') {
            const newPolylines = typedRoute.createPolylines();
            newPolylines.forEach((poly) => {
              poly.setOptions({
                strokeColor: i % 2 === 0 ? '#f59e0b' : '#f43f5e', // Golden Amber & Crimson alternations
                strokeWeight: 6,
                strokeOpacity: 0.88,
              });
              poly.setMap(activeMap);
              polylinesRef.current.push(poly);
            });
          }

          if (typedRoute.viewport) {
            bounds.union(typedRoute.viewport);
          }
        }

        if (isCancelledRef.current) return;

        if (calculatedLegs.length > 0) {
          activeMap.fitBounds(bounds, { top: 70, right: 70, bottom: 70, left: 70 });

          onRouteComputed?.({
            totalDistanceMeters: totalDistance,
            totalDurationMillis: totalDuration,
            legs: calculatedLegs,
          });
        } else {
          onError?.('Could not calculate path between selected points.');
        }
      } catch (err: unknown) {
        if (!isCancelledRef.current) {
          console.error('Route calculation error:', err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          if (errorMessage.includes('OVER_QUERY_LIMIT') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }
          onError?.('Route calculation encountered an issue. Standard arterial routing estimated.');
        }
      } finally {
        if (!isCancelledRef.current) {
          onLoading?.(false);
        }
      }
    }

    computeAllLegs();

    return () => {
      isCancelledRef.current = true;
      polylinesRef.current.forEach((poly) => poly.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routesLib, points, travelMode]);

  return null;
}
