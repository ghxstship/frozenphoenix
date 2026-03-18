"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Building2, Eye, Globe, MapPin, Pencil, Star, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompanies, useDeleteCompany } from "@/lib/supabase";
import { useCreateCompany } from "@/lib/supabase/hooks-crm";
import { ListPageShell } from "@/components/shells/list-page-shell";
import { COMPANIES_PAGE } from "@/config/list-page-configs";
import { EmptyState } from "@/components/layouts/empty-state";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { RowActionsMenu } from "@/components/data-view/row-actions-menu";
import type { ListPageConfig, ListRowActionDef } from "@/types/list-page-config";

type CompanyType = "client" | "brand" | "agency" | "vendor" | "partner";
type CompanyStatus = "prospect" | "active" | "inactive" | "churned";

interface Company {
    id: string;
    name: string;
    legalName?: string;
    industry?: string;
    website?: string;
    phone?: string;
    email?: string;
    companyType: CompanyType;
    status: CompanyStatus;
    accountManagerName?: string;
    logoUrl?: string;
    city?: string;
    state?: string;
    projectCount: number;
    totalRevenue: number;
    tags: string[];
}

const statusVariants: Record<CompanyStatus, "info" | "success" | "ghost" | "destructive"> = {
    prospect: "info",
    active: "success",
    inactive: "ghost",
    churned: "destructive",
};

const typeVariants: Record<
    CompanyType,
    "default" | "warning" | "info" | "secondary" | "destructive"
> = {
    client: "default",
    brand: "warning",
    agency: "info",
    vendor: "secondary",
    partner: "default",
};

// ─── Table Columns ──────────────────────────────────────────
const tableColumns: ColumnDef<Company>[] = [
    {
        id: "name",
        header: "Company",
        accessorKey: "name",
        sortable: true,
        filterable: true,
        sticky: true,
        render: (_v, row) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={row.logoUrl} alt={row.name} />
                    <AvatarFallback>{row.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-sm text-muted-foreground">{row.industry}</div>
                </div>
            </div>
        ),
    },
    {
        id: "companyType",
        header: "Type",
        accessorKey: "companyType",
        sortable: true,
        filterable: true,
        render: (v) => <Badge variant={typeVariants[v as CompanyType]}>{String(v)}</Badge>,
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        filterable: true,
        render: (v) => <Badge variant={statusVariants[v as CompanyStatus]}>{String(v)}</Badge>,
    },
    {
        id: "location",
        header: "Location",
        accessorFn: (row) => (row.city && row.state ? `${row.city}, ${row.state}` : ""),
        render: (v) =>
            v ? (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {String(v)}
                </div>
            ) : null,
    },
    {
        id: "accountManagerName",
        header: "Account Manager",
        accessorKey: "accountManagerName",
        render: (v) => <span className="text-sm">{v ? String(v) : "—"}</span>,
    },
    {
        id: "projectCount",
        header: "Projects",
        accessorKey: "projectCount",
        sortable: true,
        align: "right",
    },
    {
        id: "totalRevenue",
        header: "Revenue",
        accessorKey: "totalRevenue",
        sortable: true,
        align: "right",
        render: (v) => <span className="font-medium">{formatCurrency(Number(v))}</span>,
    },
];

function useCompanyRowActions(
    onRequestDelete: (id: string, name: string) => void
): ListRowActionDef[] {
    const router = useRouter();
    return useMemo<ListRowActionDef[]>(
        () => [
            {
                id: "view",
                label: "View Details",
                icon: Eye,
                onExecute: (record) => {
                    if (record.id) router.push(`/companies/${String(record.id)}`);
                },
            },
            {
                id: "edit",
                label: "Edit",
                icon: Pencil,
                onExecute: (record) => {
                    if (record.id) router.push(`/companies/${String(record.id)}/edit`);
                },
            },
            {
                id: "delete",
                label: "Delete",
                icon: Trash2,
                variant: "destructive",
                onExecute: (record) => {
                    if (record.id)
                        onRequestDelete(String(record.id), String(record.name ?? "this company"));
                },
            },
        ],
        [router, onRequestDelete]
    );
}

// ─── Company Card ────────────────────────────────────────────
function CompanyCard({ company, actions }: { company: Company; actions: ListRowActionDef[] }) {
    return (
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={company.logoUrl} alt={company.name} />
                            <AvatarFallback>
                                {company.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                            <CardDescription>{company.industry}</CardDescription>
                        </div>
                    </div>
                    <RowActionsMenu
                        record={company as unknown as Record<string, unknown>}
                        actions={actions}
                        ariaLabel="Company actions"
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex gap-2">
                    <Badge variant={typeVariants[company.companyType]}>{company.companyType}</Badge>
                    <Badge variant={statusVariants[company.status]}>{company.status}</Badge>
                </div>
                <div className="space-y-1 text-sm">
                    {company.city && company.state && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {company.city}, {company.state}
                        </div>
                    )}
                    {company.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            {company.website.replace("https://", "")}
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm">
                        <span className="font-medium">{company.projectCount}</span>
                        <span className="text-muted-foreground"> projects</span>
                    </div>
                    <div className="text-sm font-medium">
                        {formatCurrency(company.totalRevenue)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Content Component (table + cards with view toggle) ─────
function CompaniesContent({
    companies,
    actions,
}: {
    companies: Company[];
    actions: ListRowActionDef[];
}) {
    const VIEW_MODES = ["table", "cards"] as const;
    const [view, setView] = useQueryTabState({
        key: "view",
        defaultValue: "table",
        validValues: VIEW_MODES,
    });

    return (
        <>
            <div className="flex justify-end">
                <SegmentedControl
                    value={view}
                    onValueChange={(v) => setView(v as "table" | "cards")}
                    options={[
                        { value: "table", label: "Table" },
                        { value: "cards", label: "Cards" },
                    ]}
                    ariaLabel="View mode"
                />
            </div>

            {companies.length === 0 ? (
                <EmptyState
                    icon={Building2}
                    title="No companies found"
                    description="Add your first company"
                />
            ) : view === "table" ? (
                <DataTable<Company>
                    data={companies}
                    columns={tableColumns}
                    keyField="id"
                    searchable
                    searchPlaceholder="Search companies..."
                    pageSize={15}
                    hoverable
                    stickyHeader
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {companies.map((company) => (
                        <CompanyCard key={company.id} company={company} actions={actions} />
                    ))}
                </div>
            )}
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────
export default function CompaniesPage() {
    const { data: sbCompanies, isLoading } = useCompanies();
    const deleteMutation = useDeleteCompany();
    const _createCompany = useCreateCompany();
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const handleRequestDelete = useCallback((id: string, name: string) => {
        setDeleteTarget({ id, name });
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.id);
        setDeleteTarget(null);
    }, [deleteTarget, deleteMutation]);

    const rowActions = useCompanyRowActions(handleRequestDelete);

    const companies: Company[] = useMemo(
        () =>
            (sbCompanies ?? []).map((c: Record<string, unknown>) => ({
                id: (c.id as string) ?? "",
                name: (c.name as string) ?? "",
                legalName: (c.legal_name as string) ?? undefined,
                industry: (c.industry as string) ?? undefined,
                website: (c.website as string) ?? undefined,
                phone: (c.phone as string) ?? undefined,
                email: (c.email as string) ?? undefined,
                companyType: ((c.company_type as string) ?? "client") as CompanyType,
                status: ((c.status as string) ?? "prospect") as CompanyStatus,
                accountManagerName: (c.account_manager_name as string) ?? undefined,
                logoUrl: (c.logo_url as string) ?? undefined,
                city: (c.city as string) ?? undefined,
                state: (c.state as string) ?? undefined,
                projectCount: (c.project_count as number) ?? 0,
                totalRevenue: (c.total_revenue as number) ?? 0,
                tags: (c.tags as string[]) ?? [],
            })),
        [sbCompanies]
    );

    const config: ListPageConfig = useMemo(
        () => ({
            ...COMPANIES_PAGE,
            title: "Companies",
            createLabel: "Add Company",
            exportable: true,
            importable: true,
            stats: [
                { label: "Total Companies", icon: Building2, compute: (r) => r.length },
                {
                    label: "Active",
                    icon: Star,
                    filter: (r) => r.status === "active",
                },
                {
                    label: "Prospects",
                    icon: Users,
                    filter: (r) => r.status === "prospect",
                },
                {
                    label: "Total Revenue",
                    icon: Building2,
                    compute: (r) =>
                        formatCurrency(
                            r.reduce((sum, c) => sum + ((c.totalRevenue as number) || 0), 0)
                        ),
                },
            ],
            filters: [
                {
                    id: "companyType",
                    label: "Type",
                    column: "companyType",
                    options: [
                        { value: "client", label: "Client" },
                        { value: "brand", label: "Brand" },
                        { value: "agency", label: "Agency" },
                        { value: "vendor", label: "Vendor" },
                        { value: "partner", label: "Partner" },
                    ],
                },
                {
                    id: "status",
                    label: "Status",
                    column: "status",
                    options: [
                        { value: "prospect", label: "Prospect" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                        { value: "churned", label: "Churned" },
                    ],
                },
            ],
            contentSlot: <CompaniesContent companies={companies} actions={rowActions} />,
        }),
        [companies, rowActions]
    );

    return (
        <>
            {deleteTarget && (
                <div
                    role="alert"
                    className="mx-4 mt-2 flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
                >
                    <p>
                        Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This
                        action cannot be undone.
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-colors"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
                            onClick={handleConfirmDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}
            <ListPageShell
                config={config}
                data={companies as unknown as Record<string, unknown>[]}
                isLoading={isLoading}
            />
        </>
    );
}
