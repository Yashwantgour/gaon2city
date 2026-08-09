# Implementation Roadmap

This file separates what should be implemented now from what should remain future work.

## Phase 0 — Project Rules

### Implement now
- React/Vite frontend
- Express/Node backend
- Supabase setup
- environment configuration
- folder architecture
- lint/format conventions if desired
- API error handling
- basic security middleware

### Do not implement yet
- payment
- Socket.IO
- live location
- recommendations
- advanced notifications

---

## Phase 1 — Authentication and Profiles

### Implement now
- Supabase Auth
- signup/login/logout
- session persistence
- profile
- basic seller capability
- location preference

### Acceptance criteria
- user can create account
- user can login/logout
- session survives refresh
- protected pages work
- profile stored in Supabase

---

## Phase 2 — Product Marketplace

### Implement now
- categories
- add product
- edit product
- delete product
- image upload
- product details
- seller profile
- search
- filtering
- pagination

### Acceptance criteria
A real seller can create a listing and another real user can discover it.

---

## Phase 3 — Location Marketplace

### Implement now
- browser geolocation
- permission flow
- manual fallback
- PostGIS location storage
- 10 km default
- radius selector
- nearby endpoint
- distance display
- nearest sorting

### Acceptance criteria
A user at location A sees only appropriate nearby listings for the selected radius.

---

## Phase 4 — Orders

### Implement now
- cart
- buy flow
- order creation
- buyer order history
- seller order dashboard
- pickup/delivery choice
- order status

### Acceptance criteria
Buyer can place a real test order and seller can manage it.

---

## Phase 5 — Seller/Admin Operations

### Implement now
- seller dashboard
- listing management
- inventory/availability
- admin dashboard
- reports
- moderation

---

## Phase 6 — Chat

### Implement later
- buyer-seller conversation
- realtime messages
- unread state
- read state
- product/order context
- image messages

### Technology decision
Start with Supabase Realtime.

Add Socket.IO only if needed.

---

## Phase 7 — Mapbox

### Implement later
- seller marker
- buyer marker
- route
- ETA
- distance
- travel mode
- Go to Seller

### Optional
Temporary live location during a pickup journey.

---

## Phase 8 — Payment

### Implement later
- Razorpay
- server-side payment order
- checkout
- payment verification
- webhook
- order/payment state synchronization
- refunds where required

---

## Phase 9 — Trust

### Implement later
- reviews
- ratings
- seller verification
- report/block
- transaction history
- response metrics

---

## Phase 10 — Production Hardening

### Implement
- RLS review
- authorization audit
- API validation
- rate limiting
- security headers
- image optimization
- pagination review
- error monitoring/logging
- accessibility review
- responsive testing
- performance testing
- backup/recovery strategy
- deployment configuration

## Definition of Done

A feature is not complete merely because the UI exists.

For each feature verify:

```text
UI
+
API
+
Database
+
Validation
+
Authorization
+
Error handling
+
Loading state
+
Empty state
+
Mobile responsiveness
+
Security
```

## AI Implementation Rule

When asked to implement a phase:
1. Read README.md.
2. Read this roadmap.
3. Read the relevant architecture/schema/feature file.
4. Inspect existing code.
5. Do not recreate working modules.
6. Make the smallest coherent change.
7. Test the changed flow.
8. Report files changed and remaining issues.
