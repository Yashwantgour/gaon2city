# Codebase Structure

**Analysis Date:** 2026-08-14

## Directory Layout

```
gaon2city/
├── .planning/                     # GSD configuration and planning state
│   ├── codebase/                  # Generated codebase intelligence maps
│   └── config.json                # GSD execution profile and settings
├── backend/                       # Express.js REST API server
│   ├── src/
│   │   ├── config/                # Supabase and runtime environment config
│   │   ├── controllers/           # HTTP route handlers and response formatting
│   │   ├── middleware/            # Auth, validation error interceptor, global error handler
│   │   ├── routes/                # Express router modules
│   │   ├── services/              # Business logic and database operations
│   │   ├── utils/                 # Logging and custom ApiError utilities
│   │   ├── validators/            # Express-validator schema rules
│   │   └── server.js              # Application entry point
│   ├── .env                       # Backend secrets & configuration
│   └── package.json               # Backend dependencies & npm scripts
├── frontend/                      # React 19 + Vite frontend SPA
│   ├── src/
│   │   ├── assets/                # Static images and icons
│   │   ├── components/            # Reusable UI component library
│   │   │   ├── common/            # Buttons, Inputs, Modals, Badges, Loaders, Toasts
│   │   │   ├── layout/            # Navbar, Footer, MobileNav, Layout wrapper
│   │   │   └── product/           # ProductCard, ProductGrid components
│   │   ├── features/              # Redux Toolkit feature slices
│   │   ├── hooks/                 # Custom React hooks (useDebounce, useLocation)
│   │   ├── pages/                 # Route page components (Home, Marketplace, ProductDetails, etc.)
│   │   ├── routes/                # ProtectedRoute and router guards
│   │   ├── services/              # Axios API clients and Supabase browser client
│   │   ├── store/                 # Redux store configuration
│   │   ├── utils/                 # Helper utilities and constants
│   │   ├── App.jsx                # Main route provider and auth bootstrap
│   │   ├── index.css              # Tailwind CSS and global style directives
│   │   └── main.jsx               # React DOM root render
│   ├── .env                       # Frontend environment configuration
│   ├── index.html                 # HTML5 entry template
│   ├── package.json               # Frontend dependencies & npm scripts
│   └── vite.config.js             # Vite configuration with React & Tailwind plugins
└── mdfiles/                       # Architectural specifications and project documentation
```

## Key Modules & Component Mapping

### Backend Endpoints
- `backend/src/routes/auth.js` -> Auth profile sync & retrieval (`/api/auth/me`, `/api/auth/profile`, `/api/auth/seller-profile`)
- `backend/src/routes/products.js` -> Product CRUD, image uploads, search & filters (`/api/products`)
- `backend/src/routes/orders.js` -> Order lifecycle management (`/api/orders`)
- `backend/src/routes/conversations.js` -> Direct producer-consumer chat messaging (`/api/conversations`)
- `backend/src/routes/reviews.js` -> Rating and review submissions (`/api/reviews`)
- `backend/src/routes/reports.js` -> Moderation and issue reporting (`/api/reports`)
- `backend/src/routes/payments.js` -> Order payment creation & verification (`/api/payments`)
- `backend/src/routes/map.js` -> Server-side Mapbox route proxying (`/api/map`)

### Frontend Views & Features
- `frontend/src/pages/Home.jsx` -> Hero banner, category highlights, featured rural products.
- `frontend/src/pages/Marketplace.jsx` -> Search, category filtering, distance/location sorting, product cards.
- `frontend/src/pages/ProductDetails.jsx` -> Product specs, seller story, producer details, reviews, add to cart.
- `frontend/src/pages/SellerDashboard.jsx` -> Producer catalog manager, sales statistics, order fulfillment.
- `frontend/src/pages/AddProduct.jsx` -> Product creation with image upload and category tagging.
- `frontend/src/pages/Cart.jsx` & `Checkout.jsx` -> Cart review, delivery address, order submission.
- `frontend/src/pages/Chat.jsx` -> Buyer-seller direct messaging UI.
- `frontend/src/pages/AdminDashboard.jsx` -> Producer verification and platform moderation.
