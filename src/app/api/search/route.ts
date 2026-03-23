import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * GET /api/search?q=<query>&limit=20
 *
 * Gap #35: Cross-entity search across projects, tasks, contacts, deals, documents, etc.
 * Returns unified results with entity type, name, and URL.
 */

interface SearchResult {
    id: string;
    type: string;
    name: string;
    subtitle?: string | undefined;
    url: string;
}

const SEARCHABLE_ENTITIES = [
    { table: "projects", nameCol: "name", slug: "projects", label: "Project" },
    { table: "tasks", nameCol: "title", slug: "tasks", label: "Task" },
    { table: "deals", nameCol: "title", slug: "deals", label: "Deal" },
    { table: "leads", nameCol: "first_name", slug: "leads", label: "Lead" },
    { table: "opportunities", nameCol: "name", slug: "opportunities", label: "Opportunity" },
    { table: "companies", nameCol: "name", slug: "companies", label: "Company" },
    { table: "contacts", nameCol: "first_name", slug: "contacts", label: "Contact" },
    { table: "contracts", nameCol: "title", slug: "contracts", label: "Contract" },
    { table: "proposals", nameCol: "title", slug: "proposals", label: "Proposal" },
    { table: "invoices", nameCol: "description", slug: "invoices", label: "Invoice" },
    { table: "events", nameCol: "name", slug: "events", label: "Event" },
    { table: "documents", nameCol: "title", slug: "documents", label: "Document" },
    { table: "assets", nameCol: "name", slug: "assets", label: "Asset" },
    { table: "vendors", nameCol: "name", slug: "vendors", label: "Vendor" },
    { table: "crew_members", nameCol: "display_name", slug: "crew", label: "Crew" },
    { table: "campaigns", nameCol: "name", slug: "campaigns", label: "Campaign" },
    { table: "incidents", nameCol: "title", slug: "incidents", label: "Incident" },
    { table: "knowledge_articles", nameCol: "title", slug: "knowledge-base", label: "Article" },
] as const;

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/search",
        rbac: { resource: "dashboard", action: "read" },
    },
    async (request, { supabase, orgId }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get("q")?.trim();
        const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 50);

        if (!q || q.length < 2) {
            return NextResponse.json({ data: [] });
        }

        const results: SearchResult[] = [];

        // Run all entity searches in parallel (each limited to 3 results)
        const promises = SEARCHABLE_ENTITIES.map(async (entity) => {
            try {
                const { data } = await serverFromTable(supabase, entity.table)
                    .select(`id, ${entity.nameCol}`)
                    .eq("organization_id", orgId)
                    .ilike(entity.nameCol, `%${q}%`)
                    .limit(3);

                if (data) {
                    for (const row of data as Array<Record<string, unknown>>) {
                        results.push({
                            id: row.id as string,
                            type: entity.label,
                            name: String(row[entity.nameCol] ?? row.id),
                            url: `/${entity.slug}/${row.id}`,
                        });
                    }
                }
            } catch {
                // Skip entities that fail (e.g., missing org_id column)
            }
        });

        await Promise.all(promises);

        // Sort by relevance (exact prefix match first, then contains)
        const lower = q.toLowerCase();
        results.sort((a, b) => {
            const aPrefix = a.name.toLowerCase().startsWith(lower) ? 0 : 1;
            const bPrefix = b.name.toLowerCase().startsWith(lower) ? 0 : 1;
            return aPrefix - bPrefix;
        });

        return NextResponse.json({ data: results.slice(0, limit) });
    }
);
