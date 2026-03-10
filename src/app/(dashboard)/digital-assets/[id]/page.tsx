"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState } from "@/components/layouts/loading-state";
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
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatDate } from "@/lib/locale";
import { Calendar, Download, Eye, FileBox, History, Link2, Shield, User } from "lucide-react";
type TabId = "details" | "versions" | "links" | "chatter";
const TAB_VALUES = ["details", "versions", "links", "chatter"] as const;

interface VersionEntry {
    id: string;
    version_number: number;
    version_label: string;
    change_type: string;
    created_at: string;
    created_by: string;
}

interface LinkEntry {
    id: string;
    entity_type: string;
    entity_name: string;
    link_type: string;
}

function parseVersions(raw: unknown): VersionEntry[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((v) => ({
        id: String(v.id ?? ""),
        version_number: (v.version_number as number) ?? 0,
        version_label: String(v.version_label ?? ""),
        change_type: String(v.change_type ?? ""),
        created_at: String(v.created_at ?? ""),
        created_by: String(v.created_by ?? ""),
    }));
}

function parseLinks(raw: unknown): LinkEntry[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((l) => ({
        id: String(l.id ?? ""),
        entity_type: String(l.entity_type ?? ""),
        entity_name: String(l.entity_name ?? ""),
        link_type: String(l.link_type ?? ""),
    }));
}

export default function DigitalAssetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord, isLoading } = useDigitalAsset(entityId);
    const da = sbRecord as Record<string, unknown> | null;

    const assetName = (da?.name as string) ?? "";
    const filename = (da?.filename as string) ?? "";
    const description = (da?.description as string) ?? "";
    const assetStatus = (da?.status as string) ?? "draft";
    const assetClassL1 = (da?.asset_class_l1 as string) ?? "";
    const assetClassL2 = (da?.asset_class_l2 as string) ?? "";
    const sensitivity = (da?.sensitivity as string) ?? "";
    const documentNumber = (da?.document_number as string) ?? "";
    const publishedAt = (da?.published_at as string) ?? "";
    const expiresAt = (da?.expires_at as string) ?? "";
    const nextReviewDate = (da?.next_review_date as string) ?? "";
    const lastReviewedAt = (da?.last_reviewed_at as string) ?? "";
    const requiresAcknowledgment = Boolean(da?.requires_acknowledgment);
    const dataPurpose = (da?.data_purpose as string) ?? "";
    const retentionPolicyId = (da?.retention_policy_id as string) ?? "";
    const domains = Array.isArray(da?.domains) ? (da.domains as string[]) : [];
    const versions = parseVersions(da?.versions);
    const links = parseLinks(da?.links);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Digital Asset",
        listPath: "/digital-assets",
        useUpdateHook: useUpdateDigitalAsset,
        useDeleteHook: useDeleteDigitalAsset,
    });
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
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
        { id: "details" as const, label: "Details" },
        { id: "versions" as const, label: "Versions", count: versions.length },
        { id: "links" as const, label: "Links", count: links.length },
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
                        <Badge variant={getStatusVariant(assetStatus) as "default"}>
                            {getStatusLabel(assetStatus)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Class</span>
                        <Badge variant="outline" className="capitalize">
                            {assetClassL1} / {assetClassL2}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Sensitivity</span>
                        <Badge
                            variant={
                                sensitivity === "confidential"
                                    ? "warning"
                                    : sensitivity === "restricted"
                                      ? "destructive"
                                      : "ghost"
                            }
                        >
                            {sensitivity}
                        </Badge>
                    </div>
                    {documentNumber && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Doc #</span>
                            <span className="font-mono text-xs">{documentNumber}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Filename</span>
                        <span className="text-xs truncate max-w-[140px]">{filename}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {publishedAt && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Published</span>
                            <span className="font-medium">
                                {formatDate(publishedAt, "compact")}
                            </span>
                        </div>
                    )}
                    {expiresAt && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires</span>
                            <span className="font-medium">
                                {formatDate(expiresAt, "compact")}
                            </span>
                        </div>
                    )}
                    {nextReviewDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Review</span>
                            <span className="font-medium">
                                {formatDate(nextReviewDate, "compact")}
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
                        {domains.map((d) => (
                            <Chip key={d} size="sm">
                                {d}
                            </Chip>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    if (isLoading) return <LoadingState />;

    return (
        <DetailLayout
            backHref="/digital-assets"
            backLabel="Digital Assets"
            entityType="digital-assets"
            entityId={entityId}
            title={assetName}
            subtitle={`${filename} · ${documentNumber || entityId}`}
            status={assetStatus}
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
                { label: "Edit Metadata", onClick: () => router.push(`/digital-assets/${entityId}/edit`) },
                { label: "Upload New Version", onClick: () => router.push(`/digital-assets/${entityId}/edit?action=upload`) },
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
                                            {sensitivity}
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
                                            {versions[0]?.version_label ?? "v1"}
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
                                            {lastReviewedAt
                                                ? formatDate(lastReviewedAt, "compact")
                                                : "Never"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {description}
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
                                    variant={requiresAcknowledgment ? "info" : "ghost"}
                                >
                                    {requiresAcknowledgment ? "Yes" : "No"}
                                </Badge>
                            </div>
                            {dataPurpose && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Data Purpose</span>
                                    <span className="font-medium">{dataPurpose}</span>
                                </div>
                            )}
                            {retentionPolicyId && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Retention Policy</span>
                                    <span className="font-mono text-xs">
                                        {retentionPolicyId}
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
                            Version History ({versions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {versions.map((v, i) => (
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
                            Entity Links ({links.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {links.map((link) => (
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
                    recordId={entityId}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
