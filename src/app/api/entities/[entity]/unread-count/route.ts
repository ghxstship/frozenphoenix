import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors, generateRequestId } from "@/lib/api-utils";
import { serverFromTable } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * GET /api/entities/[entity]/unread-count
 *
 * Returns the unread count for entities that support it (currently: notifications).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ entity: string }> }) {
    const { entity } = await params;
    const requestId = generateRequestId();
    const log = logger.child({ requestId, route: `/api/entities/${entity}/unread-count` });

    try {
        if (entity !== "notifications") {
            return NextResponse.json(
                { error: { message: `Unread count not supported for entity: ${entity}` } },
                { status: 404 }
            );
        }

        const supabase = await createClient();
        if (!supabase) return ApiErrors.serviceUnavailable();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return ApiErrors.unauthorized();

        const { count, error } = await serverFromTable(supabase, "notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("read", false);

        if (error) {
            log.error("Failed to fetch unread count", { error });
            return ApiErrors.internalError("Failed to fetch unread count");
        }

        return NextResponse.json({ count: count ?? 0 });
    } catch (err) {
        log.error("Unhandled error", {
            error: err instanceof Error ? err.message : String(err),
        });
        return ApiErrors.internalError();
    }
}
