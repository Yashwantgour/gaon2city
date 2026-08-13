# Phase 6 Plan — Direct Messaging & Realtime Chat

**Phase:** Phase 6  
**Goal:** Implement full buyer-seller direct messaging with real-time delivery via Supabase Realtime, contextual chat initiation from product details/orders, unread indicators, and image attachment support.  
**Requirements Covered:** `CHAT-01`, `CHAT-02`, `CHAT-03`

---

## Architecture & Data Flow

```
[ Buyer on Product Page ] ───( Click "Chat Seller" )───> [ Navigate /chat?seller=ID&product=ID ]
                                                                     │
                                                                     ▼
[ Chat Component ] ◄───( Supabase Realtime Channel: 'messages' )─── [ Backend API & DB ]
        │                                                                    ▲
        ├──────► Send Message (Text / Image) ────────────────────────────────┤
        ├──────► Mark Read (read_at timestamp) ──────────────────────────────┤
        └──────► Unread Badge Counter ───────────────────────────────────────┘
```

---

## Wave 1: Contextual Navigation & Initiation

### Task 1.1: Connect ProductDetails & Marketplace to Chat
- **Target Files:**
  - `frontend/src/pages/ProductDetails.jsx`
  - `frontend/src/components/product/ProductCard.jsx`
- **Action:** Update "Chat Seller" button handlers to navigate to `/chat?seller=<seller_id>&product=<product_id>`.
- **Validation:** Clicking "Chat Seller" on any product opens `/chat` with contextual query parameters.

### Task 1.2: Chat Page Query Parameter Ingestion
- **Target Files:**
  - `frontend/src/pages/Chat.jsx`
- **Action:** Ingest `useSearchParams()` (`seller` and `product`). If present:
  - Check existing conversations list for matching `seller_id` and `product_id`.
  - If exists, automatically select that conversation.
  - If not, invoke `createConversation({ seller_id, product_id })`, append to state, and set as active conversation.

---

## Wave 2: Real-time Message Subscription & Unread State

### Task 2.1: Supabase Realtime Channel Integration
- **Target Files:**
  - `frontend/src/pages/Chat.jsx`
  - `frontend/src/services/supabase.js`
- **Action:**
  - Set up a Postgres changes subscription using `supabase.channel('messages-channel')` for `INSERT` on table `messages`.
  - When a new message arrives:
    - If it belongs to `selectedConv.id`, append it to `messages` array and auto-scroll to bottom.
    - Update conversation list's `last_message` and increment `unread_count` for inactive conversations.
    - If currently viewing the active conversation and the message is from the other participant, immediately invoke `markMessageRead(newMsg.id)`.

### Task 2.2: Global Unread Indicator
- **Target Files:**
  - `frontend/src/components/layout/Navbar.jsx`
  - `frontend/src/components/layout/MobileNav.jsx`
- **Action:** Show an unread message badge count on the Chat icon in top and bottom navigation bars.

---

## Wave 3: Image Attachments & Enhanced UX

### Task 3.1: Image Attachment Upload in Chat
- **Target Files:**
  - `backend/src/services/conversationsService.js`
  - `frontend/src/pages/Chat.jsx`
  - `frontend/src/services/conversationsApi.js`
- **Action:**
  - Connect the `HiOutlinePhoto` button to a hidden file input.
  - Upload selected image to Supabase Storage or convert to optimized base64 payload.
  - Render received and sent image thumbnails in message bubbles with click-to-preview modal.

### Task 3.2: Read Receipt & Timestamp Polish
- **Target Files:**
  - `frontend/src/pages/Chat.jsx`
- **Action:** Display double-check / read status indicator for sent messages and formatted relative timestamps.

---

## Verification Plan

### Automated / API Verification:
- `POST /api/conversations` creates/fetches conversation with valid participants.
- `POST /api/conversations/:id/messages` rejects non-participants with `403 Forbidden`.
- `PATCH /api/conversations/messages/:id/read` marks message as read and updates timestamp.

### Manual / Browser Verification:
1. Open two browser sessions (Buyer and Seller).
2. As Buyer, navigate to a product and click "Chat Seller".
3. Verify chat opens with seller name and product context header.
4. Send a text message; verify seller receives it instantly without page refresh.
5. Send an image attachment; verify image renders in chat bubble.
6. Verify unread badge increments and clears upon viewing.
