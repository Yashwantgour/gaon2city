# Testing Checklist

## Authentication
- [ ] signup
- [ ] login
- [ ] logout
- [ ] refresh/session
- [ ] protected routes
- [ ] unauthorized access blocked

## Marketplace
- [ ] create product
- [ ] edit own product
- [ ] cannot edit another seller's product
- [ ] delete own product
- [ ] upload image
- [ ] search
- [ ] category filter
- [ ] price filter
- [ ] condition filter
- [ ] pagination

## Location
- [ ] GPS permission granted
- [ ] GPS permission denied
- [ ] manual location fallback
- [ ] 5 km radius
- [ ] 10 km radius
- [ ] 25 km radius
- [ ] nearby result correctness
- [ ] distance display
- [ ] no-location state

## Orders
- [ ] create order
- [ ] buyer sees own order
- [ ] seller sees relevant order
- [ ] status transitions
- [ ] pickup
- [ ] delivery
- [ ] cancellation rules

## Chat
- [ ] create conversation
- [ ] buyer sends message
- [ ] seller receives message
- [ ] unread state
- [ ] read state
- [ ] unauthorized conversation access blocked

## Map
- [ ] buyer location
- [ ] seller location
- [ ] route
- [ ] distance
- [ ] ETA
- [ ] map responsive
- [ ] location permission handling

## Payments — future
- [ ] payment order created server-side
- [ ] successful payment verified
- [ ] failed payment
- [ ] webhook
- [ ] duplicate webhook/idempotency
- [ ] order/payment consistency

## Security
- [ ] RLS
- [ ] authorization
- [ ] validation
- [ ] rate limiting
- [ ] CORS
- [ ] Helmet
- [ ] no secrets in frontend
- [ ] safe uploads

## Responsive
- [ ] 320px mobile
- [ ] 375px mobile
- [ ] 768px tablet
- [ ] 1024px desktop
- [ ] 1440px desktop

## UX
- [ ] loading states
- [ ] empty states
- [ ] error states
- [ ] accessible forms
- [ ] keyboard navigation
- [ ] readable contrast
