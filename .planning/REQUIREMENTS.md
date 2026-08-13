# System Requirements

**Analysis & Ingest Date:** 2026-08-14  
**Source Specifications:** Ingested from `mdfiles/PROJECT_REQUIREMENTS.md`, `API_SPEC.md`, `DATABASE_SCHEMA.md`, and `SECURITY.md`.

---

## 1. Authentication & Profiles (AUTH)

- **AUTH-01:** Users must be able to sign up, log in, and log out using Supabase Auth (email/password).
- **AUTH-02:** User session tokens (JWT) must persist across page reloads and be transmitted via Bearer Authorization headers.
- **AUTH-03:** Backend `authenticate` middleware must verify Supabase JWTs and attach authenticated user context (`req.user`) to protected endpoints.
- **AUTH-04:** Profiles table in Supabase must store personal details, village, city, district, state, postal code, and seller metadata.
- **AUTH-05:** Any authenticated user must be able to upgrade/register as a seller by selecting their `seller_type` (`Farmer`, `Individual`, `Local Shop`, `Business`, `Service Provider`).

---

## 2. Product Catalog & Media (PROD)

- **PROD-01:** Sellers must be able to create, view, update, and delete product listings.
- **PROD-02:** Product schema must support title, description, category, price, quantity/stock, condition (`New`, `Used - Like New`, `Used - Good`, `Used - Fair`), seller location, and fulfillment options (pickup/delivery).
- **PROD-03:** Image upload pipeline must securely store product photos in Supabase Storage under `Image/<userId>/...` paths and attach public URLs to product records.
- **PROD-04:** Product listings must support search by keywords, category taxonomy, price range, and seller type.
- **PROD-05:** Product detail pages must render complete specs, producer profile story, stock availability, fulfillment choices, and user reviews.

---

## 3. Geospatial & Location Engine (GEO)

- **GEO-01:** Platform must capture user location via browser GPS (HTML5 Geolocation API) with explicit user permission.
- **GEO-02:** When GPS is unavailable or rejected, system must provide a seamless manual fallback selector (village, city, PIN code).
- **GEO-03:** Geographic coordinates (latitude/longitude) must be stored in PostgreSQL utilizing PostGIS geometry/geography types.
- **GEO-04:** `/api/products/nearby` endpoint must perform database-level PostGIS spatial queries filtering products within selectable radii (5 km, 10 km default, 25 km, and wider/all).
- **GEO-05:** Search results and marketplace feeds must display calculated distance (in km) and support sorting by "Nearest" first.

---

## 4. Cart & Order Lifecycle (ORD)

- **ORD-01:** Buyers must be able to add products to a client-side Redux cart, update quantities, and view real-time subtotal/tax calculations.
- **ORD-02:** Checkout flow must allow buyers to specify delivery address and select fulfillment method (seller pickup vs. local delivery).
- **ORD-03:** Backend order engine must transition orders through explicit lifecycle states:
  `PENDING` -> `CONFIRMED` -> `READY_FOR_PICKUP` / `OUT_FOR_DELIVERY` -> `PICKED_UP` / `DELIVERED` -> `COMPLETED` (or `CANCELLED` / `REFUNDED`).
- **ORD-04:** Buyers must have an Order History view (`/orders`) with status badges and order tracking.
- **ORD-05:** Sellers must have an Order Management dashboard to accept incoming orders and advance fulfillment status.

---

## 5. Direct Messaging & Chat (CHAT)

- **CHAT-01:** Buyers and sellers must be able to initiate 1-on-1 direct messaging conversations linked to specific products or orders.
- **CHAT-02:** Messages must support sender identification, message body, optional image attachments, timestamps, and read receipts.
- **CHAT-03:** Realtime message delivery and unread indicators powered by Supabase Realtime channels.

---

## 6. Mapbox Routing & Navigation (MAP)

- **MAP-01:** "Go to Seller" feature must retrieve buyer and seller coordinates and calculate driving/walking routes via Mapbox Directions API.
- **MAP-02:** Mapbox access tokens must remain protected server-side via the `/api/map/route` proxy.
- **MAP-03:** UI must render interactive route geometry, step-by-step navigation cues, total distance, and estimated travel time (ETA).

---

## 7. Payments & Financial Settlement (PAY)

- **PAY-01:** Payment creation must be strictly orchestrated server-side via Razorpay Order API (`/api/payments/create-order`).
- **PAY-02:** Payment verification must validate cryptographic signatures (`razorpay_signature`) server-side before updating order payment status.
- **PAY-03:** Webhook handlers must process asynchronous payment notifications and ensure idempotent status consistency.

---

## 8. Trust, Safety & Governance (TRUST)

- **TRUST-01:** Verified buyers who completed an order must be able to submit star ratings (1-5) and written reviews for products and sellers.
- **TRUST-02:** Users must be able to report suspicious listings, deceptive sellers, or policy violations via `/api/reports`.
- **TRUST-03:** Admins must have an Admin Dashboard (`/admin`) to review flagged reports, moderate listings, and grant seller verification badges.

---

## 9. Non-Functional & Security Requirements (NFR)

- **NFR-01 (Security):** Secure HTTP headers via Helmet, CORS origin restriction, and in-memory rate limiting against brute-force and spam attacks.
- **NFR-02 (Input Validation):** Every API endpoint must enforce strict request schema validation via `express-validator` pipelines.
- **NFR-03 (Performance):** Zero Euclidean distance calculations on client-side arrays; all filtering handled via indexed database queries.
- **NFR-04 (UX / Mobile Responsiveness):** Responsive design supporting desktop, tablet, and mobile with sticky navigation bars, skeleton loaders, and intuitive empty states.
