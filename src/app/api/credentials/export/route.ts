import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/credentials/export",
        mutation: true,
        rbac: { resource: "credentials", action: "read" },
    },
    async (request, { supabase, log }) => {
        const body = await request.json();
        const { entity_type, template_id, format, filters } = body;

        if (!entity_type || !format) {
            return ApiErrors.badRequest("entity_type and format are required");
        }

        const sb = supabase;

        // Load export template if specified
        let columnMapping:
            | { source_field: string; target_header: string; include: boolean }[]
            | null = null;
        if (template_id) {
            const { data: template } = await serverFromTable(sb, "export_templates")
                .select("column_mapping")
                .eq("id", template_id)
                .single();

            if (template) {
                columnMapping = (template as unknown as Record<string, unknown>).column_mapping as {
                    source_field: string;
                    target_header: string;
                    include: boolean;
                }[];
            }
        }

        // Fetch data based on entity_type
        let query;
        switch (entity_type) {
            case "credential_assignments":
                query = serverFromTable(sb, "credential_assignments").select(
                    "*, credential_types:credential_type_id(name, category)"
                );
                break;
            case "credential_scan_log":
                query = serverFromTable(sb, "credential_scan_log").select("*");
                break;
            case "pos_transactions":
                query = serverFromTable(sb, "pos_transactions").select("*");
                break;
            default:
                return ApiErrors.badRequest(`Unsupported entity_type: ${entity_type}`);
        }

        // Apply filters
        if (filters) {
            const f = filters as Record<string, unknown>;
            if (f.event_id) query = query.eq("event_id", f.event_id as string);
            if (f.pool_id) query = query.eq("pool_id", f.pool_id as string);
            if (f.status) query = query.eq("status", f.status as string);
            if (f.date_from) query = query.gte("created_at", f.date_from as string);
            if (f.date_to) query = query.lte("created_at", f.date_to as string);
        }

        const { data: rows, error } = await query;
        if (error) {
            log.error("[POST /api/credentials/export]", { error });
            return ApiErrors.internalError("Failed to fetch export data");
        }

        // Apply column mapping
        let exportRows: Record<string, unknown>[] = rows ?? [];
        if (columnMapping) {
            const activeColumns = columnMapping.filter((c) => c.include);
            exportRows = exportRows.map((row: Record<string, unknown>) => {
                const mapped: Record<string, unknown> = {};
                for (const col of activeColumns) {
                    mapped[col.target_header] = row[col.source_field] ?? null;
                }
                return mapped;
            });
        }

        // Format: CSV (default fallback — client-side formatting for xlsx/pdf)
        if (format === "json") {
            return NextResponse.json({ data: exportRows, total: exportRows.length });
        }

        // CSV generation
        if (exportRows.length === 0) {
            return new NextResponse("", {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="${entity_type}_export.csv"`,
                },
            });
        }

        const headers = Object.keys(exportRows[0] as Record<string, unknown>);
        const csvLines = [
            headers.join(","),
            ...exportRows.map((row: Record<string, unknown>) =>
                headers
                    .map((h) => {
                        const val = row[h];
                        if (val === null || val === undefined) return "";
                        const str = String(val);
                        return str.includes(",") || str.includes('"') || str.includes("\n")
                            ? `"${str.replace(/"/g, '""')}"`
                            : str;
                    })
                    .join(",")
            ),
        ];

        return new NextResponse(csvLines.join("\n"), {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${entity_type}_export.csv"`,
            },
        });
    }
);
