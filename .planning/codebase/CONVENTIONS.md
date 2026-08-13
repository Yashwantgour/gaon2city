# Coding Conventions

**Analysis Date:** 2026-08-14

## Naming Patterns

**Files & Directories:**
- Backend Controllers/Services/Routes/Validators: `camelCase.js` (e.g. `authController.js`, `productsService.js`, `productValidators.js`).
- Backend Utilities & Classes: `PascalCase.js` for classes (e.g. `ApiError.js`), `camelCase.js` for utility instances (e.g. `logger.js`).
- Frontend React Components: `PascalCase.jsx` (e.g. `ProductCard.jsx`, `Layout.jsx`, `Button.jsx`).
- Frontend Feature Slices & Utilities: `camelCase.js` (e.g. `authSlice.js`, `useLocation.js`, `helpers.js`).

**Code Symbols:**
- Variables & Functions: `camelCase` (e.g. `createProduct`, `handleAddToCart`, `formatPrice`).
- React Components & Custom Classes: `PascalCase` (e.g. `ProductCard`, `ApiError`).
- Constants: `UPPER_SNAKE_CASE` (e.g. `API_BASE_URL`, `PRODUCT_CATEGORIES`).

## Backend Coding Patterns

**Architecture & Layering:**
- Routes define HTTP methods and chain validator middleware before calling the controller:
  ```javascript
  router.post('/', authenticate, createProductValidator, validate, productsController.createProduct);
  ```
- Controllers are pure async wrappers handling `req`, `res`, and passing exceptions to `next(err)`:
  ```javascript
  export async function getProductById(req, res, next) {
    try {
      const product = await productsService.getProductById(req.params.id);
      res.json(product);
    } catch (err) {
      next(err);
    }
  }
  ```
- Services implement the database queries and business logic, throwing custom `ApiError` instances:
  ```javascript
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  ```

**Error Handling:**
- Centralized `ApiError` class in `backend/src/utils/ApiError.js` with static factory methods:
  - `ApiError.badRequest(msg)` (400)
  - `ApiError.unauthorized(msg)` (401)
  - `ApiError.forbidden(msg)` (403)
  - `ApiError.notFound(msg)` (404)
  - `ApiError.conflict(msg)` (409)
  - `ApiError.internal(msg)` (500)
- The global error handler in `backend/src/middleware/errorHandler.js` intercepts all thrown errors, logs them via `logger.error`, and formats a structured JSON response.

## Frontend Coding Patterns

**React Components & State:**
- Functional components with React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
- Redux Toolkit `createSlice` for feature state, with typed actions and reducer logic.
- UI components split into `components/common/` (atomic reusable controls) and `components/layout/` (scaffolding).
- Modern Tailwind CSS utility classes used for responsive styling and Framer Motion for interactive micro-animations.

**API Integration:**
- Axios instance with automatic request interceptors injecting JWT Bearer tokens from `localStorage` or Supabase session.
- Response interceptors unwrapping `response.data` or normalizing error objects.
