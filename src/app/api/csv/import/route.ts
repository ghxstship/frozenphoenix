import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { getEntityTemplate, getImportableFields } from "@/lib/csv/csv-templates";
import { validateImportRecords } from "@/lib/csv/csv-validator";

const MAX_IMPORT_ROWS = 5_000;

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
    const rows = body.rows as Record<string, unknown>[] | undefined;

    if (!entity) {
        return ApiErrors.badRequest("entity is required");
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return ApiErrors.badRequest("rows[] is required and must be a non-empty array");
    }

    if (rows.length > MAX_IMPORT_ROWS) {
        return ApiErrors.badRequest(`Maximum ${MAX_IMPORT_ROWS} rows per import. Got ${rows.length}.`);
    }

    const template = getEntityTemplate(entity);
    if (!template) {
        return ApiErrors.badRequest(`Unknown entity: ${entity}`);
    }

    if (!template.importEnabled) {
        return ApiErrors.badRequest(`Import is not enabled for entity: ${entity}`);
    }

    const sb = supabase!;

    try {
        // Get the user's org_id from org_memberships
        const { data: membership } = await serverFromTable(sb, "org_memberships")
            .select("organization_id")
            .eq("user_id", user.id)
            .eq("is_default_org", true)
            .limit(1)
            .single();

        const orgId = membership
            ? (membership as unknown as Record<string, unknown>).organization_id as string
            : null;

        // Validate all rows
        const validation = validateImportRecords(
            rows as Record<string, unknown>[],
            template
        );

        if (validation.validRecords.length === 0) {
            return NextResponse.json(
                {
                    data: {
                        status: "failed",
                        total_rows: validation.totalRows,
                        imported_rows: 0,
                        error_rows: validation.errorRows,
                        errors: validation.errors.slice(0, 100),
                    },
                },
                { status: 422 }
            );
        }

        // Prepare records for insertion
        const importableFieldNames = new Set(
            getImportableFields(template).map((f) => f.dbColumn)
        );

        const insertRecords = validation.validRecords.map((record) => {
            const cleaned: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(record)) {
                if (importableFieldNames.has(key)) {
                    cleaned[key] = value;
                }
            }
            // Inject org_id and audit fields
            if (orgId) cleaned.organization_id = orgId;
            cleaned.created_by = user.id;
            cleaned.updated_by = user.id;
            return cleaned;
        });

        // Batch insert
        const { data: inserted, error: insertError } = await serverFromTable(
            sb,
            template.dbTable
        )
            .insert(insertRecords as Record<string, unknown>[])
            .select("id");

        if (insertError) {
            logger.error("[POST /api/csv/import] Insert failed", {
                entity,
                error: insertError,
            });

            // Check for specific constraint violations
            const msg = insertError.message || "";
            if (msg.includes("duplicate") || msg.includes("unique")) {
                return NextResponse.json(
                    {
                        data: {
                            status: "partial",
                            total_rows: validation.totalRows,
                            imported_rows: 0,
                            error_rows: validation.totalRows,
                            errors: [
                                {
                                    row: 0,
                                    field: "_database",
                                    header: "Database",
                                    value: "",
                                    message: `Duplicate record detected: ${msg}`,
                                },
                            ],
                        },
                    },
                    { status: 409 }
                );
            }

            return ApiErrors.internalError(`Import failed: ${msg}`);
        }

        const importedCount = (inserted as unknown[] | null)?.length ?? 0;

        return NextResponse.json(
            {
                data: {
                    status: validation.errorRows > 0 ? "partial" : "completed",
                    total_rows: validation.totalRows,
                    imported_rows: importedCount,
                    skipped_rows: validation.errorRows,
                    errors: validation.errors.slice(0, 100),
                },
            },
            { status: 201 }
        );
    } catch (err) {
        logger.error("[POST /api/csv/import] Unexpected error", { entity, err });
        return ApiErrors.internalError("Import failed");
    }
}
