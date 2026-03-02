"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

interface NetworkContextValue {
    isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextValue>({ isOnline: true });

export function useNetworkStatus() {
    return useContext(NetworkContext);
}

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(() =>
        typeof navigator !== "undefined" ? navigator.onLine : true
    );
    const [showReconnected, setShowReconnected] = useState(false);
    const wasOfflineRef = React.useRef(false);

    const handleOnline = useCallback(() => {
        setIsOnline(true);
        if (wasOfflineRef.current) {
            setShowReconnected(true);
            setTimeout(() => setShowReconnected(false), 3000);
        }
    }, []);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
        wasOfflineRef.current = true;
    }, []);

    useEffect(() => {
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return (
        <NetworkContext.Provider value={{ isOnline }}>
            {children}
            {!isOnline && (
                <div
                    className="fixed top-0 left-0 right-0 z-[200] bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 animate-slide-down"
                    role="alert"
                    aria-live="assertive"
                >
                    <WifiOff className="h-4 w-4" />
                    You are offline. Changes will not be saved until your connection is restored.
                </div>
            )}
            {showReconnected && isOnline && (
                <div
                    className="fixed top-0 left-0 right-0 z-[200] bg-success text-success-foreground px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 animate-slide-down"
                    role="status"
                    aria-live="polite"
                >
                    <Wifi className="h-4 w-4" />
                    Connection restored.
                </div>
            )}
        </NetworkContext.Provider>
    );
}
