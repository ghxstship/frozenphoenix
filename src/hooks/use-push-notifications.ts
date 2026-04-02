"use client";

import { useCallback, useEffect, useState } from "react";

type PushPermissionState = "default" | "granted" | "denied" | "unsupported";

interface UsePushNotificationsReturn {
    isSupported: boolean;
    permissionState: PushPermissionState;
    isSubscribed: boolean;
    isLoading: boolean;
    subscribe: () => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const uint8 = Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
    return uint8.buffer as ArrayBuffer;
}

/**
 * usePushNotifications
 *
 * Manages the full Web Push subscription lifecycle:
 * 1. Checks browser support and current permission/subscription state
 * 2. subscribe() — requests permission, calls pushManager.subscribe(), POSTs to /api/push/subscribe
 * 3. unsubscribe() — calls pushSubscription.unsubscribe(), DELETEs from /api/push/subscribe
 *
 * Uses the NEXT_PUBLIC_VAPID_PUBLIC_KEY env var for the applicationServerKey.
 * Returns isSupported=false and is effectively a no-op if VAPID key is absent.
 */
export function usePushNotifications(): UsePushNotificationsReturn {
    const isSupported =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        !!VAPID_PUBLIC_KEY;

    const [permissionState, setPermissionState] = useState<PushPermissionState>(
        isSupported ? (Notification.permission as PushPermissionState) : "unsupported"
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState<PushSubscription | null>(null);

    // On mount: check existing subscription state
    useEffect(() => {
        if (!isSupported) return;

        async function checkSubscription() {
            try {
                const registration = await navigator.serviceWorker.ready;
                const existing = await registration.pushManager.getSubscription();
                setIsSubscribed(!!existing);
                setCurrentSubscription(existing);
                setPermissionState(Notification.permission as PushPermissionState);
            } catch {
                // SW not ready or push not available
            }
        }

        void checkSubscription();
    }, [isSupported]);

    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!isSupported || !VAPID_PUBLIC_KEY) return false;
        setIsLoading(true);
        try {
            // Request notification permission
            const permission = await Notification.requestPermission();
            setPermissionState(permission as PushPermissionState);
            if (permission !== "granted") return false;

            // Subscribe via pushManager
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            // Persist to backend
            const res = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscription: subscription.toJSON() }),
            });

            if (!res.ok) {
                await subscription.unsubscribe();
                return false;
            }

            setIsSubscribed(true);
            setCurrentSubscription(subscription);
            return true;
        } catch {
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    const unsubscribe = useCallback(async (): Promise<boolean> => {
        if (!isSupported || !currentSubscription) return false;
        setIsLoading(true);
        try {
            const endpoint = currentSubscription.endpoint;
            await currentSubscription.unsubscribe();

            await fetch("/api/push/subscribe", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ endpoint }),
            });

            setIsSubscribed(false);
            setCurrentSubscription(null);
            return true;
        } catch {
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported, currentSubscription]);

    return { isSupported, permissionState, isSubscribed, isLoading, subscribe, unsubscribe };
}
