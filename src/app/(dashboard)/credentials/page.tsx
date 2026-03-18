"use client";

import React, { useMemo } from "react";
import { CREDENTIALS_PAGE } from "@/config/list-page-configs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    useCreateCredentialAssignment,
    useCreateCredentialPool,
    useCreateCredentialType,
    useCreateExportTemplate,
    useCreateScanEntry,
    useCredentialPools,
    useCredentialTypes,
    useExportTemplates,
    useUpdateCredentialAssignment,
    useUpdateCredentialPool,
    useUpdateCredentialType,
    useUpdateExportTemplate,
} from "@/lib/supabase/hooks-credentialing";
import { AlertTriangle, Package, Plus, Ticket, Users } from "lucide-react";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { ListPageShell } from "@/components/shells/list-page-shell";
import type { ListPageConfig } from "@/types/list-page-config";

interface CredentialTypeRow {
    id: string;
    name: string;
    category: string;
    format: string;
    color_hex: string | null;
    tier_level: number;
    is_active: boolean;
    default_zone_access: string[];
}

interface PoolRow {
    id: string;
    credential_types: { name: string; category: string; color_hex: string | null } | null;
    total_quantity: number;
    allocated_count: number;
    event_id: string | null;
}

const typeColumns: ColumnDef<CredentialTypeRow>[] = [
    {
        id: "name",
        header: "Name",
        accessorKey: "name",
        sortable: true,
        filterable: true,
        sticky: true,
        render: (_v, row) => (
            <div className="flex items-center gap-2">
                {row.color_hex && (
                    <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: row.color_hex }}
                    />
                )}
                <span className="font-medium text-sm">{row.name}</span>
            </div>
        ),
    },
    {
        id: "category",
        header: "Category",
        accessorKey: "category",
        sortable: true,
        filterable: true,
        render: (v) => (
            <Badge variant="secondary" className="text-[10px] capitalize">
                {String(v).replace("_", " ")}
            </Badge>
        ),
    },
    {
        id: "format",
        header: "Format",
        accessorKey: "format",
        sortable: true,
        render: (v) => <span className="text-xs capitalize">{String(v)}</span>,
    },
    {
        id: "tier_level",
        header: "Tier",
        accessorKey: "tier_level",
        sortable: true,
        align: "center",
    },
    {
        id: "zones",
        header: "Default Zones",
        accessorKey: "default_zone_access",
        render: (v) => {
            const zones = v as string[];
            if (!zones || zones.length === 0)
                return <span className="text-xs text-muted-foreground">All</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {zones.map((z: string) => (
                        <Badge key={z} variant="ghost" className="text-[9px]">
                            {z}
                        </Badge>
                    ))}
                </div>
            );
        },
    },
    {
        id: "is_active",
        header: "Status",
        accessorKey: "is_active",
        render: (v) => (
            <Badge variant={v ? "success" : "ghost"} className="text-[10px]">
                {v ? "Active" : "Inactive"}
            </Badge>
        ),
    },
];

// ─── Content: Types Table + Inventory Pools ─────────────────
function CredentialsContent({
    typeRows,
    poolRows,
}: {
    typeRows: CredentialTypeRow[];
    poolRows: PoolRow[];
}) {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Ticket className="h-5 w-5" />
                        Credential Types
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable<CredentialTypeRow>
                        data={typeRows}
                        columns={typeColumns}
                        keyField="id"
                        searchable
                        searchPlaceholder="Search credential types..."
                        pageSize={20}
                        hoverable
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Inventory Pools
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {poolRows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                No inventory pools configured
                            </p>
                            <Button size="sm" className="mt-4">
                                <Plus className="h-4 w-4" />
                                Create Pool
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {poolRows.map((pool) => {
                                const remaining = pool.total_quantity - pool.allocated_count;
                                const pct =
                                    pool.total_quantity > 0
                                        ? Math.round(
                                              (pool.allocated_count / pool.total_quantity) * 100
                                          )
                                        : 0;
                                return (
                                    <Card key={pool.id}>
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-bold">
                                                        {pool.credential_types?.name ?? "Unknown"}
                                                    </p>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[9px] capitalize mt-1"
                                                    >
                                                        {pool.credential_types?.category ?? "—"}
                                                    </Badge>
                                                </div>
                                                <Badge
                                                    variant={
                                                        remaining <= 0
                                                            ? "destructive"
                                                            : remaining < 10
                                                              ? "warning"
                                                              : "success"
                                                    }
                                                    className="text-[10px]"
                                                >
                                                    {remaining} remaining
                                                </Badge>
                                            </div>
                                            <div className="mt-3">
                                                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                                    <span>{pool.allocated_count} allocated</span>
                                                    <span>{pool.total_quantity} total</span>
                                                </div>
                                                <div
                                                    className="h-2 bg-muted rounded-full overflow-hidden"
                                                    role="progressbar"
                                                    aria-valuenow={pct}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-label={`${pool.credential_types?.name ?? "Pool"} utilization: ${pct}%`}
                                                >
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            pct >= 90
                                                                ? "bg-destructive"
                                                                : pct >= 70
                                                                  ? "bg-warning"
                                                                  : "bg-primary"
                                                        }`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────
export default function CredentialsPage() {
    const { data: types, isLoading: loadingTypes } = useCredentialTypes(false);
    const { data: pools, isLoading: loadingPools } = useCredentialPools();
    const _createType = useCreateCredentialType();
    const _updateType = useUpdateCredentialType();
    const _createPool = useCreateCredentialPool();
    const _updatePool = useUpdateCredentialPool();
    const _createAssignment = useCreateCredentialAssignment();
    const _updateAssignment = useUpdateCredentialAssignment();
    const _createScan = useCreateScanEntry();
    const { data: _exportTemplates } = useExportTemplates();
    const _createExportTpl = useCreateExportTemplate();
    const _updateExportTpl = useUpdateExportTemplate();

    const isLoading = loadingTypes || loadingPools;

    const typeRows = useMemo(() => (types ?? []) as unknown as CredentialTypeRow[], [types]);
    const poolRows = useMemo(() => (pools ?? []) as unknown as PoolRow[], [pools]);

    const config: ListPageConfig = useMemo(
        () => ({
            ...CREDENTIALS_PAGE,
            title: "Credentials & Ticketing",
            createLabel: "New Credential Type",
            stats: [
                { label: "Credential Types", icon: Ticket, compute: () => typeRows.length },
                {
                    label: "Active Types",
                    icon: Ticket,
                    compute: () => typeRows.filter((t) => t.is_active).length,
                },
                {
                    label: "Pool Capacity",
                    icon: Package,
                    compute: () => poolRows.reduce((sum, p) => sum + p.total_quantity, 0),
                },
                {
                    label: "Utilization",
                    icon: Users,
                    compute: () => {
                        const cap = poolRows.reduce((sum, p) => sum + p.total_quantity, 0);
                        const alloc = poolRows.reduce((sum, p) => sum + p.allocated_count, 0);
                        return cap > 0 ? `${Math.round((alloc / cap) * 100)}%` : "0%";
                    },
                },
            ],
            contentSlot: <CredentialsContent typeRows={typeRows} poolRows={poolRows} />,
        }),
        [typeRows, poolRows]
    );

    return (
        <ListPageShell
            config={config}
            data={typeRows as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
        />
    );
}
