"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useCrewMembers, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { MOCK_CREW } from "@/lib/mock-data";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Plus, ShieldAlert, ShieldCheck, AlertTriangle, Loader2, LayoutGrid, Table2, Kanban } from "lucide-react";
import type { CrewMember, CertificationType } from "@/types";
import { DataTable, type ColumnDef } from "@/components/data-view/data-table";
import { DataBoard, type BoardColumn, type CardField } from "@/components/data-view/data-board";
import { CurrencyField, EmailField, PhoneField, TagsField } from "@/components/data-view/field-renderers";

type ViewMode = "cards" | "table" | "board";

const CREW_STATUS_VARIANTS: Record<string, "success" | "info" | "ghost" | "warning"> = {
    available: "success",
    assigned: "info",
    unavailable: "ghost",
};

const CREW_STATUS_LABELS: Record<string, string> = {
    available: "Available",
    assigned: "Assigned",
    unavailable: "Unavailable",
};

const tableColumns: ColumnDef<CrewMember>[] = [
    {
        id: "name",
        header: "Name",
        accessorKey: "name",
        sortable: true,
        filterable: true,
        sticky: true,
        render: (_value, row) => (
            <div className="flex items-center gap-2">
                <Avatar name={row.name} size="sm" />
                <span className="font-medium text-sm">{row.name}</span>
            </div>
        ),
    },
    {
        id: "role",
        header: "Role",
        accessorKey: "role",
        sortable: true,
        filterable: true,
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        filterable: true,
        render: (value) => {
            const v = String(value);
            const variant = CREW_STATUS_VARIANTS[v] ?? "ghost";
            const label = CREW_STATUS_LABELS[v] ?? v;
            return <Badge variant={variant} className="text-[10px]">{label}</Badge>;
        },
    },
    {
        id: "hourlyRate",
        header: "Rate",
        accessorKey: "hourlyRate",
        sortable: true,
        align: "right",
        render: (value) => <CurrencyField value={Number(value)} />,
    },
    {
        id: "email",
        header: "Email",
        accessorKey: "email",
        render: (value) => <EmailField value={String(value)} />,
    },
    {
        id: "phone",
        header: "Phone",
        accessorKey: "phone",
        render: (value) => <PhoneField value={String(value)} />,
    },
    {
        id: "certifications",
        header: "Certifications",
        accessorFn: (row) => row.certifications.map(c => c.label),
        render: (_value, row) => {
            const valid = row.certifications.filter(c => c.isValid).map(c => c.label);
            const expired = row.certifications.filter(c => !c.isValid).map(c => c.label);
            return (
                <div className="flex flex-wrap gap-1">
                    {valid.length > 0 && <TagsField tags={valid} />}
                    {expired.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {expired.map(e => <Badge key={e} variant="destructive" className="text-[9px]">{e}</Badge>)}
                        </div>
                    )}
                </div>
            );
        },
    },
];

const boardColumns: BoardColumn<CrewMember>[] = [
    { id: "available", title: "Available", variant: "success", filter: (m) => m.status === "available" },
    { id: "assigned", title: "Assigned", variant: "info", filter: (m) => m.status === "assigned" },
    { id: "unavailable", title: "Unavailable", variant: "ghost", filter: (m) => m.status === "unavailable" },
];

const boardCardFields: CardField<CrewMember>[] = [
    { id: "role", label: "Role", accessorKey: "role" },
    { id: "hourlyRate", label: "Rate", accessorKey: "hourlyRate", render: (v) => <CurrencyField value={Number(v)} compact /> },
    {
        id: "certifications",
        label: "Certs",
        accessorFn: (row) => row.certifications.length,
        render: (_v, row) => {
            const expired = row.certifications.filter(c => !c.isValid).length;
            const total = row.certifications.length;
            if (total === 0) return <span className="text-xs text-muted-foreground">None</span>;
            return (
                <span className={`text-xs font-medium ${expired > 0 ? "text-destructive" : "text-success"}`}>
                    {total - expired}/{total} valid
                </span>
            );
        },
    },
];

export default function CrewPage() {
    const [viewMode, setViewMode] = React.useState<ViewMode>("cards");
    const { data: sbCrew, isLoading } = useCrewMembers();

    const crew: CrewMember[] = isSupabaseConfigured && sbCrew ? sbCrew.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        avatar: c.avatar_url ?? undefined,
        hourlyRate: c.hourly_rate,
        status: c.status as "available" | "assigned" | "unavailable",
        certifications: ((c as unknown as { certifications?: Array<{
            id: string;
            type: string;
            label: string;
            issued_date: string;
            expiry_date: string;
            document_url: string | null;
        }> }).certifications || []).map(cert => ({
            id: cert.id,
            type: cert.type as CertificationType,
            label: cert.label,
            issuedDate: cert.issued_date,
            expiryDate: cert.expiry_date,
            isValid: new Date(cert.expiry_date) > new Date(),
            documentUrl: cert.document_url ?? undefined,
        })),
    })) : MOCK_CREW;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const availableCount = crew.filter(c => c.status === "available").length;
    const expiredCerts = crew.flatMap(c => c.certifications.filter(cert => !cert.isValid));

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Crew & Labor Command" description="Shift scheduling, certifications, and crew management">
                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-border bg-card p-0.5" role="tablist" aria-label="View mode">
                        {[
                            { mode: "cards" as ViewMode, icon: LayoutGrid, label: "Cards" },
                            { mode: "table" as ViewMode, icon: Table2, label: "Table" },
                            { mode: "board" as ViewMode, icon: Kanban, label: "Board" },
                        ].map(({ mode, icon: Icon, label }) => (
                            <button
                                key={mode}
                                role="tab"
                                aria-selected={viewMode === mode}
                                onClick={() => setViewMode(mode)}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                title={label}
                            >
                                <Icon className="h-4 w-4" />
                            </button>
                        ))}
                    </div>
                    <Button size="sm">
                        <Plus className="h-4 w-4" />
                        Add Crew
                    </Button>
                </div>
            </PageHeader>

            {/* Summary */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {availableCount} Available
                </div>
                {expiredCerts.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {expiredCerts.length} Expired Cert{expiredCerts.length > 1 ? "s" : ""}
                    </div>
                )}
            </div>

            {/* Table View */}
            {viewMode === "table" && (
                <DataTable<CrewMember>
                    data={crew}
                    columns={tableColumns}
                    keyField="id"
                    searchable
                    searchPlaceholder="Search crew..."
                    pageSize={20}
                />
            )}

            {/* Board View */}
            {viewMode === "board" && (
                <DataBoard<CrewMember>
                    data={crew}
                    columns={boardColumns}
                    keyField="id"
                    cardTitle="name"
                    cardFields={boardCardFields}
                    onCardClick={(member) => console.log("View crew:", member.id)}
                />
            )}

            {/* Cards View (original) */}
            {viewMode === "cards" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {crew.map((member, i) => {
                        const hasExpired = member.certifications.some(c => !c.isValid);
                        return (
                            <StaggerItem key={member.id} index={i} stagger="relaxed">
                            <Card
                                className={`${hasExpired ? "border-destructive/30" : ""}`}
                            >
                                <CardContent>
                                    <div className="flex items-start gap-3">
                                        <Avatar name={member.name} size="lg" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold truncate">{member.name}</h3>
                                                <Badge
                                                    variant={
                                                        member.status === "available" ? "success" :
                                                            member.status === "assigned" ? "info" : "ghost"
                                                    }
                                                    className="text-[9px]"
                                                >
                                                    {member.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{member.role}</p>
                                            <p className="text-xs text-muted-foreground">${member.hourlyRate}/hr</p>
                                        </div>
                                    </div>

                                    {/* Certifications */}
                                    <div className="mt-4 space-y-1.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Certifications</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {member.certifications.map((cert) => (
                                                <div
                                                    key={cert.id}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${cert.isValid
                                                            ? "bg-success/10 text-success"
                                                            : "bg-destructive/10 text-destructive"
                                                        }`}
                                                >
                                                    {cert.isValid ? (
                                                        <ShieldCheck className="h-3 w-3" />
                                                    ) : (
                                                        <AlertTriangle className="h-3 w-3" />
                                                    )}
                                                    {cert.label}
                                                    {!cert.isValid && (
                                                        <span className="ml-0.5 opacity-70">EXPIRED</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Assignment Gate Warning */}
                                    {hasExpired && (
                                        <div className="mt-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                                            <div className="flex items-center gap-1.5">
                                                <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                                                <p className="text-[10px] font-medium text-destructive">
                                                    Cannot be assigned — expired credentials
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            </StaggerItem>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
