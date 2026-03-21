"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface OAuthButtonsProps {
    onOAuth: (provider: "google") => void;
    onBluesky: (handle: string) => void;
    loading: string | null;
    disabled?: boolean;
}

function BlueskyIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 600 530" aria-hidden="true">
            <path
                fill="currentColor"
                d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"
            />
        </svg>
    );
}

export function OAuthButtons({ onOAuth, onBluesky, loading, disabled }: OAuthButtonsProps) {
    const [showHandleInput, setShowHandleInput] = useState(false);
    const [handle, setHandle] = useState("");

    const handleBlueskySubmit = useCallback(() => {
        if (handle.trim()) {
            onBluesky(handle.trim());
        }
    }, [handle, onBluesky]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleBlueskySubmit();
            }
        },
        [handleBlueskySubmit]
    );

    return (
        <>
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOAuth("google")}
                    disabled={disabled || !!loading}
                    aria-label="Sign in with Google"
                >
                    {loading === "google" ? (
                        <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
                    ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                    )}
                    Google
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        if (showHandleInput && handle.trim()) {
                            handleBlueskySubmit();
                        } else {
                            setShowHandleInput(true);
                        }
                    }}
                    disabled={disabled || !!loading}
                    aria-label="Sign in with Bluesky"
                >
                    {loading === "bluesky" ? (
                        <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
                    ) : (
                        <BlueskyIcon className="h-4 w-4" />
                    )}
                    Bluesky
                </Button>
            </div>

            {showHandleInput && (
                <div className="mt-3 flex gap-2" role="group" aria-label="Bluesky handle entry">
                    <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="user.bsky.social"
                        className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                        disabled={disabled || loading === "bluesky"}
                        autoFocus
                        aria-label="Bluesky handle"
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleBlueskySubmit}
                        disabled={disabled || loading === "bluesky" || !handle.trim()}
                        aria-label="Continue with Bluesky"
                    >
                        {loading === "bluesky" ? (
                            <Loader2
                                className="h-3 w-3 motion-safe:animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            "Go"
                        )}
                    </Button>
                </div>
            )}
        </>
    );
}
