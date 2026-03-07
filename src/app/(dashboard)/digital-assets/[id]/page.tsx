"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useDeleteDigitalAsset,
    useDigitalAsset,
    useUpdateDigitalAsset,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatDate } from "@/lib/locale";
import { Calendar, Download, Eye, FileBox, History, Link2, Shield, User } from "lucide-react";
import type { DigitalAsset } from "@/types/digital-assets";

type TabId = "details" | "versions" | "links" | "chatter";
const TAB_VALUES = ["details", "versions", "links", "chatter"] as const;

const mockAsset: DigitalAsset = {
    id: "da-1",
    asset_class: "document",
    asset_class_l1: "document",
    asset_class_l2: "contract",
    name: "Master Services Agreement — Nike",
    filename: "nike_msa_2026_final.pdf",
    description: "Executed MSA covering all production services for Nike 2026 campaign portfolio.",
    scope_level: "project",
    scope_entity_id: "p1",
    domains: ["legal"],
    status: "published",
    published_at: "2026-01-15T00:00:00Z",
    archived_at: null,
    expires_at: "2027-01-15T00:00:00Z",
    current_version_id: "v3",
    owner_id: "u1",
    created_by: "u1",
    updated_by: "u2",
    document_number: "DOC-2026-001",
    last_reviewed_at: "2026-02-01T00:00:00Z",
    next_review_date: "2026-08-01",
    reviewer_ids: ["u2", "u3"],
    requires_acknowledgment: true,
    sensitivity: "confidential",
    data_purpose: "Contractual agreement",
    retention_policy_id: "rp-legal-7yr",
    custom_metadata: {},
    organization_id: "org-1",
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
};

const mockVersions = [
    {
        id: "v3",
        version_number: 3,
        version_label: "Final Executed",
        change_type: "amendment",
        created_at: "2026-01-15",
        created_by: "Sarah Chen",
    },
    {
        id: "v2",
        version_number: 2,
        version_label: "Red-line Draft",
        change_type: "revision",
        created_at: "2026-01-12",
        created_by: "James Park",
    },
    {
        id: "v1",
        version_number: 1,
        version_label: "Initial Draft",
        change_type: "create",
        created_at: "2026-01-10",
        created_by: "Sarah Chen",
    },
];

const mockLinks = [
    { id: "l1", entity_type: "project", entity_name: "Nike Air Max Launch", link_type: "primary" },
    { id: "l2", entity_type: "contract", entity_name: "Nike MSA 2026", link_type: "attachment" },
    { id: "l3", entity_type: "vendor", entity_name: "StageCraft Studios", link_type: "reference" },
];

export default function DigitalAssetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord } = useDigitalAsset(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Digital Asset",
        listPath: "/digital-assets",
        useUpdateHook: useUpdateDigitalAsset,
        useDeleteHook: useDeleteDigitalAsset,
    });
    void router;
    void sbRecord;
    void handleUpdate;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
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
        { id: "details" as const, label: "Details" },
        { id: "versions" as const, label: "Versions", count: mockVersions.length },
        { id: "links" as const, label: "Links", count: mockLinks.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Asset Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(mockAsset.status) as "default"}>
                            {getStatusLabel(mockAsset.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Class</span>
                        <Badge variant="outline" className="capitalize">
                            {mockAsset.asset_class_l1} / {mockAsset.asset_class_l2}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Sensitivity</span>
                        <Badge
                            variant={
                                mockAsset.sensitivity === "confidential"
                                    ? "warning"
                                    : mockAsset.sensitivity === "restricted"
                                      ? "destructive"
                                      : "ghost"
                            }
                        >
                            {mockAsset.sensitivity}
                        </Badge>
                    </div>
                    {mockAsset.document_number && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Doc #</span>
                            <span className="font-mono text-xs">{mockAsset.document_number}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Filename</span>
                        <span className="text-xs truncate max-w-[140px]">{mockAsset.filename}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {mockAsset.published_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Published</span>
                            <span className="font-medium">
                                {formatDate(mockAsset.published_at, "compact")}
                            </span>
                        </div>
                    )}
                    {mockAsset.expires_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires</span>
                            <span className="font-medium">
                                {formatDate(mockAsset.expires_at, "compact")}
                            </span>
                        </div>
                    )}
                    {mockAsset.next_review_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Review</span>
                            <span className="font-medium">
                                {formatDate(mockAsset.next_review_date, "compact")}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Domains</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                        {mockAsset.domains.map((d) => (
                            <Chip key={d} size="sm">
                                {d}
                            </Chip>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/digital-assets"
            backLabel="Digital Assets"
            entityType="digital-assets"
            entityId={entityId}
            title={mockAsset.name}
            subtitle={`${mockAsset.filename} · ${mockAsset.document_number ?? mockAsset.id}`}
            status={mockAsset.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileBox className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                    </Button>
                    <Button size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                    </Button>
                </div>
            }
            menuItems={[
                { label: "Edit Metadata", onClick: () => {} },
                { label: "Upload New Version", onClick: () => {} },
                ...crudMenuItems,
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "details" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Sensitivity</p>
                                        <p className="text-sm font-bold capitalize">
                                            {mockAsset.sensitivity}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <History className="h-5 w-5 text-info" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Version</p>
                                        <p className="text-sm font-bold">
                                            {mockVersions[0]?.version_label ?? "v1"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Last Reviewed
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {mockAsset.last_reviewed_at
                                                ? formatDate(mockAsset.last_reviewed_at, "compact")
                                                : "Never"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {mockAsset.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {mockAsset.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Compliance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Requires Acknowledgment
                                </span>
                                <Badge
                                    variant={mockAsset.requires_acknowledgment ? "info" : "ghost"}
                                >
                                    {mockAsset.requires_acknowledgment ? "Yes" : "No"}
                                </Badge>
                            </div>
                            {mockAsset.data_purpose && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Data Purpose</span>
                                    <span className="font-medium">{mockAsset.data_purpose}</span>
                                </div>
                            )}
                            {mockAsset.retention_policy_id && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Retention Policy</span>
                                    <span className="font-mono text-xs">
                                        {mockAsset.retention_policy_id}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "versions" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Version History ({mockVersions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockVersions.map((v, i) => (
                                <div
                                    key={v.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center ${i === 0 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}
                                        >
                                            <span className="text-xs font-bold">
                                                v{v.version_number}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {v.version_label ?? `Version ${v.version_number}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {v.created_by} ·{" "}
                                                {formatDate(v.created_at, "compact")}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={i === 0 ? "success" : "ghost"}>
                                        {v.change_type}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "links" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Link2 className="h-4 w-4" />
                            Entity Links ({mockLinks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockLinks.map((link) => (
                                <div
                                    key={link.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {link.entity_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {link.entity_type}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{link.link_type}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="digital_asset"
                    recordId={mockAsset.id}
                    activityItems={makeMockActivity("digital_asset")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
