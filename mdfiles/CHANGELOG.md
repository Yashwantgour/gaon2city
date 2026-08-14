# Changelog

This file should record meaningful architectural and product changes.

## Initial Documentation

Created the project documentation baseline covering:
- product identity
- requirements
- approved technology stack
- system architecture
- database design
- features
- API structure
- UI/UX rules
- security
- implementation roadmap
- future implementation
- AI coding rules
- environment configuration
- testing checklist

## Rule

When a major architecture or product decision changes, add an entry here with:
- date
- decision
- reason
- affected files

## Phase 10 — Production Hardening (2026-08-14)
- **RLS & Database Security**: Added comprehensive migration `supabase/migrations/20260814000001_production_hardening_rls.sql` with PostGIS GiST spatial indexing, performance indexes, and strict Row Level Security policies across all 12 tables.
- **API Hardening**: Added route-specific rate limiting (auth, payments, reports), strict Helmet security headers, CORS origin validation, and structured request logging.
- **Input Validation**: Added `authValidators.js` for profile update requests.
- **Frontend Reliability**: Added React `ErrorBoundary` component to gracefully catch rendering exceptions.
- **Deployment Docs & Templates**: Added `mdfiles/DEPLOYMENT.md` and complete environment templates (`frontend/.env.example`, `backend/.env.example`).
