# Project Requirements

## Product Goal

Create a full-stack hyperlocal marketplace for villagers and city residents.

Any user can become a buyer, seller, or both.

## User Roles

### Buyer
Can:
- create account
- set location
- browse nearby products
- search products
- filter products
- view product details
- contact seller
- add to cart
- place order
- choose pickup/delivery where supported
- view orders
- navigate to seller
- review completed transactions

### Seller
Can:
- create seller profile
- create product listings
- upload product images
- edit/delete listings
- manage inventory/availability
- receive buyer messages
- accept/manage orders
- mark products ready for pickup
- manage delivery availability
- view completed transactions

### Admin
Can:
- manage users
- manage products
- manage categories
- review reports
- moderate listings
- manage platform-level settings
- view order/payment summaries
- manage seller verification where implemented

## Marketplace Requirements

Every product should support, as appropriate:
- title
- description
- price
- quantity
- category
- condition
- images
- seller
- seller type
- location
- pickup availability
- delivery availability
- status
- created/updated timestamps

### Seller Types

- Individual
- Farmer
- Local Shop
- Business
- Service Provider

### Product Conditions

- New
- Used - Like New
- Used - Good
- Used - Fair

## Location Requirements

### Default
Show products within 10 km.

### Radius
Allow:
- 5 km
- 10 km
- 25 km
- wider/all area

### Location fallback
If browser geolocation is unavailable or denied:
- village
- city
- PIN code
- manually selected location

### Geographic storage
Use PostgreSQL/PostGIS through Supabase.

Do not download thousands of products and calculate all distances in React.

The backend/database should perform geographic filtering.

## Product Discovery

Required:
- search
- categories
- price filtering
- condition filtering
- seller-type filtering
- distance filtering
- newest
- nearest
- price low-to-high
- price high-to-low

Future:
- personalized recommendations
- saved searches
- alerts for nearby products

## Order Requirements

Order lifecycle should support states such as:

PENDING
→ CONFIRMED
→ READY_FOR_PICKUP / OUT_FOR_DELIVERY
→ PICKED_UP / DELIVERED
→ COMPLETED

Cancellation and failure states should be modeled explicitly.

## Pickup and Delivery

Each product/order may support:
- seller pickup
- local delivery
- both

Do not assume every product can be shipped.

## Chat Requirements

Conversation should connect:
- buyer
- seller
- optionally product
- optionally order

Message data:
- sender
- message text
- optional image
- timestamp
- read state

## Map Requirements

"Go to Seller" should:
1. obtain buyer location,
2. obtain seller location,
3. open Mapbox,
4. calculate route,
5. show route,
6. show distance and ETA.

Optional future:
- explicit temporary live-location sharing.

## Payment Requirements

Payment must be handled server-side.

Never trust a frontend-only success flag.

Required future payment flow:
1. create order
2. create payment order server-side
3. open checkout
4. verify payment
5. process webhook
6. update payment/order status
7. make fulfillment status consistent

## Trust & Safety

Required/future:
- report listing
- block user
- seller verification
- transaction-based reviews
- moderation
- suspicious listing handling
- rate limiting
- authorization
