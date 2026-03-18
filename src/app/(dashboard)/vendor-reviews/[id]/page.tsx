"use client";

import { useParams } from "next/navigation";
import { useDeleteVendorReview, useUpdateVendorReview, useVendorReview } from "@/lib/supabase";
import { useReviewCycles, useReviewFeedback } from "@/lib/supabase/hooks-feature-gaps";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layouts/empty-state";
import { ClipboardCheck, Loader2, MessageCircle, RefreshCw, Star } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

function ReviewCyclesTab() {
    const { data: cycles, isLoading } = useReviewCycles();
    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }
    if (!cycles || cycles.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No review cycles found.
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    Review Cycles ({cycles.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {cycles.map((c) => (
                        <div
                            key={c.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {String(c.name ?? c.id)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {String(c.status ?? "active")}
                                </p>
                            </div>
                            <Badge variant={c.status === "completed" ? "success" : "ghost"}>
                                {String(c.status ?? "active")}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ReviewFeedbackTab() {
    const { data: feedback, isLoading } = useReviewFeedback();
    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }
    if (!feedback || feedback.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No review feedback found.
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Review Feedback ({feedback.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {feedback.map((f) => (
                        <div key={f.id} className="p-3 rounded-lg bg-secondary/20">
                            <p className="text-sm font-medium">
                                {String(f.reviewer_id ?? "Reviewer")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {String(f.comments ?? "No comments")}
                            </p>
                            {typeof f.overall_rating === "number" && (
                                <p className="text-xs font-semibold mt-1">
                                    Rating: {f.overall_rating}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

const CONFIG: DetailPageConfig = {
    entityKey: "vendor_reviews",
    titleKey: "title",
    statusKey: "status",
    icon: ClipboardCheck,
    backHref: "/vendor-reviews",
    backLabel: "Vendor Reviews",
    chatterRecordType: "vendor_review",
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "overall_score", label: "Rating", accessorKey: "overall_score" },
        { id: "review_date", label: "Review Date", accessorKey: "review_date", fieldType: "date" },
    ],
    fields: [
        { id: "overall_score", label: "Overall Score", accessorKey: "overall_score" },
        { id: "comments", label: "Comments", accessorKey: "comments", fullWidth: true },
        { id: "notes", label: "Notes", accessorKey: "notes", fullWidth: true },
    ],
    tabs: [
        {
            id: "scores",
            label: "Scores",
            content: (
                <EmptyState
                    icon={Star}
                    title="No scores recorded"
                    description="Detailed scoring breakdown for this vendor review will appear here."
                    compact
                />
            ),
        },
        {
            id: "review-cycles",
            label: "Review Cycles",
            content: <ReviewCyclesTab />,
        },
        {
            id: "feedback",
            label: "Feedback",
            content: <ReviewFeedbackTab />,
        },
    ],
};

export default function VendorReviewDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: review, isLoading } = useVendorReview(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Vendor Review",
        listPath: "/vendor-reviews",
        useUpdateHook: useUpdateVendorReview,
        useDeleteHook: useDeleteVendorReview,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={entityId}
            record={review as Record<string, unknown> | null}
            isLoading={isLoading}
            menuItems={crudMenuItems}
        />
    );
}
