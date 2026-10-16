# Puja Navigator Kolkata 🪔

A modern, responsive, map-based navigation web application designed to help residents and tourists discover iconic Durga Puja pandals across Kolkata, calculate real street distances and travel times, and plan optimized pandal-hopping tours.

## Key Features

1. **Interactive Kolkata Durga Puja Map**:
   - Built with Google Maps JavaScript API and `@vis.gl/react-google-maps`.
   - Custom festive Durga Puja markers with glowing diya motifs and itinerary sequences.
   - User geolocation detection with real-time accuracy and graceful fallback to key transit hubs (Esplanade, Howrah, Sealdah, Shyambazar).
   - Recenter, zoom, and live GPS focus controls.

2. **Verified Kolkata Pandal Discovery**:
   - Structured dataset of 22 verified iconic Kolkata pandals (Sreebhumi Sporting Club, Bagbazar Sarbojanin, College Square, Ekdalia Evergreen, Santosh Mitra Square, Singhi Park, Suruchi Sangha, Tridhara Sammilani, and more).
   - Exact geographical coordinates, neighborhood classification, nearest Kolkata Metro station (Blue Line & Green Line), crowd intensity, and best visiting times.
   - Real-time distance and estimated travel duration calculation from the user's location.

3. **Point-to-Point Route Planner**:
   - Route between Current Location or Transit Hubs to any selected pandal, or between any two pandals.
   - Powered by the modern Google Maps Routes API (`Route.computeRoutes`).
   - Supports Driving and Walking travel modes.
   - Direct launch into the native Google Maps app for live turn-by-turn navigation.

4. **Multi-Stop Pandal-Hopping Itinerary Planner**:
   - Add multiple pandals to a custom hopping circuit.
   - Reorder stops or remove destinations.
   - **One-Click Route Optimization**: Employs a Traveling Salesperson / Nearest Neighbor algorithm to arrange pandals in the most efficient physical visiting sequence, eliminating unnecessary backtracking.
   - Leg-by-leg distance and duration breakdown.
   - Pre-configured signature circuits:
     - *South Kolkata Heritage Trail*
     - *North Kolkata Heritage Walk*
     - *Grand Palace & Architectural Trail*

5. **Durga Puja Transit & Traffic Advisory**:
   - Kolkata Police festive road closure and pedestrian-only zone notices.
   - Kolkata Metro all-night train timetable advisory.
   - Ganges ferry bypass routes (Howrah Station to Bagbazar and Ahiritola Ghats).

6. **Saved Wishlist / Bookmarks**:
   - Bookmark favorite pandals for later viewing.
   - 1-click conversion of saved pandals into an itinerary.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `VITE_GOOGLE_MAPS_API_KEY` is configured:
```env
VITE_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
```

### Installation & Run
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.
