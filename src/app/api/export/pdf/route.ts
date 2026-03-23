import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * GET /api/export/pdf?entity_type=&entity_id=
 *
 * Gap #39: PDF export for detail pages
 * Generates a server-side HTML representation of an entity suitable for
 * browser print-to-PDF or returns structured data for client-side PDF generation.
 *
 * Supports: proposals, invoices, client_invoices, contracts, estimates, call_sheets
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/export/pdf",
        rbac: { resource: "documents", action: "read" },
    },
    async (request, { supabase, orgId }) => {
        const url = new URL(request.url);
        const entityType = url.searchParams.get("entity_type");
        const entityId = url.searchParams.get("entity_id");

        if (!entityType || !entityId) {
            return ApiErrors.badRequest("entity_type and entity_id are required");
        }

        const tableName = entityType.replace(/-/g, "_");

        // Fetch entity data with common select
        // §2.2 trust boundary: tableName is resolved at runtime from query param — columns unknown at compile time
        const { data: entity, error } = await serverFromTable(supabase, tableName)
            .select("*")
            .eq("id", entityId)
            .eq("organization_id", orgId)
            .single();

        if (error || !entity) {
            return ApiErrors.notFound("Entity");
        }

        const record = entity as Record<string, unknown>;

        // Fetch organization branding
        const { data: org } = await serverFromTable(supabase, "organizations")
            .select("name, logo_url, billing_email, tax_id")
            .eq("id", orgId)
            .single();

        const orgData = (org as Record<string, unknown>) ?? {};

        // Fetch line items if applicable
        let lineItems: Array<Record<string, unknown>> = [];
        if (entityType === "client_invoices" || entityType === "client-invoices") {
            // §2.2 trust boundary: dynamic entity type for line items — full row needed for column-mapped export
            const { data: items } = await serverFromTable(supabase, "invoice_line_items")
                .select(
                    "id, line_number, name, description, quantity, unit_price, amount, client_invoice_id"
                )
                .eq("client_invoice_id", entityId)
                .order("line_number", { ascending: true });
            lineItems = (items ?? []) as Array<Record<string, unknown>>;
        }

        // Build PDF-ready HTML
        const html = buildPdfHtml(entityType, record, orgData, lineItems);

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Content-Disposition": `inline; filename="${entityType}-${entityId}.html"`,
            },
        });
    }
);

function buildPdfHtml(
    entityType: string,
    record: Record<string, unknown>,
    org: Record<string, unknown>,
    lineItems: Array<Record<string, unknown>>
): string {
    const title = (record.title ?? record.name ?? record.invoice_number ?? entityType) as string;
    const orgName = (org.name ?? "Organization") as string;

    const formatCurrency = (val: unknown) => {
        if (val == null) return "$0.00";
        return `$${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (val: unknown) => {
        if (!val) return "—";
        return new Date(val as string).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    let bodyContent = "";

    if (entityType.includes("invoice")) {
        bodyContent = `
            <div style="display:flex;justify-content:space-between;margin-bottom:32px">
                <div>
                    <h1 style="font-size:24px;font-weight:700;margin:0">${title}</h1>
                    <p style="color:#666;margin:4px 0">Invoice #${record.invoice_number ?? "—"}</p>
                </div>
                <div style="text-align:right">
                    <p style="font-weight:600">${orgName}</p>
                    <p style="color:#666;font-size:13px">${org.billing_email ?? ""}</p>
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:24px;padding:16px;background:#f8f9fa;border-radius:8px">
                <div><span style="color:#666">Date:</span> ${formatDate(record.invoice_date)}</div>
                <div><span style="color:#666">Due:</span> ${formatDate(record.due_date)}</div>
                <div><span style="color:#666">Status:</span> <strong>${record.status ?? "—"}</strong></div>
            </div>
            ${
                lineItems.length > 0
                    ? `
                <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                    <thead>
                        <tr style="border-bottom:2px solid #e2e8f0">
                            <th style="text-align:left;padding:8px 0;font-size:13px;color:#666">#</th>
                            <th style="text-align:left;padding:8px 0;font-size:13px;color:#666">Description</th>
                            <th style="text-align:right;padding:8px 0;font-size:13px;color:#666">Qty</th>
                            <th style="text-align:right;padding:8px 0;font-size:13px;color:#666">Rate</th>
                            <th style="text-align:right;padding:8px 0;font-size:13px;color:#666">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lineItems
                            .map(
                                (li) => `
                            <tr style="border-bottom:1px solid #e2e8f0">
                                <td style="padding:8px 0">${li.line_number ?? ""}</td>
                                <td style="padding:8px 0">${li.name ?? ""}</td>
                                <td style="padding:8px 0;text-align:right">${li.quantity ?? 1}</td>
                                <td style="padding:8px 0;text-align:right">${formatCurrency(li.unit_price)}</td>
                                <td style="padding:8px 0;text-align:right">${formatCurrency(li.amount ?? ((li.quantity as number) ?? 1) * ((li.unit_price as number) ?? 0))}</td>
                            </tr>
                        `
                            )
                            .join("")}
                    </tbody>
                </table>
            `
                    : ""
            }
            <div style="text-align:right;margin-top:16px">
                <div style="margin:4px 0"><span style="color:#666">Subtotal:</span> ${formatCurrency(record.subtotal)}</div>
                ${record.tax_amount ? `<div style="margin:4px 0"><span style="color:#666">Tax:</span> ${formatCurrency(record.tax_amount)}</div>` : ""}
                <div style="margin:8px 0;font-size:18px;font-weight:700"><span style="color:#666">Total:</span> ${formatCurrency(record.total)}</div>
            </div>
        `;
    } else {
        // Generic entity PDF
        const fields = Object.entries(record).filter(
            ([key]) =>
                ![
                    "id",
                    "organization_id",
                    "created_at",
                    "updated_at",
                    "created_by",
                    "updated_by",
                    "deleted_at",
                ].includes(key)
        );
        bodyContent = `
            <h1 style="font-size:24px;font-weight:700;margin:0 0 8px">${title}</h1>
            <p style="color:#666;margin:0 0 24px">${orgName} · ${formatDate(record.created_at)}</p>
            <table style="width:100%;border-collapse:collapse">
                ${fields
                    .map(
                        ([key, val]) => `
                    <tr style="border-bottom:1px solid #e2e8f0">
                        <td style="padding:8px 0;color:#666;font-size:13px;width:180px">${key.replace(/_/g, " ")}</td>
                        <td style="padding:8px 0">${val != null ? String(val) : "—"}</td>
                    </tr>
                `
                    )
                    .join("")}
            </table>
        `;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title>${title} — ${orgName}</title>
    <style>
        @media print { body { margin: 0; } @page { margin: 1in; } }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px; }
    </style>
</head>
<body>
    ${bodyContent}
    <div style="margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;color:#999;font-size:11px;text-align:center">
        Generated by ${orgName} · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
    </div>
</body>
</html>`;
}
