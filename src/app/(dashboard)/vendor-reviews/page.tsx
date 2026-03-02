"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Loader2, Plus, Star, ThumbsDown, ThumbsUp, TrendingUp } from "lucide-react";
import { MOCK_VENDOR_REVIEWS } from "@/lib/demo-data-vendor-lifecycle";
import { isSupabaseConfigured, useVendorReviews } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { VendorReviewType } from "@/types/vendor-lifecycle";

const REVIEW_TYPE_LABELS: Record<
    VendorReviewType,
    { label: string; variant: "default" | "info" | "warning" | "destructive" }
> = {
    project_completion: { label: "Project Completion", variant: "info" },
    periodic: { label: "Periodic", variant: "default" },
    incident: { label: "Incident", variant: "destructive" },
    self_assessment: { label: "Self Assessment", variant: "warning" },
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
    const px = size === "sm" ? "h-3 w-3" : "h-4 w-4";
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`${px} ${i <= rating ? "text-star-rating fill-star-rating" : "text-muted-foreground/30"}`}
                />
            ))}
        </div>
    );
}

export default function VendorReviewsPage() {
    const [search, setSearch] = useState("");
    const { data: sbReviews, isLoading } = useVendorReviews();

    const reviews =
        isSupabaseConfigured && sbReviews
            ? (sbReviews as unknown as typeof MOCK_VENDOR_REVIEWS)
            : MOCK_VENDOR_REVIEWS;
    const filtered = reviews.filter(
        (r) =>
            !search ||
            (r.vendorName || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.projectName || "").toLowerCase().includes(search.toLowerCase())
    );

    const avgRating =
        reviews.length > 0
            ? (reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length).toFixed(1)
            : "0";
    const wouldRehireCount = reviews.filter((r) => r.wouldRehire).length;
    const wouldNotRehireCount = reviews.filter((r) => r.wouldRehire === false).length;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="vendor_reviews" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Vendor Reviews"
                    description="Performance reviews, ratings, and rehire recommendations for all vendors and subcontractors"
                >
                    <Link href="/vendor-reviews/new">
                        <Button size="sm">
                            <Plus className="h-4 w-4" /> New Review
                        </Button>
                    </Link>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Reviews" value={reviews.length} icon={Star} />
                    <StatCard title="Avg. Rating" value={avgRating} icon={TrendingUp} />
                    <StatCard title="Would Rehire" value={wouldRehireCount} icon={ThumbsUp} />
                    <StatCard
                        title="Would Not Rehire"
                        value={wouldNotRehireCount}
                        icon={ThumbsDown}
                    />
                </div>

                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search reviews..."
                    className="max-w-sm"
                />

                <div className="space-y-4">
                    {filtered.map((review, i) => (
                        <StaggerItem key={review.id} index={i} stagger="relaxed">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-bold">
                                                    {review.vendorName}
                                                </h3>
                                                <Badge
                                                    variant={
                                                        REVIEW_TYPE_LABELS[review.reviewType]
                                                            .variant
                                                    }
                                                    className="text-[10px]"
                                                >
                                                    {REVIEW_TYPE_LABELS[review.reviewType].label}
                                                </Badge>
                                            </div>
                                            {review.projectName && (
                                                <p className="text-xs text-muted-foreground">
                                                    Project: {review.projectName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <StarRating rating={review.overallRating} size="md" />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {review.reviewDate}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-3">
                                        {[
                                            { label: "Quality", value: review.qualityRating },
                                            { label: "Timeliness", value: review.timelinessRating },
                                            {
                                                label: "Communication",
                                                value: review.communicationRating,
                                            },
                                            {
                                                label: "Professionalism",
                                                value: review.professionalismRating,
                                            },
                                            { label: "Value", value: review.valueRating },
                                            { label: "Safety", value: review.safetyRating },
                                        ]
                                            .filter((r) => r.value !== undefined)
                                            .map((r) => (
                                                <div key={r.label} className="text-center">
                                                    <p className="text-[10px] text-muted-foreground mb-0.5">
                                                        {r.label}
                                                    </p>
                                                    <StarRating rating={r.value!} />
                                                </div>
                                            ))}
                                    </div>

                                    {(review.strengths ||
                                        review.improvements ||
                                        review.comments) && (
                                        <div className="space-y-2 text-xs border-t border-border pt-3">
                                            {review.strengths && (
                                                <div>
                                                    <span className="font-medium text-success">
                                                        Strengths:
                                                    </span>{" "}
                                                    <span className="text-muted-foreground">
                                                        {review.strengths}
                                                    </span>
                                                </div>
                                            )}
                                            {review.improvements && (
                                                <div>
                                                    <span className="font-medium text-warning">
                                                        Improvements:
                                                    </span>{" "}
                                                    <span className="text-muted-foreground">
                                                        {review.improvements}
                                                    </span>
                                                </div>
                                            )}
                                            {review.comments && (
                                                <div>
                                                    <span className="font-medium">Comments:</span>{" "}
                                                    <span className="text-muted-foreground">
                                                        {review.comments}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border text-xs">
                                        <span className="text-muted-foreground">
                                            Reviewed by {review.reviewerName}
                                        </span>
                                        {review.wouldRehire !== undefined && (
                                            <div className="flex items-center gap-1">
                                                {review.wouldRehire ? (
                                                    <>
                                                        <ThumbsUp className="h-3 w-3 text-success" />
                                                        <span className="text-success">
                                                            Would rehire
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ThumbsDown className="h-3 w-3 text-destructive" />
                                                        <span className="text-destructive">
                                                            Would not rehire
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    ))}
                </div>
            </div>
        </PermissionGate>
    );
}
