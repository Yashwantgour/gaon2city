# 🌾 Gaon2City — Hyperlocal Village-to-City Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-emerald.svg)](https://supabase.com/)
[![Mapbox](https://img.shields.io/badge/Mapbox-GL%20JS-blue.svg)](https://www.mapbox.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

> **Gaon2City** is a production-grade hyperlocal marketplace designed to bridge the gap between rural producers (farmers, artisans, craftsmen) and urban/semi-urban consumers. It enables real-time nearby product discovery, direct buyer-seller interactions, order fulfillment (pickup or delivery), and road-following turn-by-turn navigation.

---

## 📌 Table of Contents

- [Core Principles & Vision](#-core-principles--vision)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Full Repository Structure](#-full-repository-structure)
- [Technology Stack](#-technology-stack)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Database & Migrations](#database--migrations)
  - [Running Locally](#running-locally)
- [API Reference](#-api-reference)
- [Security & Production Hardening](#-security--production-hardening)
- [Roadmap & Phases](#-roadmap--phases)

---

## 🎯 Core Principles & Vision

- **Hyperlocal First:** Prioritizes products within a configurable radius (**10 km default**, 5 km, 25 km, or All Areas).
- **PostGIS Geospatial Engine:** Server-authoritative spatial distance calculations (`ST_DWithin`, `ST_Distance`) with spatial GiST indexing.
- **Privacy-Aware Navigation:** Precise road navigation is initiated only when explicitly requested via **"Go to Seller" / `/directions`**, powered by Mapbox GL JS and Directions API.
- **Zero Intermediaries:** Buyers and local producers communicate directly through real-time chat, place orders, choose pickup or delivery, and complete transactions securely.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **Hyperlocal Marketplace** | Search, filter by 12 canonical categories, sort by nearest distance, newest, or price. Fully responsive product grid without cluttered map canvases. |
| **Seller Storefront & Listings** | Sellers can add/edit products, upload multi-angle photos directly to Supabase Storage, manage stock quantity, conditions, and fulfillment options. |
| **Turn-by-Turn Navigation** | Mapbox-powered navigation (`/directions`) with real road routing for driving, cycling, or walking, live ETA, remaining distance, and step-by-step instructions. |
| **Realtime Buyer-Seller Chat** | Direct messaging with unread badges, product & order context chips, and instant conversation synchronization. |
| **Orders & Fulfillment** | Complete cart, multi-item checkout, pickup/delivery choice, real-time status tracker (`pending` → `confirmed` → `processing` → `shipped` → `delivered`). |
| **Razorpay Payments** | Server-side order creation, HMAC signature verification, and webhook-aware state synchronization. |
| **Trust, Reviews & Reports** | Star ratings and text reviews for completed transactions; community reporting system with moderation dashboard. |
| **Admin & Moderation** | Admin console for managing reported listings, user bans, and platform analytics. |

---

## 🏗️ System Architecture

```text
                                ┌────────────────────────────────────────┐
                                │     Clients (Mobile / Desktop Web)     │
                                └───────────────────┬────────────────────┘
                                                    │
                                            HTTPS / REST / WSS
                                                    │
                   ┌────────────────────────────────┴────────────────────────────────┐
                   ▼                                                                 ▼
      ┌─────────────────────────┐                                       ┌─────────────────────────┐
      │  Vite React Frontend    │                                       │   Express API Gateway   │
      │  (Tailwind, Redux,      │                                       │   (Helmet, RateLimit,   │
      │   Mapbox GL JS, Router) │                                       │    PostGIS Proxy, Auth) │
      └────────────┬────────────┘                                       └────────────┬────────────┘
                   │                                                                 │
                   │                           ┌─────────────────────────────────────┘
                   │                           │ (Service Role & JWT Bearer)
                   ▼                           ▼
      ┌───────────────────────────────────────────────────────────────────────────────────────────┐
      │                                Supabase Managed Services                                  │
      │  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────────────┐  │
      │  │ PostgreSQL + PostGIS  │  │     Supabase Auth     │  │   Supabase Storage            │  │
      │  │ • 12 Core Tables      │  │ • JWT Sessions        │  │ • 'product-images' bucket     │  │
      │  │ • Row Level Security  │  │ • Profile Auto-Sync   │  │ • Direct CDN delivery         │  │
      │  │ • Spatial GiST Index  │  └───────────────────────┘  └───────────────────────────────┘  │
      │  └───────────────────────┘                                                                │
      └───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Full Repository Structure

```text
gaon2city/
├── README.md                           # Root documentation & project guide
├── supabase/
│   └── migrations/
│       ├── 20260814000000_product_schema.sql             # Base schema definition
│       └── 20260814000001_production_hardening_rls.sql   # PostGIS indexes & RLS policies
│
├── backend/                            # Express.js REST API Server
│   ├── .env.example                    # Backend environment template
│   ├── package.json
│   └── src/
│       ├── server.js                   # Server entry, Helmet, CORS, RateLimiting
│       ├── config/
│       │   └── supabase.js             # Supabase Admin client (service-role)
│       ├── controllers/
│       │   ├── authController.js       # User & seller profile controller
│       │   ├── productsController.js   # Product listings & PostGIS nearby queries
│       │   ├── ordersController.js     # Cart, checkout, and order status lifecycle
│       │   ├── conversationsController.js # Buyer-seller messaging & read states
│       │   ├── reviewsController.js    # Seller reviews & rating aggregation
│       │   ├── reportsController.js    # Moderation & report filing
│       │   ├── paymentsController.js   # Razorpay server-side orders & verification
│       │   └── mapController.js        # Mapbox proxy (routing, geocoding)
│       ├── middleware/
│       │   ├── auth.js                 # JWT Bearer token authentication & roles
│       │   ├── errorHandler.js         # Centralized error handler (no stack leaks)
│       │   └── validate.js             # Express-validator error handler
│       ├── routes/
│       │   ├── auth.js                 # /api/auth routes
│       │   ├── products.js             # /api/products routes
│       │   ├── categories.js           # /api/categories routes
│       │   ├── orders.js               # /api/orders routes
│       │   ├── conversations.js        # /api/conversations routes
│       │   ├── reviews.js              # /api/reviews routes
│       │   ├── reports.js              # /api/reports routes
│       │   ├── payments.js             # /api/payments routes
│       │   └── map.js                  # /api/map proxy routes
│       ├── services/                   # Business logic & Supabase database queries
│       │   ├── authService.js
│       │   ├── productsService.js
│       │   ├── ordersService.js
│       │   ├── conversationsService.js
│       │   ├── reviewsService.js
│       │   ├── reportsService.js
│       │   ├── paymentsService.js
│       │   └── mapService.js
│       ├── utils/
│       │   ├── ApiError.js             # Custom standardized API error class
│       │   └── logger.js               # Sanitized structured HTTP logger
│       └── validators/                 # Input validation rules (express-validator)
│           ├── authValidators.js
│           ├── productValidators.js
│           ├── orderValidators.js
│           ├── chatValidators.js
│           ├── reviewValidators.js
│           ├── reportValidators.js
│           └── mapValidators.js
│
├── frontend/                           # React + Vite Client Application
│   ├── .env.example                    # Frontend environment template
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx                    # React entry point
│       ├── App.jsx                     # Route registry, Auth listener & ErrorBoundary
│       ├── index.css                   # Tailwind CSS utilities & custom scrollbars
│       ├── components/
│       │   ├── common/                 # Reusable UI components
│       │   │   ├── Button.jsx          # Accessible button with loading states
│       │   │   ├── Input.jsx           # Form input with validation styling
│       │   │   ├── Modal.jsx           # Accessible modal dialog
│       │   │   ├── Toast.jsx           # Toast notification component
│       │   │   ├── Badge.jsx           # Status badge component
│       │   │   ├── EmptyState.jsx      # Friendly empty states
│       │   │   ├── ErrorState.jsx      # Actionable error states
│       │   │   ├── Loader.jsx          # Smooth animated spinner
│       │   │   ├── ReportModal.jsx     # Community reporting modal
│       │   │   └── ErrorBoundary.jsx   # Runtime exception recovery wrapper
│       │   ├── layout/
│       │   │   ├── Header.jsx          # Top navigation bar & location picker
│       │   │   ├── Footer.jsx          # Site footer
│       │   │   ├── MobileNav.jsx       # Bottom navigation bar for mobile devices
│       │   │   ├── LocationPicker.jsx  # Location dropdown & GPS trigger
│       │   │   └── Layout.jsx          # Primary layout wrapper
│       │   ├── map/
│       │   │   ├── MapboxView.jsx      # Mapbox GL JS map canvas with directions route
│       │   │   └── DirectionsPanel.jsx # Turn-by-turn navigation steps & mode switch
│       │   └── product/
│       │       ├── ProductCard.jsx     # Responsive product display card
│       │       └── ProductGrid.jsx     # Responsive multi-column grid
│       ├── features/                   # Redux Toolkit Slices
│       │   ├── auth/authSlice.js
│       │   ├── cart/cartSlice.js
│       │   ├── location/locationSlice.js
│       │   └── products/productsSlice.js
│       ├── hooks/
│       │   ├── useDebounce.js          # Debounce hook for search input
│       │   ├── useLocation.js          # Geolocation & radius management hook
│       │   └── useToast.js             # Toast notification trigger hook
│       ├── pages/                      # Application Views
│       │   ├── Home.jsx                # Landing page with hero & categories
│       │   ├── Marketplace.jsx         # Main product discovery & filters
│       │   ├── ProductDetails.jsx      # Product overview & "Go to Seller"
│       │   ├── SellerProfile.jsx       # Public seller profile & listings
│       │   ├── AddProduct.jsx          # Create product listing & photo upload
│       │   ├── EditProduct.jsx         # Update product listing
│       │   ├── Cart.jsx                # Shopping cart
│       │   ├── Checkout.jsx            # Order placement & fulfillment choice
│       │   ├── Orders.jsx              # Buyer & seller order tracking
│       │   ├── Chat.jsx                # Real-time buyer-seller conversations
│       │   ├── Directions.jsx          # Turn-by-turn Mapbox navigation page
│       │   ├── SellerDashboard.jsx     # Seller management & analytics
│       │   ├── AdminDashboard.jsx      # Admin moderation console
│       │   ├── Profile.jsx             # User profile editor
│       │   ├── Login.jsx               # User authentication
│       │   ├── Signup.jsx              # New account registration
│       │   └── NotFound.jsx            # 404 page
│       ├── services/                   # API clients & Supabase connector
│       │   ├── api.js                  # Axios instance with auth interceptors
│       │   ├── authApi.js              # Auth API calls
│       │   ├── productsApi.js          # Products & nearby search API calls
│       │   ├── ordersApi.js            # Orders & checkout API calls
│       │   ├── chatApi.js              # Chat & messages API calls
│       │   ├── reviewsApi.js           # Reviews & ratings API calls
│       │   ├── reportsApi.js           # Reports API calls
│       │   ├── paymentsApi.js          # Razorpay payment API calls
│       │   ├── mapApi.js               # Route & geocoding API calls
│       │   ├── storageService.js       # Supabase Storage client
│       │   └── supabase.js             # Frontend Supabase client
│       ├── store/
│       │   └── index.js                # Redux store configuration
│       └── utils/
│           ├── constants.js            # 12 Canonical categories & sort options
│           └── helpers.js              # Price, distance, and date formatting
│
└── mdfiles/                            # Engineering Specifications & Rules
    ├── AI_WORKING_RULES.md             # Guidelines for AI coding agents
    ├── API_SPEC.md                     # Detailed REST API specification
    ├── ARCHITECTURE.md                 # System architecture overview
    ├── CHANGELOG.md                    # Record of architecture decisions
    ├── DATABASE_SCHEMA.md              # Database schemas & relationships
    ├── DEPLOYMENT.md                   # Production deployment & backup guide
    ├── ENVIRONMENT.md                  # Environment variable reference
    ├── FEATURES.md                     # Detailed feature matrix
    ├── IMPLEMENTATION_ROADMAP.md       # Phased delivery roadmap
    ├── PROJECT_REQUIREMENTS.md         # Product requirements document
    ├── SECURITY.md                     # Security & authorization checklist
    ├── TECH_STACK.md                   # Tech stack constraints
    └── UI_UX_GUIDELINES.md             # Design principles & aesthetics
```

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS 3.4
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM v6
- **Animations:** Framer Motion
- **Icons:** React Icons (`react-icons/hi2`)
- **Maps & Routing:** Mapbox GL JS v3

### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 5
- **Security:** Helmet, CORS, Express-Rate-Limit
- **Validation:** Express-Validator
- **Database Client:** `@supabase/supabase-js`

### Database & Cloud Services
- **Database:** Supabase PostgreSQL with **PostGIS** geospatial extension
- **Authentication:** Supabase Auth (JWT)
- **File Storage:** Supabase Storage (`product-images` bucket)
- **Payments:** Razorpay API & Webhooks
- **Routing Engine:** Mapbox Directions API

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or later
- [npm](https://www.npmjs.com/) v9.0.0 or later
- A free [Supabase](https://supabase.com/) project
- A free [Mapbox](https://account.mapbox.com/) public access token

---

### Environment Variables

#### 1. Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase Server Config (Keep service role key private!)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Mapbox Server Proxy Token
MAPBOX_TOKEN=pk.your_mapbox_token

# Razorpay Payments (Optional for testing)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_key
```

#### 2. Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```bash
# Supabase Public Keys
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Mapbox Public Access Token
VITE_MAPBOX_TOKEN=pk.your_mapbox_public_token

# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

---

### Database & Migrations

Execute the migration scripts in your Supabase SQL Editor:
1. Run `supabase/migrations/20260814000000_product_schema.sql`
2. Run `supabase/migrations/20260814000001_production_hardening_rls.sql`
3. Create a public bucket named `product-images` in Supabase Storage.

---

### Running Locally

Open two terminal windows:

#### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
# Vite dev server runs on http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Health check & uptime status | ❌ |
| `GET` | `/api/auth/me` | Current user profile | ✅ |
| `PATCH`| `/api/auth/profile` | Update profile information | ✅ |
| `GET` | `/api/auth/seller/:id` | Public seller profile details | ❌ |
| `GET` | `/api/products` | Search, filter, & list products | ❌ |
| `GET` | `/api/products/nearby` | PostGIS geospatial radius search | ❌ |
| `GET` | `/api/products/:id` | Single product details | ❌ |
| `POST` | `/api/products` | Create a new product listing | ✅ (Seller) |
| `PATCH`| `/api/products/:id` | Update listing details | ✅ (Owner) |
| `DELETE`| `/api/products/:id` | Delete product listing | ✅ (Owner) |
| `POST` | `/api/products/upload` | Upload product image to Storage | ✅ |
| `GET` | `/api/categories` | List 12 canonical categories | ❌ |
| `POST` | `/api/orders` | Place new order | ✅ |
| `GET` | `/api/orders` | List buyer / seller orders | ✅ |
| `GET` | `/api/orders/:id` | Order details with item list | ✅ |
| `PATCH`| `/api/orders/:id/status` | Update fulfillment status | ✅ (Seller) |
| `POST` | `/api/orders/:id/cancel` | Cancel pending order | ✅ (Buyer) |
| `GET` | `/api/conversations` | List user conversations | ✅ |
| `POST` | `/api/conversations` | Create / retrieve conversation | ✅ |
| `GET` | `/api/conversations/:id/messages` | Conversation message history | ✅ |
| `POST` | `/api/conversations/:id/messages` | Send a new message | ✅ |
| `POST` | `/api/reviews` | Submit order review & rating | ✅ |
| `GET` | `/api/reviews/seller/:id`| Get seller reviews & average rating | ❌ |
| `POST` | `/api/reports` | Submit community report | ✅ |
| `GET` | `/api/map/route` | Calculate Mapbox navigation route | ❌ |

---

## 🔒 Security & Production Hardening

- **Database RLS Policies:** Row Level Security enabled across all tables to enforce ownership at the database layer.
- **Strict Helmet Headers:** Configured for HSTS (1 year), frameguard (`deny`), X-Content-Type-Options, and secure Referrer Policy.
- **Granular Rate Limiting:** Global baseline limiter (300 req/15m), strict Auth limiter (60 req/15m), and Payment limiter (30 req/15m).
- **Graceful Error Handling:** React `<ErrorBoundary>` wrapper to prevent blank-screen crashes, and sanitized backend error handler.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
