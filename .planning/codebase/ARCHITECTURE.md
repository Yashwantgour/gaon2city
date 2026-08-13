# Architecture

**Analysis Date:** 2026-08-14

## Pattern Overview

**Overall:** Client-Server Monorepo Architecture with decoupled Express.js REST API and React/Vite Single Page Application (SPA), backed by Supabase (PostgreSQL, Auth, Storage).

**Key Characteristics:**
- **Layered Backend:** Strict separation of concerns (Route definitions -> Request validation pipelines -> Controller handlers -> Service layer -> Database/External SDK client).
- **Centralized Error & Response Flow:** Uniform error modeling via custom `ApiError` class caught by global Express error middleware.
- **Client-Side SPA with Feature Slices:** Redux Toolkit slices (`auth`, `cart`, `location`, `products`, `ui`) manage state with Axios interceptors managing Bearer token injection.
- **Server-Side API Proxying:** Sensitive external APIs (Mapbox, Payment Gateway secrets, Supabase Service Role) are kept server-side to protect credentials from client tampering.

## System Layers

```
[ Frontend: React 19 + Redux Toolkit + Vite ]
         |
         | (HTTP/JSON + Bearer JWT)
         v
[ Backend: Express 5 API Server ]
    ├── Security: Helmet, CORS, Express-Rate-Limit
    ├── Routing: /api/auth, /api/products, /api/orders, /api/conversations, /api/reviews, /api/reports, /api/payments, /api/map
    ├── Validation: Express-Validator pipelines (src/validators/*)
    ├── Controllers: Request/Response marshaling (src/controllers/*)
    ├── Services: Core business logic (src/services/*)
    └── Cloud / External Services:
          ├── Supabase Admin / Scoped Client (PostgreSQL, Auth, Storage)
          ├── Mapbox Directions API
          └── Razorpay Payment Processing
```

## Backend Architecture

- **Entry Point:** `backend/src/server.js` initializes middleware, mounts API route groups, attaches health check (`/api/health`), and registers 404 and global error handlers.
- **Controllers (`backend/src/controllers/`):** Thin orchestrators that parse HTTP request params/body/query, invoke service methods, and format JSON responses.
- **Services (`backend/src/services/`):** Encapsulate all database queries, Supabase client delegation, image parsing (base64 to binary buffer), and business logic.
- **Middleware (`backend/src/middleware/`):**
  - `auth.js`: Validates Supabase JWTs, retrieves user profile, handles automatic profile provisioning if missing.
  - `validate.js`: Checks express-validator results and throws formatted `400 Bad Request` errors.
  - `errorHandler.js`: Catches `ApiError` instances and unhandled exceptions, converting them into uniform JSON responses (`{ message, status }`).

## Frontend Architecture

- **Entry Point:** `frontend/src/main.jsx` and `frontend/src/App.jsx` mounting `BrowserRouter` and Redux `Provider`.
- **Layout & Routing:** `frontend/src/components/layout/Layout.jsx` wraps page routes with top navigation (`Navbar`), sticky bottom mobile bar (`MobileNav`), and site `Footer`.
- **State Management (`frontend/src/features/` & `frontend/src/store/`):**
  - `authSlice.js`: Current user session, user metadata, login/logout state.
  - `cartSlice.js`: Shopping cart items, quantities, subtotal calculations.
  - `locationSlice.js`: Selected delivery location and rural producer geo-filtering.
  - `productsSlice.js`: Product catalog filters, active category, search terms.
  - `uiSlice.js`: Global toast notifications, modals, theme/drawer states.
- **API Client (`frontend/src/services/api.js`):** Axios instance with automatic token extraction from `localStorage` / Supabase session, adding `Authorization: Bearer <token>` to all outgoing requests.
