# `src/features/` — Feature Modules

Feature-scoped containers that own data fetching, state management, and business logic orchestration for specific application domains.

## Structure

Each feature module follows the convention:

```
features/{feature}/
├── components/   # Feature-specific UI components
├── hooks/        # Feature-specific React hooks
├── utils/        # Feature-specific utilities
└── index.ts      # Public API — barrel export
```

## Current Features

| Feature | Purpose                                                           |
| ------- | ----------------------------------------------------------------- |
| `auth/` | Authentication flows — login forms, MFA setup, session management |

## Boundaries

- **DO:** Compose UI components with data fetching, manage feature-local state, orchestrate business operations
- **DO NOT:** Define primitive UI components (use `src/components/ui/`), define global config, define reusable hooks
- **IMPORT FROM:** `@/components/ui/`, `@/lib/`, `@/config/`, `@/hooks/`, `@/types/`
- **IMPORTED BY:** `src/app/` (page components only)

## Adding a Feature

1. Create `src/features/{name}/` with the structure above
2. Export the public API via `index.ts`
3. Import only from `src/app/` page/layout components — never cross-import between features
