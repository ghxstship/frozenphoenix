---
description: MANDATORY — No backward compatibility shims. Always implement the correct canonical solution.
---

# No Backward Compatibility — MANDATORY RULE

## Core Principle

When a database column, field, or interface property is removed, migrated, or replaced:

1. **DELETE it from all type interfaces.** Do NOT mark it `@deprecated`. Do NOT make it optional. REMOVE it entirely.
2. **UPDATE all references** in application code to use the new canonical source (e.g., junction table, new column, relation embedding).
3. **NEVER use fallback patterns** like `?? []`, `?? undefined`, or optional chaining to "survive" a missing field. If the field is gone, the code that used it must be rewritten to use the replacement.
4. **NEVER preserve old field names** "for backward compatibility." The old field does not exist. Code that references it is broken and must be fixed.

## Anti-Patterns (NEVER DO THESE)

```typescript
// ❌ WRONG: Marking as deprecated/optional
/** @deprecated Now stored in junction table */
approver_ids?: string[];

// ❌ WRONG: Fallback to empty array
const ids = (flag.target_user_ids ?? []).includes(userId);

// ❌ WRONG: Keeping field in interface "just in case"
mentioned_user_ids?: string[];
```

## Correct Patterns

```typescript
// ✅ RIGHT: Remove field from interface entirely
// (approver_ids is gone — not in interface at all)

// ✅ RIGHT: Query the junction table
const { data: approvers } = useQuery({
  queryKey: ["brief_approvers", briefId],
  queryFn: () => supabase.from("brief_approvers").select("user_id").eq("brief_id", briefId),
});

// ✅ RIGHT: Use relation embedding in PostgREST selects
selectDetail: "*, brief_approvers(user_id), brief_reviewers(user_id)";
```

## Scope

This rule applies to:

- TypeScript interfaces and types
- Zod schemas
- API route handlers
- Database types (generated or manual)
- Any code that references removed database columns
