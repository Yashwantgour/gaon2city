# Phase 9: Trust, Reviews & Community Moderation

## Objective
Establish a trusted community marketplace with order-verified buyer ratings & reviews, seller verification badges, abuse/listing reporting modals, and an administrative moderation workflow.

---

## Tasks

### 1. Order-Verified Reviews & Ratings Engine
- **Files:** `frontend/src/components/product/ReviewList.jsx`, `frontend/src/components/product/ReviewFormModal.jsx`, `frontend/src/pages/ProductDetails.jsx`, `backend/src/services/reviewsService.js`, `backend/src/routes/reviews.js`
- **Details:**
  - Enhance `ProductDetails.jsx` with a dedicated **Customer Reviews & Ratings** section:
    - Overall star rating score (e.g. 4.8 / 5.0) and star breakdown bars (5★, 4★, 3★, 2★, 1★).
    - Review cards with reviewer avatar, name, star rating, verified buyer badge (`✓ Verified Purchase`), timestamp, and text review.
  - Review Submission Modal (`ReviewFormModal.jsx`):
    - Allows buyers who purchased from the seller to submit 1-5 star ratings and reviews.
    - Connects with `POST /api/reviews`.

### 2. Seller Trust & Verification Badges
- **Files:** `frontend/src/components/common/Badge.jsx`, `frontend/src/components/product/ProductCard.jsx`, `frontend/src/pages/ProductDetails.jsx`, `frontend/src/pages/Profile.jsx`
- **Details:**
  - Visually distinct seller trust badges:
    - 🛡️ **Verified Seller** (`verified`)
    - 🌾 **Local Producer / Shop** (`local_shop` / `cooperative`)
    - ⭐ **Top Rated** (average rating >= 4.5)
  - Display badge on Product Details seller card, Product Cards, and User Profile.

### 3. Community Abuse & Listing Reporting
- **Files:** `frontend/src/components/common/ReportModal.jsx`, `frontend/src/pages/ProductDetails.jsx`, `frontend/src/services/reportsApi.js`, `backend/src/services/reportsService.js`
- **Details:**
  - Add "Report Listing / Seller" button on `ProductDetails.jsx`.
  - Opens `ReportModal` with structured violation categories:
    - Misleading or counterfeit product
    - Inappropriate content or photos
    - Pricing / fraud suspicion
    - Harassment or offensive communication
  - Submits to `POST /api/reports` with confirmation toast.

### 4. Administrative Moderation Dashboard
- **Files:** `frontend/src/pages/AdminDashboard.jsx`, `backend/src/controllers/reportsController.js`
- **Details:**
  - Upgrade the **Reports** tab in `AdminDashboard.jsx`:
    - List pending reports with reporter name, reported product/user, violation category, and description.
    - Actions: `Mark Resolved`, `Dismiss`, `Take Down Product`.
    - Realtime report count badge.

---

## Verification Plan

### Automated Tests / Build
- Run `npm --prefix frontend run build` to verify 0 compiler/TypeScript errors.

### Manual UAT Scenarios
1. **Scenario 1:** View product details -> displays star rating summary and seller reviews list with verified purchase badges.
2. **Scenario 2:** Click "Write a Review" -> submits star rating & review for delivered order.
3. **Scenario 3:** Click "Report Listing" on product detail page -> opens Report modal, selects violation reason, and submits to admin queue.
4. **Scenario 4:** Open Admin Dashboard -> review pending reports and execute resolution actions.
