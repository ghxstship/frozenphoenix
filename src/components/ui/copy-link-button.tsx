"use client";

import React, { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyLinkButtonProps {
    label?: string;
    title?: string;
}

export function CopyLinkButton({ label = "Share", title = "Copy link to clipboard" }: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API not available — no-op
        }
    }, []);

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accent/10 transition-colors text-muted-foreground hover:text-foreground"
            title={title}
            aria-label={copied ? "Link copied" : title}
        >
            {copied ? (
                <>
                    <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                    Copied!
                </>
            ) : (
                <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    {label}
                </>
            )}
            <span className="sr-only" aria-live="polite">
                {copied ? "Link copied to clipboard" : ""}
            </span>
        </button>
    );
}
