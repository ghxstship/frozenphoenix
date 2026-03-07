"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useCreativeAsset,
    useDeleteCreativeAsset,
    useUpdateCreativeAsset,
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
import { Calendar, Download, Eye, MessageSquare, Palette, User } from "lucide-react";

type TabId = "details" | "reviews" | "chatter";
const TAB_VALUES = ["details", "reviews", "chatter"] as const;

const mockCreativeAsset = {
    id: "ca-1",
    name: "Hero Banner — Nike Air Max 2026",
    asset_role: "hero" as const,
    production_status: "approved" as const,
    target_channels: ["social_media", "digital_display"],
    brand_compliance_score: 92,
    locale: "en-US",
    specs: { width: 1920, height: 1080, format: "PNG", dpi: 300 },
    due_date: "2026-03-01",
    approved_at: "2026-02-28T14:00:00Z",
    assigned_to: "Maya Rodriguez",
    campaign_name: "Nike Air Max 2026 Launch",
    description:
        "Primary hero banner for the Air Max 2026 launch campaign. Features product shot with dynamic motion blur and brand palette gradient.",
};

const mockReviews = [
    {
        id: "r1",
        reviewer: "Creative Director",
        gate: "brand_review",
        status: "approved",
        score: 95,
        feedback: "Excellent brand alignment. Approved.",
        reviewed_at: "2026-02-27",
    },
    {
        id: "r2",
        reviewer: "Marketing Lead",
        gate: "client_review",
        status: "approved",
        score: 88,
        feedback: "Minor color tweak needed on CTA. Updated and approved.",
        reviewed_at: "2026-02-28",
    },
    {
        id: "r3",
        reviewer: "Legal Review",
        gate: "legal_review",
        status: "pending",
        score: null,
        feedback: null,
        reviewed_at: null,
    },
];

export default function CreativeAssetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord } = useCreativeAsset(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Creative Asset",
        listPath: "/creative-assets",
        useUpdateHook: useUpdateCreativeAsset,
        useDeleteHook: useDeleteCreativeAsset,
    });
    void router;
    void sbRecord;
    void handleUpdate;
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
        { id: "reviews" as const, label: "Reviews", count: mockReviews.length },
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
                        <Badge
                            variant={
                                getStatusVariant(mockCreativeAsset.production_status) as "default"
                            }
                        >
                            {getStatusLabel(mockCreativeAsset.production_status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Role</span>
                        <Badge variant="outline" className="capitalize">
                            {mockCreativeAsset.asset_role}
                        </Badge>
                    </div>
                    {mockCreativeAsset.brand_compliance_score !== null && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Brand Score</span>
                            <Badge
                                variant={
                                    mockCreativeAsset.brand_compliance_score >= 80
                                        ? "success"
                                        : "warning"
                                }
                            >
                                {mockCreativeAsset.brand_compliance_score}%
                            </Badge>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Locale</span>
                        <span className="font-mono text-xs">{mockCreativeAsset.locale}</span>
                    </div>
                    {mockCreativeAsset.due_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Due</span>
                            <span className="font-medium">
                                {formatDate(mockCreativeAsset.due_date, "compact")}
                            </span>
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
                        {mockCreativeAsset.target_channels.map((ch) => (
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
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions</span>
                        <span className="font-mono text-xs">
                            {mockCreativeAsset.specs.width}×{mockCreativeAsset.specs.height}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Format</span>
                        <span className="font-medium">{mockCreativeAsset.specs.format}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">DPI</span>
                        <span className="font-medium">{mockCreativeAsset.specs.dpi}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/creative-assets"
            backLabel="Creative Assets"
            entityType="creative-assets"
            entityId={entityId}
            title={mockCreativeAsset.name}
            subtitle={`${mockCreativeAsset.campaign_name} · ${mockCreativeAsset.asset_role}`}
            status={mockCreativeAsset.production_status}
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
            menuItems={[
                { label: "Edit Asset", onClick: () => {} },
                { label: "Submit for Review", onClick: () => {} },
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
                                    <Palette className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Brand Score</p>
                                        <p className="text-lg font-bold">
                                            {mockCreativeAsset.brand_compliance_score}%
                                        </p>
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
                                            {mockCreativeAsset.approved_at
                                                ? formatDate(
                                                      mockCreativeAsset.approved_at,
                                                      "compact"
                                                  )
                                                : "Pending"}
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
                                            {mockCreativeAsset.assigned_to ?? "Unassigned"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {mockCreativeAsset.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {mockCreativeAsset.description}
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
                                <p className="text-sm text-muted-foreground">
                                    Asset preview placeholder
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "reviews" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Reviews ({mockReviews.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockReviews.map((review) => (
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
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="creative_asset"
                    recordId={mockCreativeAsset.id}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
