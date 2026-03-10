"use client";

import { useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_WORKER_REVIEW_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Calendar, ClipboardCheck, Plus, Star, ThumbsUp } from "lucide-react";
import type { WorkerReview } from "@/types/workforce";
import type { ReviewTargetType } from "@/types/workforce";
import { PermissionGate } from "@/components/permission-guard";

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
                <span className="text-[10px] w-4 text-right">{value}</span>
            </div>
        </div>
    );
}

export default function WorkforceReviewsPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    // NEXT: Wire to useWorkerReviews() when hook is available
    const reviews: WorkerReview[] = [];
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const filtered = reviews.filter((r) => {
        const matchesSearch =
            !search ||
            (r.workerName || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.reviewerName || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.projectName || "").toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "all" || r.targetType === typeFilter;
        return matchesSearch && matchesType;
    });

    const totalReviews = reviews.length;
    const avgRating =
        reviews.length > 0
            ? (reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length).toFixed(1)
            : "0";
    const wouldReengage = reviews.filter((r) => r.wouldReengage).length;
    const pendingAck = reviews.filter((r) => !r.acknowledgedAt).length;

    return (
        <PermissionGate resource="workforce" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Performance Reviews"
                description="Universal review system for all worker classifications — employees, contractors, freelancers, and vendors"
            >
                <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> New Review
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Reviews" value={totalReviews} icon={ClipboardCheck} />
                <StatCard title="Average Rating" value={avgRating} icon={Star} />
                <StatCard title="Would Re-engage" value={wouldReengage} icon={ThumbsUp} />
                <StatCard title="Pending Acknowledgment" value={pendingAck} icon={Calendar} />
            </div>

            <div className="flex items-center gap-3">
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search reviews..."
                    className="flex-1 max-w-sm"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                    <option value="all">All Types</option>
                    {Object.entries(TARGET_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map((review, i) => (
                    <StaggerItem key={review.id} index={i} stagger="normal">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-bold">{review.workerName}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="default" className="text-[10px]">
                                                {TARGET_LABELS[review.targetType]}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground">
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
                                                <span className="text-[10px] text-muted-foreground">
                                                    • {review.projectName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Stars rating={review.overallRating} />
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
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
                                    <RatingRow
                                        label="Reliability"
                                        value={review.reliabilityRating}
                                    />
                                    <RatingRow label="Safety" value={review.safetyRating} />
                                </div>

                                {review.strengths && (
                                    <div className="mb-2">
                                        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">
                                            Strengths
                                        </p>
                                        <p className="text-xs line-clamp-2">{review.strengths}</p>
                                    </div>
                                )}
                                {review.areasForImprovement && (
                                    <div className="mb-2">
                                        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">
                                            Areas for Improvement
                                        </p>
                                        <p className="text-xs line-clamp-2">
                                            {review.areasForImprovement}
                                        </p>
                                    </div>
                                )}
                                {review.goals && (
                                    <div className="mb-2">
                                        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">
                                            Goals
                                        </p>
                                        <p className="text-xs line-clamp-2">{review.goals}</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-3 pt-2 border-t">
                                    <span className="text-[10px] text-muted-foreground">
                                        By {review.reviewerName}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {review.wouldReengage !== undefined && (
                                            <Badge
                                                variant={
                                                    review.wouldReengage ? "success" : "destructive"
                                                }
                                                className="text-[10px]"
                                            >
                                                {review.wouldReengage
                                                    ? "Would Re-engage"
                                                    : "Would Not Re-engage"}
                                            </Badge>
                                        )}
                                        {review.acknowledgedAt ? (
                                            <span className="text-[10px] text-success">
                                                Acknowledged
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-warning">
                                                Pending Ack
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12">
                    <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No reviews found</p>
                </div>
            )}
            <CreateEntityDialog config={CREATE_WORKER_REVIEW_CONFIG} open={createOpen} onClose={closeCreate} />
        </div>
        </PermissionGate>
    );
}
