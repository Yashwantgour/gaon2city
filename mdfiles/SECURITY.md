# Security Requirements

## Authentication

Use Supabase Auth.

Never implement insecure custom password storage.

## Secrets

Environment variables only.

Examples:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MAPBOX_TOKEN
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Never commit `.env`.

The Supabase service-role key must never be sent to the browser.

## Authorization

Authentication answers:
> Who are you?

Authorization answers:
> Are you allowed to perform this action?

Both are required.

Examples:
- seller can edit own product only
- buyer can view own order only
- seller can view relevant orders only
- chat accessible only to participants
- admin endpoints restricted to admin users

## Supabase RLS

Use RLS as a database-level security layer.

Do not depend only on frontend route protection.

## Input Validation

Validate:
- product title
- description
- price
- quantity
- category
- IDs
- order status
- review rating
- report reason
- location parameters
- search/radius parameters

## File Uploads

Validate:
- file type
- size
- extension
- ownership
- storage path

Do not trust a client-provided filename.

## Rate Limiting

Apply rate limiting especially to:
- login-related endpoints
- product creation
- chat/message endpoints
- reports
- payment endpoints
- public search endpoints where necessary

## Payments

Never mark payment successful based solely on frontend response.

Verify payment server-side.

Use provider webhooks for authoritative asynchronous events.

## Location Privacy

Location is sensitive.

Rules:
- ask permission
- explain why location is needed
- allow manual fallback
- do not expose exact private seller location unnecessarily
- use approximate/public location where appropriate
- live location must be explicit and temporary
- provide stop-sharing control

## Logging

Never log:
- passwords
- access tokens
- service keys
- payment secrets
- unnecessary private location data

## Error Handling

Production responses should not expose stack traces or database internals.

## Security Checklist

Before production:
- [ ] RLS enabled
- [ ] service key protected
- [ ] environment variables protected
- [ ] API validation
- [ ] authorization checks
- [ ] rate limiting
- [ ] secure CORS
- [ ] Helmet/security headers
- [ ] safe file uploads
- [ ] payment verification
- [ ] webhook verification
- [ ] no secrets in Git
