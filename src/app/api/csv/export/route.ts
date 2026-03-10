import { NextRequest } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { csvResponse, serializeCsv } from "@/lib/csv/csv-utils";
import { getEntityTemplate, getExportableFields } from "@/lib/csv/csv-templates";

const MAX_EXPORT_ROWS = 10_000;

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    let body: Record<string, unknown>;
    try {
        body = (await request.json()) as Record<string, unknown>;
    } catch {
        return ApiErrors.badRequest("Invalid JSON body");
    }

    const entity = body.entity as string | undefined;
    const filters = body.filters as Record<string, unknown> | undefined;
    const limit = Math.min(Number(body.limit) || MAX_EXPORT_ROWS, MAX_EXPORT_ROWS);

    if (!entity) {
        return ApiErrors.badRequest("entity is required");
    }

    const template = getEntityTemplate(entity);
    if (!template) {
        return ApiErrors.badRequest(`Unknown entity: ${entity}. Valid entities: ${Object.keys((await import("@/lib/csv/csv-templates")).CSV_ENTITY_TEMPLATES).join(", ")}`);
    }

    if (!template.exportEnabled) {
        return ApiErrors.badRequest(`Export is not enabled for entity: ${entity}`);
    }

    const sb = supabase!;

    try {
        // Build select string from exportable fields
        const exportFields = getExportableFields(template);
        const selectColumns = exportFields.map((f) => f.dbColumn).join(", ");

        let query = serverFromTable(sb, template.dbTable)
            .select(template.selectQuery ?? selectColumns)
            .limit(limit);

        // Apply default sort
        if (template.defaultSort) {
            query = query.order(template.defaultSort.column, {
                ascending: template.defaultSort.ascending,
            });
        }

        // Apply user-provided filters
        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                if (value === null || value === undefined || value === "") continue;
                query = query.eq(key, value as string);
            }
        }

        const { data: rows, error } = await query;

        if (error) {
            logger.error("[POST /api/csv/export]", { entity, error });
            return ApiErrors.internalError("Failed to fetch export data");
        }

        const records = (rows ?? []) as Record<string, unknown>[];

        // Map to CSV headers
        const headers = exportFields.map((f) => ({
            key: f.dbColumn,
            label: f.csvHeader,
        }));

        const csv = serializeCsv(records, headers);
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${template.entity}_export_${timestamp}.csv`;

        return csvResponse(csv, filename);
    } catch (err) {
        logger.error("[POST /api/csv/export] Unexpected error", { entity, err });
        return ApiErrors.internalError("Export failed");
    }
}
