"use client";

import { useRouter } from "next/navigation";
import { useCompany, useDeleteCompany, useProjects, useUpdateCompany } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    Building2,
    DollarSign,
    ExternalLink,
    FolderOpen,
    Mail,
    Phone,
    Star,
    User,
    Users,
} from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "companies",
    titleKey: "name",
    statusKey: "status",
    icon: Building2,
    backHref: "/companies",
    backLabel: "Companies",
    chatterRecordType: "company",
    fields: [
        { id: "company_type", label: "Type", accessorKey: "company_type", fieldType: "status" },
        { id: "industry", label: "Industry", accessorKey: "industry" },
        { id: "legal_name", label: "Legal Name", accessorKey: "legal_name" },
        { id: "website", label: "Website", accessorKey: "website", fieldType: "url" },
        { id: "phone", label: "Phone", accessorKey: "phone", fieldType: "phone" },
        { id: "email", label: "Email", accessorKey: "email", fieldType: "email" },
    ],
    sidebarFields: [
        { id: "company_type", label: "Type", accessorKey: "company_type", fieldType: "status" },
        { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        { id: "industry", label: "Industry", accessorKey: "industry" },
        { id: "legal_name", label: "Legal Name", accessorKey: "legal_name" },
    ],
    tabs: [],
};

export function CompanyDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { data: sbRecord, isLoading } = useCompany(id);
    const co = (sbRecord ?? initialRecord) as Record<string, unknown> | null;
    const { data: sbProjects } = useProjects();

    const industry = (co?.industry as string) ?? "";
    const accountManagerName = (co?.account_manager_name as string) ?? "";
    const city = (co?.city as string) ?? "";
    const state = (co?.state as string) ?? "";
    const tags = (co?.tags as string[]) ?? [];
    const companyNotes = (co?.notes as string) ?? "";

    const companyProjects = (sbProjects ?? []).filter(
        (p: Record<string, unknown>) => (p.company_id as string) === id
    ) as Record<string, unknown>[];
    const contacts = (co?.contacts ?? []) as Record<string, unknown>[];
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Company",
        listPath: "/companies",
        useUpdateHook: useUpdateCompany,
        useDeleteHook: useDeleteCompany,
    });

    const sidebarSlot = (
        <div className="density-gap-section">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Account Manager</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{accountManagerName || "—"}</p>
                            <p className="text-xs text-muted-foreground">Account Executive</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {tags.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px]">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const overviewSlot = companyNotes ? (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{companyNotes}</p>
            </CardContent>
        </Card>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => [industry, city, state].filter(Boolean).join(" · "),
        sidebarSlot,
        overviewSlot,
        stats: [
            {
                label: "Total Revenue",
                icon: DollarSign,
                compute: (r) => formatCurrency(Number(r.total_revenue ?? 0)),
            },
            { label: "Projects", icon: FolderOpen, compute: () => companyProjects.length },
            { label: "Tier", icon: Star, compute: () => "Tier 1" },
        ],
        tabs: [
            {
                id: "projects",
                label: "Projects",
                count: companyProjects.length,
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" />
                                Projects ({companyProjects.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {companyProjects.map((project) => (
                                    <div
                                        key={project.id as string}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {String(project.name ?? "")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Started {String(project.start_date ?? "")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium">
                                                {formatCurrency((project.budget as number) ?? 0)}
                                            </span>
                                            <Badge
                                                variant={getStatusVariant(
                                                    (project.status as string) ?? ""
                                                )}
                                            >
                                                {getStatusLabel((project.status as string) ?? "")}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "contacts",
                label: "Contacts",
                count: contacts.length,
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Contacts ({contacts.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {contacts.map((contact) => (
                                    <div
                                        key={contact.id as string}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold">
                                                        {String(contact.name ?? "")}
                                                    </p>
                                                    {Boolean(contact.primary) && (
                                                        <Badge
                                                            variant="warning"
                                                            className="text-[9px]"
                                                        >
                                                            Primary
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {String(contact.title ?? "")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right text-xs text-muted-foreground space-y-1">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Mail className="h-3 w-3" />
                                                {String(contact.email ?? "")}
                                            </div>
                                            <div className="flex items-center gap-1 justify-end">
                                                <Phone className="h-3 w-3" />
                                                {String(contact.phone ?? "")}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={co ? { ...(co as Record<string, unknown>) } : null}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                { label: "Edit Company", onClick: () => router.push(`/companies/${id}/edit`) },
                {
                    label: "Add Contact",
                    onClick: () => router.push(`/contacts/new?companyId=${id}`),
                },
                {
                    label: "Create Project",
                    onClick: () => router.push(`/projects/new?companyId=${id}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit Website
                </Button>
            }
        />
    );
}
