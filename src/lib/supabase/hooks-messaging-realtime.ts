"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "./client";

// ─── Typing Indicator (Supabase Broadcast — ephemeral, no DB) ───

interface TypingUser {
    userId: string;
    name: string;
}

export function useTypingIndicator(conversationId: string | undefined) {
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>["channel"]> | null>(null);
    const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    useEffect(() => {
        if (!conversationId) return;

        const supabase = getSupabase();
        const channel = supabase.channel(`typing:${conversationId}`);

        channel
            .on("broadcast", { event: "typing" }, ({ payload }: { payload: Record<string, unknown> }) => {
                const user = payload as unknown as TypingUser;
                setTypingUsers((prev) => {
                    const exists = prev.some((u) => u.userId === user.userId);
                    if (!exists) return [...prev, user];
                    return prev;
                });

                // Clear after 3 seconds of no typing
                const existing = timeoutsRef.current.get(user.userId);
                if (existing) clearTimeout(existing);
                timeoutsRef.current.set(
                    user.userId,
                    setTimeout(() => {
                        setTypingUsers((prev) => prev.filter((u) => u.userId !== user.userId));
                        timeoutsRef.current.delete(user.userId);
                    }, 3000)
                );
            })
            .on("broadcast", { event: "stop_typing" }, ({ payload }: { payload: Record<string, unknown> }) => {
                const { userId } = payload as unknown as { userId: string };
                setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
                const existing = timeoutsRef.current.get(userId);
                if (existing) {
                    clearTimeout(existing);
                    timeoutsRef.current.delete(userId);
                }
            })
            .subscribe();

        channelRef.current = channel;

        const timeouts = timeoutsRef.current;
        return () => {
            for (const timeout of timeouts.values()) {
                clearTimeout(timeout);
            }
            timeouts.clear();
            setTypingUsers([]);
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    const sendTyping = useCallback(
        (userId: string, name: string) => {
            channelRef.current?.send({
                type: "broadcast",
                event: "typing",
                payload: { userId, name },
            });
        },
        []
    );

    const sendStopTyping = useCallback(
        (userId: string) => {
            channelRef.current?.send({
                type: "broadcast",
                event: "stop_typing",
                payload: { userId },
            });
        },
        []
    );

    return { typingUsers, sendTyping, sendStopTyping };
}

// ─── Presence (Supabase Realtime Presence) ───

interface PresenceUser {
    userId: string;
    name: string;
    status: "online" | "away" | "dnd" | "offline";
    lastSeen: string;
}

export function usePresence(channelName = "global-presence") {
    const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
    const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>["channel"]> | null>(null);

    useEffect(() => {
        const supabase = getSupabase();
        const channel = supabase.channel(channelName, {
            config: { presence: { key: "user" } },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                const users: PresenceUser[] = [];
                for (const key of Object.keys(state)) {
                    const presences = state[key];
                    if (presences && presences.length > 0) {
                        users.push(presences[0] as PresenceUser);
                    }
                }
                setOnlineUsers(users);
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [channelName]);

    const trackPresence = useCallback(
        (user: Omit<PresenceUser, "lastSeen">) => {
            channelRef.current?.track({
                ...user,
                lastSeen: new Date().toISOString(),
            });
        },
        []
    );

    const untrack = useCallback(() => {
        channelRef.current?.untrack();
    }, []);

    return { onlineUsers, trackPresence, untrack };
}

// ─── Messages Realtime (postgres_changes on messages table) ───

export function useMessagesRealtime(conversationId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!conversationId) return;

        const supabase = getSupabase();
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversationId}`,
                },
                () => {
                    queryClient.invalidateQueries({
                        queryKey: ["messaging", "messages", conversationId],
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "message_reactions",
                },
                () => {
                    queryClient.invalidateQueries({
                        queryKey: ["messaging", "messages", conversationId],
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);
}

// ─── Conversations Realtime (conversation updates) ───

export function useConversationsRealtime() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const supabase = getSupabase();
        const channel = supabase
            .channel("conversations-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "conversations",
                },
                () => {
                    queryClient.invalidateQueries({
                        queryKey: ["messaging", "conversations"],
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "conversation_members",
                },
                () => {
                    queryClient.invalidateQueries({
                        queryKey: ["messaging", "conversations"],
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
}
