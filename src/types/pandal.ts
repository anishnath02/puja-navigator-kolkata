export interface LatLng {
  lat: number;
  lng: number;
}

export type ZoneType = 'All' | 'North Kolkata' | 'South Kolkata' | 'Central' | 'Salt Lake & VIP Road';

export type PandalCategory = 'Heritage Sabekiana' | 'Grand Architectural' | 'Artistic & Conceptual' | 'Lighting & Illumination';

export type CrowdLevel = 'Very High' | 'High' | 'Moderate';

export interface TransitGuide {
  metro: {
    station: string;
    line: 'Blue Line (North-South)' | 'Green Line (East-West)' | 'Purple Line';
    gate?: string;
    walkingTimeMinutes: number;
    walkingDistanceMeters: number;
  };
  train?: {
    station: string;
    railwayDivision: string;
    feederConnection: string;
  };
  busAndAuto: {
    nearestBusStop: string;
    keyBusRoutes: string[];
    sharedAutoStand?: string;
  };
  ferryGhat?: {
    ghatName: string;
    connectionFrom: string;
  };
  walkingDirections: string;
}

export interface Pandal {
  id: string;
  name: string;
  bengaliName: string;
  neighborhood: string;
  zone: ZoneType;
  address: string;
  coordinates: LatLng;
  nearestMetro: string;
  metroLine: 'Blue Line' | 'Green Line';
  category: PandalCategory;
  famousFor: string;
  crowdLevel: CrowdLevel;
  bestVisitingTime: string;
  wheelchairAccessible: boolean;
  entryCost: 'Free Entry' | 'Pass / VIP Counter Available';
  description: string;
  heritageYear?: string;
  highlights: string[];
  trafficTip: string;
  foodNearby?: string;
  anjaliTiming?: string;
  transit?: TransitGuide;
}

export type TravelMode = 'DRIVING' | 'WALKING' | 'TRANSIT';

export interface RouteLeg {
  startAddress?: string;
  endAddress?: string;
  distanceMeters: number;
  durationMillis: number;
  distanceText: string;
  durationText: string;
}

export interface CalculatedRoute {
  totalDistanceMeters: number;
  totalDurationMillis: number;
  distanceText: string;
  durationText: string;
  legs: RouteLeg[];
  travelMode: TravelMode;
}
