import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const body = await request.json();
    const { entity_type, target_pool_id, file_name, file_size_bytes, rows } = body;

    if (!entity_type || !file_name || !rows || !Array.isArray(rows)) {
        return ApiErrors.badRequest("entity_type, file_name, and rows[] are required");
    }

    const sb = supabase!;

    // Create the bulk import job record
    const { data: job, error: jobError } = await serverFromTable(sb, "bulk_import_jobs")
        .insert({
            entity_type,
            target_pool_id: target_pool_id ?? null,
            file_name,
            file_size_bytes: file_size_bytes ?? null,
            total_rows: rows.length,
            status: "validating",
            created_by: user.id,
            started_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .select()
        .single();

    if (jobError || !job) {
        logger.error("[POST /api/credentials/bulk-import]", { error: jobError });
        return ApiErrors.internalError("Failed to create import job");
    }

    const jobRec = job as unknown as Record<string, unknown>;
    const jobId = jobRec.id as string;
    const orgId = jobRec.organization_id as string;

    // Process rows
    let processedRows = 0;
    let errorRows = 0;
    const skippedRows = 0;
    const errorDetails: { row: number; field: string; message: string }[] = [];

    // Update job status to processing
    await serverFromTable(sb, "bulk_import_jobs")
        .update({ status: "processing" })
        .eq("id", jobId);

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as Record<string, unknown>;

        // Validate required fields
        if (!row.assignee_name) {
            errorDetails.push({ row: i + 1, field: "assignee_name", message: "Required field missing" });
            errorRows++;
            continue;
        }

        if (!row.credential_type_id && !target_pool_id) {
            errorDetails.push({ row: i + 1, field: "credential_type_id", message: "Required when no target pool specified" });
            errorRows++;
            continue;
        }

        // Determine the pool — use target_pool_id or find by credential_type_id
        let poolId = target_pool_id;
        if (!poolId && row.credential_type_id) {
            const { data: pool } = await serverFromTable(sb, "credential_inventory_pools")
                .select("id")
                .eq("credential_type_id", row.credential_type_id as string)
                .limit(1)
                .single();

            if (pool) {
                poolId = (pool as unknown as Record<string, unknown>).id;
            } else {
                errorDetails.push({ row: i + 1, field: "credential_type_id", message: "No pool found for credential type" });
                errorRows++;
                continue;
            }
        }

        const barcode = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();

        const { error: insertError } = await serverFromTable(sb, "credential_assignments")
            .insert({
                organization_id: orgId,
                pool_id: poolId,
                credential_type_id: row.credential_type_id ?? null,
                assignee_name: row.assignee_name,
                assignee_email: row.assignee_email ?? null,
                barcode_value: barcode,
                zone_access: row.zone_access ?? [],
                status: "requested",
                notes: row.notes ?? null,
                external_id: row.external_id ?? null,
                created_by: user.id,
                updated_by: user.id,
            } as Record<string, unknown>);

        if (insertError) {
            errorDetails.push({ row: i + 1, field: "_insert", message: insertError.message });
            errorRows++;
        } else {
            processedRows++;
        }
    }

    // Update job with results
    const finalStatus = errorRows === rows.length ? "failed" : "completed";
    await serverFromTable(sb, "bulk_import_jobs")
        .update({
            status: finalStatus,
            processed_rows: processedRows,
            error_rows: errorRows,
            skipped_rows: skippedRows,
            error_details: errorDetails,
            result_summary: {
                total: rows.length,
                processed: processedRows,
                errors: errorRows,
                skipped: skippedRows,
            },
            completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);

    return NextResponse.json({
        data: {
            job_id: jobId,
            status: finalStatus,
            total_rows: rows.length,
            processed_rows: processedRows,
            error_rows: errorRows,
            skipped_rows: skippedRows,
            error_details: errorDetails.slice(0, 50),
        },
    }, { status: 201 });
}
