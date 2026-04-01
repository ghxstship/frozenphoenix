import { type NextRequest, NextResponse } from "next/server";
import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createCollectionRoute } from "@/lib/api/crud-factory";
import { COLLECTION_ROUTES } from "@/lib/api/route-registry";

/**
 * Catch-all API collection route for config-driven CRUD entities.
 *
 * Handles GET (list) and POST (create) for any entity registered in
 * the route registry. Custom API routes (advancing, auth, conversations,
 * etc.) live in their own explicit directories and are unaffected.
 *
 * URL pattern: /api/entities/[entity]
 *
 * Supports ?mode=lookup for lightweight dropdown queries that use the
 * entity's selectLookup (flat columns, no FK joins) instead of selectList.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    const { entity: slug } = await params;
    const routeConfig = COLLECTION_ROUTES[slug];
    if (!routeConfig) {
        return NextResponse.json({ error: `Unknown entity: ${slug}` }, { status: 404 });
    }

    const config = getEntityCrudConfig(routeConfig.entity);

    // When mode=lookup, swap selectList for the entity's lean selectLookup.
    // This avoids expensive FK joins that can fail on missing relations.
    const isLookup = new URL(request.url).searchParams.get("mode") === "lookup";
    const handlers = createCollectionRoute({
        ...config,
        filters: routeConfig.filters,
        ...(isLookup ? { selectList: config.selectLookup, maxPerPage: 500 } : {}),
    });

    return handlers.GET(request);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string }> }
) {
    const { entity: slug } = await params;
    const routeConfig = COLLECTION_ROUTES[slug];
    if (!routeConfig) {
        return NextResponse.json({ error: `Unknown entity: ${slug}` }, { status: 404 });
    }

    const config = getEntityCrudConfig(routeConfig.entity);
    const handlers = createCollectionRoute({
        ...config,
        filters: routeConfig.filters,
    });

    return handlers.POST(request);
}
