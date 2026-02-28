"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface BotProtectionProps {
    siteKey?: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    action?: string;
}

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: HTMLElement,
                options: Record<string, unknown>
            ) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

export function BotProtection({
    siteKey,
    onVerify,
    onError,
    onExpire,
    action = "auth",
}: BotProtectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const resolvedSiteKey =
        siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const handleVerify = useCallback(
        (token: string) => onVerify(token),
        [onVerify]
    );

    useEffect(() => {
        if (!resolvedSiteKey || !containerRef.current) return;

        const renderWidget = () => {
            if (!window.turnstile || !containerRef.current) return;
            if (widgetIdRef.current) {
                window.turnstile.remove(widgetIdRef.current);
            }
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: resolvedSiteKey,
                callback: handleVerify,
                "error-callback": onError,
                "expired-callback": onExpire,
                action,
                theme: "auto",
                size: "invisible",
            });
        };

        if (window.turnstile) {
            renderWidget();
        } else {
            const script = document.createElement("script");
            script.src =
                "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
            script.async = true;
            script.onload = renderWidget;
            document.head.appendChild(script);
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [resolvedSiteKey, handleVerify, onError, onExpire, action]);

    if (!resolvedSiteKey) return null;

    return <div ref={containerRef} className="hidden" aria-hidden="true" />;
}

export function useBotProtection() {
    const [token, setToken] = React.useState<string | null>(null);
    const [error, setError] = React.useState(false);

    const onVerify = useCallback((t: string) => {
        setToken(t);
        setError(false);
    }, []);

    const onError = useCallback(() => {
        setToken(null);
        setError(true);
    }, []);

    const onExpire = useCallback(() => {
        setToken(null);
    }, []);

    return { token, error, onVerify, onError, onExpire };
}
