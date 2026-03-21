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
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
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

    return handlers.GET(request);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
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
