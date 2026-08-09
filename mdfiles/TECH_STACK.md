# Technology Stack Rules

## Required

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- React Hook Form
- React Router DOM
- Redux Toolkit
- Axios

### Backend
- Node.js
- Express.js
- JavaScript

### Backend platform
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- PostgreSQL PostGIS

### Maps
- Mapbox

## Future

### Payments
- Razorpay

### Advanced realtime
- Socket.IO

## Explicitly Avoid

Unless the owner changes the requirements:
- TypeScript
- MongoDB
- Firebase
- Next.js
- Prisma
- Mongoose
- another SQL database
- another authentication provider
- unnecessary state libraries

## Dependency Philosophy

Before adding a dependency ask:
1. Can the existing stack solve this cleanly?
2. Is the dependency necessary for production?
3. Does it conflict with the approved architecture?
4. Does it increase maintenance substantially?

Prefer fewer dependencies.

## State Management

Use Redux Toolkit for global client state:
- authentication/session state
- cart
- location preferences
- user preferences
- global UI state

Do not put every local form field into Redux.

Server data should be handled through a clean API/service layer. RTK Query may be used if needed because it is part of Redux Toolkit.

## Forms

Use React Hook Form for:
- login/signup
- add product
- edit product
- checkout
- profile
- reports
- seller settings

## Animations

Framer Motion:
- page transitions
- modal/drawer
- card interactions
- subtle loading transitions
- notifications

Avoid excessive animation.

## Styling

Design language:
- clean
- neutral
- professional
- accessible
- mobile-first

One primary brand color is preferred.

Do not copy Amazon/Flipkart branding.
