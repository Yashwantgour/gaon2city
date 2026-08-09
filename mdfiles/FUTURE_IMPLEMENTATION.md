# Future Implementation

This document records features intentionally deferred from the initial implementation.

## 1. Payments

Provider:
- Razorpay

Requirements:
- server-created payment orders
- secure verification
- webhook processing
- idempotency
- payment/order synchronization
- refund support

Do not implement fake payment success.

## 2. Advanced Chat

Start with Supabase Realtime.

Later, Socket.IO can support:
- presence
- typing indicators
- richer rooms
- live pickup coordination
- temporary location sessions

## 3. Live Location

Use only when there is a clear use case.

Flow:

```text
Buyer clicks Share Live Location
 ↓
Explicit consent
 ↓
Temporary session
 ↓
Location updates
 ↓
Seller sees current location
 ↓
Buyer clicks Stop Sharing
 ↓
Session ends
```

Do not continuously track users by default.

## 4. Marketplace Map

Map/list toggle:

```text
[ List ] [ Map ]
```

Map shows:
- nearby products
- approximate locations
- price/product preview
- selected listing details

Avoid exposing sensitive exact residential addresses unnecessarily.

## 5. Make an Offer

Useful for negotiable products.

```text
Listed price
 ↓
Buyer offer
 ↓
Seller accepts/rejects/counters
 ↓
Negotiated price
 ↓
Order
```

## 6. Notifications

Potential channels:
- in-app
- email
- push
- SMS/WhatsApp only if later justified and legally/commercially appropriate

Events:
- new message
- order status
- payment status
- offer received
- offer accepted
- nearby saved-search listing

## 7. Saved Searches

Users can save:
- keyword
- category
- radius
- price range
- condition

Future alerts should use real marketplace data.

## 8. Recommendations

Do not start with an AI recommendation system.

First collect reliable:
- views
- searches
- favorites
- purchases
- categories
- location context

Then consider recommendations.

## 9. Seller Analytics

Future dashboard:
- views
- inquiries
- favorites
- orders
- conversion
- revenue
- response time

## 10. Delivery Expansion

Initially focus on:
- seller pickup
- local seller delivery

Later:
- delivery partners
- delivery zones
- delivery fees
- delivery tracking

Do not build a logistics network before the marketplace has enough activity.

## 11. Scaling

Only introduce infrastructure such as Redis, queues, dedicated realtime services, or additional databases when actual traffic/requirements justify it.

Avoid premature complexity.
