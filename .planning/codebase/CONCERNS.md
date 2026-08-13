# Codebase Concerns

**Analysis Date:** 2026-08-14

## Tech Debt & Code Hygiene

**Unused & Skeleton Files:**
- `frontend/src/counter.ts`, `frontend/src/main.ts`, and `frontend/src/style.css` appear to be leftover default Vite starter artifacts. They should be cleaned up or properly integrated into the TypeScript setup.
- TypeScript is listed as a dependency in `frontend/package.json` with a `tsc && vite build` build step, but the majority of frontend components are written in `.jsx` and `.js`.

**In-Memory State & Rate Limiting:**
- `backend/src/server.js` uses `express-rate-limit` in-memory store. For multi-instance deployments or horizontal scaling, a Redis-backed rate limiter store is required.
- In-memory fallback arrays (e.g. `LOCAL_PRODUCTS_STORE` in `productsService.js`) exist as local fallbacks when Supabase credentials are not supplied.

## Security Considerations

**Supabase Service Role Usage:**
- The backend relies heavily on `supabaseAdmin` (which bypasses Supabase Row Level Security / RLS). Where appropriate, user-scoped clients created via `createUserClient(accessToken)` should be enforced to prevent accidental privilege escalation.

**Payload & Image Handling:**
- `backend/src/server.js` configures `express.json({ limit: '50mb' })` and `express.urlencoded({ limit: '50mb' })` to accommodate base64 image strings. Decoding large 50MB base64 images directly in Node.js heap memory can lead to memory pressure under high concurrent upload traffic. Direct client-to-storage signed URLs or multipart streaming via `multer` is recommended for high-load production.

## Testing & Quality Gaps

**Automated Test Coverage:**
- 0% automated test coverage in both backend and frontend.
- No CI/CD workflow currently configured in `.github/workflows` to run automated linting or test suites on PRs.

## Fragile Areas

**Third-Party Service Configuration:**
- Payment gateway integration (`paymentsService.js`) is currently stubbed out pending live Razorpay credentials.
- Map routing (`mapService.js`) strictly throws 500 errors if `MAPBOX_TOKEN` is missing from the environment.
