"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCompany, useDeleteCompany, useUpdateCompany } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
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

const mockCompany = {
    id: "1",
    name: "Nike",
    legalName: "Nike, Inc.",
    industry: "Sportswear",
    website: "https://nike.com",
    phone: "+1 503-671-6453",
    email: "partnerships@nike.com",
    companyType: "brand" as const,
    status: "active" as const,
    accountManagerName: "Sarah Chen",
    city: "Beaverton",
    state: "OR",
    country: "United States",
    address: "One Bowerman Drive",
    projectCount: 12,
    totalRevenue: 2450000,
    tags: ["tier-1", "experiential", "sports"],
    notes: "Key strategic account. Primary contact is VP of Brand Activations. Prefers premium experiential productions with heavy digital integration.",
};

const mockProjects = [
    {
        id: "p1",
        name: "Air Max Launch 2026",
        status: "in_progress",
        budget: 485000,
        startDate: "2026-01-15",
    },
    {
        id: "p2",
        name: "Summer Campaign — Stadium Series",
        status: "planning",
        budget: 320000,
        startDate: "2026-04-01",
    },
    {
        id: "p3",
        name: "NYC Pop-Up Experience",
        status: "completed",
        budget: 175000,
        startDate: "2025-11-01",
    },
    {
        id: "p4",
        name: "Holiday Brand Activation",
        status: "completed",
        budget: 250000,
        startDate: "2025-10-15",
    },
];

const mockContacts = [
    {
        id: "c1",
        name: "Jessica Williams",
        title: "VP Brand Activations",
        email: "jwilliams@nike.com",
        phone: "+1 503-671-6500",
        primary: true,
    },
    {
        id: "c2",
        name: "Marcus Lee",
        title: "Senior Event Manager",
        email: "mlee@nike.com",
        phone: "+1 503-671-6512",
        primary: false,
    },
    {
        id: "c3",
        name: "Anna Rodriguez",
        title: "Procurement Lead",
        email: "arodriguez@nike.com",
        phone: "+1 503-671-6520",
        primary: false,
    },
];

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
    const { data: sbRecord } = useCompany(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Company",
        listPath: "/companies",
        useUpdateHook: useUpdateCompany,
        useDeleteHook: useDeleteCompany,
    });
    void router;
    void sbRecord;
    void handleUpdate;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });

    const [chatterComments, setChatterComments] = useState<CommentItem[]>(makeMockComments());
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
        { id: "projects" as const, label: "Projects", count: mockProjects.length },
        { id: "contacts" as const, label: "Contacts", count: mockContacts.length },
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
                        <Badge variant={typeVariants[mockCompany.companyType]}>
                            {mockCompany.companyType}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={statusVariants[mockCompany.status]}>
                            {mockCompany.status}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry</span>
                        <span className="font-medium">{mockCompany.industry}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Legal Name</span>
                        <span className="font-medium">{mockCompany.legalName}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                            href={mockCompany.website}
                            className="text-primary hover:underline text-xs"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {mockCompany.website.replace("https://", "")}
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{mockCompany.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{mockCompany.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">
                            {mockCompany.address}, {mockCompany.city}, {mockCompany.state}
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
                            <p className="font-medium">{mockCompany.accountManagerName}</p>
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
                        {mockCompany.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/companies"
            backLabel="Companies"
            title={mockCompany.name}
            subtitle={`${mockCompany.industry} · ${mockCompany.city}, ${mockCompany.state}`}
            status={mockCompany.status}
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
                { label: "Edit Company", onClick: () => {} },
                { label: "Add Contact", onClick: () => {} },
                { label: "Create Project", onClick: () => {} },
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
                                            {formatCurrency(mockCompany.totalRevenue)}
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
                                            {mockCompany.projectCount}
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

                    {mockCompany.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {mockCompany.notes}
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
                            Projects ({mockProjects.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                >
                                    <div>
                                        <p className="text-sm font-semibold">{project.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Started {project.startDate}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">
                                            {formatCurrency(project.budget)}
                                        </span>
                                        <Badge variant={getStatusVariant(project.status)}>
                                            {getStatusLabel(project.status)}
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
                            Contacts ({mockContacts.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockContacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold">
                                                    {contact.name}
                                                </p>
                                                {contact.primary && (
                                                    <Badge variant="warning" className="text-[9px]">
                                                        Primary
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {contact.title}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground space-y-1">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Mail className="h-3 w-3" />
                                            {contact.email}
                                        </div>
                                        <div className="flex items-center gap-1 justify-end">
                                            <Phone className="h-3 w-3" />
                                            {contact.phone}
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
                    recordId={mockCompany.id}
                    activityItems={makeMockActivity("company")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
