import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/time-entries/generate-invoice
 *
 * I1: Time Entry → Invoice Pipeline
 * Aggregates approved time entries by project into a new client invoice
 * with line items. Transitions consumed time entries to "invoiced" status.
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/time-entries/generate-invoice",
        mutation: true,
        rbac: { resource: "client_invoices", action: "write" },
    },
    async (request, { supabase, orgId }) => {
        const body = await request.json();
        const { project_id, billing_period_start, billing_period_end } = body;

        if (!project_id) {
            return NextResponse.json(
                { error: { message: "project_id is required" } },
                { status: 400 }
            );
        }

        // Fetch approved, billable time entries for this project
        let query = serverFromTable(supabase, "time_entries")
            .select("id, crew_member_id, hours_worked, hourly_rate, notes, date, task_id")
            .eq("project_id", project_id)
            .eq("status", "approved")
            .eq("organization_id", orgId);

        if (billing_period_start) query = query.gte("date", billing_period_start);
        if (billing_period_end) query = query.lte("date", billing_period_end);

        const { data: timeEntries, error: fetchError } = await query;

        if (fetchError) {
            return NextResponse.json(
                { error: { message: "Failed to fetch time entries", details: fetchError.message } },
                { status: 500 }
            );
        }

        if (!timeEntries || timeEntries.length === 0) {
            return NextResponse.json(
                {
                    error: {
                        message: "No approved time entries found for this project and period",
                    },
                },
                { status: 404 }
            );
        }

        // Fetch project for invoice context
        const { data: project } = await serverFromTable(supabase, "projects")
            .select("name, company_id")
            .eq("id", project_id)
            .single();

        type TE = {
            id: string;
            crew_member_id: string | null;
            hours_worked: number;
            hourly_rate: number;
            notes: string | null;
            date: string;
            task_id: string | null;
        };
        const entries = timeEntries as TE[];
        const totalHours = entries.reduce((sum: number, te: TE) => sum + (te.hours_worked ?? 0), 0);
        const totalAmount = entries.reduce(
            (sum: number, te: TE) => sum + (te.hours_worked ?? 0) * (te.hourly_rate ?? 0),
            0
        );

        const now = new Date();
        const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Net 30

        // Create client invoice
        const { data: invoice, error: invoiceError } = await serverFromTable(
            supabase,
            "client_invoices"
        )
            .insert({
                project_id,
                organization_id: orgId,
                company_id: project?.company_id ?? null,
                status: "draft",
                subtotal: totalAmount,
                total: totalAmount,
                invoice_date: now.toISOString().split("T")[0]!,
                due_date: dueDate.toISOString().split("T")[0]!,
                invoice_number: `INV-${Date.now().toString(36).toUpperCase()}`,
                billing_period_start: billing_period_start ?? null,
                billing_period_end: billing_period_end ?? null,
                notes: `Generated from ${timeEntries.length} approved time entries (${totalHours.toFixed(1)}h)`,
            })
            .select("id")
            .single();

        if (invoiceError || !invoice) {
            return NextResponse.json(
                { error: { message: "Failed to create invoice", details: invoiceError?.message } },
                { status: 500 }
            );
        }

        // Create invoice line items
        const lineItems = entries.map((te: TE, idx: number) => ({
            client_invoice_id: invoice.id,
            line_number: idx + 1,
            name: te.notes ?? `Time entry — ${te.date}`,
            quantity: te.hours_worked ?? 0,
            unit_price: te.hourly_rate ?? 0,
            unit: "hours",
            billing_period_start: billing_period_start ?? null,
            billing_period_end: billing_period_end ?? null,
        }));

        await serverFromTable(supabase, "invoice_line_items").insert(lineItems);

        // Link time entries via junction table
        const links = entries.map((te: TE) => ({
            invoice_line_item_id: invoice.id,
            time_entry_id: te.id,
            hours_billed: te.hours_worked ?? 0,
            rate_billed: te.hourly_rate ?? 0,
            amount_billed: (te.hours_worked ?? 0) * (te.hourly_rate ?? 0),
        }));

        await serverFromTable(supabase, "invoice_time_entries").insert(links);

        // Transition time entries to "invoiced"
        await serverFromTable(supabase, "time_entries")
            .update({ status: "invoiced" })
            .in(
                "id",
                entries.map((te: TE) => te.id)
            );

        return NextResponse.json(
            {
                data: {
                    invoice_id: invoice.id,
                    time_entries_invoiced: timeEntries.length,
                    total_hours: totalHours,
                    total_amount: totalAmount,
                },
            },
            { status: 201 }
        );
    }
);
