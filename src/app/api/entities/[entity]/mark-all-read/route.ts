import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors, generateRequestId } from "@/lib/api-utils";
import { serverFromTable } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * POST /api/entities/[entity]/mark-all-read
 *
 * Marks all records as read for entities that support it (currently: notifications).
 */
export async function POST(request: Request, { params }: { params: Promise<{ entity: string }> }) {
    const { entity } = await params;
    const requestId = generateRequestId();
    const log = logger.child({ requestId, route: `/api/entities/${entity}/mark-all-read` });

    try {
        if (entity !== "notifications") {
            return NextResponse.json(
                { error: { message: `Mark-all-read not supported for entity: ${entity}` } },
                { status: 404 }
            );
        }

        const supabase = await createClient();
        if (!supabase) return ApiErrors.serviceUnavailable();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return ApiErrors.unauthorized();

        const { error } = await serverFromTable(supabase, "notifications")
            .update({
                read: true,
                read_at: new Date().toISOString(),
            } as Record<string, unknown>)
            .eq("user_id", user.id)
            .eq("read", false);

        if (error) {
            log.error("Failed to mark all notifications read", { error });
            return ApiErrors.internalError("Failed to mark notifications as read");
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        log.error("Unhandled error", {
            error: err instanceof Error ? err.message : String(err),
        });
        return ApiErrors.internalError();
    }
}
