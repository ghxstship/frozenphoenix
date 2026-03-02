# Contributing to FrozenPhoenix / Playbook

## Getting Started

```bash
# Clone and install
git clone <repo-url>
cd FrozenPhoenix
npm install

# Start local Supabase (optional — app falls back to mock data)
npx supabase start

# Start dev server
npm run dev
```

## Development Workflow

1. **Branch** from `main` using conventional names: `feat/`, `fix/`, `chore/`, `docs/`
2. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add invoice draft generation`
   - `fix: correct RLS policy on vendors table`
   - `chore: upgrade next to 15.x`
3. **Pre-commit hooks** run automatically via Husky + lint-staged (Prettier + ESLint)
4. **Open a PR** against `main` — CI quality gate must pass

## Scripts

| Script                 | Purpose                  |
| ---------------------- | ------------------------ |
| `npm run dev`          | Start Next.js dev server |
| `npm run build`        | Production build         |
| `npm run lint`         | ESLint check             |
| `npm run type-check`   | TypeScript strict check  |
| `npm run test`         | Run Vitest test suite    |
| `npm run format`       | Format with Prettier     |
| `npm run format:check` | Check formatting         |
| `npm run quality-gate` | Full deployment gate     |

## Code Standards

- **TypeScript** — `strict: true`, no `any`, no `@ts-ignore`
- **Imports** — External → Internal (`@/`) → Relative → Types
- **Logging** — Use `@/lib/logger` — never `console.*` directly
- **API errors** — Use `ApiErrors` from `@/lib/api-utils`
- **CSS** — Logical properties only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`/`text-end`)
- **Styling** — Design tokens via `@/config/design-tokens` — no hardcoded colors/spacing
- **Components** — Stateless by default, typed props, no side effects
- **State** — Zustand for UI, TanStack Query for server, no prop drilling

## Testing

- Unit tests in `src/__tests__/lib/`
- Use Vitest + `vi.mock()` / `vi.stubEnv()` for mocking
- Target: 80% unit coverage, 70% integration

## Architecture

See [docs/ARCHITECTURE_RECOMMENDATIONS.md](docs/ARCHITECTURE_RECOMMENDATIONS.md) for full architecture guide.

### Key Directories

```
src/
├── app/              # Next.js App Router pages + API routes
├── components/       # Shared UI components
├── config/           # SSOT configs (tokens, navigation, RBAC, brands)
├── hooks/            # Custom React hooks
├── lib/              # Utilities (logger, locale, auth, supabase)
└── types/            # Domain type definitions
supabase/
└── migrations/       # Sequential SQL migrations
```

## Migrations

- Files in `supabase/migrations/` use sequential numbering: `001_`, `002_`, etc.
- Never reuse or duplicate a migration number
- Test locally with `npx supabase db reset` before committing

## Quality Gate

The CI pipeline enforces:

- TypeScript compilation (zero errors)
- ESLint (zero errors)
- `npm audit` (zero high/critical vulnerabilities)
- All tests pass
- Next.js build succeeds

See [QUALITY_STANDARDS.md](QUALITY_STANDARDS.md) for the full 360-criterion gate.
