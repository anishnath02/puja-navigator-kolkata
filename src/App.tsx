import { useState, useEffect, useMemo, useCallback } from 'react';
import { KOLKATA_PANDALS } from './data/pandals';
import { Pandal, LatLng, ZoneType, TravelMode } from './types/pandal';
import { Navbar, ActiveTab } from './components/Navbar';
import { MapContainer } from './components/MapContainer';
import { PandalCard } from './components/PandalCard';
import { PandalDetailModal } from './components/PandalDetailModal';
import { RoutePlannerPanel } from './components/RoutePlannerPanel';
import { HoppingPlannerPanel } from './components/HoppingPlannerPanel';
import { TrafficAdvisoryView } from './components/TrafficAdvisoryModal';
import { calculateHaversineDistanceKm, optimizeItinerarySequence } from './utils/distance';
import { RoutePoint } from './components/RouteRenderer';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  MapPin,
  AlertCircle,
  X,
  Compass,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyBcXYgqVsfWYoyw6HvcMNGT5B9qmcinrBs';

export default function App() {
  // Theme state: defaults to 'light' ("White Mode") as requested
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('pujanavigator_theme');
      return (savedTheme as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  const isLight = theme === 'light';

  // Toggle Theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('pujanavigator_theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Navigation & View
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [mobileView, setMobileView] = useState<'map' | 'list'>('list');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Quota banner listener
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // User Location State
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<ZoneType>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'distance' | 'name'>('recommended');

  // Selected Pandal for Detail Modal / Focus
  const [selectedPandal, setSelectedPandal] = useState<Pandal | null>(null);
  const [detailModalPandal, setDetailModalPandal] = useState<Pandal | null>(null);

  // Saved Pandals (Bookmarks)
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pujanavigator_saved');
      return saved ? JSON.parse(saved) : ['sreebhumi', 'bagbazar', 'ekdalia-evergreen'];
    } catch {
      return ['sreebhumi', 'bagbazar', 'ekdalia-evergreen'];
    }
  });

  // Hopping Tour Itinerary
  const [itineraryIds, setItineraryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pujanavigator_itinerary');
      return saved ? JSON.parse(saved) : ['bagbazar', 'kumartuli-park', 'college-square'];
    } catch {
      return ['bagbazar', 'kumartuli-park', 'college-square'];
    }
  });

  // Point to Point Route State
  const [routeStart, setRouteStart] = useState<{
    type: 'user' | 'hub' | 'pandal';
    id?: string;
    name: string;
    coordinates: LatLng;
  } | null>(null);
  const [routeDestination, setRouteDestination] = useState<Pandal | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVING');

  // Route calculation states
  const [activeRouteData, setActiveRouteData] = useState<{
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
  } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pujanavigator_saved', JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('pujanavigator_itinerary', JSON.stringify(itineraryIds));
    } catch {
      // ignore
    }
  }, [itineraryIds]);

  // Listen for Google Maps Platform quota exceeded event
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  // Request user location with clear permission flow
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);

        setRouteStart((prev) =>
          prev === null
            ? {
                type: 'user',
                name: 'My Current Location',
                coordinates: coords,
              }
            : prev
        );
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation access issue:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(
            'Location permission was denied. You can select a starting point like Esplanade, Sealdah, or Howrah Station from the Route Planner.'
          );
        } else {
          setLocationError('Unable to retrieve location. Using central Kolkata as default.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, []);

  // Toggle Saved / Bookmarked
  const toggleSaved = useCallback((pandal: Pandal) => {
    setSavedIds((prev) =>
      prev.includes(pandal.id) ? prev.filter((id) => id !== pandal.id) : [...prev, pandal.id]
    );
  }, []);

  // Toggle Itinerary Stop
  const toggleItinerary = useCallback((pandal: Pandal) => {
    setItineraryIds((prev) =>
      prev.includes(pandal.id) ? prev.filter((id) => id !== pandal.id) : [...prev, pandal.id]
    );
  }, []);

  // Add Stop to Itinerary
  const addStopToItinerary = useCallback((pandal: Pandal) => {
    setItineraryIds((prev) => (prev.includes(pandal.id) ? prev : [...prev, pandal.id]));
  }, []);

  // Remove Stop from Itinerary
  const removeStopFromItinerary = useCallback((index: number) => {
    setItineraryIds((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  // Move Stop in Itinerary
  const moveStopInItinerary = useCallback((index: number, direction: 'up' | 'down') => {
    setItineraryIds((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  }, []);

  // Optimize Itinerary sequence using TSP Nearest Neighbor
  const handleOptimizeItinerary = useCallback(() => {
    const currentPandals = itineraryIds
      .map((id) => KOLKATA_PANDALS.find((p) => p.id === id))
      .filter((p): p is Pandal => Boolean(p));

    if (currentPandals.length <= 2) return;

    const startCoord = userLocation || currentPandals[0].coordinates;
    const optimized = optimizeItinerarySequence(startCoord, currentPandals);
    setItineraryIds(optimized.map((p) => p.id));
  }, [itineraryIds, userLocation]);

  // Navigate to single pandal (switches to Route tab)
  const handleNavigateToPandal = useCallback(
    (pandal: Pandal) => {
      setSelectedPandal(pandal);
      setRouteDestination(pandal);
      if (!routeStart) {
        if (userLocation) {
          setRouteStart({
            type: 'user',
            name: 'My Current Location',
            coordinates: userLocation,
          });
        } else {
          setRouteStart({
            type: 'hub',
            name: 'Esplanade (Dharmatala)',
            coordinates: { lat: 22.5645, lng: 88.3533 },
          });
        }
      }
      setActiveTab('route');
      setIsSidebarOpen(true);
    },
    [routeStart, userLocation]
  );

  // Derived start point pandal (if origin is pandal)
  const startPointPandal = useMemo(() => {
    if (routeStart?.type === 'pandal' && routeStart.id) {
      return KOLKATA_PANDALS.find((p) => p.id === routeStart.id) || null;
    }
    return null;
  }, [routeStart]);

  // Swap Origin and Destination in Point-to-Point routing
  const handleSwapRoutePoints = useCallback(() => {
    if (!startPointPandal || !routeDestination) return;
    const tempDest = routeDestination;
    setRouteDestination(startPointPandal);
    setRouteStart({
      type: 'pandal',
      id: tempDest.id,
      name: tempDest.name,
      coordinates: tempDest.coordinates,
    });
  }, [routeDestination, startPointPandal]);

  // Convert itinerary IDs to Pandal objects
  const itineraryPandals = useMemo(() => {
    return itineraryIds
      .map((id) => KOLKATA_PANDALS.find((p) => p.id === id))
      .filter((p): p is Pandal => Boolean(p));
  }, [itineraryIds]);

  // Convert saved IDs to Pandal objects
  const savedPandals = useMemo(() => {
    return savedIds
      .map((id) => KOLKATA_PANDALS.find((p) => p.id === id))
      .filter((p): p is Pandal => Boolean(p));
  }, [savedIds]);

  // Filtered & Sorted Pandals for Explore list
  const filteredPandals = useMemo(() => {
    let list = [...KOLKATA_PANDALS];

    // Search Query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.bengaliName.includes(q) ||
          p.neighborhood.toLowerCase().includes(q) ||
          p.zone.toLowerCase().includes(q) ||
          p.nearestMetro.toLowerCase().includes(q) ||
          p.famousFor.toLowerCase().includes(q) ||
          (p.foodNearby && p.foodNearby.toLowerCase().includes(q))
      );
    }

    // Zone Filter
    if (selectedZone !== 'All') {
      list = list.filter((p) => p.zone === selectedZone);
    }

    // Category Filter
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Sorting
    if (sortBy === 'distance' && userLocation) {
      list.sort((a, b) => {
        const distA = calculateHaversineDistanceKm(userLocation, a.coordinates);
        const distB = calculateHaversineDistanceKm(userLocation, b.coordinates);
        return distA - distB;
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [searchQuery, selectedZone, selectedCategory, sortBy, userLocation]);

  // Compute active route points to draw on the map based on active tab
  const mapRoutePoints = useMemo<RoutePoint[]>(() => {
    if (activeTab === 'route') {
      if (routeStart && routeDestination) {
        return [
          { coordinates: routeStart.coordinates, name: routeStart.name },
          { coordinates: routeDestination.coordinates, name: routeDestination.name },
        ];
      }
      return [];
    }

    if (activeTab === 'itinerary') {
      if (itineraryPandals.length >= 2) {
        const points: RoutePoint[] = [];
        if (userLocation) {
          points.push({ coordinates: userLocation, name: 'My Current Location' });
        }
        itineraryPandals.forEach((p) => {
          points.push({ coordinates: p.coordinates, name: p.name });
        });
        return points;
      }
      return [];
    }

    return [];
  }, [activeTab, routeStart, routeDestination, itineraryPandals, userLocation]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight ? 'bg-white text-neutral-900' : 'bg-neutral-950 text-neutral-100'
      }`}
    >
      {/* Tier 2: Google Maps Quota Warning Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-xs">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setMobileView('list');
          setIsSidebarOpen(true);
        }}
        savedCount={savedIds.length}
        itineraryCount={itineraryIds.length}
        userLocation={userLocation}
        onLocateMe={handleLocateUser}
        isLocating={isLocating}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Optional Location Denied Banner */}
      {locationError && (
        <div
          className={`border-b px-4 py-2 text-xs flex items-center justify-between gap-3 ${
            isLight
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{locationError}</span>
          </div>
          <button
            onClick={() => setLocationError(null)}
            className="p-1 text-neutral-500 hover:text-neutral-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Left Sidebar / Panel */}
        <div
          className={`transition-all duration-300 flex-shrink-0 flex flex-col z-20 border-r ${
            isLight
              ? 'bg-neutral-50/70 border-neutral-200'
              : 'bg-neutral-950 border-neutral-800/80'
          } ${
            isSidebarOpen ? 'w-full lg:w-[480px] xl:w-[520px]' : 'w-0 hidden'
          } ${mobileView === 'map' ? 'hidden lg:flex' : 'flex'}`}
          style={{ height: 'calc(100vh - 65px)' }}
        >
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {/* TAB 1: EXPLORE PANDALS */}
            {activeTab === 'explore' && (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      isLight ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pandal, neighborhood (e.g. Bagbazar, Gariahat, VIP Rd)..."
                    className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-sm transition focus:outline-none border shadow-2xs ${
                      isLight
                        ? 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-rose-800'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Zone Filter (Interactive functional segmented controls) */}
                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between text-xs font-medium ${
                      isLight ? 'text-neutral-600' : 'text-neutral-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-rose-700 dark:text-amber-400" />
                      <span>Kolkata Zone</span>
                    </span>
                    <span className="font-mono tabular-nums">{filteredPandals.length} pandals</span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {(['All', 'North Kolkata', 'South Kolkata', 'Central', 'Salt Lake & VIP Road'] as ZoneType[]).map(
                      (zone) => (
                        <button
                          key={zone}
                          onClick={() => setSelectedZone(zone)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                            selectedZone === zone
                              ? isLight
                                ? 'bg-rose-800 text-white font-semibold shadow-2xs'
                                : 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                              : isLight
                              ? 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
                              : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                          }`}
                        >
                          {zone}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Category & Sort controls */}
                <div className="flex items-center justify-between gap-2 text-xs pt-1">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer border ${
                      isLight
                        ? 'bg-white text-neutral-700 border-neutral-300'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                    }`}
                  >
                    <option value="All">All Categories</option>
                    <option value="Heritage Sabekiana">Heritage Sabekiana</option>
                    <option value="Grand Architectural">Grand Architectural</option>
                    <option value="Artistic & Conceptual">Artistic & Conceptual</option>
                    <option value="Lighting & Illumination">Lighting & Illumination</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recommended' | 'distance' | 'name')}
                    className={`rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer border ${
                      isLight
                        ? 'bg-white text-neutral-700 border-neutral-300'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                    }`}
                  >
                    <option value="recommended">Featured Order</option>
                    {userLocation && <option value="distance">Nearest to Me</option>}
                    <option value="name">Alphabetical</option>
                  </select>
                </div>

                {/* Pandal List */}
                <div className="space-y-3 pt-1">
                  {filteredPandals.map((pandal) => (
                    <PandalCard
                      key={pandal.id}
                      pandal={pandal}
                      userLocation={userLocation}
                      isSelected={selectedPandal?.id === pandal.id}
                      isSaved={savedIds.includes(pandal.id)}
                      isInItinerary={itineraryIds.includes(pandal.id)}
                      theme={theme}
                      onSelect={(p) => {
                        setSelectedPandal(p);
                        if (window.innerWidth < 1024) setMobileView('map');
                      }}
                      onNavigateTo={handleNavigateToPandal}
                      onToggleSaved={toggleSaved}
                      onToggleItinerary={toggleItinerary}
                      onViewDetails={(p) => setDetailModalPandal(p)}
                    />
                  ))}

                  {filteredPandals.length === 0 && (
                    <div
                      className={`p-8 text-center rounded-xl border space-y-2 ${
                        isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/40 border-neutral-800'
                      }`}
                    >
                      <Compass className="w-8 h-8 text-neutral-400 mx-auto" />
                      <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        No matching pandals found
                      </p>
                      <p className="text-xs text-neutral-500">
                        Try searching for another neighborhood, or clear the zone filters.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ROUTE PLANNER */}
            {activeTab === 'route' && (
              <RoutePlannerPanel
                pandals={KOLKATA_PANDALS}
                userLocation={userLocation}
                startPoint={routeStart}
                destinationPandal={routeDestination}
                travelMode={travelMode}
                theme={theme}
                onStartPointChange={setRouteStart}
                onDestinationChange={(p) => {
                  setRouteDestination(p);
                  if (p) setSelectedPandal(p);
                }}
                onTravelModeChange={setTravelMode}
                onSwapPoints={handleSwapRoutePoints}
                routeData={activeRouteData}
                isLoadingRoute={isLoadingRoute}
                routeError={routeError}
              />
            )}

            {/* TAB 3: HOPPING TOUR ITINERARY */}
            {activeTab === 'itinerary' && (
              <HoppingPlannerPanel
                pandals={KOLKATA_PANDALS}
                itinerary={itineraryPandals}
                userLocation={userLocation}
                travelMode={travelMode}
                theme={theme}
                onTravelModeChange={setTravelMode}
                onRemoveStop={removeStopFromItinerary}
                onMoveStop={moveStopInItinerary}
                onOptimizeRoute={handleOptimizeItinerary}
                onClearItinerary={() => setItineraryIds([])}
                onAddPandalToItinerary={addStopToItinerary}
                onLoadPredefinedCircuit={(ids) => setItineraryIds(ids)}
                routeData={activeRouteData}
                isLoadingRoute={isLoadingRoute}
              />
            )}

            {/* TAB 4: SAVED PANDALS */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2
                      className={`text-xl font-serif font-bold flex items-center gap-2 ${
                        isLight ? 'text-neutral-900' : 'text-neutral-100'
                      }`}
                    >
                      <Bookmark className="w-5 h-5 text-rose-600" />
                      <span>Saved Pandals</span>
                    </h2>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      {savedPandals.length} pandals in your wishlist
                    </p>
                  </div>

                  {savedPandals.length > 0 && (
                    <button
                      onClick={() => {
                        setItineraryIds(savedIds);
                        setActiveTab('itinerary');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer ${
                        isLight
                          ? 'bg-rose-800 hover:bg-rose-900 text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Create Tour from Saved</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {savedPandals.map((pandal) => (
                    <PandalCard
                      key={pandal.id}
                      pandal={pandal}
                      userLocation={userLocation}
                      isSelected={selectedPandal?.id === pandal.id}
                      isSaved={true}
                      isInItinerary={itineraryIds.includes(pandal.id)}
                      theme={theme}
                      onSelect={(p) => setSelectedPandal(p)}
                      onNavigateTo={handleNavigateToPandal}
                      onToggleSaved={toggleSaved}
                      onToggleItinerary={toggleItinerary}
                      onViewDetails={(p) => setDetailModalPandal(p)}
                    />
                  ))}

                  {savedPandals.length === 0 && (
                    <div
                      className={`p-8 text-center rounded-xl border space-y-2 ${
                        isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/40 border-neutral-800'
                      }`}
                    >
                      <Bookmark className="w-8 h-8 text-neutral-400 mx-auto" />
                      <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        No saved pandals yet
                      </p>
                      <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                        Bookmark pandals while exploring to plan your custom Durga Puja hopping circuit.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: TRAFFIC & METRO GUIDE */}
            {activeTab === 'guide' && <TrafficAdvisoryView theme={theme} />}
          </div>
        </div>

        {/* Sidebar Collapse/Expand Floating Button on Desktop */}
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          title={isSidebarOpen ? 'Collapse list panel' : 'Expand list panel'}
          className={`hidden lg:flex absolute top-4 z-30 p-2 rounded-r-xl border shadow-md items-center justify-center transition-all cursor-pointer ${
            isSidebarOpen ? 'left-[480px] xl:left-[520px]' : 'left-0 rounded-l-none'
          } ${
            isLight
              ? 'bg-white border-neutral-200 text-neutral-700 hover:text-neutral-950'
              : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
          }`}
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Right Section: Large Interactive Google Map */}
        <div
          className={`flex-1 relative h-full ${
            mobileView === 'list' ? 'hidden lg:block' : 'block'
          }`}
          style={{ height: 'calc(100vh - 65px)' }}
        >
          <MapContainer
            apiKey={GOOGLE_MAPS_API_KEY}
            pandals={filteredPandals}
            selectedPandal={selectedPandal}
            onSelectPandal={(p) => {
              setSelectedPandal(p);
              setDetailModalPandal(p);
            }}
            itineraryPandals={itineraryPandals}
            userLocation={userLocation}
            routePoints={mapRoutePoints}
            travelMode={travelMode}
            theme={theme}
            onRouteComputed={(data) => setActiveRouteData(data)}
            onRouteLoading={setIsLoadingRoute}
            onRouteError={setRouteError}
          />

          {/* Floating Selected Pandal Quick Card (Overlay on Map) */}
          {selectedPandal && (
            <div
              className={`absolute bottom-6 left-6 right-6 md:right-auto md:w-96 z-30 rounded-2xl p-4 shadow-xl border space-y-3 transition-colors ${
                isLight
                  ? 'bg-white/95 backdrop-blur-md border-neutral-200 text-neutral-900'
                  : 'bg-neutral-900/95 backdrop-blur-md border-neutral-700 text-neutral-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={`text-[11px] font-medium ${
                      isLight ? 'text-rose-800' : 'text-amber-400'
                    }`}
                  >
                    {selectedPandal.zone} · {selectedPandal.category}
                  </span>
                  <h3 className="font-serif font-bold text-base truncate">
                    {selectedPandal.name}
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {selectedPandal.neighborhood} · {selectedPandal.nearestMetro}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPandal(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div
                className={`flex items-center gap-2 pt-1 border-t ${
                  isLight ? 'border-neutral-200' : 'border-neutral-800'
                }`}
              >
                <button
                  onClick={() => setDetailModalPandal(selectedPandal)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    isLight
                      ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                  }`}
                >
                  View Details
                </button>
                <button
                  onClick={() => handleNavigateToPandal(selectedPandal)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center justify-center gap-1 ${
                    isLight
                      ? 'bg-rose-800 hover:bg-rose-900 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                  }`}
                >
                  <span>Directions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Toggle Bar between Map and List View */}
        <div
          className={`lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 rounded-full p-1 shadow-xl flex items-center gap-1 border ${
            isLight
              ? 'bg-white/95 backdrop-blur-md border-neutral-300 text-neutral-900'
              : 'bg-neutral-900/95 backdrop-blur-md border-neutral-700 text-neutral-100'
          }`}
        >
          <button
            onClick={() => setMobileView('list')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              mobileView === 'list'
                ? isLight
                  ? 'bg-rose-800 text-white shadow-xs'
                  : 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              mobileView === 'map'
                ? isLight
                  ? 'bg-rose-800 text-white shadow-xs'
                  : 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </main>

      {/* Pandal Detail Modal */}
      {detailModalPandal && (
        <PandalDetailModal
          pandal={detailModalPandal}
          userLocation={userLocation}
          isSaved={savedIds.includes(detailModalPandal.id)}
          isInItinerary={itineraryIds.includes(detailModalPandal.id)}
          theme={theme}
          onClose={() => setDetailModalPandal(null)}
          onNavigateTo={handleNavigateToPandal}
          onToggleSaved={toggleSaved}
          onToggleItinerary={toggleItinerary}
        />
      )}
    </div>
  );
}
