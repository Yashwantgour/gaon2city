# User Acceptance Testing (UAT) — Phase 6: Direct Messaging & Realtime Chat

**Phase:** Phase 6  
**Status:** In Progress  
**Started:** 2026-08-14  

---

## Test Scenarios

### Test 1: Contextual Chat Initiation from Product Page
- **Preconditions:** User is logged in and views a product listing on `/marketplace` or `/product/:id`.
- **Action:** Click "Chat Seller" button.
- **Expected Result:** Navigates to `/chat?seller=<seller_id>&product=<product_id>`, opens or initiates the conversation thread with the seller, and displays the product context header.
- **Status:** ✅ Passed

### Test 2: Text Messaging & Auto-scroll
- **Action:** Type a message in the input field and press Enter or click the Send button.
- **Expected Result:** Message appears instantly in a styled message bubble on the right with relative timestamp, input clears, and chat view scrolls to the latest message.
- **Status:** ✅ Passed

### Test 3: Photo Attachment & Media Preview
- **Action:** Click the photo icon, select an image, and click Send.
- **Expected Result:** Image preview displays prior to sending, then uploads and renders smoothly within the message bubble.
- **Status:** ✅ Passed

### Test 4: Real-time Delivery & Unread Indicators
- **Action:** Send a message between two active user sessions.
- **Expected Result:** Message arrives in real-time via Supabase Realtime channel without requiring a page reload; unread badges update accurately.
- **Status:** Pending User Confirmation
