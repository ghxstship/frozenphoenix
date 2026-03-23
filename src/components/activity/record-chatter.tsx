"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ActivityFeed, type ActivityItem } from "./activity-feed";
import { type CommentItem, CommentsSection } from "./comments-section";
import { EntityCommentsSection } from "./entity-comments-section";
import { useMessagingEnabled } from "@/hooks/use-messaging-enabled";
import { Activity, MessageSquare } from "lucide-react";

type ChatterTab = "comments" | "activity";

export interface RecordChatterProps {
    recordType: string;
    recordId: string;
    activityItems?: ActivityItem[] | undefined;
    comments?: CommentItem[] | undefined;
    currentUserId?: string | undefined;
    onAddComment?: (content: string) => Promise<void> | undefined;
    onEditComment?: (id: string, content: string) => Promise<void> | undefined;
    onDeleteComment?: (id: string) => Promise<void> | undefined;
    defaultTab?: ChatterTab | undefined;
    maxActivityItems?: number | undefined;
    className?: string | undefined;
    compact?: boolean | undefined;
}

export function RecordChatter({
    recordType,
    recordId,
    activityItems = [],
    comments = [],
    currentUserId,
    onAddComment,
    onEditComment,
    onDeleteComment,
    defaultTab = "comments",
    maxActivityItems = 20,
    className,
    compact = false,
}: RecordChatterProps) {
    const [tab, setTab] = useState<ChatterTab>(defaultTab);
    const { messagingEnabled } = useMessagingEnabled();

    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-base">Chatter</CardTitle>
                    <SegmentedControl
                        ariaLabel="Chatter view"
                        value={tab}
                        onValueChange={(v) => setTab(v as ChatterTab)}
                        size="sm"
                        options={[
                            {
                                value: "comments",
                                label: `Comments (${comments.length})`,
                                icon: <MessageSquare className="h-3.5 w-3.5" />,
                            },
                            {
                                value: "activity",
                                label: `Activity (${activityItems.length})`,
                                icon: <Activity className="h-3.5 w-3.5" />,
                            },
                        ]}
                    />
                </div>
            </CardHeader>
            <CardContent>
                {tab === "comments" ? (
                    messagingEnabled ? (
                        <EntityCommentsSection entityType={recordType} entityId={recordId} />
                    ) : (
                        <CommentsSection
                            comments={comments}
                            {...(currentUserId ? { currentUserId } : {})}
                            {...(onAddComment ? { onAddComment } : {})}
                            {...(onEditComment ? { onEditComment } : {})}
                            {...(onDeleteComment ? { onDeleteComment } : {})}
                        />
                    )
                ) : (
                    <ActivityFeed
                        items={activityItems}
                        maxItems={maxActivityItems}
                        compact={compact}
                    />
                )}
            </CardContent>
        </Card>
    );
}
