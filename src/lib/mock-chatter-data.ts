import type { ActivityItem } from "@/components/activity/activity-feed";
import type { CommentItem } from "@/components/activity/comments-section";

export function makeMockActivity(recordType: string): ActivityItem[] {
    const now = Date.now();
    return [
        {
            id: "a1",
            action: "created",
            actorName: "Sarah Chen",
            entityType: recordType,
            entityName: `this ${recordType}`,
            createdAt: new Date(now - 14 * 86400000).toISOString(),
        },
        {
            id: "a2",
            action: "updated",
            actorName: "Mike Johnson",
            entityType: recordType,
            description: "Updated details",
            createdAt: new Date(now - 10 * 86400000).toISOString(),
        },
        {
            id: "a3",
            action: "status_changed",
            actorName: "Sarah Chen",
            entityType: recordType,
            description: "Status changed",
            createdAt: new Date(now - 7 * 86400000).toISOString(),
        },
        {
            id: "a4",
            action: "commented",
            actorName: "Alex Rivera",
            entityType: recordType,
            description: "Left a comment",
            createdAt: new Date(now - 3 * 86400000).toISOString(),
        },
    ];
}

export function makeMockComments(): CommentItem[] {
    const now = Date.now();
    return [
        {
            id: "c1",
            authorId: "u1",
            authorName: "Sarah Chen",
            content: "Looks good — let's proceed with the current plan.",
            createdAt: new Date(now - 5 * 86400000).toISOString(),
        },
        {
            id: "c2",
            authorId: "u2",
            authorName: "Mike Johnson",
            content: "Agreed. I'll update the timeline accordingly.",
            createdAt: new Date(now - 3 * 86400000).toISOString(),
        },
    ];
}
