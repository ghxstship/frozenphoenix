import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { createAdvanceSchema } from "@/lib/validation/advancing-schemas";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/advancing",
        rbac: { resource: "advancing", action: "read" },
    },
    async (request, { supabase, log }) => {
        const url = new URL(request.url);
        const status = url.searchParams.get("status");
        const advanceType = url.searchParams.get("advance_type");
        const priority = url.searchParams.get("priority");
        const eventId = url.searchParams.get("event_id");
        const projectId = url.searchParams.get("project_id");
        const page = parseInt(url.searchParams.get("page") ?? "1", 10);
        const perPage = Math.min(parseInt(url.searchParams.get("per_page") ?? "25", 10), 100);
        const sortBy = url.searchParams.get("sort_by") ?? "created_at";
        const sortOrder = url.searchParams.get("sort_order") ?? "desc";

        let query = serverFromTable(supabase, "production_advances")
            .select(
                `
                *,
                events:event_id(name),
                projects:project_id(name),
                submitted_by_profile:submitted_by(name, avatar_url),
                approved_by_profile:approved_by(name)
            `,
                { count: "exact" }
            )
            .is("deleted_at", null);

        if (status) {
            const statuses = status.split(",");
            query = statuses.length > 1 ? query.in("status", statuses) : query.eq("status", status);
        }
        if (advanceType) query = query.eq("advance_type", advanceType);
        if (priority) query = query.eq("priority", priority);
        if (eventId) query = query.eq("event_id", eventId);
        if (projectId) query = query.eq("project_id", projectId);

        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(from, to);

        const { data, error, count } = await query;
        if (error) {
            log.error("[GET /api/advancing]", { error });
            return ApiErrors.internalError("Failed to fetch advances");
        }

        return NextResponse.json({
            data,
            pagination: { page, per_page: perPage, total: count ?? 0 },
        });
    }
);

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/advancing",
        mutation: true,
        rbac: { resource: "advancing", action: "write" },
    },
    async (request, { supabase, user, log }) => {
        const parsed = await parseAndValidate(request, createAdvanceSchema);
        if (!parsed.success) return parsed.response;

        const { items, ...advanceData } = parsed.data;

        const { data: advance, error: advanceError } = await serverFromTable(
            supabase,
            "production_advances"
        )
            .insert({
                ...advanceData,
                submitted_by: user.id,
            } as Record<string, unknown>)
            .select("id, status, advance_type, amount, submitted_by, created_at")
            .single();

        if (advanceError) {
            log.error("[POST /api/advancing] insert failed", { error: advanceError });
            return ApiErrors.internalError("Failed to create advance");
        }

        if (items.length > 0) {
            const { error: itemsError } = await serverFromTable(
                supabase,
                "production_advance_items"
            ).insert(
                items.map((item) => ({
                    advance_id: advance.id,
                    ...item,
                })) as Record<string, unknown>[]
            );

            if (itemsError) {
                log.error("[POST /api/advancing] items insert failed", { error: itemsError });
                return ApiErrors.internalError("Advance created but items failed");
            }
        }

        return NextResponse.json({ data: advance }, { status: 201 });
    }
);
