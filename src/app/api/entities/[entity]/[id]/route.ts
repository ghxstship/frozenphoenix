import { type NextRequest, NextResponse } from "next/server";
import { getEntityCrudConfig } from "@/lib/api/entity-config";
import { createItemRoute } from "@/lib/api/crud-factory";
import { ITEM_ROUTES } from "@/lib/api/route-registry";

/**
 * Catch-all API item route for config-driven CRUD entities.
 *
 * Handles GET (detail), PATCH (update), and DELETE for any entity
 * registered in the route registry.
 *
 * URL pattern: /api/entities/[entity]/[id]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const { entity: slug, id } = await params;
    const routeConfig = ITEM_ROUTES[slug];
    if (!routeConfig) {
        return NextResponse.json({ error: `Unknown entity: ${slug}` }, { status: 404 });
    }

    const config = getEntityCrudConfig(routeConfig.entity);
    const handlers = createItemRoute({
        ...config,
        immutableColumns: routeConfig.immutableColumns,
    });

    // Reconstruct the request with the id in the context
    return handlers.GET(request, { params: Promise.resolve({ id }) });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const { entity: slug, id } = await params;
    const routeConfig = ITEM_ROUTES[slug];
    if (!routeConfig) {
        return NextResponse.json({ error: `Unknown entity: ${slug}` }, { status: 404 });
    }

    const config = getEntityCrudConfig(routeConfig.entity);
    const handlers = createItemRoute({
        ...config,
        immutableColumns: routeConfig.immutableColumns,
    });

    return handlers.PATCH(request, { params: Promise.resolve({ id }) });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> }
) {
    const { entity: slug, id } = await params;
    const routeConfig = ITEM_ROUTES[slug];
    if (!routeConfig) {
        return NextResponse.json({ error: `Unknown entity: ${slug}` }, { status: 404 });
    }

    const config = getEntityCrudConfig(routeConfig.entity);
    const handlers = createItemRoute({
        ...config,
        immutableColumns: routeConfig.immutableColumns,
    });

    return handlers.DELETE(request, { params: Promise.resolve({ id }) });
}
