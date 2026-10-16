import React from 'react';
import { Compass, Navigation2, Sparkles, Bookmark, AlertCircle, LocateFixed, Sun, Moon } from 'lucide-react';

export type ActiveTab = 'explore' | 'route' | 'itinerary' | 'saved' | 'guide';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  savedCount: number;
  itineraryCount: number;
  userLocation: { lat: number; lng: number } | null;
  onLocateMe: () => void;
  isLocating: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  savedCount,
  itineraryCount,
  userLocation,
  onLocateMe,
  isLocating,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  return (
    <header
      className={`sticky top-0 z-40 transition-colors border-b px-4 md:px-8 py-3 ${
        isLight
          ? 'bg-white/95 backdrop-blur-md border-neutral-200 text-neutral-900 shadow-xs'
          : 'bg-neutral-950/95 backdrop-blur-md border-neutral-800 text-neutral-100'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 md:gap-8">
        {/* Zone 1: Single Text Element Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-serif text-lg font-bold shadow-xs select-none ${
              isLight
                ? 'bg-rose-800 text-amber-100 border border-rose-900'
                : 'bg-rose-950 text-amber-300 border border-rose-800'
            }`}
          >
            🪔
          </div>
          <div className="flex flex-col">
            <span
              className={`font-serif font-bold text-lg md:text-xl tracking-tight whitespace-nowrap ${
                isLight ? 'text-neutral-900' : 'text-neutral-50'
              }`}
            >
              Puja Navigator <span className="font-sans font-medium text-sm md:text-base text-rose-700 dark:text-rose-400">Kolkata</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (4-5 single-line clean text links with subtle hover underlines) */}
        <nav
          className={`hidden lg:flex items-center gap-8 text-sm font-medium ${
            isLight ? 'text-neutral-600' : 'text-neutral-400'
          }`}
        >
          <button
            onClick={() => onTabChange('explore')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'explore'
                ? isLight
                  ? 'text-rose-800 font-semibold border-b-2 border-rose-800'
                  : 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : isLight
                ? 'hover:text-neutral-900'
                : 'hover:text-neutral-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore Pandals</span>
          </button>

          <button
            onClick={() => onTabChange('route')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'route'
                ? isLight
                  ? 'text-rose-800 font-semibold border-b-2 border-rose-800'
                  : 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : isLight
                ? 'hover:text-neutral-900'
                : 'hover:text-neutral-100'
            }`}
          >
            <Navigation2 className="w-4 h-4" />
            <span>Route Planner</span>
          </button>

          <button
            onClick={() => onTabChange('itinerary')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'itinerary'
                ? isLight
                  ? 'text-rose-800 font-semibold border-b-2 border-rose-800'
                  : 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : isLight
                ? 'hover:text-neutral-900'
                : 'hover:text-neutral-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Hopping Tour</span>
            {itineraryCount > 0 && (
              <span
                className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  isLight
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {itineraryCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('saved')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'saved'
                ? isLight
                  ? 'text-rose-800 font-semibold border-b-2 border-rose-800'
                  : 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : isLight
                ? 'hover:text-neutral-900'
                : 'hover:text-neutral-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span
                className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  isLight
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('guide')}
            className={`flex items-center gap-2 whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'guide'
                ? isLight
                  ? 'text-rose-800 font-semibold border-b-2 border-rose-800'
                  : 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : isLight
                ? 'hover:text-neutral-900'
                : 'hover:text-neutral-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Traffic Advisory</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Theme switch + GPS locator) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* White / Dark Mode Switch */}
          <button
            onClick={onToggleTheme}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to White Mode'}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Find My Location */}
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            title={userLocation ? 'Location Active' : 'Locate My Position in Kolkata'}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs ${
              userLocation
                ? isLight
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-neutral-900 text-neutral-200 border border-neutral-700 hover:bg-neutral-800'
                : isLight
                ? 'bg-rose-800 hover:bg-rose-900 text-white font-semibold'
                : 'bg-gradient-to-r from-amber-600 to-rose-700 hover:from-amber-500 hover:to-rose-600 text-white font-semibold'
            }`}
          >
            <LocateFixed
              className={`w-4 h-4 ${
                isLocating
                  ? 'animate-spin'
                  : userLocation
                  ? isLight
                    ? 'text-emerald-700'
                    : 'text-emerald-400'
                  : 'text-white'
              }`}
            />
            <span className="hidden sm:inline">
              {isLocating ? 'Locating...' : userLocation ? 'GPS Located' : 'Find My Location'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div
        className={`lg:hidden flex items-center justify-between gap-1 pt-2.5 mt-2 border-t overflow-x-auto text-xs font-medium ${
          isLight ? 'border-neutral-200' : 'border-neutral-800'
        }`}
      >
        <button
          onClick={() => onTabChange('explore')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'explore'
              ? isLight
                ? 'bg-rose-100 text-rose-900 font-semibold'
                : 'bg-amber-500/15 text-amber-400 font-semibold'
              : isLight
              ? 'text-neutral-600'
              : 'text-neutral-400'
          }`}
        >
          Explore
        </button>
        <button
          onClick={() => onTabChange('route')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'route'
              ? isLight
                ? 'bg-rose-100 text-rose-900 font-semibold'
                : 'bg-amber-500/15 text-amber-400 font-semibold'
              : isLight
              ? 'text-neutral-600'
              : 'text-neutral-400'
          }`}
        >
          Directions
        </button>
        <button
          onClick={() => onTabChange('itinerary')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'itinerary'
              ? isLight
                ? 'bg-rose-100 text-rose-900 font-semibold'
                : 'bg-amber-500/15 text-amber-400 font-semibold'
              : isLight
              ? 'text-neutral-600'
              : 'text-neutral-400'
          }`}
        >
          <span>Hop Tour</span>
          {itineraryCount > 0 && (
            <span className={`text-[10px] px-1 rounded ${isLight ? 'bg-amber-200' : 'bg-amber-500/30'}`}>
              {itineraryCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('saved')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'saved'
              ? isLight
                ? 'bg-rose-100 text-rose-900 font-semibold'
                : 'bg-amber-500/15 text-amber-400 font-semibold'
              : isLight
              ? 'text-neutral-600'
              : 'text-neutral-400'
          }`}
        >
          <span>Saved</span>
          {savedCount > 0 && (
            <span className={`text-[10px] px-1 rounded ${isLight ? 'bg-rose-200' : 'bg-rose-500/30'}`}>
              {savedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('guide')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
            activeTab === 'guide'
              ? isLight
                ? 'bg-rose-100 text-rose-900 font-semibold'
                : 'bg-amber-500/15 text-amber-400 font-semibold'
              : isLight
              ? 'text-neutral-600'
              : 'text-neutral-400'
          }`}
        >
          Advisory
        </button>
      </div>
    </header>
  );
};
