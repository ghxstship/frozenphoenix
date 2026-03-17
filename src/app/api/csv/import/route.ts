import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { getEntityTemplate, getImportableFields } from "@/lib/csv/csv-templates";
import { validateImportRecords } from "@/lib/csv/csv-validator";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { csvImportSchema, validate } from "@/lib/validation/schemas";

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/csv/import",
        mutation: true,
        rbac: { resource: "csv", action: "write" },
    },
    async (request, { supabase, user, log }) => {
        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(csvImportSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const entity = result.data.entity;
        const rows = result.data.rows as Record<string, unknown>[];

        const template = getEntityTemplate(entity);
        if (!template) {
            return ApiErrors.badRequest(`Unknown entity: ${entity}`);
        }

        if (!template.importEnabled) {
            return ApiErrors.badRequest(`Import is not enabled for entity: ${entity}`);
        }

        try {
            // Get the user's org_id from org_memberships
            const { data: membership } = await serverFromTable(supabase, "org_memberships")
                .select("organization_id")
                .eq("user_id", user.id)
                .eq("is_default_org", true)
                .limit(1)
                .single();

            const orgId = membership
                ? ((membership as unknown as Record<string, unknown>).organization_id as string)
                : null;

            // Validate all rows
            const validation = validateImportRecords(rows as Record<string, unknown>[], template);

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
                supabase,
                template.dbTable
            )
                .insert(insertRecords as Record<string, unknown>[])
                .select("id");

            if (insertError) {
                log.error("[POST /api/csv/import] Insert failed", {
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
                                        message:
                                            "Duplicate record detected — one or more rows conflict with existing data",
                                    },
                                ],
                            },
                        },
                        { status: 409 }
                    );
                }

                return ApiErrors.internalError("Import failed");
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
            log.error("[POST /api/csv/import] Unexpected error", { entity, err });
            return ApiErrors.internalError("Import failed");
        }
    }
);
