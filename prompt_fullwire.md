# GHXSTSHIP INDUSTRIES — FULL-WIRE VALIDATION AUDIT PROTOCOL v1.0

## WINDSURF DATABASE ↔ API ↔ UI END-TO-END WIRING CERTIFICATION

**Classification:** Full-Stack Wire Validation / Surgical Precision / Zero Dead Ends
**Scope:** Every database field, every API endpoint, every UI element — traced end-to-end
**Standard:** Zero orphaned fields, zero phantom UI, zero dead endpoints, zero broken bindings
**Failure Mode:** BLOCK until every wire is verified connected and functional

---

## INSTRUCTIONS TO WINDSURF

You are operating as a **Principal Full-Stack Integration Engineer** performing a **complete wire-trace audit** of this entire application. Your job is to verify that every piece of data can travel the full circuit:

```
DATABASE COLUMN → ORM MODEL → API ENDPOINT → FRONTEND FETCH → UI RENDER → USER INTERACTION → MUTATION → API HANDLER → ORM WRITE → DATABASE
```

**Every wire must be traced in both directions.** A field that exists in the database but never reaches the UI is dead. A UI element that displays data from nowhere is phantom. An API endpoint that nobody calls is orphaned. A form field that submits to nothing is broken.

**Your mandate:**

1. **MAP** every database table and column
2. **TRACE** every field through the ORM, API, and into the UI
3. **VERIFY** every UI data display is bound to real, fetched data
4. **VERIFY** every UI form/input writes back through a real mutation path
5. **IDENTIFY** every break in the wire — fields that stop mid-journey
6. **FIX** every break by completing the circuit or removing the dead end

**You are an electrical engineer testing continuity on every single wire in the system. If the circuit is broken, the system doesn't ship.**

---

## OUTPUT FORMAT

For each table/model, output a complete wire map:

```
══════════════════════════════════════════════════════════════════
🗄️  TABLE: [table_name]
📊 COLUMNS: [count]
🔌 WIRE STATUS: FULLY CONNECTED | PARTIAL | DISCONNECTED
══════════════════════════════════════════════════════════════════

COLUMN-BY-COLUMN WIRE TRACE:
┌─────────────────┬────────────┬───────────────┬──────────────┬──────────┐
│ DB Column        │ ORM Field  │ API Exposure   │ UI Display   │ UI Write │
├─────────────────┼────────────┼───────────────┼──────────────┼──────────┤
│ id (uuid)        │ ✅ id      │ ✅ GET /users  │ ✅ URL param │ ❌ N/A   │
│ email (varchar)  │ ✅ email   │ ✅ GET /users  │ ✅ Profile   │ ✅ Form  │
│ avatar_url (text)│ ✅ avatar  │ ❌ NOT EXPOSED │ 🔴 PHANTOM  │ 🔴 DEAD  │
│ stripe_id (text) │ ✅ stripeId│ ✅ Server only │ ❌ Hidden    │ ❌ N/A   │
└─────────────────┴────────────┴───────────────┴──────────────┴──────────┘

🔴 BROKEN WIRES:
[V-001] avatar_url exists in DB but is never returned by any API endpoint.
        ProfilePage.tsx line 47 renders <Avatar src={user.avatarUrl}> but
        the GET /api/users/[id] response does not include avatarUrl.
        FIX: Add avatarUrl to user select query in /api/users/[id]/route.ts line 23

[V-002] ...
══════════════════════════════════════════════════════════════════
```

---

## PHASE 0: COMPLETE SYSTEM INVENTORY

Before tracing any wires, build the complete inventory of both ends:

### 0.1 — Database Schema Extraction

```
ACTION: Extract and catalog the COMPLETE database schema.

FOR PRISMA:
  cat prisma/schema.prisma
  — List every model, every field, every relation, every enum

FOR DRIZZLE:
  find . -name "schema.ts" -path "*/drizzle/*" -o -name "schema.ts" -path "*/db/*"
  — Read every table definition

FOR RAW SQL / SUPABASE:
  — Read every migration file in order
  — Or query: SELECT table_name, column_name, data_type, is_nullable,
    column_default FROM information_schema.columns
    WHERE table_schema = 'public' ORDER BY table_name, ordinal_position;

BUILD THIS MASTER TABLE:

DATABASE_INVENTORY = {
  tables: [
    {
      name: "users",
      columns: [
        { name: "id", type: "uuid", nullable: false, default: "gen_random_uuid()", pk: true },
        { name: "email", type: "varchar(255)", nullable: false, unique: true },
        { name: "name", type: "varchar(255)", nullable: true },
        { name: "avatar_url", type: "text", nullable: true },
        { name: "role", type: "enum(admin,member,viewer)", nullable: false, default: "member" },
        { name: "stripe_customer_id", type: "varchar(255)", nullable: true },
        { name: "created_at", type: "timestamptz", nullable: false, default: "now()" },
        { name: "updated_at", type: "timestamptz", nullable: false, auto_update: true },
        // ... every single column
      ],
      relations: [
        { name: "projects", type: "one-to-many", target: "projects", fk: "projects.owner_id" },
        { name: "memberships", type: "one-to-many", target: "org_members", fk: "org_members.user_id" },
        // ... every single relation
      ],
      indexes: [ ... ],
      rls_policies: [ ... ],  // if Supabase
    },
    // ... every single table
  ],
  enums: [
    { name: "user_role", values: ["admin", "member", "viewer"] },
    // ... every enum
  ],
  views: [ ... ],        // materialized or regular views
  functions: [ ... ],    // stored procedures, triggers
}
```

### 0.2 — API Endpoint Extraction

```
ACTION: Catalog EVERY API endpoint in the application.

FOR NEXT.JS APP ROUTER:
  find app -name "route.ts" -o -name "route.tsx" | sort
  — For each file, identify exported HTTP methods (GET, POST, PUT, PATCH, DELETE)

FOR NEXT.JS PAGES ROUTER:
  find pages/api -name "*.ts" -o -name "*.tsx" | sort

FOR tRPC:
  find . -name "*.router.ts" -o -name "*.procedure.ts" | sort
  — List every procedure with its type (query, mutation, subscription)

FOR EXPRESS / FASTIFY / HONO:
  grep -rn "app.get\|app.post\|app.put\|app.patch\|app.delete\|router.get\|router.post" \
  --include="*.ts" | sort

FOR SERVER ACTIONS:
  grep -rn "'use server'" --include="*.ts" --include="*.tsx" | sort
  — List every exported async function in server action files

BUILD THIS MASTER TABLE:

API_INVENTORY = {
  endpoints: [
    {
      path: "/api/users",
      method: "GET",
      file: "app/api/users/route.ts",
      auth: "required",
      input: { query: "{ search?: string, page?: number, limit?: number }" },
      output: "{ users: User[], total: number, hasMore: boolean }",
      db_tables_read: ["users"],
      db_tables_write: [],
      called_by_ui: ["app/(dashboard)/admin/users/page.tsx"],
    },
    {
      path: "/api/users/[id]",
      method: "GET",
      file: "app/api/users/[id]/route.ts",
      auth: "required",
      input: { params: "{ id: string }" },
      output: "{ user: User }",
      select_fields: ["id", "email", "name", "avatar_url", "role", "created_at"],
      db_tables_read: ["users"],
      db_tables_write: [],
      called_by_ui: ["app/(dashboard)/profile/page.tsx", "components/UserCard.tsx"],
    },
    {
      path: "/api/users/[id]",
      method: "PATCH",
      file: "app/api/users/[id]/route.ts",
      auth: "required + owner",
      input: { body: "{ name?: string, avatar_url?: string }" },
      output: "{ user: User }",
      writable_fields: ["name", "avatar_url"],
      db_tables_read: ["users"],
      db_tables_write: ["users"],
      called_by_ui: ["app/(dashboard)/settings/profile/page.tsx"],
    },
    // ... EVERY endpoint
  ],

  server_actions: [
    {
      name: "updateProfile",
      file: "app/actions/user.ts",
      input: "FormData | { name: string, bio?: string }",
      db_tables_write: ["users"],
      called_by_ui: ["app/(dashboard)/settings/profile/page.tsx"],
    },
    // ... EVERY server action
  ],

  trpc_procedures: [
    // ... if applicable
  ],
}
```

### 0.3 — UI Data Consumption Extraction

```
ACTION: Catalog EVERY UI component and page that displays or mutates data.

FOR EACH PAGE AND DATA-DISPLAYING COMPONENT:

find . -type f \( -name "*.tsx" -o -name "*.jsx" \) \
  | grep -v node_modules | grep -v .next \
  | xargs grep -l "fetch\|useSWR\|useQuery\|trpc\|supabase\|use server\|getServerSide\|getStaticProps\|generateMetadata\|searchParams\|params" \
  | sort

BUILD THIS MASTER TABLE:

UI_INVENTORY = {
  pages: [
    {
      path: "app/(dashboard)/projects/page.tsx",
      route: "/projects",
      data_sources: [
        {
          type: "server_component_fetch",
          endpoint: "/api/projects",
          method: "GET",
          fields_displayed: ["id", "name", "status", "created_at", "owner.name", "owner.avatar_url"],
          fields_missing_from_display: [],  // fields fetched but not shown
          fields_displayed_but_not_fetched: [],  // 🔴 PHANTOM DATA
        }
      ],
      mutations: [
        {
          action: "delete_project",
          endpoint: "/api/projects/[id]",
          method: "DELETE",
          trigger_ui: "DeleteButton in ProjectCard",
          confirmation: true,
          optimistic_update: false,
          cache_invalidation: true,
        }
      ],
      forms: [],
      search_filters: [
        { param: "status", type: "select", options: ["active", "archived", "draft"], bound_to: "query.status" },
        { param: "search", type: "text", bound_to: "query.search" },
      ],
    },
    // ... EVERY page
  ],

  forms: [
    {
      component: "app/(dashboard)/projects/new/page.tsx",
      route: "/projects/new",
      submit_endpoint: "/api/projects",
      submit_method: "POST",
      fields: [
        { name: "name", type: "text", required: true, max_length: 255, db_column: "projects.name" },
        { name: "description", type: "textarea", required: false, db_column: "projects.description" },
        { name: "status", type: "select", options: ["draft", "active"], db_column: "projects.status" },
        { name: "start_date", type: "date", required: false, db_column: "projects.start_date" },
        { name: "budget", type: "number", required: false, db_column: "projects.budget" },
        { name: "client_id", type: "select_async", source: "/api/clients", db_column: "projects.client_id" },
      ],
      validation_schema: "createProjectSchema (zod)",
      redirect_after: "/projects/[id]",
      error_handling: "inline field errors + toast",
    },
    // ... EVERY form
  ],
}
```

---

## PHASE 1: DATABASE → ORM WIRE VALIDATION

```
VERIFY EVERY DATABASE COLUMN IS REPRESENTED IN THE ORM LAYER.

FOR EACH TABLE IN DATABASE_INVENTORY:

1. Open the corresponding ORM model/schema file
2. Compare column-by-column:

   DB COLUMN EXISTS → ORM FIELD EXISTS?
   ├── ✅ YES, types match → PASS
   ├── ⚠️ YES, types mismatch → FIX type mapping
   ├── 🔴 NO, column exists in DB but not in ORM → ADD to ORM or document why excluded
   └── 🔴 ORM field exists but no DB column → REMOVE from ORM or add migration

3. Compare relations:
   DB FOREIGN KEY → ORM RELATION DEFINED?
   ├── ✅ YES, correct → PASS
   ├── 🔴 FK exists but no ORM relation → ADD relation to ORM
   └── 🔴 ORM relation exists but no FK → ADD migration or fix ORM

4. Verify enum alignment:
   DB ENUM VALUES === ORM ENUM VALUES?
   ├── ✅ Match → PASS
   └── 🔴 Mismatch → SYNC (add migration or update ORM)

5. Verify defaults:
   DB DEFAULT === ORM DEFAULT?
   ├── ✅ Match → PASS
   └── ⚠️ Mismatch → SYNC

CRITICAL CHECK — FIELD NAME MAPPING:
Verify the ORM field name maps correctly to the DB column name.
Common failure: ORM uses camelCase, DB uses snake_case.
The mapping must be explicit and tested:

  DB: avatar_url → ORM: avatarUrl → @map("avatar_url") // Prisma
  DB: stripe_customer_id → ORM: stripeCustomerId → @map("stripe_customer_id")
  DB: created_at → ORM: createdAt → @map("created_at")

  If ANY mapping is missing or incorrect, queries will silently fail
  or return undefined. This is a CRITICAL violation.

OUTPUT: Table showing every DB column ↔ ORM field mapping with status.
```

---

## PHASE 2: ORM → API ENDPOINT WIRE VALIDATION

```
VERIFY EVERY ORM FIELD THAT SHOULD BE EXPOSED IS REACHABLE VIA API.

FOR EACH TABLE, DETERMINE FIELD EXPOSURE REQUIREMENTS:

FIELD CATEGORIES:
  PUBLIC_READ    — Returned in list and detail API responses
  PRIVATE_READ   — Returned only to the resource owner or admin
  SERVER_ONLY    — Never sent to client (secrets, internal IDs)
  WRITE_PUBLIC   — Settable by the resource owner via API
  WRITE_ADMIN    — Settable only by admin via API
  COMPUTED       — Derived from other fields, not stored (or stored as cache)
  SYSTEM         — Managed by system only (created_at, updated_at, etc.)

FOR EACH TABLE, BUILD THIS MATRIX:

┌──────────────────────┬──────────────┬─────────────┬──────────────┬──────────────┐
│ ORM Field            │ Exposure     │ READ Via     │ WRITE Via    │ Status       │
├──────────────────────┼──────────────┼─────────────┼──────────────┼──────────────┤
│ id                   │ PUBLIC_READ  │ GET /users   │ N/A (system) │ ✅           │
│ email                │ PRIVATE_READ │ GET /users/me│ PATCH /users │ ✅           │
│ name                 │ PUBLIC_READ  │ GET /users   │ PATCH /users │ ✅           │
│ avatarUrl            │ PUBLIC_READ  │ ❌ MISSING   │ ❌ MISSING   │ 🔴 UNWIRED  │
│ hashedPassword       │ SERVER_ONLY  │ ❌ (correct) │ Special flow │ ✅           │
│ stripeCustomerId     │ SERVER_ONLY  │ ❌ (correct) │ N/A (system) │ ✅           │
│ role                 │ PUBLIC_READ  │ GET /users   │ PATCH (admin)│ ✅           │
│ bio                  │ PUBLIC_READ  │ GET /users   │ PATCH /users │ ✅           │
│ onboardingCompleted  │ PRIVATE_READ │ ❌ MISSING   │ ❌ MISSING   │ 🔴 UNWIRED  │
│ lastLoginAt          │ PRIVATE_READ │ ❌ MISSING   │ N/A (system) │ 🔴 UNWIRED  │
│ createdAt            │ PUBLIC_READ  │ GET /users   │ N/A (system) │ ✅           │
│ updatedAt            │ SYSTEM       │ GET /users   │ N/A (system) │ ✅           │
└──────────────────────┴──────────────┴─────────────┴──────────────┴──────────────┘

FOR EACH 🔴 UNWIRED FIELD:

Determine: Should this field be exposed?
├── YES → Trace the full required path and implement:
│         1. Add to SELECT clause in query
│         2. Add to response type/schema
│         3. Add to API route handler return
│         4. Add to mutation handler input validation (if writable)
│         5. Continue to Phase 3 (API → UI)
│
└── NO → Document WHY with comment in schema:
          // @wire-audit: not exposed — internal tracking only
          // @wire-audit: not exposed — populated by webhook handler only

CRITICAL — SELECT FIELD VERIFICATION:

Open every API route handler and verify the SELECT/include clause:

❌ DANGEROUS (selects everything including secrets):
const user = await db.user.findUnique({ where: { id } });
return NextResponse.json(user);  // LEAKS hashedPassword, stripeCustomerId

✅ SAFE (explicit select):
const user = await db.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    avatarUrl: true,
    role: true,
    bio: true,
    createdAt: true,
  },
});
return NextResponse.json({ user });

FOR EVERY API RESPONSE:
□ Verify no SERVER_ONLY fields are leaked
□ Verify all PUBLIC_READ fields are included
□ Verify PRIVATE_READ fields only returned to authorized users
□ Verify response type matches actual returned data

CRITICAL — MUTATION FIELD VERIFICATION:

Open every POST/PUT/PATCH/DELETE handler and verify:

1. INPUT VALIDATION matches writable fields:
   const schema = z.object({
     name: z.string().max(255).optional(),
     bio: z.string().max(1000).optional(),
     avatarUrl: z.string().url().optional(),
   });
   
   ❌ MISSING: If the DB has a field, the ORM has it, the UI form has it,
      but the PATCH handler doesn't accept it → THE WRITE WIRE IS BROKEN

   ❌ DANGEROUS: If the handler accepts fields it shouldn't:
      role, stripeCustomerId, hashedPassword → MASS ASSIGNMENT VULNERABILITY

2. WRITE OPERATION includes the field:
   await db.user.update({
     where: { id },
     data: {
       name: validated.name,
       bio: validated.bio,
       avatarUrl: validated.avatarUrl,  // ← If missing, form submits but doesn't save
     },
   });

3. RESPONSE after mutation returns updated data:
   The API must return the updated record so the UI can update without refetching.
```

---

## PHASE 3: API ENDPOINT → UI FETCH WIRE VALIDATION

```
VERIFY EVERY API ENDPOINT IS CALLED BY AT LEAST ONE UI CONSUMER.
VERIFY EVERY UI DATA DISPLAY IS FED BY A REAL API CALL.

3.1 — ORPHANED ENDPOINT DETECTION

For each endpoint in API_INVENTORY, search the entire frontend:

grep -rn "[endpoint_path]" --include="*.ts" --include="*.tsx" \
  | grep -v node_modules | grep -v "route.ts"

AND for tRPC:
grep -rn "[procedure_name]" --include="*.ts" --include="*.tsx" \
  | grep -v node_modules | grep -v "router.ts"

AND for server actions:
grep -rn "[action_function_name]" --include="*.ts" --include="*.tsx" \
  | grep -v node_modules

CLASSIFICATION:
├── ✅ CALLED — Endpoint is consumed by UI or another service
├── ⚠️ INTERNAL ONLY — Called by other API routes or webhooks (document)
├── ⚠️ SCHEDULED — Called by cron jobs or background workers (document)
├── 🔴 ORPHANED — No consumer found anywhere → DELETE or WIRE UP
└── 🔴 PARTIALLY ORPHANED — Some HTTP methods used, others not

FOR EVERY ORPHANED ENDPOINT:
  Determine: Should this endpoint exist?
  ├── YES → Identify the UI page that should call it and wire it up
  └── NO → DELETE the endpoint and its tests

3.2 — PHANTOM DATA DETECTION (UI displays data that isn't fetched)

For each page in UI_INVENTORY, trace every data binding:

OPEN THE PAGE FILE. For every piece of dynamic data displayed:

  {user.name}           → WHERE does `user` come from?
  {project.status}      → WHICH fetch provides `project`?
  {formatDate(item.createdAt)} → IS `createdAt` in the API response?
  {stats.totalRevenue}  → WHICH endpoint returns `totalRevenue`?

TRACE THE CHAIN:
  UI renders {user.avatarUrl}
  ↓
  `user` comes from useQuery({ queryKey: ['user', id] })
  ↓
  Query function calls fetch('/api/users/' + id)
  ↓
  /api/users/[id] handler returns: { id, email, name, role, createdAt }
  ↓
  🔴 PHANTOM: avatarUrl is NOT in the API response
  → The UI will render `undefined` or crash

FOR EVERY PIECE OF DATA RENDERED IN THE UI:

□ Trace to the fetch/query that provides it
□ Verify the field exists in the API response
□ Verify the field name matches exactly (camelCase alignment)
□ Verify the field type is compatible (string rendered as string, date formatted, etc.)
□ Verify null/undefined is handled (what shows when the field is empty?)

COMMON PHANTOM DATA PATTERNS:

🔴 PHANTOM — Field renamed in API but not in UI:
  API returns: { firstName, lastName }
  UI renders: {user.name}  // undefined — field is now firstName

🔴 PHANTOM — Relation not included in query:
  API returns: { id, name, projectId }  // no project object
  UI renders: {task.project.name}  // crashes: cannot read 'name' of undefined

🔴 PHANTOM — Aggregation not computed:
  UI renders: {project.taskCount}
  API returns project without _count aggregation

🔴 PHANTOM — Nested field not selected:
  API: select: { owner: { select: { id: true, name: true } } }
  UI: {project.owner.avatarUrl}  // not selected → undefined

🔴 PHANTOM — Enum value mismatch:
  DB enum: 'in_progress'
  UI checks: status === 'inProgress'  // never matches

🔴 PHANTOM — Date not serialized:
  API returns Date object via server component
  UI tries: new Date(item.createdAt) on already-Date object

3.3 — DATA FRESHNESS VERIFICATION

For every data display in the UI:

□ After a mutation, does the UI update?
  ├── Optimistic update (instant) → Verify rollback on error
  ├── Cache invalidation (refetch) → Verify correct query key invalidated
  ├── Server component revalidation → Verify revalidatePath/revalidateTag called
  └── 🔴 STALE — UI doesn't update after mutation → WIRE the invalidation

□ After another user's mutation, does the UI update? (if realtime)
  ├── Realtime subscription → Verify subscription matches the data query
  ├── Polling → Verify interval is appropriate
  └── Manual refresh only → Acceptable for non-collaborative data

COMMON STALENESS BUGS:

🔴 STALE — Wrong query key invalidated:
  Mutation invalidates: ['projects']
  But the page queries: ['project', id]  // singular, specific — not invalidated

🔴 STALE — Server action doesn't revalidate:
  async function updateProject(data) {
    await db.project.update(...);
    // Missing: revalidatePath('/projects') or revalidateTag('projects')
  }

🔴 STALE — Optimistic update doesn't match server shape:
  Optimistic: { ...old, name: newName }
  Server returns: { ...project, updatedAt: new Date() }  // updatedAt not in optimistic
```

---

## PHASE 4: UI FORM → API MUTATION → DATABASE WRITE VALIDATION

```
VERIFY EVERY FORM FIELD WRITES THROUGH TO THE DATABASE.

FOR EACH FORM IN UI_INVENTORY:

4.1 — FORM FIELD → API INPUT MAPPING

┌────────────────────┬───────────────────┬──────────────────┬──────────────┬──────────┐
│ Form Field         │ Field Name in     │ Zod Schema       │ API Handler  │ DB Write │
│ (UI)               │ FormData/Payload  │ Validation       │ Accepts      │ Includes │
├────────────────────┼───────────────────┼──────────────────┼──────────────┼──────────┤
│ "Project Name"     │ name              │ ✅ z.string()    │ ✅ data.name │ ✅ name  │
│ input              │                   │    .max(255)     │              │          │
├────────────────────┼───────────────────┼──────────────────┼──────────────┼──────────┤
│ "Description"      │ description       │ ✅ z.string()    │ ✅           │ ✅       │
│ textarea           │                   │    .optional()   │              │          │
├────────────────────┼───────────────────┼──────────────────┼──────────────┼──────────┤
│ "Start Date"       │ startDate         │ ✅ z.string()    │ ✅           │ ❌ MISS  │
│ date picker        │                   │    .datetime()   │              │          │
├────────────────────┼───────────────────┼──────────────────┼──────────────┼──────────┤
│ "Budget"           │ budget            │ ❌ MISSING       │ ❌ MISSING   │ ❌ MISS  │
│ number input       │                   │ from schema      │              │          │
├────────────────────┼───────────────────┼──────────────────┼──────────────┼──────────┤
│ "Client"           │ clientId          │ ✅ z.string()    │ ✅           │ ✅       │
│ async select       │                   │    .uuid()       │              │          │
├────────────────────┼───────────────────┼──────────────────┼──────────────┼──────────┤
│ "Tags"             │ tags              │ ✅ z.array()     │ ✅           │ 🔴 WRONG │
│ multi-select       │                   │                  │              │ (see V-) │
└────────────────────┴───────────────────┴──────────────────┴──────────────┴──────────┘

🔴 BROKEN WIRES FOUND:
[V-001] "Start Date" field: User enters date, API receives it, but
        db.project.create() doesn't include startDate in the data object.
        FILE: app/api/projects/route.ts LINE: 34
        FIX: Add startDate: validated.startDate to create data

[V-002] "Budget" field: Exists in UI form but is NOT in the Zod schema,
        NOT in the API handler, and NOT written to DB.
        FULL WIRE REQUIRED:
        1. Add to schema: budget: z.number().min(0).optional()
        2. Add to handler: budget: validated.budget
        3. Verify DB column exists: projects.budget (decimal)

[V-003] "Tags" field: Written as array of strings but DB expects
        junction table entries (project_tags). Handler writes tags
        as JSON string to a text column instead of creating relations.
        FIX: Implement proper many-to-many write through junction table.

4.2 — EDIT FORM PRE-POPULATION VERIFICATION

For every EDIT form (as opposed to CREATE):

□ Form is pre-populated with existing data on load
□ Every field shows the current value from the API
□ No field shows a stale or default value when editing
□ File/image fields show the current file (not empty upload input)
□ Multi-select fields show all currently selected values
□ Date fields parse and display the current date correctly
□ Rich text fields render existing HTML/markdown content

TRACE THE PRE-POPULATION CHAIN:
  Page loads → fetch GET /api/projects/[id] → response includes all editable fields
  → form defaultValues set from response → each field rendered with current value

COMMON PRE-POPULATION BUGS:

🔴 Form uses defaultValues but data loads async — form renders with empty defaults
   then data arrives but defaultValues don't update (react-hook-form: use reset())

🔴 Select field shows value "active" but the display label says "Select status..."
   because the option matching logic doesn't match server value format

🔴 Date field receives "2025-03-15T00:00:00.000Z" but the date input expects
   "2025-03-15" — parsing/formatting mismatch

🔴 Rich text editor receives HTML but the editor component expects Markdown
   or a custom JSON format — content renders as raw HTML strings

4.3 — FORM VALIDATION ALIGNMENT

THE VALIDATION CHAIN MUST BE CONSISTENT AT ALL THREE LAYERS:

LAYER 1 — UI (form validation):
  react-hook-form + zod resolver
  Shows inline errors before submission

LAYER 2 — API (input validation):
  Zod schema on the server
  Returns 400 with field-level errors

LAYER 3 — DATABASE (constraints):
  NOT NULL, CHECK, UNIQUE, FK constraints
  Returns constraint violation errors

VERIFY ALIGNMENT:

□ Required in UI form → required in API schema → NOT NULL in DB
□ Max length in UI → max length in API schema → VARCHAR(n) in DB
□ Min/max number in UI → min/max in API schema → CHECK constraint in DB
□ Email format in UI → .email() in API schema → (app-level only, no DB check)
□ Unique in UI (checked async) → unique check in API → UNIQUE constraint in DB
□ Enum options in UI select → .enum() in API schema → ENUM type in DB

❌ MISALIGNMENT EXAMPLES:

🔴 UI allows 500 char name, API allows 255, DB column is VARCHAR(100)
   → User submits 200 chars, passes UI, passes API, CRASHES at DB

🔴 UI marks field optional, API schema marks required
   → User skips field, submits, gets unexpected 400 error

🔴 UI offers enum options ["draft", "active", "archived"]
   API schema accepts ["draft", "active", "completed"]
   DB enum has ['draft', 'active', 'completed', 'archived']
   → UI shows option that API rejects; DB has value UI can't display

4.4 — ERROR PROPAGATION VERIFICATION

When validation fails at ANY layer, verify the error reaches the user:

□ API returns 400 with field-level errors → UI displays errors on correct fields
□ API returns 409 (conflict/duplicate) → UI shows appropriate message
□ API returns 422 (unprocessable) → UI shows appropriate message
□ API returns 500 → UI shows generic error (not raw stack trace)
□ DB constraint violation → API catches, translates to 400/409 → UI displays
□ Network failure → UI shows retry option or offline message
□ Timeout → UI shows timeout message with retry

VERIFY THE ERROR SHAPE IS CONSISTENT:

// API error response format:
{
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid input",
    details: {
      name: "Name is required",
      email: "Email is already in use",
      budget: "Budget must be a positive number",
    }
  }
}

// UI error handling:
const { error } = await submitForm(data);
if (error?.details) {
  Object.entries(error.details).forEach(([field, message]) => {
    form.setError(field, { message });  // ← Sets error on the CORRECT field
  });
}

🔴 COMMON FAILURE: API returns field errors but UI shows only a generic toast
   because the error parsing doesn't extract field-level details.
```

---

## PHASE 5: RELATIONSHIP & JOIN WIRE VALIDATION

```
VERIFY EVERY DATABASE RELATIONSHIP IS PROPERLY WIRED THROUGH ALL LAYERS.

FOR EACH RELATION IN THE SCHEMA:

5.1 — ONE-TO-MANY RELATIONS

Example: User has many Projects

DB:
  projects.owner_id → users.id (FK)

ORM:
  User model: projects Project[]
  Project model: owner User @relation(fields: [ownerId], references: [id])

API (READ — list projects with owner):
  GET /api/projects → includes owner: { select: { id, name, avatarUrl } }
  □ Verify the include/join is in the query
  □ Verify the owner data is in the response type
  □ Verify N+1 is prevented (single query with join, not loop of queries)

API (WRITE — create project with owner):
  POST /api/projects → sets ownerId from authenticated user
  □ Verify ownerId is set server-side (NOT from client request body)
  □ Verify ownerId references a real user (FK constraint)

UI (DISPLAY):
  □ ProjectCard shows owner name and avatar
  □ Owner name links to owner profile
  □ If owner is null (orphaned), graceful fallback shown

UI (FILTER):
  □ "My Projects" filter works (ownerId === currentUser.id)
  □ "All Projects" shows projects from all owners (if permitted)
  □ Filter persists in URL params

5.2 — MANY-TO-MANY RELATIONS

Example: Projects have many Tags, Tags have many Projects

DB:
  project_tags (project_id, tag_id) — junction table

ORM:
  Project model: tags Tag[] (via ProjectTag)
  Tag model: projects Project[] (via ProjectTag)

API (READ):
  GET /api/projects/[id] → includes tags: [{ id, name, color }]
  □ Verify tags are included in the response
  □ Verify the junction table query is efficient

API (WRITE — set tags on project):
  PATCH /api/projects/[id] → body: { tagIds: ["uuid1", "uuid2"] }
  □ Verify handler performs a SET operation (delete old + insert new)
    OR a DIFF operation (add missing, remove extra)
  □ Verify orphan junction rows are cleaned up
  □ Verify tag IDs are validated (exist in tags table)
  □ Verify transaction wraps the multi-table write

UI (DISPLAY):
  □ Tags rendered as badges on project card
  □ Tag colors rendered correctly
  □ Empty state when no tags ("No tags")

UI (EDIT):
  □ Multi-select shows all available tags
  □ Currently assigned tags are pre-selected
  □ Adding/removing tags submits correctly
  □ Optimistic update works (tag appears/disappears immediately)

5.3 — ONE-TO-ONE RELATIONS

Example: User has one Profile

DB:
  profiles.user_id → users.id (FK, UNIQUE)

VERIFY:
  □ Profile created when user is created (or created lazily on first access)
  □ Profile fetched with user when needed (include or join)
  □ Profile fields editable through user settings form
  □ Deleting user cascades to profile (or explicitly handled)

5.4 — SELF-REFERENTIAL RELATIONS

Example: Comments have replies (parent_comment_id → comments.id)

VERIFY:
  □ Infinite nesting handled (max depth or flat with indentation)
  □ Deleting parent handles children (cascade, orphan, or soft delete)
  □ API returns nested structure or flat list with parentId
  □ UI renders thread/tree structure correctly
  □ Reply form submits with correct parentId

5.5 — POLYMORPHIC RELATIONS

Example: Comments belong to either Project OR Task (commentable_type + commentable_id)

VERIFY:
  □ Both type and ID columns are set on create
  □ Query correctly filters by type AND id
  □ UI shows correct context ("on Project: X" vs "on Task: Y")
  □ Type column uses enum, not free-text string
```

---

## PHASE 6: DATA VIEW COMPLETENESS AUDIT

```
EVERY "VIEW" OF DATA IN THE UI MUST BE COMPLETE AND FUNCTIONAL.

6.1 — LIST VIEW AUDIT

For every list/table view in the application:

□ DATA LOADING:
  □ Loading skeleton shown while data fetches
  □ Error state shown if fetch fails (with retry button)
  □ Empty state shown if no results (with clear CTA)
  □ Empty state shown if filters exclude all results (with "clear filters" link)

□ DATA DISPLAY:
  □ Every column/field in the list is wired to real data
  □ No columns show "undefined", "null", "NaN", or "[object Object]"
  □ Dates formatted consistently (relative or absolute, not raw ISO)
  □ Numbers formatted (currency, percentage, locale-appropriate)
  □ Enum values displayed as human-readable labels (not DB values)
  □ Boolean values displayed as icons/badges (not "true"/"false")
  □ Null/empty values show dash (—) or appropriate placeholder
  □ Long text truncated with ellipsis and tooltip or expand
  □ User references show name + avatar (not raw IDs)
  □ Status values show colored badge (not plain text)

□ SORTING:
  □ At least one default sort (usually createdAt desc)
  □ Sort indicator shown on active column
  □ Sort persists in URL params
  □ Sort parameter sent to API (not client-side sort on partial data)
  □ API handler applies sort to database query
  □ Sort direction toggles on click (asc ↔ desc)

□ FILTERING:
  □ Every filter is wired to an API query parameter
  □ API handler applies filter to database query (not fetch-all-then-filter)
  □ Filter values persist in URL params (shareable, bookmarkable)
  □ Active filters shown with clear option
  □ Filter combination works correctly (AND logic)
  □ Filter options are dynamic where needed (loaded from DB, not hardcoded)

□ SEARCH:
  □ Search input debounced (300ms minimum)
  □ Search parameter sent to API
  □ API performs indexed search (not LIKE '%term%' without index)
  □ Search highlights matches (optional but recommended)
  □ Search works across relevant fields (name, description, etc.)
  □ Empty search returns all results

□ PAGINATION:
  □ Pagination implemented (cursor or offset)
  □ Page size configurable or sensible default (10-50)
  □ Current page/position indicated
  □ Total count shown (if available without performance cost)
  □ "Load more" or page controls wired to API with correct params
  □ Navigating to page 2+ works on page refresh (URL params)
  □ Reaching the end is clear (no infinite spinner)

□ BULK ACTIONS (if applicable):
  □ Select all / deselect all works
  □ Selected count displayed
  □ Bulk action submits all selected IDs to API
  □ API handler processes bulk operation in transaction
  □ UI updates for all affected items after bulk action
  □ Confirmation dialog for destructive bulk actions

6.2 — DETAIL VIEW AUDIT

For every detail/show page:

□ All fields from the model are displayed (or consciously omitted)
□ Related data loaded and displayed:
  □ Belongs-to relations shown (e.g., project.owner displayed)
  □ Has-many relations listed (e.g., project.tasks as a table/list)
  □ Many-to-many shown (e.g., project.tags as badges)
□ Timestamps formatted and displayed (created, updated)
□ Status shown with appropriate visual treatment
□ Actions available: Edit, Delete, Archive, etc.
□ Breadcrumb navigation shows context (Projects > Project Name)
□ Page title/metadata reflects the resource name
□ 404 handling if resource doesn't exist
□ 403 handling if user lacks access

6.3 — CREATE/EDIT FORM VIEW AUDIT

For every form view:

□ CREATE form:
  □ All writable fields have form inputs
  □ Required fields marked with asterisk and aria-required
  □ Validation matches API and DB constraints
  □ Submit button disabled while submitting
  □ Submit shows loading indicator
  □ Success redirects to detail view or list
  □ Success shows toast notification
  □ Error shows inline field errors AND/OR toast
  □ Form preserves input on error (doesn't clear)

□ EDIT form:
  □ All editable fields pre-populated with current values
  □ No field is empty when it has a saved value
  □ "Cancel" returns to previous view without saving
  □ "Save" submits only changed fields (PATCH, not PUT of everything)
  □ Optimistic update or refetch after save
  □ Concurrent edit warning (if applicable — last-write-wins or lock)

6.4 — DELETE FLOW AUDIT

For every deletable resource:

□ Delete button exists on detail view and/or list view
□ Confirmation dialog shown before delete
□ Confirmation includes resource name ("Delete project 'My Project'?")
□ Delete sends DELETE request to correct API endpoint
□ API verifies ownership/permissions before deleting
□ API handles cascade (delete children) or reject (has children)
□ UI removes item from list after successful delete
□ UI redirects from detail view to list view after delete
□ Toast notification confirms deletion
□ Undo available within short window (if soft-delete implemented)

6.5 — DASHBOARD / AGGREGATE VIEW AUDIT

For every dashboard or statistics view:

□ Every stat/metric is wired to a real aggregation query
□ Aggregation runs in the database (not in JavaScript after fetch-all)
□ Time range filter works and is applied to the query
□ Charts/graphs receive real data (not mock/placeholder)
□ Chart axes labeled correctly
□ Chart data refreshes when filters change
□ Loading state for each widget/card
□ Error state for each widget/card (independent failures)
□ Stat values formatted correctly (currency, percentage, count)
□ Comparison values calculated correctly (vs. previous period)
□ Empty state for charts with no data in range
```

---

## PHASE 7: REALTIME WIRE VALIDATION

```
IF THE APPLICATION HAS REALTIME FEATURES:

For every realtime subscription in the UI:

□ Subscription channel matches the data being displayed
□ Subscription filters match the current view (e.g., project-specific channel)
□ Incoming realtime events update the correct UI state
□ Incoming events don't duplicate existing data
□ Incoming events from current user are handled (no double-display)
□ Subscription cleans up on component unmount
□ Subscription reconnects on connection loss
□ Subscription re-authenticates on token refresh
□ Optimistic updates don't conflict with realtime updates

FOR EACH REALTIME EVENT TYPE:
┌──────────────────┬──────────────┬──────────────────┬──────────────────┐
│ Event            │ DB Trigger   │ Broadcast Channel│ UI Handler       │
├──────────────────┼──────────────┼──────────────────┼──────────────────┤
│ task.created     │ ✅ INSERT    │ ✅ project:{id}  │ ✅ adds to list  │
│ task.updated     │ ✅ UPDATE    │ ✅ project:{id}  │ ✅ updates item  │
│ task.deleted     │ ✅ DELETE    │ ✅ project:{id}  │ ❌ NOT HANDLED   │
│ comment.created  │ ✅ INSERT    │ ✅ task:{id}     │ ✅ appends       │
│ member.joined    │ ❌ MISSING   │ ❌ MISSING       │ ❌ NOT WIRED     │
└──────────────────┴──────────────┴──────────────────┴──────────────────┘

🔴 BROKEN: task.deleted events are broadcast but UI doesn't remove the task.
🔴 BROKEN: member.joined has no trigger, no broadcast, and no UI handler.
```

---

## PHASE 8: FILE UPLOAD WIRE VALIDATION

```
IF THE APPLICATION HAS FILE UPLOADS:

For every file upload in the UI:

□ Upload input accepts correct file types (accept attribute)
□ Client-side file size validation before upload
□ Upload progress indicator shown
□ Upload sends to correct API endpoint or storage service
□ API validates file type by content (magic bytes)
□ API validates file size server-side
□ File stored with generated key (not user-provided filename)
□ File URL/key stored in correct database column
□ Stored URL is accessible (signed URL or public URL as appropriate)
□ File displays correctly after upload (image preview, file icon, etc.)
□ File can be replaced (new upload updates DB reference)
□ File can be deleted (DB reference cleared + storage file cleaned up)
□ Old file deleted from storage when replaced (no orphan files)

WIRE TRACE:
  UI upload input → FormData/multipart → API route → Storage service → URL returned
  → URL saved to DB column → DB column returned in API response → UI renders file
```

---

## PHASE 9: SEARCH & FILTER WIRE VALIDATION

```
FOR EVERY SEARCH AND FILTER IN THE UI:

9.1 — URL ↔ STATE ↔ API SYNC

The filter state must exist in THREE synchronized locations:
  1. URL search params (shareable, bookmarkable, back-button works)
  2. UI component state (inputs show current filter values)
  3. API request params (server receives and applies filters)

VERIFY THIS CIRCUIT:

User types in search box
  → URL updates: ?search=hello
  → API called with: /api/projects?search=hello
  → Results update in UI

User clicks back button
  → URL reverts to previous params
  → UI inputs update to match URL
  → API called with previous params
  → Results update to match

User shares URL with filters: /projects?status=active&search=hello
  → Recipient loads page
  → UI inputs show status=active and search=hello
  → API called with both params
  → Correct filtered results displayed

🔴 COMMON BREAKAGE:
  - Filters in React state but not in URL → back button doesn't work
  - Filters in URL but not read on page load → shared links show unfiltered
  - Filters sent to API but API ignores them → UI shows filter but data unfiltered
  - Clearing a filter doesn't remove URL param → stale filter after "clear"

9.2 — FILTER OPTION SOURCE VALIDATION

For each filter dropdown/select:

□ Options loaded from API (not hardcoded) when they come from DB data
  (e.g., tag filter options come from GET /api/tags, not a static array)
□ Options include all valid values (no missing enum members)
□ Options match what the API/DB accepts (no invalid options shown)
□ "All" / clear option available
□ Selected option reflected in URL params
□ Option count/badge shown (how many results per option)
```

---

## PHASE 10: WEBHOOK & EXTERNAL EVENT WIRE VALIDATION

```
IF THE APPLICATION RECEIVES WEBHOOKS (Stripe, Auth provider, etc.):

For each webhook endpoint:

□ Webhook handler exists at correct URL
□ Webhook signature verified (Stripe: stripe.webhooks.constructEvent)
□ Every event type handled:

  EVENT                         → DB WRITE              → UI IMPACT
  ─────────────────────────────────────────────────────────────────
  checkout.session.completed    → subscription.create    → Plan badge updates
  invoice.payment_succeeded     → subscription.renew     → Billing page shows payment
  invoice.payment_failed        → subscription.pastDue   → Warning banner shown
  customer.subscription.deleted → subscription.cancel    → Downgrade to free
  user.created (auth webhook)   → user.create in DB      → User can log in
  user.updated (auth webhook)   → user.update in DB      → Profile reflects changes

□ For EACH event → DB write: verify the data mapping is complete
□ For EACH DB write → UI impact: verify the UI reads and displays the updated data
□ If webhook writes to DB and user is viewing that data:
  □ Realtime updates the view, OR
  □ Next page load reflects the change, OR
  □ Polling catches the change within acceptable delay

🔴 COMMON BREAKAGE:
  - Webhook creates subscription record but UI reads from a different table/field
  - Webhook updates status to 'past_due' but UI only checks for 'active' | 'canceled'
  - Webhook runs but UI cache not invalidated → user sees stale data until hard refresh
```

---

## PHASE 11: FINAL WIRE CERTIFICATION

```
COMPLETE THIS CHECKLIST — EVERY ITEM MUST PASS:

DATABASE → ORM:
□ Every DB column has corresponding ORM field
□ Every ORM relation has corresponding FK
□ Field name mapping (snake_case ↔ camelCase) verified
□ Enum values synchronized
□ Defaults synchronized

ORM → API:
□ Every required field exposed via at least one endpoint
□ No SERVER_ONLY fields leaked in responses
□ Every writable field accepted by at least one mutation endpoint
□ Mutation endpoints validate all accepted fields
□ Select/include clauses are explicit (no select-all)

API → UI FETCH:
□ Every API endpoint consumed by at least one UI component
□ No orphaned endpoints
□ Every data field rendered in UI is present in API response
□ No phantom data (UI renders fields not in response)
□ Response shapes match TypeScript interfaces

UI FORM → API MUTATION:
□ Every form field maps to an API input field
□ Every API input field maps to a DB write
□ Validation aligned across all three layers (UI, API, DB)
□ Error propagation works from DB → API → UI
□ Edit forms pre-populate every field correctly

DATA VIEWS:
□ Every list view: loading, error, empty states implemented
□ Every list view: sort, filter, search, pagination wired to API
□ Every detail view: all fields displayed with correct formatting
□ Every form view: all writable fields present with validation
□ Every delete flow: confirmation, API call, UI cleanup
□ Every dashboard: real aggregation queries, not mock data

RELATIONSHIPS:
□ Every one-to-many: parent displayed in child, children listed in parent
□ Every many-to-many: junction table writes and reads work
□ Every self-reference: recursive rendering handles depth
□ No orphaned records possible after any CRUD operation

REALTIME:
□ Every subscription matches displayed data
□ Every realtime event updates UI correctly
□ Subscriptions clean up on unmount

WEBHOOKS:
□ Every webhook event writes to correct DB table
□ Every webhook-written value is readable and displayable in UI

CACHE / FRESHNESS:
□ Every mutation invalidates related caches
□ Every server action revalidates affected paths
□ No stale data persists after any write operation
□ URL filter state, UI state, and API params are synchronized
```

---

## WIRE CERTIFICATION SCORECARD

```
╔══════════════════════════════════════════════════════════════╗
║           FULL-WIRE CERTIFICATION SCORECARD                 ║
╠══════════════════════════════════════╦═════════╦════════════╣
║ WIRE LAYER                           ║ SCORE   ║ STATUS     ║
╠══════════════════════════════════════╬═════════╬════════════╣
║ DB → ORM Column Mapping             ║   /100  ║            ║
║ DB → ORM Relation Mapping           ║   /100  ║            ║
║ DB → ORM Enum/Default Sync          ║   /100  ║            ║
║ ORM → API Read Exposure             ║   /100  ║            ║
║ ORM → API Write Acceptance          ║   /100  ║            ║
║ API → UI Fetch Binding              ║   /100  ║            ║
║ API → UI Phantom Data (zero)        ║   /100  ║            ║
║ UI Form → API Input Mapping         ║   /100  ║            ║
║ API Input → DB Write Mapping        ║   /100  ║            ║
║ Validation Alignment (UI/API/DB)    ║   /100  ║            ║
║ Error Propagation (DB → UI)         ║   /100  ║            ║
║ Edit Form Pre-population            ║   /100  ║            ║
║ List View Completeness              ║   /100  ║            ║
║ Detail View Completeness            ║   /100  ║            ║
║ Create Form Completeness            ║   /100  ║            ║
║ Edit Form Completeness              ║   /100  ║            ║
║ Delete Flow Completeness            ║   /100  ║            ║
║ Dashboard/Aggregate Wiring          ║   /100  ║            ║
║ Sort/Filter/Search Wiring           ║   /100  ║            ║
║ Pagination Wiring                   ║   /100  ║            ║
║ URL ↔ State ↔ API Sync              ║   /100  ║            ║
║ Relationship Wiring (1:N)           ║   /100  ║            ║
║ Relationship Wiring (M:N)           ║   /100  ║            ║
║ Relationship Wiring (Self-ref)      ║   /100  ║            ║
║ File Upload Wiring                  ║   /100  ║            ║
║ Realtime Event Wiring               ║   /100  ║            ║
║ Webhook → DB → UI Wiring            ║   /100  ║            ║
║ Cache Invalidation Completeness     ║   /100  ║            ║
║ Orphaned Endpoint Detection         ║   /100  ║            ║
║ Dead DB Field Detection             ║   /100  ║            ║
╠══════════════════════════════════════╬═════════╬════════════╣
║ OVERALL WIRE SCORE                   ║   /100  ║            ║
╠══════════════════════════════════════╩═════════╩════════════╣
║                                                              ║
║ CERTIFICATION: [ FULLY WIRED / PARTIAL / DISCONNECTED ]      ║
║                                                              ║
║ PHANTOM DATA POINTS (UI shows data from nowhere): [must = 0] ║
║ DEAD DB FIELDS (stored but never displayed): [list + justify] ║
║ ORPHANED ENDPOINTS (exist but never called): [must = 0]       ║
║ BROKEN FORM FIELDS (input exists, write doesn't): [must = 0]  ║
║ BROKEN READS (DB has data, UI doesn't show it): [list]        ║
║ STALE DATA PATHS (mutation doesn't refresh UI): [must = 0]    ║
║ BROKEN RELATIONSHIPS (FK exists, not loaded in UI): [list]    ║
║                                                              ║
║ MINIMUM SCORE TO CERTIFY: 95 per layer                       ║
║ MINIMUM OVERALL TO CERTIFY: 95                               ║
║ PHANTOM DATA POINTS ALLOWED: 0                               ║
║ BROKEN FORM FIELDS ALLOWED: 0                                ║
║ STALE DATA PATHS ALLOWED: 0                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## EXECUTION PROTOCOL

**When you receive a codebase to audit with this prompt:**

1. **Phase 0**: Extract complete database schema, catalog every API endpoint, map every UI data consumer. Build all three inventories before tracing a single wire.

2. **Phase 1**: DB → ORM. Open the schema file. Open every migration. Compare column-by-column. Every mismatch is a violation.

3. **Phase 2**: ORM → API. Open every API route. Check the SELECT clause. Check the response shape. Check the input schema. Map field-by-field.

4. **Phase 3**: API → UI. Open every page and data component. Trace every `{variable.field}` back to its fetch. If the fetch doesn't include the field, it's phantom.

5. **Phase 4**: UI Form → API → DB. Open every form. Trace every input field through submission to the API to the database write. If any link is broken, the form is broken.

6. **Phase 5**: Relationships. Trace every FK through includes/joins in the API through to the UI rendering of related data.

7. **Phase 6**: Data views. Verify every list, detail, form, delete, and dashboard view is complete with all states (loading, error, empty, populated).

8. **Phase 7**: Realtime. Trace every subscription from trigger to broadcast to UI handler.

9. **Phase 8**: File uploads. Trace from UI input through storage through DB through display.

10. **Phase 9**: Search/filter. Verify URL ↔ state ↔ API sync for every filterable view.

11. **Phase 10**: Webhooks. Trace every external event through DB write through UI display.

12. **Phase 11**: Complete the final checklist and produce the scorecard.

**For every broken wire:**
- Report exact file paths and line numbers on BOTH ends of the break
- Show exactly what's missing
- Write the exact code to complete the circuit
- Apply the fix

**You are not done until every wire has been traced end-to-end and the scorecard reads 95+ across every layer.**

**If the circuit is broken, the system doesn't ship.**

---

*GHXSTSHIP Industries LLC — Every Field. Every Endpoint. Every Pixel. Fully Wired.*
*Full-Wire Validation Protocol v1.0 — Zero Dead Ends, Zero Phantom Data, Zero Broken Forms*