"use client";

import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_WORKER_REVIEW_CONFIG } from "@/config/create-entity-configs";
import { OperationalDashboardShell } from "@/components/shells";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Calendar, ClipboardCheck, Plus, Star, ThumbsUp } from "lucide-react";
import type { WorkerReview } from "@/types/workforce";
import type { ReviewTargetType } from "@/types/workforce";
import { useWorkerReviewsList } from "@/lib/supabase";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

const TARGET_LABELS: Record<ReviewTargetType, string> = {
    employee: "Employee",
    contractor: "Contractor",
    vendor: "Vendor",
    freelancer: "Freelancer",
    intern: "Intern",
};

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={`h-3.5 w-3.5 ${n <= rating ? "fill-star-rating text-star-rating" : "text-muted-foreground/30"}`}
                />
            ))}
        </div>
    );
}

function RatingRow({ label, value }: { label: string; value?: number }) {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-1">
                <Stars rating={value} />
                <span className="density-caption w-4 text-right">{value}</span>
            </div>
        </div>
    );
}

export function ReviewsPageClient() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const { data: sbReviews, isLoading } = useWorkerReviewsList();
    const reviews: WorkerReview[] = (sbReviews ?? []) as unknown as WorkerReview[];

    const config: DashboardPageConfig = {
        resource: "workforce",
        title: "Performance Reviews",
        description:
            "Universal review system for all worker classifications — employees, contractors, freelancers, and vendors",
        headerActions: (
            <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> New Review
            </Button>
        ),
        stats: [
            {
                label: "Total Reviews",
                icon: ClipboardCheck,
                compute: (d) => d.length,
            },
            {
                label: "Average Rating",
                icon: Star,
                compute: (d) =>
                    d.length > 0
                        ? (
                              d.reduce((s, r) => s + (Number(r.overallRating) || 0), 0) / d.length
                          ).toFixed(1)
                        : "0",
            },
            {
                label: "Would Re-engage",
                icon: ThumbsUp,
                compute: (d) => d.filter((r) => r.wouldReengage).length,
            },
            {
                label: "Pending Acknowledgment",
                icon: Calendar,
                compute: (d) => d.filter((r) => !r.acknowledgedAt).length,
            },
        ],
        searchable: true,
        searchPlaceholder: "Search reviews...",
        searchKeys: ["workerName", "reviewerName", "projectName"],
        filters: [
            {
                id: "targetType",
                label: "Type",
                type: "select",
                options: [
                    { value: "all", label: "All Types" },
                    ...Object.entries(TARGET_LABELS).map(([value, label]) => ({ value, label })),
                ],
                defaultValue: "all",
                predicate: (item, val) => val === "all" || item.targetType === val,
            },
        ],
        cardLayout: "grid",
        gridCols: "grid-cols-1 lg:grid-cols-2",
        cardRenderer: (item, i) => {
            const review = item as unknown as WorkerReview;
            return (
                <StaggerItem key={review.id} index={i} stagger="normal">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-bold">{review.workerName}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="default" className="density-caption">
                                            {TARGET_LABELS[review.targetType]}
                                        </Badge>
                                        <span className="density-caption text-muted-foreground">
                                            {{
                                                annual: "Annual",
                                                quarterly: "Quarterly",
                                                probationary: "Probationary",
                                                peer_review: "Peer Review",
                                                self_assessment: "Self Assessment",
                                                project_review: "Project Review",
                                            }[review.reviewType] ??
                                                review.reviewType.replace(/_/g, " ")}
                                        </span>
                                        {review.projectName && (
                                            <span className="density-caption text-muted-foreground">
                                                • {review.projectName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Stars rating={review.overallRating} />
                                    <p className="density-caption text-muted-foreground mt-0.5">
                                        {new Date(review.reviewDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1 mb-3">
                                <RatingRow label="Quality" value={review.qualityRating} />
                                <RatingRow label="Timeliness" value={review.timelinessRating} />
                                <RatingRow
                                    label="Communication"
                                    value={review.communicationRating}
                                />
                                <RatingRow
                                    label="Professionalism"
                                    value={review.professionalismRating}
                                />
                                <RatingRow label="Reliability" value={review.reliabilityRating} />
                                <RatingRow label="Safety" value={review.safetyRating} />
                            </div>

                            {review.strengths && (
                                <div className="mb-2">
                                    <p className="density-caption font-medium text-muted-foreground mb-0.5">
                                        Strengths
                                    </p>
                                    <p className="text-xs line-clamp-2">{review.strengths}</p>
                                </div>
                            )}
                            {review.areasForImprovement && (
                                <div className="mb-2">
                                    <p className="density-caption font-medium text-muted-foreground mb-0.5">
                                        Areas for Improvement
                                    </p>
                                    <p className="text-xs line-clamp-2">
                                        {review.areasForImprovement}
                                    </p>
                                </div>
                            )}
                            {review.goals && (
                                <div className="mb-2">
                                    <p className="density-caption font-medium text-muted-foreground mb-0.5">
                                        Goals
                                    </p>
                                    <p className="text-xs line-clamp-2">{review.goals}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-3 pt-2 border-t">
                                <span className="density-caption text-muted-foreground">
                                    By {review.reviewerName}
                                </span>
                                <div className="flex items-center gap-2">
                                    {review.wouldReengage !== undefined && (
                                        <Badge
                                            variant={
                                                review.wouldReengage ? "success" : "destructive"
                                            }
                                            className="density-caption"
                                        >
                                            {review.wouldReengage
                                                ? "Would Re-engage"
                                                : "Would Not Re-engage"}
                                        </Badge>
                                    )}
                                    {review.acknowledgedAt ? (
                                        <span className="density-caption text-success">
                                            Acknowledged
                                        </span>
                                    ) : (
                                        <span className="density-caption text-warning">
                                            Pending Ack
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </StaggerItem>
            );
        },
        emptyState: {
            icon: Star,
            title: "No reviews found",
        },
    };

    return (
        <>
            <OperationalDashboardShell
                config={config}
                data={(reviews ?? []) as unknown as Record<string, unknown>[]}
                isLoading={isLoading}
            />
            <CreateEntityDialog
                config={CREATE_WORKER_REVIEW_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </>
    );
}
