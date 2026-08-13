# Gaon2City — Hyperlocal Rural-Urban Direct Marketplace

**Analysis & Ingest Date:** 2026-08-14  
**Source Specifications:** Ingested from `mdfiles/` (`PROJECT_REQUIREMENTS.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `IMPLEMENTATION_ROADMAP.md`, `TECH_STACK.md`, `SECURITY.md`)

---

## 1. Vision & Overview

**Gaon2City** is a full-stack hyperlocal commerce platform bridging rural producers (farmers, artisans, local shops, service providers) directly with urban consumers. It eliminates unnecessary intermediaries, guarantees fresh produce and authentic village craftsmanship, enables transparent pricing, and supports flexible fulfillment (seller pickup, local delivery, or both) powered by PostGIS geospatial discovery.

Every user on the platform can seamlessly act as a **Buyer**, **Seller**, or **Both**.

---

## 2. User Roles & Capabilities

### 🛍️ Buyer
- **Account & Onboarding:** Secure signup/login via Supabase Auth, location configuration (GPS or manual village/city/PIN).
- **Discovery:** Browse, search, and filter local produce/products with dynamic radius filtering (5 km, 10 km default, 25 km, wider area) and PostGIS distance sorting.
- **Product Details & Story:** View verified product specs, seller background/type, condition, stock availability, and user reviews.
- **Orders & Checkout:** Cart management, flexible fulfillment selection (local pickup / delivery), order lifecycle tracking.
- **Direct Communication:** Contextual chat with sellers with product/order references.
- **Navigation:** Integrated Mapbox directions ("Go to Seller") calculating routes, distance, and ETAs.

### 🚜 Seller / Producer
- **Producer Profile:** Register seller details and seller type (`Farmer`, `Individual`, `Local Shop`, `Business`, `Service Provider`).
- **Catalog Management:** Create, edit, delete listings with image uploads directly to Supabase Storage.
- **Inventory & Fulfillment:** Set stock quantities, prices, condition (`New`, `Used - Like New`, `Used - Good`, `Used - Fair`), pickup availability, and local delivery radius.
- **Sales & Orders:** Real-time buyer messaging, order fulfillment dashboard (status transitions: Pending -> Confirmed -> Ready for Pickup / Out for Delivery -> Completed).

### 🛡️ Admin / Moderator
- **Governance:** Platform user management, listing moderation, suspicious item flagging.
- **Verification:** Seller verification workflows to establish trust badges.
- **Analytics & Health:** Platform order metrics, category management, report investigations.

---

## 3. Technology Stack & Platform Architecture

- **Backend:** Node.js + Express 5 (`backend/src/server.js`) with layered MVC/Service architecture, Helmet, CORS, and Express-Rate-Limit.
- **Frontend:** React 19 + Vite (`frontend/src/App.jsx`), Tailwind CSS v4, Framer Motion animations, Redux Toolkit state management, and React Router v7.
- **Data & Auth Layer:** Supabase PostgreSQL with PostGIS extension for high-performance spatial queries, Supabase Auth with JWT bearer verification, and Supabase Storage for media assets.
- **Geolocation & Mapping:** Mapbox Directions API (proxied server-side via `backend/src/services/mapService.js`).
- **Payments:** Razorpay payment order generation and cryptographic webhook/signature verification (staged in `paymentsService.js`).

---

## 4. Key Architectural Decisions & Invariants

1. **Server-Side Geospatial Calculations:** All distance filtering and radius searches are computed at the database level via PostGIS (`ST_DWithin`, `ST_Distance`). Never download thousands of raw items to calculate Euclidean distances in React.
2. **Server-Side Payment Authority:** Payments and order fulfillment states are verified server-side. Frontend success flags are never trusted without backend signature verification.
3. **Sensitive Credential Protection:** Mapbox API keys and Supabase Service Role keys remain strictly server-side.
4. **Resilient Location Fallback:** Geolocation gracefully falls back from browser GPS to manual village/city/PIN code selection.
5. **No Broken Windows / Definition of Done:** Every feature must satisfy UI + API + DB + Validation + Authorization + Error Handling + Loading/Empty States + Responsive Mobile layout.
