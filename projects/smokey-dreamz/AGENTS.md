<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Smokey Dreamz - Development Guide

## Quick Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/               # API routes
│   │   ├── health/       # Health check
│   │   └── logo/         # Logo serving
│   ├── feed/             # Redirect to menu
│   ├── locations/        # Branch pages
│   │   ├── blairgowrie/
│   │   ├── randpark-ridge/
│   │   ├── witbank/
│   │   └── page.tsx      # All locations
│   ├── membership/       # Member pages
│   │   ├── card/         # Digital membership card
│   │   └── page.tsx      # Member dashboard
│   ├── menu/             # Product menu
│   ├── staff/verify/     # Staff verification (admin only)
│   ├── verify/[memberId]/ # QR verification route
│   ├── welcome/          # Age gate + login
│   └── page.tsx          # Home page
├── components/
│   ├── branches/         # Branch-specific components
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── QuotationDrawer.tsx
│   ├── ServiceWorkerRegistration.tsx
│   ├── StrainHoverCard.tsx
│   ├── StrainSpotlight.tsx
│   ├── membership.ts
│   ├── members.ts
│   ├── products.ts
│   └── strainData.ts     # Strain research database
└── proxy.ts              # Age verification middleware
```

## Supabase Setup

### Tables
- **members**: id, membership_id, name, email, id_number, contact_number, is_admin, created_at
- **products**: id, name, category, description, image_url, is_available, created_at
- **visits**: id, member_id, branch_id, created_at

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

The POS bridge (`scripts/randpark-bridge.py`) and `scripts/test-supabase.py` read
`SUPABASE_URL` and `SUPABASE_ANON_KEY`, plus an optional `SUPABASE_SERVICE_KEY` for the
bridge. No credentials are committed — set these per environment.

## Key Features

### Membership System
- Sign up / Login at `/welcome`
- Digital card with barcode at `/membership/card`
- QR verification at `/verify/[memberId]`
- Staff verification at `/staff/verify` (requires is_admin=true)

### Product Menu
- Strain research database with lineage, terpenes, effects
- 7-day NEW DROP badge
- Category filters (Boutique, Premium, Edibles)
- WhatsApp quotation system

### PWA Features
- Add to Home Screen support
- Service worker for offline access
- Manifest at `/manifest.json`

## Admin Tasks

### Make a user admin
```sql
UPDATE members SET is_admin = true WHERE email = 'email@example.com';
```

### View recent visits
```sql
SELECT m.name, m.membership_id, v.created_at, v.branch_id 
FROM visits v 
JOIN members m ON v.member_id = m.id 
ORDER BY v.created_at DESC 
LIMIT 20;
```