# Smokey Dreamz

Premium Cannabis Dispensary - Johannesburg

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment:**
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

3. **Run development:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
npm start
```

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database + Edge Functions)
- PWA (Service Worker)

## Routes

| Route | Description |
|-------|------------|
| `/` | Home |
| `/welcome` | Age gate + login |
| `/menu` | Product menu |
| `/membership` | Member dashboard |
| `/membership/card` | Digital card with barcode |
| `/admin` | Staff login |
| `/staff/verify` | Member verification |
| `/locations` | All branches |

## Database (Supabase)

Tables: `members`, `products`, `visits`

Make user admin:
```sql
UPDATE members SET is_admin = true WHERE email = 'email@example.com';
```

## Edge Function

`verify-member` - Secure barcode verification (uses service role key)

## License

For adult use only. 21+