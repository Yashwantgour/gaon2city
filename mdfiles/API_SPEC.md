# API Specification

Base URL example:

```text
/api
```

## Auth

```text
GET    /auth/me
```

Authentication should rely on the chosen Supabase Auth/session strategy.

## Products

```text
GET    /products
GET    /products/:id
POST   /products
PATCH  /products/:id
DELETE /products/:id
GET    /products/nearby
```

Nearby request concept:

```text
GET /products/nearby?lat=...&lng=...&radius=10
```

Backend converts kilometers to meters and uses PostGIS.

## Search

```text
GET /products?search=wheat
GET /products?category=agriculture
GET /products?condition=used-good
GET /products?minPrice=...
GET /products?maxPrice=...
GET /products?sort=distance
```

Prefer a clean query parameter design rather than creating dozens of endpoints.

## Orders

```text
POST /orders
GET  /orders
GET  /orders/:id
PATCH /orders/:id/status
POST /orders/:id/cancel
```

Authorization must ensure:
- buyer can manage their buyer actions
- seller can manage seller actions
- admin has appropriate privileges

## Chat

```text
GET  /conversations
GET  /conversations/:id/messages
POST /conversations
POST /conversations/:id/messages
PATCH /messages/:id/read
```

Realtime delivery can be handled by Supabase Realtime initially.

## Map

Mapbox API calls should not expose sensitive server credentials.

If a server-side Mapbox operation is required:

```text
GET /map/route
```

Otherwise use the appropriate client-safe Mapbox configuration.

## Payments — Future

```text
POST /payments/create-order
POST /payments/verify
POST /payments/webhook
GET  /payments/:id
```

Payment webhook endpoint must be protected according to provider requirements.

## Reviews

```text
POST /reviews
GET  /sellers/:id/reviews
```

Backend must verify that the reviewer is eligible to review the completed transaction.

## Reports

```text
POST /reports
GET  /admin/reports
PATCH /admin/reports/:id
```

Admin-only endpoints require strict authorization.

## API Rules

Every endpoint should:
- validate input
- authenticate where required
- authorize the resource
- return consistent HTTP status codes
- return safe error messages
- log unexpected server errors
- never leak secrets
