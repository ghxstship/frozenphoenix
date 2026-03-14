"use client";

import { useParams, useRouter } from "next/navigation";
import {
    useCreativeAsset,
    useDeleteCreativeAsset,
    useUpdateCreativeAsset,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatDate } from "@/lib/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { Calendar, Download, Eye, MessageSquare, Palette, User } from "lucide-react";

interface ReviewItem {
    id: string;
    reviewer: string;
    gate: string;
    status: string;
    score: number | null;
    feedback: string | null;
    reviewed_at: string | null;
}

function parseReviews(raw: unknown): ReviewItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((r, i) => ({
        id: String(r.id ?? `r-${i}`),
        reviewer: String(r.reviewer ?? ""),
        gate: String(r.gate ?? ""),
        status: String(r.status ?? "pending"),
        score: typeof r.score === "number" ? r.score : null,
        feedback: typeof r.feedback === "string" ? r.feedback : null,
        reviewed_at: typeof r.reviewed_at === "string" ? r.reviewed_at : null,
    }));
}

function parseSpecs(raw: unknown): { width: number; height: number; format: string; dpi: number } {
    const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    return {
        width: (s.width as number) ?? 0,
        height: (s.height as number) ?? 0,
        format: (s.format as string) ?? "",
        dpi: (s.dpi as number) ?? 0,
    };
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "creative-assets",
    titleKey: "name",
    statusKey: "production_status",
    icon: Palette,
    backHref: "/creative-assets",
    backLabel: "Creative Assets",
    chatterRecordType: "creative_asset",
    fields: [],
    tabs: [],
};

export default function CreativeAssetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord, isLoading } = useCreativeAsset(entityId);
    const ca = sbRecord as Record<string, unknown> | null;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Creative Asset",
        listPath: "/creative-assets",
        useUpdateHook: useUpdateCreativeAsset,
        useDeleteHook: useDeleteCreativeAsset,
    });

    const assetRole = (ca?.asset_role as string) ?? "";
    const productionStatus = (ca?.production_status as string) ?? "draft";
    const targetChannels = Array.isArray(ca?.target_channels)
        ? (ca.target_channels as string[])
        : [];
    const brandComplianceScore =
        typeof ca?.brand_compliance_score === "number" ? ca.brand_compliance_score : null;
    const locale = (ca?.locale as string) ?? "";
    const specs = parseSpecs(ca?.specs);
    const dueDate = (ca?.due_date as string) ?? "";
    const approvedAt = (ca?.approved_at as string) ?? "";
    const assignedTo = (ca?.assigned_to as string) ?? "";
    const campaignName = (ca?.campaign_name as string) ?? "";
    const description = (ca?.description as string) ?? "";
    const reviews = parseReviews(ca?.reviews);

    const sidebarSlot = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Asset Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(productionStatus) as "default"}>
                            {getStatusLabel(productionStatus)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Role</span>
                        <Badge variant="outline" className="capitalize">
                            {assetRole}
                        </Badge>
                    </div>
                    {brandComplianceScore !== null && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Brand Score</span>
                            <Badge variant={brandComplianceScore >= 80 ? "success" : "warning"}>
                                {brandComplianceScore}%
                            </Badge>
                        </div>
                    )}
                    {locale && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Locale</span>
                            <span className="font-mono text-xs">{locale}</span>
                        </div>
                    )}
                    {dueDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Due</span>
                            <span className="font-medium">{formatDate(dueDate, "compact")}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Channels</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                        {targetChannels.map((ch) => (
                            <Chip key={ch} size="sm">
                                {ch.replace(/_/g, " ")}
                            </Chip>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Specs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {(specs.width > 0 || specs.height > 0) && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Dimensions</span>
                            <span className="font-mono text-xs">
                                {specs.width}×{specs.height}
                            </span>
                        </div>
                    )}
                    {specs.format && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Format</span>
                            <span className="font-medium">{specs.format}</span>
                        </div>
                    )}
                    {specs.dpi > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">DPI</span>
                            <span className="font-medium">{specs.dpi}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const overviewSlot = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <Palette className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Brand Score</p>
                                <p className="text-lg font-bold">{brandComplianceScore ?? "—"}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-info" />
                            <div>
                                <p className="text-xs text-muted-foreground">Approved</p>
                                <p className="text-sm font-semibold">
                                    {approvedAt ? formatDate(approvedAt, "compact") : "Pending"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-warning" />
                            <div>
                                <p className="text-xs text-muted-foreground">Assigned To</p>
                                <p className="text-sm font-semibold">
                                    {assignedTo || "Unassigned"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {!!description && (
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
                    <CardTitle className="text-base">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border bg-secondary/30 h-48 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Asset preview placeholder</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => `${campaignName} · ${assetRole}`,
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "reviews",
                label: "Reviews",
                count: reviews.length,
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Reviews ({reviews.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="p-3 rounded-lg bg-secondary/20 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {review.reviewer}
                                                </p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {review.gate.replace(/_/g, " ")}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {review.score !== null && (
                                                    <span className="text-xs font-bold">
                                                        {review.score}%
                                                    </span>
                                                )}
                                                <Badge
                                                    variant={
                                                        review.status === "approved"
                                                            ? "success"
                                                            : review.status === "rejected"
                                                              ? "destructive"
                                                              : "ghost"
                                                    }
                                                >
                                                    {review.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        {review.feedback && (
                                            <p className="text-xs text-muted-foreground">
                                                {review.feedback}
                                            </p>
                                        )}
                                        {review.reviewed_at && (
                                            <p className="text-[10px] text-muted-foreground/60">
                                                {formatDate(review.reviewed_at, "compact")}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
        ],
    };

    const record = ca ? { ...(ca as Record<string, unknown>) } : null;

    return (
        <DetailPageShell
            config={config}
            id={entityId}
            record={record}
            isLoading={isLoading}
            menuItems={[
                {
                    label: "Edit Asset",
                    onClick: () => router.push(`/creative-assets/${entityId}/edit`),
                },
                {
                    label: "Submit for Review",
                    onClick: () => handleUpdate({ status: "in_review" }),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Palette className="h-7 w-7 text-primary-foreground" />
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
