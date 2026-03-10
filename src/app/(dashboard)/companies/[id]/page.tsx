"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCompany, useDeleteCompany, useUpdateCompany } from "@/lib/supabase/hooks-pages";
import { useProjects } from "@/lib/supabase/hooks";
import { LoadingState } from "@/components/layouts/loading-state";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import {
    Building2,
    DollarSign,
    ExternalLink,
    FolderOpen,
    Globe,
    Mail,
    MapPin,
    Phone,
    Star,
    User,
    Users,
} from "lucide-react";

type TabId = "overview" | "projects" | "contacts" | "chatter";
const TAB_VALUES = ["overview", "projects", "contacts", "chatter"] as const;


const statusVariants: Record<string, "success" | "info" | "ghost" | "destructive"> = {
    active: "success",
    prospect: "info",
    inactive: "ghost",
    churned: "destructive",
};

const typeVariants: Record<string, "default" | "warning" | "info" | "secondary"> = {
    client: "default",
    brand: "warning",
    agency: "info",
    vendor: "secondary",
};

export default function CompanyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord, isLoading } = useCompany(entityId);
    const co = sbRecord as Record<string, unknown> | null;
    const { data: sbProjects } = useProjects();

    const companyName = (co?.name as string) ?? "";
    const legalName = (co?.legal_name as string) ?? "";
    const industry = (co?.industry as string) ?? "";
    const website = (co?.website as string) ?? "";
    const companyPhone = (co?.phone as string) ?? "";
    const companyEmail = (co?.email as string) ?? "";
    const companyType = (co?.company_type as string) ?? "";
    const companyStatus = (co?.status as string) ?? "active";
    const accountManagerName = (co?.account_manager_name as string) ?? "";
    const city = (co?.city as string) ?? "";
    const state = (co?.state as string) ?? "";
    const address = (co?.address as string) ?? "";
    const totalRevenue = (co?.total_revenue as number) ?? 0;
    const tags = (co?.tags as string[]) ?? [];
    const companyNotes = (co?.notes as string) ?? "";

    const companyProjects = (sbProjects ?? []).filter(
        (p: Record<string, unknown>) => (p.company_id as string) === entityId
    ) as Record<string, unknown>[];
    const contacts = ((co?.contacts ?? []) as Record<string, unknown>[]);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Company",
        listPath: "/companies",
        useUpdateHook: useUpdateCompany,
        useDeleteHook: useDeleteCompany,
    });
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });

    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);
    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Sarah Chen",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "projects" as const, label: "Projects", count: companyProjects.length },
        { id: "contacts" as const, label: "Contacts", count: contacts.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Company Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant={typeVariants[companyType]}>
                            {companyType}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={statusVariants[companyStatus]}>
                            {companyStatus}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry</span>
                        <span className="font-medium">{industry}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Legal Name</span>
                        <span className="font-medium">{legalName}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {website && (
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                            href={website}
                            className="text-primary hover:underline text-xs"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {website.replace("https://", "")}
                        </a>
                    </div>
                    )}
                    {companyPhone && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{companyPhone}</span>
                    </div>
                    )}
                    {companyEmail && (
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{companyEmail}</span>
                    </div>
                    )}
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">
                            {[address, city, state].filter(Boolean).join(", ")}
                        </span>
                    </div>
                </CardContent>
            </Card>

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
        </div>
    );

    if (isLoading) return <LoadingState />;

    return (
        <DetailLayout
            backHref="/companies"
            backLabel="Companies"
            entityType="companies"
            entityId={entityId}
            title={companyName}
            subtitle={[industry, city, state].filter(Boolean).join(" · ")}
            status={companyStatus}
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
            menuItems={[
                { label: "Edit Company", onClick: () => router.push(`/companies/${entityId}/edit`) },
                { label: "Add Contact", onClick: () => router.push(`/contacts/new?companyId=${entityId}`) },
                { label: "Create Project", onClick: () => router.push(`/projects/new?companyId=${entityId}`) },
                ...crudMenuItems,
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Total Revenue
                                        </p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(totalRevenue)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
                                        <FolderOpen className="h-5 w-5 text-info" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Projects</p>
                                        <p className="text-lg font-bold">
                                            {companyProjects.length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                                        <Star className="h-5 w-5 text-warning" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tier</p>
                                        <p className="text-lg font-bold">Tier 1</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {companyNotes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {companyNotes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "projects" && (
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
                                        <p className="text-sm font-semibold">{String(project.name ?? "")}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Started {String(project.start_date ?? "")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">
                                            {formatCurrency((project.budget as number) ?? 0)}
                                        </span>
                                        <Badge variant={getStatusVariant((project.status as string) ?? "")}>
                                            {getStatusLabel((project.status as string) ?? "")}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "contacts" && (
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
                                                    <Badge variant="warning" className="text-[9px]">
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
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="company"
                    recordId={entityId}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
