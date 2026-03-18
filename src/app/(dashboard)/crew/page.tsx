"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { Avatar } from "@/components/ui/avatar";
import { useCrewMembers } from "@/lib/supabase";
import { useLiveCrewAssignmentsPage } from "@/lib/supabase/hooks-admin";
import { useCrewSubmissions } from "@/lib/supabase/hooks-collaborators";
import { StaggerItem } from "@/components/ui/stagger-container";
import { AlertTriangle, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { CREW_PAGE } from "@/config/list-page-configs";
import type { CertificationType, CrewMember } from "@/types";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { type BoardColumn, type CardField, DataBoard } from "@/components/data-view/data-board";
import {
    CurrencyField,
    EmailField,
    PhoneField,
    TagsField,
} from "@/components/data-view/field-renderers";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/layouts/empty-state";
import { ListPageShell } from "@/components/shells/list-page-shell";
import type { ListPageConfig } from "@/types/list-page-config";

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
            return (
                <Badge variant={variant} className="text-[10px]">
                    {label}
                </Badge>
            );
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
        accessorFn: (row) => row.certifications.map((c) => c.label),
        render: (_value, row) => {
            const valid = row.certifications.filter((c) => c.isValid).map((c) => c.label);
            const expired = row.certifications.filter((c) => !c.isValid).map((c) => c.label);
            return (
                <div className="flex flex-wrap gap-1">
                    {valid.length > 0 && <TagsField tags={valid} />}
                    {expired.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {expired.map((e) => (
                                <Badge key={e} variant="destructive" className="text-[9px]">
                                    {e}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            );
        },
    },
];

const boardColumns: BoardColumn<CrewMember>[] = [
    {
        id: "available",
        title: "Available",
        variant: "success",
        filter: (m) => m.status === "available",
    },
    { id: "assigned", title: "Assigned", variant: "info", filter: (m) => m.status === "assigned" },
    {
        id: "unavailable",
        title: "Unavailable",
        variant: "ghost",
        filter: (m) => m.status === "unavailable",
    },
];

const boardCardFields: CardField<CrewMember>[] = [
    { id: "role", label: "Role", accessorKey: "role" },
    {
        id: "hourlyRate",
        label: "Rate",
        accessorKey: "hourlyRate",
        render: (v) => <CurrencyField value={Number(v)} compact />,
    },
    {
        id: "certifications",
        label: "Certs",
        accessorFn: (row) => row.certifications.length,
        render: (_v, row) => {
            const expired = row.certifications.filter((c) => !c.isValid).length;
            const total = row.certifications.length;
            if (total === 0) return <span className="text-xs text-muted-foreground">None</span>;
            return (
                <span
                    className={`text-xs font-medium ${expired > 0 ? "text-destructive" : "text-success"}`}
                >
                    {total - expired}/{total} valid
                </span>
            );
        },
    },
];

// ─── Crew Card ───────────────────────────────────────────────
function CrewCard({ member }: { member: CrewMember }) {
    const hasExpired = member.certifications.some((c) => !c.isValid);
    return (
        <Card className={`${hasExpired ? "border-destructive/30" : ""}`}>
            <CardContent>
                <div className="flex items-start gap-3">
                    <Avatar name={member.name} size="lg" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold truncate">{member.name}</h3>
                            <Badge
                                variant={
                                    member.status === "available"
                                        ? "success"
                                        : member.status === "assigned"
                                          ? "info"
                                          : "ghost"
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
                    <OverlineText>Certifications</OverlineText>
                    <div className="flex flex-wrap gap-1.5">
                        {member.certifications.map((cert) => (
                            <div
                                key={cert.id}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
                                    cert.isValid
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
    );
}

// ─── Content Component ──────────────────────────────────────
function CrewContent({ crew }: { crew: CrewMember[] }) {
    const router = useRouter();
    const VIEW_MODES = ["cards", "table", "board"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "cards",
        validValues: VIEW_MODES,
    });

    return (
        <>
            <div className="flex justify-end">
                <SegmentedControl<ViewMode>
                    ariaLabel="Crew view mode"
                    value={viewMode}
                    onValueChange={setViewMode}
                    options={[
                        { value: "cards", label: "Cards" },
                        { value: "table", label: "Table" },
                        { value: "board", label: "Board" },
                    ]}
                />
            </div>

            {viewMode === "table" &&
                (crew.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No crew members found"
                        description="Add your first crew member to get started"
                    />
                ) : (
                    <DataTable<CrewMember>
                        data={crew}
                        columns={tableColumns}
                        keyField="id"
                        searchable
                        searchPlaceholder="Search crew..."
                        pageSize={20}
                    />
                ))}

            {viewMode === "board" && (
                <DataBoard<CrewMember>
                    data={crew}
                    columns={boardColumns}
                    keyField="id"
                    cardTitle="name"
                    cardFields={boardCardFields}
                    onCardClick={(member) => router.push(`/crew/${member.id}`)}
                    emptyState={
                        <EmptyState
                            icon={Users}
                            title="No crew members found"
                            description="Add your first crew member to get started"
                        />
                    }
                />
            )}

            {viewMode === "cards" &&
                (crew.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No crew members found"
                        description="Add your first crew member to get started"
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {crew.map((member, i) => (
                            <StaggerItem key={member.id} index={i} stagger="relaxed">
                                <CrewCard member={member} />
                            </StaggerItem>
                        ))}
                    </div>
                ))}
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────
export default function CrewPage() {
    const { data: sbCrew, isLoading } = useCrewMembers();
    const { data: _liveAssignments } = useLiveCrewAssignmentsPage();
    const { data: _crewSubmissions } = useCrewSubmissions("");

    const crew: CrewMember[] = useMemo(
        () =>
            (sbCrew ?? []).map((c) => ({
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone,
                role: c.role,
                avatar: c.avatar_url ?? undefined,
                hourlyRate: c.hourly_rate,
                status: c.status as "available" | "assigned" | "unavailable",
                certifications: (
                    (
                        c as unknown as {
                            certifications?: Array<{
                                id: string;
                                type: string;
                                label: string;
                                issued_date: string;
                                expiry_date: string;
                                document_url: string | null;
                            }>;
                        }
                    ).certifications || []
                ).map((cert) => ({
                    id: cert.id,
                    type: cert.type as CertificationType,
                    label: cert.label,
                    issuedDate: cert.issued_date,
                    expiryDate: cert.expiry_date,
                    isValid: new Date(cert.expiry_date) > new Date(),
                    documentUrl: cert.document_url ?? undefined,
                })),
            })),
        [sbCrew]
    );

    const config: ListPageConfig = useMemo(
        () => ({
            ...CREW_PAGE,
            title: "Crew & Labor Command",
            createLabel: "Add Crew",
            exportable: true,
            importable: true,
            stats: [
                {
                    label: "Available",
                    icon: ShieldCheck,
                    filter: (r) => r.status === "available",
                },
                {
                    label: "Assigned",
                    icon: Users,
                    filter: (r) => r.status === "assigned",
                },
                {
                    label: "Expired Certs",
                    icon: ShieldAlert,
                    compute: (r) =>
                        r.reduce((sum, m) => {
                            const certs = (m as unknown as CrewMember).certifications ?? [];
                            return sum + certs.filter((cert) => !cert.isValid).length;
                        }, 0),
                },
            ],
            alerts: [
                {
                    severity: "destructive",
                    icon: ShieldAlert,
                    when: (records) =>
                        records.some((r) => {
                            const certs = (r as unknown as CrewMember).certifications ?? [];
                            return certs.some((cert) => !cert.isValid);
                        }),
                    message: (records) => {
                        const count = records.reduce((sum, r) => {
                            const certs = (r as unknown as CrewMember).certifications ?? [];
                            return sum + certs.filter((cert) => !cert.isValid).length;
                        }, 0);
                        return `${count} expired certification${count > 1 ? "s" : ""} — affected crew cannot be assigned`;
                    },
                },
            ],
            filters: [
                {
                    id: "status",
                    label: "Status",
                    column: "status",
                    options: [
                        { value: "available", label: "Available" },
                        { value: "assigned", label: "Assigned" },
                        { value: "unavailable", label: "Unavailable" },
                    ],
                },
            ],
            contentSlot: <CrewContent crew={crew} />,
        }),
        [crew]
    );

    return (
        <ListPageShell
            config={config}
            data={crew as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
        />
    );
}
