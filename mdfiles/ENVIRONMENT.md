# Environment Configuration

Never commit real secrets.

## Frontend

Typical public/client-safe variables:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_MAPBOX_TOKEN=
VITE_API_BASE_URL=
```

Only put values in Vite variables that are safe to expose to the browser.

## Backend

Private variables:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MAPBOX_TOKEN=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
PORT=
CLIENT_URL=
```

Exact variable names may be adapted to the implementation, but the security rules remain.

## Important

Never expose:
- Supabase service-role key
- Razorpay secret
- private API credentials

Do not put backend secrets in:
- React source
- Vite public variables
- committed config files
- screenshots
- documentation examples containing real credentials

Use `.env.example` with blank/example values.
