# External Integrations

**Analysis Date:** 2026-08-14

## APIs & External Services

**Supabase (BaaS Platform):**
- **Purpose:** Primary database, authentication provider, and binary file storage.
- **Client Library:** `@supabase/supabase-js` (v2.112.2) on both backend and frontend.
- **Sub-services:**
  - **Supabase Auth:** Email/password authentication, JWT issuance and session management. Scoped client instantiation via `createUserClient(accessToken)` or admin bypass via `supabaseAdmin`.
  - **Supabase PostgreSQL Database:** Core relational tables (`profiles`, `products`, `orders`, `conversations`, `messages`, `reviews`, `reports`).
  - **Supabase Storage:** Media and product photo uploads bucket (`Image/<userId>/<timestamp>_<filename>`).

**Map & Geolocation (Mapbox Directions API):**
- **Purpose:** Server-side proxy for routing and directions calculation between rural producers and city consumers.
- **Endpoint:** `https://api.mapbox.com/directions/v5/mapbox/{profile}/{originLng},{originLat};{destLng},{destLat}`
- **Integration Layer:** `backend/src/services/mapService.js` and `backend/src/routes/map.js` (keeps Mapbox access token protected server-side).

**Payment Gateway (Razorpay):**
- **Purpose:** Payment collection and verification for marketplace orders.
- **Integration Layer:** `backend/src/services/paymentsService.js` and `backend/src/routes/payments.js`.
- **Status:** Structure and endpoint stubs implemented (`/api/payments/create-order`, `/api/payments/verify`), awaiting live Razorpay SDK keys.

## Environment Variables

**Backend (`backend/.env`):**
- `PORT` - Port number for the Express API server (default: `5000`).
- `CLIENT_URL` - Allowed CORS origin URL (e.g. `http://localhost:5173`).
- `SUPABASE_URL` - Supabase project URL.
- `SUPABASE_ANON_KEY` - Supabase anonymous public key.
- `SUPABASE_SERVICE_ROLE_KEY` - Privileged backend key for service-role database operations and administrative tasks.
- `MAPBOX_TOKEN` - Secret access token for Mapbox directions/routing queries.
- `RAZORPAY_KEY_ID` - Key ID for Razorpay merchant payment integration.
- `RAZORPAY_KEY_SECRET` - Key secret for Razorpay webhook and payment signature verification.

**Frontend (`frontend/.env`):**
- `VITE_API_BASE_URL` - Backend API base path (e.g. `http://localhost:5000/api`).
- `VITE_SUPABASE_URL` - Client-side Supabase URL.
- `VITE_SUPABASE_ANON_KEY` - Client-side public Supabase anonymous key.

## Webhooks & Event Streams

- Real-time chat polling/subscriptions and payment webhooks ready for extension via Supabase realtime channels and Razorpay webhook handlers.
