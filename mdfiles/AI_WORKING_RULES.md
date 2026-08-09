# AI Working Rules

This repository is designed so that another AI coding agent can understand and extend the project safely.

## Before Coding

Read:
1. README.md
2. PROJECT_REQUIREMENTS.md
3. TECH_STACK.md
4. ARCHITECTURE.md
5. IMPLEMENTATION_ROADMAP.md
6. relevant feature/database/security documents

Then inspect the actual repository.

## Never Assume

Do not assume:
- dummy data is acceptable
- a missing API should be mocked permanently
- frontend authorization is enough
- GPS is always available
- every seller has delivery
- every product supports direct payment
- every product should expose an exact address
- Socket.IO is automatically required
- a new dependency is automatically acceptable

## Data Rule

Production flows must use real Supabase data.

Mock data is acceptable only for:
- isolated UI development
- automated tests
- explicitly requested demos

Do not silently leave fake data in production flows.

## Coding Rule

Prefer:
- small reusable components
- clear service functions
- thin controllers
- centralized error handling
- validation
- meaningful names
- predictable API responses

Avoid:
- giant components
- duplicated API logic
- hardcoded secrets
- hardcoded seller/product data
- business logic hidden inside JSX

## UI Rule

Every important async screen should have:
- loading
- success
- empty
- error

Every form should have:
- validation
- disabled submit while processing
- understandable error messages

## Location Rule

Use:
- PostGIS for authoritative nearby filtering
- user consent
- fallback location selection
- privacy-aware seller locations

## Payment Rule

Payment must be:
- created server-side
- verified server-side
- webhook-aware

Never trust client-only payment status.

## Realtime Rule

Use Supabase Realtime first.

Only add Socket.IO for a demonstrated requirement.

## Security Rule

Never:
- expose service-role key
- expose payment secret
- commit `.env`
- trust client ownership claims
- skip RLS
- return internal stack traces

## Change Rule

When modifying an existing feature:
1. inspect existing implementation
2. preserve working behavior
3. update related docs if architecture changes
4. test affected paths
5. avoid unrelated refactors

## Documentation Rule

If a major architectural decision changes, update:
- README.md
- ARCHITECTURE.md
- TECH_STACK.md
- relevant roadmap/feature files

## Completion Report

After implementation, report:
- what was implemented
- files created/changed
- database changes
- environment variables required
- test result
- known limitations
- next recommended phase
