"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useCredentialPools, useCredentialTypes } from "@/lib/supabase/hooks-credentialing";
import {
    AlertTriangle,
    Loader2,
    Package,
    Plus,
    Ticket,
    Users,
} from "lucide-react";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { PermissionGate } from "@/components/permission-guard";

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
            if (!zones || zones.length === 0) return <span className="text-xs text-muted-foreground">All</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {zones.map((z: string) => (
                        <Badge key={z} variant="ghost" className="text-[9px]">{z}</Badge>
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

export default function CredentialsPage() {
    const { data: types, isLoading: loadingTypes } = useCredentialTypes(false);
    const { data: pools, isLoading: loadingPools } = useCredentialPools();

    const isLoading = loadingTypes || loadingPools;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const typeRows = (types ?? []) as unknown as CredentialTypeRow[];
    const poolRows = (pools ?? []) as unknown as PoolRow[];

    const totalTypes = typeRows.length;
    const activeTypes = typeRows.filter((t) => t.is_active).length;
    const totalPoolCapacity = poolRows.reduce((sum, p) => sum + p.total_quantity, 0);
    const totalAllocated = poolRows.reduce((sum, p) => sum + p.allocated_count, 0);
    const utilizationPct = totalPoolCapacity > 0 ? Math.round((totalAllocated / totalPoolCapacity) * 100) : 0;

    return (
        <PermissionGate resource="credential_types" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Credentials & Ticketing"
                    description="Manage credential types, inventory pools, and assignment policies"
                >
                    <Button size="sm">
                        <Plus className="h-4 w-4" />
                        New Credential Type
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Credential Types" value={totalTypes} icon={Ticket} />
                    <StatCard title="Active Types" value={activeTypes} icon={Ticket} />
                    <StatCard title="Pool Capacity" value={totalPoolCapacity} icon={Package} />
                    <StatCard
                        title="Utilization"
                        value={`${utilizationPct}%`}
                        description={`${totalAllocated} / ${totalPoolCapacity} allocated`}
                        icon={Users}
                    />
                </div>

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
                                <p className="text-sm text-muted-foreground">No inventory pools configured</p>
                                <Button size="sm" className="mt-4">
                                    <Plus className="h-4 w-4" />
                                    Create Pool
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {poolRows.map((pool) => {
                                    const remaining = pool.total_quantity - pool.allocated_count;
                                    const pct = pool.total_quantity > 0
                                        ? Math.round((pool.allocated_count / pool.total_quantity) * 100)
                                        : 0;
                                    return (
                                        <Card key={pool.id}>
                                            <CardContent className="pt-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold">
                                                            {pool.credential_types?.name ?? "Unknown"}
                                                        </p>
                                                        <Badge variant="secondary" className="text-[9px] capitalize mt-1">
                                                            {pool.credential_types?.category ?? "—"}
                                                        </Badge>
                                                    </div>
                                                    <Badge
                                                        variant={remaining <= 0 ? "destructive" : remaining < 10 ? "warning" : "success"}
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
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-primary"
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
            </div>
        </PermissionGate>
    );
}
