import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/integrations/accounting
 *
 * Gap #26: Accounting integration (QuickBooks/Xero)
 * Syncs invoices and expenses to an external accounting provider.
 * This is the integration adapter that transforms FrozenPhoenix data
 * into the provider's format and dispatches via their API.
 *
 * Body: { action: "sync_invoice" | "sync_expense" | "sync_payment", entity_id: string }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/integrations/accounting",
        mutation: true,
        rbac: { resource: "provider_connections", action: "write" },
    },
    async (request, { supabase, orgId, log }) => {
        const body = await request.json();
        const { action, entity_id } = body;

        if (!action || !entity_id) {
            return NextResponse.json(
                { error: { message: "action and entity_id are required" } },
                { status: 400 }
            );
        }

        // Find active accounting provider connection
        const { data: connection } = await serverFromTable(supabase, "provider_connections")
            .select("id, provider_type, access_token, refresh_token, api_base_url, is_active")
            .eq("organization_id", orgId)
            .in("provider_type", ["quickbooks", "xero"])
            .eq("is_active", true)
            .limit(1)
            .single();

        if (!connection) {
            return NextResponse.json(
                {
                    error: {
                        message:
                            "No active accounting integration configured. Connect QuickBooks or Xero in Settings > Integrations.",
                    },
                },
                { status: 404 }
            );
        }

        const conn = connection as Record<string, unknown>;
        const providerType = conn.provider_type as string;

        // Fetch the entity data based on action
        let entityData: Record<string, unknown> | null = null;

        if (action === "sync_invoice") {
            const { data } = await serverFromTable(supabase, "client_invoices")
                .select("*, invoice_line_items(*)")
                .eq("id", entity_id)
                .eq("organization_id", orgId)
                .single();
            entityData = data as Record<string, unknown> | null;
        } else if (action === "sync_expense") {
            const { data } = await serverFromTable(supabase, "expenses")
                .select("*")
                .eq("id", entity_id)
                .eq("organization_id", orgId)
                .single();
            entityData = data as Record<string, unknown> | null;
        } else if (action === "sync_payment") {
            const { data } = await serverFromTable(supabase, "payments")
                .select("*")
                .eq("id", entity_id)
                .eq("organization_id", orgId)
                .single();
            entityData = data as Record<string, unknown> | null;
        } else {
            return NextResponse.json(
                { error: { message: `Unknown action: ${action}` } },
                { status: 400 }
            );
        }

        if (!entityData) {
            return NextResponse.json({ error: { message: "Entity not found" } }, { status: 404 });
        }

        // Transform and dispatch to provider
        const apiBaseUrl = (conn.api_base_url as string) || "";
        const accessToken = (conn.access_token as string) || "";

        if (!apiBaseUrl || !accessToken) {
            return NextResponse.json(
                {
                    error: {
                        message: `${providerType} connection is not properly configured (missing API URL or token)`,
                    },
                },
                { status: 422 }
            );
        }

        // Build provider-specific payload
        const payload = transformForProvider(providerType, action, entityData);

        // Dispatch to provider API
        try {
            const endpoint = getProviderEndpoint(providerType, action, apiBaseUrl);
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            // Log sync event
            await serverFromTable(supabase, "sync_events").insert({
                provider_connection_id: conn.id,
                direction: "outbound",
                entity_type: action.replace("sync_", ""),
                entity_id,
                status: response.ok ? "success" : "failed",
                response_code: response.status,
                organization_id: orgId,
            });

            if (!response.ok) {
                const errorBody = await response.text().catch(() => "Unknown error");
                log.error("Accounting sync failed", {
                    provider: providerType,
                    status: response.status,
                    error: errorBody,
                });
                return NextResponse.json(
                    {
                        error: {
                            message: `${providerType} sync failed (HTTP ${response.status})`,
                            details: errorBody,
                        },
                    },
                    { status: 502 }
                );
            }

            const result = await response.json().catch(() => ({}));
            return NextResponse.json({
                data: {
                    synced: true,
                    provider: providerType,
                    action,
                    entity_id,
                    provider_id: result.id ?? result.Id ?? null,
                },
            });
        } catch (err) {
            log.error("Accounting sync exception", { error: (err as Error).message });
            return NextResponse.json(
                {
                    error: {
                        message: `Failed to connect to ${providerType}`,
                        details: (err as Error).message,
                    },
                },
                { status: 502 }
            );
        }
    }
);

function transformForProvider(
    provider: string,
    action: string,
    data: Record<string, unknown>
): Record<string, unknown> {
    if (provider === "quickbooks") {
        if (action === "sync_invoice") {
            return {
                Invoice: {
                    DocNumber: data.invoice_number,
                    TxnDate: data.invoice_date,
                    DueDate: data.due_date,
                    TotalAmt: data.total,
                    Balance: data.balance_due ?? data.total,
                    Line: Array.isArray(data.invoice_line_items)
                        ? (data.invoice_line_items as Array<Record<string, unknown>>).map(
                              (li, i) => ({
                                  LineNum: i + 1,
                                  Amount:
                                      ((li.quantity as number) ?? 1) *
                                      ((li.unit_price as number) ?? 0),
                                  Description: li.name,
                                  DetailType: "SalesItemLineDetail",
                                  SalesItemLineDetail: {
                                      Qty: li.quantity,
                                      UnitPrice: li.unit_price,
                                  },
                              })
                          )
                        : [],
                },
            };
        }
        if (action === "sync_expense") {
            return {
                Purchase: {
                    TxnDate: data.date ?? data.created_at,
                    TotalAmt: data.amount,
                    PaymentType: "Cash",
                    Line: [{ Amount: data.amount, Description: data.description }],
                },
            };
        }
    }

    if (provider === "xero") {
        if (action === "sync_invoice") {
            return {
                Type: "ACCREC",
                InvoiceNumber: data.invoice_number,
                Date: data.invoice_date,
                DueDate: data.due_date,
                Total: data.total,
                LineItems: Array.isArray(data.invoice_line_items)
                    ? (data.invoice_line_items as Array<Record<string, unknown>>).map((li) => ({
                          Description: li.name,
                          Quantity: li.quantity,
                          UnitAmount: li.unit_price,
                      }))
                    : [],
            };
        }
    }

    return data;
}

function getProviderEndpoint(provider: string, action: string, baseUrl: string): string {
    const entityMap: Record<string, Record<string, string>> = {
        quickbooks: {
            sync_invoice: "/v3/company/{realmId}/invoice",
            sync_expense: "/v3/company/{realmId}/purchase",
            sync_payment: "/v3/company/{realmId}/payment",
        },
        xero: {
            sync_invoice: "/api.xro/2.0/Invoices",
            sync_expense: "/api.xro/2.0/BankTransactions",
            sync_payment: "/api.xro/2.0/Payments",
        },
    };
    const path = entityMap[provider]?.[action] ?? `/${action}`;
    return `${baseUrl}${path}`;
}
