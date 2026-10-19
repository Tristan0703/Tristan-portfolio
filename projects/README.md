# Projects

Source snapshots of shipped work referenced by the portfolio site. Each directory is an
independent application with its own `package.json` and is excluded from the root site's
TypeScript, ESLint, and Vitest runs.

| Directory | Project | Stack | Portfolio card |
| --- | --- | --- | --- |
| `k-and-r-thread/` | K&R Thread web application | Next.js 16, React 19, Supabase, Tailwind 4 | Proof-of-Concept Booking Architecture |
| `smokey-dreamz/` | Smokey Dreamz multi-branch retail platform | Next.js 16, Supabase, PWA, Cloudflare Workers | Retail Workflow Systems |
| `pc-dev-remote/` | Remote desktop system | .NET 8 / C#, React Native (Vite), NetBird mesh | Heavy Hitters (Client Work) |

## Notes on import

- These are cleaned source snapshots. `node_modules`, build output (`bin`, `obj`, `dist`),
  caches (`__pycache__`, `graphify-out`), and nested archives were removed before commit.
- Fabric imagery in `k-and-r-thread/public/fabrics/` is stored with Git LFS.
- Supabase credentials are read from environment variables only. No keys are committed.

## Running a project

Each directory is self-contained:

```bash
cd projects/<directory>
npm install
npm run dev
```

`pc-dev-remote` has two parts — see `projects/pc-dev-remote/README.md` for the .NET host and
React Native client build steps.
