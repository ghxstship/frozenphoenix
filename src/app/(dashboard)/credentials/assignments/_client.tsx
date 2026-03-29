"use client";

import React, { useState } from "react";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCredentialAssignments, useCredentialTypes } from "@/lib/supabase/hooks-credentialing";
import type { CredentialAssignmentStatus } from "@/types";
import { BadgeCheck, Download, Plus, QrCode, Upload, Users } from "lucide-react";
import { getStatusVariant } from "@/config/ui-variants";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_CREDENTIAL_ASSIGNMENT_CONFIG } from "@/config/create-entity-configs";

interface AssignmentRow {
    id: string;
    assignee_name: string;
    assignee_email: string | null;
    barcode_value: string;
    status: string;
    zone_access: string[];
    valid_from: string | null;
    valid_until: string | null;
    checked_in_at: string | null;
    checked_out_at: string | null;
    credential_types: { name: string; category: string; color_hex: string | null } | null;
    created_at: string;
}

const columns: ColumnDef<AssignmentRow>[] = [
    {
        id: "assignee_name",
        header: "Assignee",
        accessorKey: "assignee_name",
        sortable: true,
        filterable: true,
        sticky: true,
        render: (_v, row) => (
            <div>
                <p className="text-sm font-medium">{row.assignee_name}</p>
                {row.assignee_email && (
                    <p className="density-caption text-muted-foreground">{row.assignee_email}</p>
                )}
            </div>
        ),
    },
    {
        id: "credential_type",
        header: "Type",
        accessorFn: (row) => row.credential_types?.name ?? "—",
        sortable: true,
        filterable: true,
        render: (_v, row) => (
            <div className="flex items-center gap-1.5">
                {row.credential_types?.color_hex && (
                    <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: row.credential_types.color_hex }}
                    />
                )}
                <span className="text-xs">{row.credential_types?.name ?? "—"}</span>
            </div>
        ),
    },
    {
        id: "barcode_value",
        header: "Barcode",
        accessorKey: "barcode_value",
        render: (v) => (
            <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                <QrCode className="h-3 w-3" />
                {String(v)}
            </span>
        ),
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        filterable: true,
        render: (v) => {
            const s = String(v);
            return (
                <Badge variant={getStatusVariant(s)} className="density-caption capitalize">
                    {s.replaceAll("_", " ")}
                </Badge>
            );
        },
    },
    {
        id: "zone_access",
        header: "Zones",
        accessorKey: "zone_access",
        render: (v) => {
            const zones = v as string[];
            if (!zones || zones.length === 0)
                return <span className="text-xs text-muted-foreground">All</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {zones.slice(0, 3).map((z: string) => (
                        <Badge key={z} variant="ghost" className="density-caption">
                            {z}
                        </Badge>
                    ))}
                    {zones.length > 3 && (
                        <Badge variant="ghost" className="density-caption">
                            +{zones.length - 3}
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        id: "checked_in_at",
        header: "Check-In",
        accessorKey: "checked_in_at",
        sortable: true,
        render: (v) => {
            if (!v) return <span className="text-xs text-muted-foreground">—</span>;
            return <span className="text-xs">{new Date(v as string).toLocaleTimeString()}</span>;
        },
    },
    {
        id: "created_at",
        header: "Created",
        accessorKey: "created_at",
        sortable: true,
        render: (v) => (
            <span className="text-xs">{new Date(v as string).toLocaleDateString()}</span>
        ),
    },
];

export function CredentialAssignmentsPageClient() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [statusFilter] = useState<CredentialAssignmentStatus | undefined>();
    const { data: assignments, isLoading } = useCredentialAssignments({
        status: statusFilter ? [statusFilter] : undefined,
    });
    const { data: types } = useCredentialTypes();

    const rows = (assignments ?? []) as unknown as AssignmentRow[];
    const checkedIn = rows.filter((r) => r.status === "checked_in").length;
    const issued = rows.filter((r) => ["approved", "issued"].includes(r.status)).length;
    const revoked = rows.filter((r) => r.status === "revoked").length;

    const contentSlot = (
        <div className="density-gap-page">
            {revoked > 0 && (
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 flex items-center gap-2">
                    <Badge variant="destructive" className="density-caption">
                        {revoked}
                    </Badge>
                    <span className="text-xs text-destructive font-medium">
                        revoked credential{revoked > 1 ? "s" : ""} in current view
                    </span>
                </div>
            )}

            <DataTable<AssignmentRow>
                data={rows}
                columns={columns}
                keyField="id"
                searchable
                searchPlaceholder="Search by name, email, or barcode..."
                pageSize={25}
                stickyHeader
                hoverable
            />
            <CreateEntityDialog
                config={CREATE_CREDENTIAL_ASSIGNMENT_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </div>
    );

    const config: ListPageConfig = {
        entityKey: "credential_assignments",
        resource: "credential_assignments",
        action: "read",
        title: "Credential Assignments",
        description: "View and manage all credential assignments across events",
        headerActions: (
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4" /> Bulk Import
                </Button>
                <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" /> Export
                </Button>
                <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Assign Credential
                </Button>
            </div>
        ),
        stats: [
            { label: "Total Assignments", icon: Users, compute: () => rows.length },
            { label: "Checked In", icon: BadgeCheck, compute: () => checkedIn },
            { label: "Issued / Approved", icon: BadgeCheck, compute: () => issued },
            { label: "Credential Types", icon: BadgeCheck, compute: () => (types ?? []).length },
        ],
        contentSlot,
    };

    return <ListPageShell config={config} isLoading={isLoading} />;
}
