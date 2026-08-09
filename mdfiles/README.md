# Gaon2City Marketplace — AI Project Context

## 1. Project Identity

**Gaon2City Marketplace** is a production-oriented hyperlocal marketplace for villagers and city residents.

The platform allows any eligible user to:
- discover products/services nearby,
- sell products by creating listings,
- communicate with sellers,
- place orders,
- arrange local pickup or delivery,
- navigate to the seller's location.

The core differentiator is **location-aware hyperlocal commerce** rather than a generic Amazon/Flipkart clone.

> Product positioning: **A village-to-city and city-to-village nearby marketplace where people can buy and sell from people around them.**

## 2. Core Rule

If the user's location is available, the default marketplace experience should prioritize products within **10 km**.

The radius must be configurable:
- 5 km
- 10 km (default)
- 25 km
- All / wider area

If GPS permission is denied, the application must provide a location fallback such as village/city/PIN selection.

## 3. Technology Constraints

Use only the following primary stack:

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- React Hook Form
- React Router DOM
- Redux Toolkit
- Axios
- Mapbox for maps/routing

### Backend
- Node.js
- Express.js
- JavaScript only, NOT TypeScript

### Backend services / data
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime where useful
- PostGIS for geographic queries

### Future integrations
- Razorpay for payments
- Socket.IO only if advanced real-time requirements justify it

Do NOT introduce MongoDB, Firebase, Next.js, Prisma, TypeScript, or another database unless the project owner explicitly changes this requirement.

## 4. Current Implementation Priority

Build the project in this order:

1. Foundation and architecture
2. Authentication and profiles
3. Marketplace/product listings
4. Search/filter/category system
5. Location and 10-km nearby marketplace
6. Cart/order/pickup workflow
7. Seller dashboard
8. Admin dashboard
9. Buyer-seller chat
10. Mapbox seller navigation
11. Payments
12. Reviews/trust/safety
13. Production hardening

## 5. Advanced Features Planned

### Payment
Planned production payment integration:
- server-side order creation
- checkout
- payment verification
- webhook handling
- payment status
- refunds where applicable

### Buyer ↔ Seller Chat
Planned:
- conversations
- real-time messages
- unread count
- read state
- product context
- order context
- optional image messages
- online status where appropriate

Start with Supabase Realtime. Add Socket.IO only when necessary.

### Map / Go to Seller
Planned:
- buyer current location
- seller location
- Mapbox map
- route calculation
- distance
- ETA
- driving/walking options
- "Go to Seller"

Optional later:
- temporary live location sharing during pickup/travel.

Live location must be explicitly opt-in and stoppable.

## 6. Product Principles

The UI should be:
- professional
- clean
- responsive
- accessible
- fast
- minimal
- trustworthy

Do NOT copy Amazon/Flipkart branding or layouts.

Avoid:
- excessive colors
- excessive gradients
- unnecessary animations
- excessive glassmorphism
- decorative UI that hurts usability

Use one primary brand color with neutral backgrounds/text and restrained accents.

## 7. AI Development Rule

Any AI working on this project must:
1. Read the relevant markdown files before changing architecture.
2. Preserve the technology constraints.
3. Never create dummy marketplace data in production implementation unless explicitly requested for testing.
4. Prefer real Supabase data.
5. Keep secrets in environment variables.
6. Never expose service-role secrets to the frontend.
7. Enforce authorization server-side and with Supabase RLS.
8. Validate all important inputs.
9. Handle loading, empty, error, and success states.
10. Keep the application mobile-first and fully responsive.
11. Implement features incrementally according to the roadmap.
12. Do not silently replace an approved technology with another one.

## 8. Production Mindset

This project is intended to be more than a visual college demo. The architecture should support a real pilot with:
- one village,
- nearby towns/cities,
- real sellers,
- real buyers,
- real products,
- real transactions.

Start small, but do not build disposable architecture.
