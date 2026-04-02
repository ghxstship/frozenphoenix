"use client";

/* ═══════════════════════════════════════════════════════════════
   NFC WRITER — Write asset/credential identifiers to NFC tags.
   Uses the Web NFC API (NDEFReader). Progressive enhancement:
   renders a fallback message on unsupported browsers.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Nfc, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/locale-provider";

export interface NfcWriterProps {
    /** The value to write to the NFC tag */
    value: string;
    /** Display label for the tag contents */
    label?: string | undefined; /** Called after a successful write */
    onWriteComplete?: ((serialNumber: string) => void) | undefined; /** Called on write failure */
    onWriteError?: ((error: Error) => void) | undefined;
    className?: string | undefined;
}

type WriteStatus = "idle" | "waiting" | "writing" | "success" | "error";

/**
 * Check if the Web NFC API is available in the current browser.
 */
export function isNfcWriteSupported(): boolean {
    return typeof window !== "undefined" && "NDEFReader" in window;
}

export function NfcWriter({
    value,
    label,
    onWriteComplete,
    onWriteError,
    className,
}: NfcWriterProps) {
    const { t } = useTranslation("scanning");
    const [status, setStatus] = useState<WriteStatus>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleWrite = useCallback(async () => {
        if (!isNfcWriteSupported()) {
            setStatus("error");
            setErrorMessage(t("nfc.unsupported"));
            return;
        }

        setStatus("waiting");
        setErrorMessage("");

        try {
            // §2.2: Web NFC types declared in src/types/web-nfc.d.ts
            const NDEFReaderCtor = window.NDEFReader;
            if (!NDEFReaderCtor) return;
            const reader = new NDEFReaderCtor();

            await reader.write({
                records: [
                    {
                        recordType: "text",
                        data: value,
                    },
                    {
                        recordType: "url",
                        data: `${window.location.origin}/assets/scan?nfc=${encodeURIComponent(value)}`,
                    },
                ],
            });

            setStatus("success");
            onWriteComplete?.(value);
        } catch (err) {
            setStatus("error");
            const message = err instanceof Error ? err.message : "NFC write failed";
            setErrorMessage(message);
            onWriteError?.(err instanceof Error ? err : new Error(message));
        }
    }, [value, onWriteComplete, onWriteError, t]);

    if (!isNfcWriteSupported()) {
        return (
            <div className={cn("text-center p-4", className)}>
                <Nfc className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t("nfc.unsupported")}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                    NFC writing requires Chrome on Android with NFC hardware.
                </p>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col items-center gap-3 p-4", className)}>
            <div className="relative">
                <Nfc
                    className={cn(
                        "h-12 w-12 transition-colors",
                        status === "waiting" && "text-warning motion-safe:animate-pulse",
                        status === "writing" && "text-primary motion-safe:animate-pulse",
                        status === "success" && "text-success",
                        status === "error" && "text-destructive",
                        status === "idle" && "text-muted-foreground"
                    )}
                />
                {status === "success" && (
                    <CheckCircle2 className="absolute -bottom-1 -right-1 h-5 w-5 text-success" />
                )}
                {status === "error" && (
                    <XCircle className="absolute -bottom-1 -right-1 h-5 w-5 text-destructive" />
                )}
            </div>

            {label && <p className="text-sm font-medium text-center">{label}</p>}

            <p className="text-xs font-mono text-muted-foreground text-center truncate max-w-full">
                {value}
            </p>

            {status === "waiting" && (
                <Badge variant="warning" className="text-xs">
                    <Loader2 className="h-3 w-3 motion-safe:animate-spin mr-1" />
                    Tap NFC tag to write...
                </Badge>
            )}

            {status === "success" && (
                <Badge variant="success" className="text-xs">
                    Tag written successfully
                </Badge>
            )}

            {status === "error" && errorMessage && (
                <Badge variant="destructive" className="text-xs">
                    {errorMessage}
                </Badge>
            )}

            <Button
                size="sm"
                onClick={handleWrite}
                disabled={status === "waiting"}
                variant={status === "success" ? "outline" : "default"}
            >
                {status === "waiting" ? (
                    <>
                        <Loader2 className="h-4 w-4 motion-safe:animate-spin mr-1" />
                        Waiting for tag...
                    </>
                ) : status === "success" ? (
                    "Write Again"
                ) : (
                    <>
                        <Nfc className="h-4 w-4 mr-1" />
                        Write to NFC Tag
                    </>
                )}
            </Button>
        </div>
    );
}
