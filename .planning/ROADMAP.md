# Implementation Roadmap

**Analysis & Ingest Date:** 2026-08-14  
**Source Specifications:** Ingested from `mdfiles/IMPLEMENTATION_ROADMAP.md`

---

## Milestone 1: Core Hyperlocal Marketplace

- [x] **Phase 0 — Project Scaffolding & Architecture**
  - Express 5 REST API + React 19 / Vite SPA setup.
  - Security middleware (Helmet, CORS, Rate Limit) and centralized `ApiError` handler.
  - Redux Toolkit store and Tailwind CSS v4 design system.

- [x] **Phase 1 — Authentication & User Profiles**
  - Supabase Auth integration (email/password signup, login, logout).
  - Session persistence and token refresh across browser refreshes.
  - User profiles table and seller role registration (`seller_type`).

- [x] **Phase 2 — Product Catalog & Media Management**
  - Product creation, edit, deletion, and inventory tracking.
  - Image upload pipeline to Supabase Storage (`Image/<userId>/...`).
  - Product discovery, category taxonomy, keyword search, and condition filters.

- [x] **Phase 3 — Geospatial Discovery & Location Marketplace**
  - Browser HTML5 Geolocation API integration with permission prompt.
  - Manual location fallback (city, village, PIN code).
  - Database-level spatial distance calculation and nearby product filtering (`/api/products/nearby`).

- [x] **Phase 4 — Cart, Checkout & Order Lifecycle**
  - Client-side shopping cart with Redux Toolkit.
  - Multi-item checkout with fulfillment selection (pickup vs. local delivery).
  - Backend order state machine (`PENDING` -> `CONFIRMED` -> `READY_FOR_PICKUP`/`OUT_FOR_DELIVERY` -> `COMPLETED`).
  - Buyer order history and seller order fulfillment dashboard.

- [x] **Phase 5 — Seller & Admin Operations**
  - Seller dashboard with sales overview and product catalog controls.
  - Admin dashboard with platform user list, reports queue, and listing moderation.

---

## Milestone 2: Interactive Realtime & External Services

- [x] **Phase 6 — Direct Messaging & Realtime Chat**
  - Buyer-seller direct chat linked to specific products/orders.
  - Supabase Realtime channel subscriptions for instant message delivery and unread indicators.
  - Media/image attachments in chat threads.

- [x] **Phase 7 — Mapbox Directions & Navigation**
  - "Go to Seller" routing integration using server-side Mapbox API proxy.
  - Turn-by-turn route visualization, distance readout, and driving/walking ETA display.
  - Interactive map markers for rural producers on the marketplace.

- [ ] **Phase 8 — Payment Gateway Integration (Razorpay)**
  - Razorpay order creation via `/api/payments/create-order`.
  - Frontend Razorpay checkout popup and signature verification on backend (`/api/payments/verify`).
  - Webhook processing for automated order fulfillment confirmation.

---

## Milestone 3: Trust, Quality & Production Hardening

- [x] **Phase 9 — Trust, Reviews & Community Moderation**
  - Order-verified buyer reviews and star ratings.
  - User and listing reporting system (`/api/reports`).
  - Seller verification status badges.

- [ ] **Phase 10 — Production Hardening & Testing**
  - Automated integration and unit test suite (Vitest + Supertest + React Testing Library).
  - Supabase Row-Level Security (RLS) policies audit.
  - Redis-backed distributed rate limiting.
  - CI/CD GitHub Actions workflow for linting, testing, and production builds.
