# Phase 7: Mapbox Directions & "Go to Seller" Navigation

## Objective
Implement end-to-end Mapbox routing, interactive geospatial map visualization, and "Go to Seller" navigation to connect buyers with rural producers seamlessly.

---

## Tasks

### 1. Backend Mapbox Proxy & Routing Engine
- **Files:** `backend/src/routes/map.js`, `backend/src/controllers/mapController.js`, `backend/src/services/mapService.js`, `backend/src/validators/mapValidators.js`, `backend/src/server.js`
- **Details:**
  - Create `GET /api/map/route`:
    - Validates `origin_lat`, `origin_lng`, `dest_lat`, `dest_lng`, and optional `profile` (`driving`, `walking`, `cycling`).
    - Queries Mapbox Directions API (`https://api.mapbox.com/directions/v5/mapbox/...`) using server-side `MAPBOX_TOKEN`.
    - Resilient fallback engine: If `MAPBOX_TOKEN` is not provided or upstream fails, generates an accurate Great-Circle / Haversine route geometry with estimated driving & walking ETA (duration, distance, step summaries) so the UI remains 100% operational without failing.
  - Create `GET /api/map/config`:
    - Returns client-safe public map config (or fallback tile provider configurations).

### 2. Frontend Mapbox & Interactive Map Engine
- **Files:** `frontend/src/components/map/MapboxView.jsx`, `frontend/src/components/map/DirectionsPanel.jsx`, `frontend/src/services/mapApi.js`
- **Details:**
  - Create lightweight, responsive Map component using interactive Leaflet/Mapbox GL or SVG-Geo vector tiles with full custom markers, route line overlays, popups, and zoom controls.
  - Render Buyer origin pin (blue pulsing circle) and Seller destination pin (emerald/primary barn/shop marker).
  - Render polyline route connecting buyer to seller with turn points.

### 3. "Go to Seller" Flow on Product Details & Dedicated Directions Page
- **Files:** `frontend/src/pages/ProductDetails.jsx`, `frontend/src/pages/Directions.jsx`, `frontend/src/App.jsx`
- **Details:**
  - Wire the "Go to Seller" button on `ProductDetails.jsx` to navigate to `/directions?seller=<seller_id>&product=<product_id>`.
  - Handle missing buyer location by seamlessly requesting GPS or opening a location picker.
  - Display:
    - Interactive live map with route polyline and markers.
    - Distance (km) and travel times (Driving ETA, Walking ETA, Cycling ETA).
    - Mode selector tabs (`Driving`, `Walking`, `Cycling`).
    - Step-by-step navigation instructions.
    - Seller contact badge with village/city address and direct "Chat Seller" button.
    - "Open in Google Maps" / "Open in Apple Maps" external action buttons for in-car navigation.

### 4. Marketplace Map View Toggle
- **Files:** `frontend/src/pages/Marketplace.jsx`, `frontend/src/components/map/MarketplaceMap.jsx`
- **Details:**
  - Add a View Toggle on `/marketplace` (`Grid View` vs `Map View`).
  - In Map View, render pins for all available products in the active radius with popup previews (image, price, title, seller, and "Go to Seller" / "Chat" buttons).

---

## Verification Plan

### Automated Tests / Build
- Run `npm --prefix frontend run build` to verify 0 compiler/TypeScript errors.
- Test `GET /api/map/route` endpoint with origin and destination coordinates.

### Manual UAT Scenarios
1. **Scenario 1:** Click "Go to Seller" on any product detail page -> opens Directions page with route map, distance, and ETA.
2. **Scenario 2:** Toggle travel mode (Driving vs Walking) -> updates ETA and route.
3. **Scenario 3:** Click "Open in Google Maps" -> launches external navigation URL with origin & destination query parameters.
4. **Scenario 4:** Switch Marketplace to Map View -> displays pins for rural sellers with clickable product preview cards.
