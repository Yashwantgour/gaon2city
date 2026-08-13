# Phase 7 UAT Tracker: Mapbox Directions & "Go to Seller" Navigation

### Test 1: "Go to Seller" Navigation Initiation
- **Action:** Open any product details page on `/marketplace` and click the "Go to Seller" button.
- **Expected Result:** Navigates smoothly to `/directions?seller=<sellerId>&product=<productId>`, opens the live map view with origin (Buyer) and destination (Seller) pins and glowing route polyline.
- **Status:** PASSED (Verified by user)

### Test 2: Travel Modes & Dynamic ETA Calculation
- **Action:** In the Directions panel, toggle between "Driving", "Walking", and "Cycling" travel modes.
- **Expected Result:** Estimated travel time, arrival timestamp, and route steps dynamically recalculate based on the selected mode (e.g. driving ~40 km/h, walking ~5 km/h, cycling ~15 km/h).
- **Status:** PASSED (Verified by user)

### Test 3: External Google Maps / In-Car Navigation Launch
- **Action:** Click "Open in Google Maps" at the bottom of the Directions panel.
- **Expected Result:** Launches Google Maps in a new tab with origin, destination, and travel mode prefilled for real-time turn-by-turn road navigation.
- **Status:** PASSED (Verified by user)

### Test 4: Marketplace Map View Toggle
- **Action:** Go to `/marketplace` and click the "Map View" button in the top toolbar.
- **Expected Result:** Switches to the interactive map view displaying price tag markers for available products; clicking a marker opens a floating product preview card with a direct "Go to Seller" button.
- **Status:** PASSED (Verified by user)
