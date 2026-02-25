# Frozen Phoenix — Production Command Center

End-to-end client ecosystem for technical production, fabrication, and experiential agencies.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui patterns
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from **Settings > API**
3. Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Database

Run the SQL migration in your Supabase SQL Editor:

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the query to create all tables, RLS policies, and triggers

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── dashboard/      # Main dashboard
│   │   ├── pipeline/       # CRM pipeline (Kanban)
│   │   ├── projects/       # Project management
│   │   ├── tasks/          # Task tracking
│   │   ├── calendar/       # Unified calendar view
│   │   ├── scheduling/     # Crew shift scheduling
│   │   ├── crew/           # Crew & certifications
│   │   ├── assets/         # Asset inventory
│   │   ├── fleet/          # Vehicle fleet management
│   │   ├── vendors/        # Vendor vault
│   │   ├── finance/        # Financial operations
│   │   ├── procurement/    # Purchase requests & POs
│   │   ├── approvals/      # Milestone approvals
│   │   ├── brand-kit/      # Client brand guidelines
│   │   ├── decks/          # Presentation decks
│   │   ├── people/         # Stakeholder matrix
│   │   ├── org-chart/      # Project org charts
│   │   ├── sops/           # Standard operating procedures
│   │   ├── vault/          # Secure document storage
│   │   ├── case-studies/   # Published case studies
│   │   └── settings/       # User & org settings
│   ├── (public)/           # Public routes
│   │   ├── login/          # Sign in
│   │   └── signup/         # Sign up
│   └── auth/               # Auth callback routes
├── components/
│   ├── layouts/            # Sidebar, Topbar
│   ├── ui/                 # Reusable UI components
│   └── providers.tsx       # React Query + Auth providers
├── config/
│   ├── navigation.ts       # Sidebar navigation config
│   └── rbac.ts             # Role-based access control
├── lib/
│   ├── supabase/           # Supabase client & hooks
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   ├── middleware.ts   # Auth middleware
│   │   ├── auth-context.tsx # Auth React context
│   │   ├── hooks.ts        # Data fetching hooks
│   │   └── database.types.ts # TypeScript types
│   ├── mock-data.ts        # Mock data for development
│   └── utils.ts            # Utility functions
└── types/
    └── index.ts            # Core type definitions
```

## Features

### Command Center
- **Dashboard**: Real-time KPIs, active projects, overdue approvals
- **Calendar**: Unified view of projects, tasks, and milestones

### Commercial
- **Pipeline**: Kanban-style deal management
- **Contacts**: Stakeholder CRM
- **Case Studies**: Auto-published from completed projects

### Production
- **Projects**: Full lifecycle management with phase tracking
- **Tasks**: Granular task management with fabrication status
- **Scheduling**: Crew shift management
- **Crew**: Certification tracking with compliance gates
- **Assets**: Equipment inventory with barcode tracking
- **Fleet**: Vehicle dispatch and GPS tracking

### Creative
- **Brand Kit**: Client brand guidelines library
- **Decks**: Auto-generated presentation decks
- **Approvals**: Milestone-tied approvals with escalation

### Finance
- **Vendors**: COI validation, NDA tracking, ratings
- **Invoices**: Three-way match (PO ↔ WO ↔ Invoice)
- **Procurement**: Purchase requests and PO management

### Organization
- **People**: Stakeholder matrix by type
- **Org Chart**: Auto-generated per project
- **SOPs**: Role-based procedures with acknowledgments
- **Vault**: Encrypted document storage with expiring links

## RBAC (Role-Based Access Control)

Four permission levels:

| Level | Access |
|-------|--------|
| **exec** | Full access — margins, payroll, cross-project data |
| **pm** | Project-scoped — budgets, crew, tasks |
| **client** | Approved deliverables, progress decks, public budgets |
| **vendor** | Task-specific work orders, site maps only |

## Development

### Mock Data

The app includes mock data in `src/lib/mock-data.ts` for development without a database connection. Pages will use mock data when Supabase is not configured.

### Adding New Pages

1. Create a new folder in `src/app/(dashboard)/`
2. Add `page.tsx` with the page component
3. Update `src/config/navigation.ts` to add to sidebar
4. Add permission in `src/config/rbac.ts` if needed

### Database Types

After modifying the database schema, regenerate types:

```bash
npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/database.types.ts
```

## License

Private — All rights reserved.
