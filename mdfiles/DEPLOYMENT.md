# Gaon2City — Production Deployment & Hardening Guide

This document outlines the deployment configuration, security hardening, database backup/recovery strategies, and operational monitoring for Gaon2City.

---

## 1. Architecture Overview

```text
       [ Clients / Browsers / Mobile PWA ]
                      │
           HTTPS (TLS 1.3 / HSTS)
                      │
     ┌────────────────┴────────────────┐
     │                                 │
     ▼                                 ▼
[ Frontend Web App ]          [ Express API Gateway ]
Hosted on Vercel / Netlify    Hosted on Render / Railway / Node VM
(Vite React SPA)              (Helmet, RateLimit, CORS, PostGIS Proxy)
     │                                 │
     │      ┌──────────────────────────┘
     │      │  (Bearer Auth Token / Service Role)
     ▼      ▼
[ Supabase Managed Services ]
├── PostgreSQL + PostGIS (Spatial GiST Indexes, RLS Policies)
├── Supabase Auth (JWT verification)
├── Supabase Storage (product-images bucket)
└── Supabase Realtime (Chat & order sync)
```

---

## 2. Production Checklist

### 2.1 Database & PostGIS
- [x] Run `supabase/migrations/20260814000001_production_hardening_rls.sql` to enforce RLS across all 12 core tables.
- [x] Verify spatial index `idx_products_location` on `public.products (location)` using GiST.
- [x] Verify composite indexes on frequent query columns (`seller_id`, `category_id`, `created_at`, `buyer_id`).

### 2.2 Backend Security & API Hardening
- [x] **Security Headers**: Strict Helmet configuration (X-Content-Type-Options, Frameguard Deny, HSTS 1 year, Referrer Policy).
- [x] **Rate Limiting**:
  - Global: 300 requests / 15 min per IP.
  - Auth: 60 requests / 15 min.
  - Payments: 30 requests / 15 min.
  - Reports: 20 requests / 15 min.
- [x] **Authorization**: Token-based authentication, user-scoped queries, ownership assertions before updates/deletes.
- [x] **Input Validation**: Express-validator schemas on all mutation routes.

### 2.3 Frontend Reliability
- [x] **Error Boundary**: React ErrorBoundary wrapping root routes to gracefully handle unexpected runtime errors without blank screens.
- [x] **Empty & Loading States**: Skeleton loaders, informative empty states, and toast notifications.
- [x] **Clean Responsive Layouts**: 1–2 cards on mobile, 2–3 on tablet, 3–4 on desktop.

---

## 3. Database Backup & Disaster Recovery Strategy

1. **Automated Daily Backups**:
   - Supabase automatically takes daily logical backups.
   - For enterprise / scale tier, Point-in-Time Recovery (PITR) allows restoration to any second in the past 7–30 days.
2. **Manual Snapshot Export (pg_dump)**:
   ```bash
   pg_dump -h db.<PROJECT-REF>.supabase.co -U postgres -d postgres -F c -b -v -f gaon2city_backup_$(date +%Y%m%d).dump
   ```
3. **Storage Retention**:
   - Product images stored in Supabase Storage with bucket-level size limits (max 5MB per upload) and mime-type verification.

---

## 4. Monitoring & Logging

- **Structured HTTP Logs**: Timestamped request method, URL, status code, and latency in milliseconds.
- **Sensitive Data Masking**: Authentication tokens, Razorpay secrets, and passwords are never logged to stdout or error traces.
- **Health Check Endpoint**:
  ```http
  GET /api/health
  Response: { "status": "ok", "environment": "production", "timestamp": "..." }
  ```
