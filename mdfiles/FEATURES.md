# Feature Specification

## MVP / Current Implementation

### Authentication
- signup
- login
- logout
- session persistence
- profile
- role/capability handling

### Marketplace
- homepage
- product listing
- product details
- categories
- search
- filters
- sorting
- pagination
- seller profile
- add product
- edit product
- delete product
- image upload

### Location
- browser geolocation
- permission handling
- fallback manual location
- default 10 km radius
- radius selection
- nearby product query
- distance display

### Orders
- cart
- buy flow
- order creation
- buyer orders
- seller orders
- order status
- pickup/delivery selection where supported

### Seller
- seller dashboard
- listing management
- inventory/availability
- order management

### Admin
- users
- listings
- categories
- reports
- moderation

## Advanced / Later

### Payments
- Razorpay
- payment order
- checkout
- signature verification
- webhooks
- payment status
- refunds

### Chat
- buyer-seller conversation
- realtime messages
- unread messages
- read status
- product context
- order context
- image messages
- presence

### Map
- Mapbox
- seller marker
- buyer marker
- route
- distance
- ETA
- travel mode
- Go to Seller

### Optional live location
- explicit user consent
- temporary session
- live buyer position
- stop sharing

## Future Product Features

### Marketplace Map
A map/list toggle showing nearby listings geographically.

### Make an Offer
Useful for:
- used vehicles
- tractors
- equipment
- furniture
- other negotiable products

Flow:
```text
Buyer offer
 ↓
Seller accepts/rejects/counters
 ↓
Agreed price
 ↓
Order
```

### Reviews
Only allow transaction-based reviews after successful completion.

### Trust
- verified seller
- transaction count
- rating
- response time
- report/block

### Notifications
Future:
- order updates
- chat messages
- offers
- nearby listing alerts
- payment status

### Saved Searches
Future:
- save search
- preferred radius
- category
- price range
- optional notifications

### Recommendations
Future:
- based on browsing
- saved products
- location
- categories
- previous purchases

Do not implement AI recommendations before reliable real data exists.
