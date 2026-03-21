/**
 * @Mention parsing utilities for the comments/notification system.
 * Extracts @mentions from text, resolves them against a user directory,
 * and generates notification payloads.
 */

export interface MentionMatch {
    username: string;
    startIndex: number;
    endIndex: number;
    userId?: string;
    displayName?: string;
}

export interface MentionNotificationPayload {
    recipientUserId: string;
    recipientUsername: string;
    senderName: string;
    entityType: string;
    entityId: string;
    commentId: string;
    mentionContext: string;
}

const MENTION_REGEX = /@([a-zA-Z0-9_.-]+)/g;

/**
 * Extract all @mentions from a text string.
 */
export function extractMentions(text: string): MentionMatch[] {
    const matches: MentionMatch[] = [];
    let match: RegExpExecArray | null;

    const regex = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
    while ((match = regex.exec(text)) !== null) {
        matches.push({
            username: match[1]!,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
        });
    }

    return matches;
}

/**
 * Resolve mentions against a user directory (array of {id, username, displayName}).
 */
export function resolveMentions(
    mentions: MentionMatch[],
    userDirectory: Array<{ id: string; username: string; displayName: string }>
): MentionMatch[] {
    return mentions.map((mention) => {
        const user = userDirectory.find(
            (u) => u.username.toLowerCase() === mention.username.toLowerCase()
        );
        if (user) {
            return {
                ...mention,
                userId: user.id,
                displayName: user.displayName,
            };
        }
        return mention;
    });
}

/**
 * Build notification payloads for resolved mentions.
 */
export function buildMentionNotifications(
    resolvedMentions: MentionMatch[],
    context: {
        senderName: string;
        entityType: string;
        entityId: string;
        commentId: string;
        commentText: string;
    }
): MentionNotificationPayload[] {
    const truncatedContext =
        context.commentText.length > 120
            ? context.commentText.slice(0, 120) + "..."
            : context.commentText;

    return resolvedMentions
        .filter((m) => m.userId)
        .map((mention) => ({
            recipientUserId: mention.userId!,
            recipientUsername: mention.username,
            senderName: context.senderName,
            entityType: context.entityType,
            entityId: context.entityId,
            commentId: context.commentId,
            mentionContext: truncatedContext,
        }));
}

/**
 * Render text with @mentions highlighted as styled spans.
 * Returns an array of React-compatible segments.
 */
export function segmentMentionText(
    text: string
): Array<{ type: "text" | "mention"; value: string }> {
    const segments: Array<{ type: "text" | "mention"; value: string }> = [];
    const regex = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
        }
        segments.push({ type: "mention", value: match[0] });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        segments.push({ type: "text", value: text.slice(lastIndex) });
    }

    return segments;
}

/**
 * Get autocomplete suggestions for a partial @mention query.
 */
export function getMentionSuggestions(
    query: string,
    userDirectory: Array<{ id: string; username: string; displayName: string }>,
    limit = 5
): Array<{ id: string; username: string; displayName: string }> {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return userDirectory
        .filter(
            (u) =>
                u.username.toLowerCase().includes(lowerQuery) ||
                u.displayName.toLowerCase().includes(lowerQuery)
        )
        .slice(0, limit);
}
