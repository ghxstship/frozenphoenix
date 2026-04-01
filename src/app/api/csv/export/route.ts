import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { csvResponse, serializeCsv } from "@/lib/csv/csv-utils";
import { getEntityTemplate, getExportableFields } from "@/lib/csv/csv-templates";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { csvExportSchema, validate } from "@/lib/validation/schemas";

const MAX_EXPORT_ROWS = 10_000;

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/csv/export",
        mutation: true,
        rbac: { resource: "csv", action: "read" },
    },
    async (request, { supabase, log }) => {
        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(csvExportSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const entity = result.data.entity;
        const filters = result.data.filters as Record<string, unknown> | undefined;
        const limit = Math.min(result.data.limit ?? MAX_EXPORT_ROWS, MAX_EXPORT_ROWS);
        const preview = result.data.preview;
        const selectedColumns = result.data.columns;

        const template = getEntityTemplate(entity);
        if (!template) {
            return ApiErrors.badRequest(
                `Unknown entity: ${entity}. Valid entities: ${Object.keys((await import("@/lib/csv/csv-templates")).CSV_ENTITY_TEMPLATES).join(", ")}`
            );
        }

        if (!template.exportEnabled) {
            return ApiErrors.badRequest(`Export is not enabled for entity: ${entity}`);
        }

        try {
            // Build select string from exportable fields, optionally filtered by user selection
            const allExportFields = getExportableFields(template);
            const exportFields = selectedColumns
                ? allExportFields.filter((f) => selectedColumns.includes(f.dbColumn))
                : allExportFields;

            if (exportFields.length === 0) {
                return ApiErrors.badRequest("No columns selected for export");
            }

            // CSV export uses flat column selects — never the join-based selectQuery
            // from entity config (those return nested objects the CSV serializer can't handle).
            // Only use selectQuery if explicitly set in csv-template-overrides.ts.
            const selectColumns = exportFields.map((f) => f.dbColumn).join(", ");
            const selectStr = template.selectQuery ?? selectColumns;
            const effectiveLimit = preview ? 5 : limit;

            let query = serverFromTable(supabase, template.dbTable)
                .select(selectStr, preview ? { count: "exact", head: false } : undefined)
                .limit(effectiveLimit);

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

            const { data: rows, error, count } = await query;

            if (error) {
                log.error("[POST /api/csv/export]", { entity, error });
                return ApiErrors.internalError("Failed to fetch export data");
            }

            const records = (rows ?? []) as Record<string, unknown>[];

            // Preview mode: return JSON with rows + total count
            if (preview) {
                return NextResponse.json({
                    data: {
                        rows: records,
                        total_count: count ?? records.length,
                        columns: exportFields.map((f) => ({
                            key: f.dbColumn,
                            label: f.csvHeader,
                            type: f.type,
                        })),
                    },
                });
            }

            // Full export: return CSV file
            const headers = exportFields.map((f) => ({
                key: f.dbColumn,
                label: f.csvHeader,
            }));

            const csv = serializeCsv(records, headers);
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `${template.entity}_export_${timestamp}.csv`;

            return csvResponse(csv, filename);
        } catch (err) {
            log.error("[POST /api/csv/export] Unexpected error", { entity, err });
            return ApiErrors.internalError("Export failed");
        }
    }
);
