# Tristan Lincoln Niekerk — Portfolio

Portfolio site for my work as a Technical Director and Software Developer: full-stack web
infrastructure, interactive visual systems, and virtual reality software. The site also
carries cleaned source snapshots of the public projects referenced throughout it.

## Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **3D:** Three.js (hero lattice), dynamically imported and client-only
- **Data:** Supabase / PostgreSQL (in the showcased projects)
- **Testing:** Vitest

## Structure

```
src/
  app/                  # routes, layout, metadata, sitemap, robots, OG image
  components/           # hero, arsenal, projects, contact, layout, ui
  data/                 # typed content layer, no UI
  lib/                  # mailto builder, validation, helpers
projects/               # independent project sources (excluded from site build)
```

Content lives in `src/data/`. Editing `profile.ts`, `arsenal.ts`, `projects.ts`, or
`scopes.ts` updates the site without touching components.

## Projects

| Directory | Project | Stack | Card |
| --- | --- | --- | --- |
| `projects/k-and-r-thread` | K&R Thread web application | Next.js 16, React 19, Supabase, Tailwind 4 | Proof-of-Concept Booking Architecture |
| `projects/smokey-dreamz` | Smokey Dreamz multi-branch retail platform | Next.js 16, Supabase, PWA, Cloudflare Workers | Retail Workflow Systems |
| `projects/pc-dev-remote` | Remote desktop system | .NET 8 / C#, React Native, NetBird | Heavy Hitters (Client Work) |

These are source snapshots cleaned of dependencies and build output. Fabric imagery in
`projects/k-and-r-thread/public/fabrics/` is stored with Git LFS. No credentials are
committed; Supabase keys are read from environment variables.

## Commands

```bash
npm run dev         # development server
npm run build       # production build
npm start           # serve the production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm test            # vitest run
```

## Configuration

The site reads one optional environment variable:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

It falls back to `http://localhost:3000` when unset and is used for canonical URLs,
sitemap, and robots.

## Contact

- Email: tristanniekerk@gmail.com
- GitHub: https://github.com/Tristan0703

## License

MIT. See [LICENSE](LICENSE) for details.
