"use client";

import { useRouter } from "next/navigation";
import { useDeleteDigitalAsset, useDigitalAsset, useUpdateDigitalAsset } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { formatDate } from "@/lib/formatters/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { Calendar, Download, Eye, FileBox, History, Link2, Shield, User } from "lucide-react";

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

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "digital_asset",
    titleKey: "name",
    statusKey: "status",
    icon: FileBox,
    backHref: "/digital-assets",
    backLabel: "Digital Assets",
    chatterRecordType: "digital_asset",
    fields: [
        {
            id: "asset_class_l1",
            label: "Class L1",
            accessorKey: "asset_class_l1",
            fieldType: "status",
        },
        {
            id: "asset_class_l2",
            label: "Class L2",
            accessorKey: "asset_class_l2",
            fieldType: "status",
        },
        {
            id: "sensitivity",
            label: "Sensitivity",
            accessorKey: "sensitivity",
            fieldType: "status",
        },
        { id: "document_number", label: "Doc #", accessorKey: "document_number" },
        { id: "filename", label: "Filename", accessorKey: "filename" },
    ],
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "asset_class_l1",
            label: "Class",
            accessorKey: "asset_class_l1",
            fieldType: "status",
        },
        {
            id: "sensitivity",
            label: "Sensitivity",
            accessorKey: "sensitivity",
            fieldType: "status",
        },
        { id: "document_number", label: "Doc #", accessorKey: "document_number" },
        { id: "filename", label: "Filename", accessorKey: "filename" },
    ],
    tabs: [],
};

export function DigitalAssetDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { data: sbRecord, isLoading } = useDigitalAsset(id);
    const da = (sbRecord ?? initialRecord) as Record<string, unknown> | null;

    const filename = (da?.filename as string) ?? "";
    const description = (da?.description as string) ?? "";
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
        entityId: id,
        entityLabel: "Digital Asset",
        listPath: "/digital-assets",
        useUpdateHook: useUpdateDigitalAsset,
        useDeleteHook: useDeleteDigitalAsset,
    });

    const sidebarSlot = (
        <div className="density-gap-section">
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
                            <span className="font-medium">{formatDate(expiresAt, "compact")}</span>
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

    const overviewSlot = (
        <div className="density-gap-page">
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
                        <span className="text-muted-foreground">Requires Acknowledgment</span>
                        <Badge variant={requiresAcknowledgment ? "info" : "ghost"}>
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
                            <span className="font-mono text-xs">{retentionPolicyId}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => `${filename} · ${documentNumber || id}`,
        sidebarSlot,
        overviewSlot,
        stats: [
            { label: "Sensitivity", icon: Shield, compute: () => sensitivity },
            { label: "Version", icon: History, compute: () => versions[0]?.version_label ?? "v1" },
            {
                label: "Last Reviewed",
                icon: Calendar,
                compute: () => (lastReviewedAt ? formatDate(lastReviewedAt, "compact") : "Never"),
            },
        ],
        tabs: [
            {
                id: "versions",
                label: "Versions",
                count: versions.length,
                content: (
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
                                                    {v.version_label ??
                                                        `Version ${v.version_number}`}
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
                ),
            },
            {
                id: "links",
                label: "Links",
                count: links.length,
                content: (
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
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={da}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                {
                    label: "Edit Metadata",
                    onClick: () => router.push(`/digital-assets/${id}/edit`),
                },
                {
                    label: "Upload New Version",
                    onClick: () => router.push(`/digital-assets/${id}/edit?action=upload`),
                },
                ...crudMenuItems,
            ]}
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
        />
    );
}
