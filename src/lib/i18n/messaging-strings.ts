/**
 * Messaging & Communications — i18n string definitions
 * Pattern: matches auth-strings.ts structure
 */

export const MESSAGING_STRINGS = {
    // Panel & Navigation
    panel_title: "Messages",
    panel_close: "Close messages",
    nav_messages: "Messages",
    nav_channels: "Channels",

    // Conversations
    conversations_title: "Conversations",
    conversations_empty: "No conversations yet",
    conversations_search: "Search conversations...",
    conversations_new: "New conversation",
    conversations_pinned: "Pinned",
    conversations_all: "All conversations",
    conversation_archived: "Archived",
    conversation_muted: "Muted",

    // New Conversation Dialog
    new_dm: "Direct Message",
    new_group: "Group",
    new_channel: "Channel",
    new_group_name: "Group name",
    new_channel_name: "Channel name",
    new_channel_description: "Description (optional)",
    new_channel_public: "Public channel (anyone in the org can join)",
    new_search_people: "Search people...",
    new_creating: "Creating...",
    new_create: "Create",
    new_cancel: "Cancel",

    // Chat View
    chat_no_messages: "No messages yet. Start the conversation!",
    chat_load_more: "Load older messages",
    chat_members_count: "{count} members",
    chat_typing_one: "{name} is typing...",
    chat_typing_many: "{count} people are typing...",

    // Message Composer
    composer_placeholder: "Type a message...",
    composer_send: "Send message",
    composer_replying_to: "Replying to {name}",
    composer_cancel_reply: "Cancel reply",
    composer_mention_hint: "Type @ to mention someone",

    // Message Bubble
    message_edit: "Edit",
    message_delete: "Delete",
    message_pin: "Pin message",
    message_unpin: "Unpin message",
    message_reply: "Reply",
    message_thread: "Reply in thread",
    message_edited: "edited",
    message_deleted: "This message was deleted",
    message_reactions: "Reactions",
    message_read_by: "Read by {count}",

    // Thread Panel
    thread_title: "Thread",
    thread_replies: "{count} replies",
    thread_reply_placeholder: "Reply in thread...",
    thread_back: "Back to conversation",

    // Channel Browser
    channels_browse: "Browse Channels",
    channels_search: "Search channels...",
    channels_all: "All",
    channels_join: "Join",
    channels_leave: "Leave",
    channels_no_match: "No channels match your filters",
    channels_empty: "No channels available",

    // Reactions
    reactions_add: "Add reaction",
    reactions_quick: "Quick reactions",

    // Read Receipts
    read_receipts_title: "Read by",
    read_receipts_none: "No read receipts",

    // Mandatory Read
    mandatory_read_banner: "This message requires acknowledgment",
    mandatory_read_acknowledge: "Acknowledge",
    mandatory_read_acknowledged: "Acknowledged",
    mandatory_read_pending: "{count} pending acknowledgments",

    // Scheduled Messages
    scheduled_title: "Scheduled Messages",
    scheduled_empty: "No scheduled messages",
    scheduled_send_at: "Send at",
    scheduled_cancel: "Cancel scheduled message",

    // Member Management
    members_title: "Members",
    members_add: "Add members",
    members_remove: "Remove member",
    members_no_results: "No members found",

    // Export
    export_title: "Export conversation",
    export_csv: "Export as CSV",
    export_json: "Export as JSON",
    export_downloading: "Downloading...",

    // General
    new_no_members: "No members found",

    // Errors
    error_send_failed: "Failed to send message",
    error_load_failed: "Failed to load messages",
    error_connection: "Connection lost. Reconnecting...",
    error_rate_limit: "You are sending messages too quickly",

    // Accessibility
    a11y_message_list: "Message history",
    a11y_unread_badge: "{count} unread messages",
    a11y_reaction_picker: "Choose a reaction",
    a11y_mention_suggestions: "Mention suggestions",
    a11y_typing_indicator: "Typing indicator",
} as const;

export type MessagingStringKey = keyof typeof MESSAGING_STRINGS;
