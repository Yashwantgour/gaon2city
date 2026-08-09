# System Architecture

## High-Level Architecture

```text
                    ┌─────────────────────┐
                    │       Browser       │
                    │ React + Vite        │
                    │ Tailwind            │
                    │ Redux Toolkit       │
                    └──────────┬──────────┘
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │   Express API       │
                    │   Node.js           │
                    │   JavaScript        │
                    └───────┬─────┬───────┘
                            │     │
                ┌───────────┘     └──────────────┐
                ▼                                ▼
       ┌────────────────┐                ┌────────────────┐
       │ Supabase       │                │ External APIs  │
       │ PostgreSQL     │                │ Mapbox         │
       │ Auth           │                │ Razorpay       │
       │ Storage        │                └────────────────┘
       │ Realtime       │
       │ PostGIS        │
       └────────────────┘
```

## Frontend

Recommended structure:

```text
frontend/
└── src/
    ├── assets/
    ├── components/
    │   ├── common/
    │   ├── navbar/
    │   ├── product/
    │   ├── seller/
    │   ├── marketplace/
    │   ├── chat/
    │   ├── map/
    │   └── forms/
    ├── pages/
    │   ├── Home/
    │   ├── Marketplace/
    │   ├── ProductDetails/
    │   ├── AddProduct/
    │   ├── EditProduct/
    │   ├── Cart/
    │   ├── Checkout/
    │   ├── Orders/
    │   ├── Profile/
    │   ├── SellerDashboard/
    │   ├── Chat/
    │   ├── Map/
    │   └── Admin/
    ├── features/
    │   ├── auth/
    │   ├── products/
    │   ├── cart/
    │   ├── orders/
    │   ├── chat/
    │   ├── location/
    │   └── user/
    ├── services/
    ├── hooks/
    ├── utils/
    ├── routes/
    └── store/
```

## Backend

```text
backend/
└── src/
    ├── config/
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── services/
    ├── validators/
    ├── utils/
    └── server.js
```

## Backend Layering

Request:

```text
Route
 ↓
Authentication middleware
 ↓
Validation
 ↓
Controller
 ↓
Service
 ↓
Supabase
 ↓
Response
```

Controllers should remain thin.
Business logic should live in services.

## Security Boundary

Frontend:
- public Supabase client only
- no service-role key
- no private API secret

Backend:
- private secrets
- payment verification
- privileged operations
- sensitive business logic

Supabase:
- RLS for data authorization

## Location Architecture

```text
Browser GPS
   ↓
Location permission
   ↓
Frontend state
   ↓
Nearby products API
   ↓
Express
   ↓
PostGIS query
   ↓
Products within requested radius
```

Do not perform the authoritative distance filtering only in the frontend.

## Real-Time Architecture

### Initial implementation
Use Supabase Realtime for chat and simple real-time state.

### Future
Use Socket.IO if the application needs:
- complex presence
- temporary live location
- high-frequency room events
- advanced real-time coordination

Do not use Socket.IO simply because it is available.

## Map Architecture

Normal navigation:

```text
Buyer location
      +
Seller location
      ↓
Mapbox Directions
      ↓
Route
      ↓
Mapbox UI
```

Live location:

```text
Buyer explicitly starts sharing
      ↓
Temporary session
      ↓
Socket/Realtime transport
      ↓
Seller view
      ↓
Buyer stops sharing
      ↓
Session ends
```
