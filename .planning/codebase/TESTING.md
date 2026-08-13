# Testing Patterns

**Analysis Date:** 2026-08-14

## Current Testing Setup

**Automated Test Frameworks:**
- **Status:** Currently, no automated testing runner (Jest, Vitest, Mocha, or Supertest) is configured in `backend/package.json` or `frontend/package.json`.
- **Test Scripts:** Neither `npm test` nor test execution commands are defined in the project package scripts.

## Test Specifications & Manual Checklists

The project maintains comprehensive testing specifications and QA checklists in `mdfiles/TESTING_CHECKLIST.md` covering:
- **Authentication & Authorization:** Signup, login, JWT issuance, profile creation, seller role verification, and protected route access.
- **Product Management:** Product creation, image upload to Supabase storage, category filtering, search, and stock quantity updates.
- **Cart & Checkout:** Add/remove items, quantity updates, order calculation, address validation, and payment status transitions.
- **Messaging & Chat:** Conversation creation between buyer and seller, message persistence, and timestamps.
- **Reviews & Ratings:** Review submission, rating calculations, and display on product details.
- **Map & Geolocation:** Distance calculation between rural producer origin and delivery coordinates.

## Recommended Automated Test Architecture

To achieve production readiness, the following test setup should be implemented:

1. **Backend Integration & Unit Tests:**
   - **Framework:** `vitest` or `jest` + `supertest`.
   - **Target:** API endpoint status codes, validation rule failures (`express-validator`), authentication middleware rejection, and service mocking.
   - **Test Directory Convention:** `backend/src/__tests__/` or `*.test.js` adjacent to controllers/services.

2. **Frontend Component & Hook Tests:**
   - **Framework:** `vitest` + `@testing-library/react` + `@testing-library/user-event`.
   - **Target:** Redux slice reducers, UI components (`Button`, `Modal`, `ProductCard`), and custom hooks (`useDebounce`, `useLocation`).
   - **Test Directory Convention:** `frontend/src/__tests__/` or `*.test.jsx`.

3. **End-to-End (E2E) Testing:**
   - **Framework:** `playwright` for end-to-end checkout, login, and seller onboarding flows.
