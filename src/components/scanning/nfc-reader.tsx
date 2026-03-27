"use client";

/* ═══════════════════════════════════════════════════════════════
   NFC READER — Web NFC scanning component (Android Chrome 89+).
   Feature-detects NDEFReader; renders nothing when unavailable.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState } from "react";
import { Nfc, NfcIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playSuccessBeep, triggerHaptic } from "@/lib/audio/scan-audio";
import { SCANNING_STRINGS } from "@/lib/i18n/scanning-strings";

const S = SCANNING_STRINGS.nfc;

export interface NfcReadResult {
    serialNumber: string;
    records: Array<{ recordType: string; data: string }>;
}

export interface NfcReaderProps {
    onRead: (result: NfcReadResult) => void;
    onError?: ((error: string) => void) | undefined;
    enabled?: boolean | undefined;
    className?: string | undefined;
}

/** Check if Web NFC API is available in the current browser. */
export function isNfcSupported(): boolean {
    return typeof window !== "undefined" && "NDEFReader" in window;
}

export function NfcReader({ onRead, onError, enabled = true, className }: NfcReaderProps) {
    const [isReading, setIsReading] = useState(false);
    const [status, setStatus] = useState<"idle" | "reading" | "success" | "error">("idle");
    const abortRef = useRef<AbortController | null>(null);

    const startReading = useCallback(async () => {
        if (!isNfcSupported() || !enabled) return;

        // Abort any existing reader
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            // §2.2: Web NFC types declared in src/types/web-nfc.d.ts
            const NDEFReaderCtor = window.NDEFReader;
            if (!NDEFReaderCtor) return;
            const reader = new NDEFReaderCtor();

            setIsReading(true);
            setStatus("reading");

            await reader.scan({ signal: controller.signal });

            reader.addEventListener(
                "reading",
                (event: NDEFReadingEvent) => {
                    const records = Array.from(event.message.records).map((record) => {
                        let data = "";
                        try {
                            if (record.data) {
                                const decoder = new TextDecoder();
                                data = decoder.decode(record.data);
                            }
                        } catch {
                            data = "";
                        }
                        return { recordType: record.recordType, data };
                    });

                    playSuccessBeep();
                    triggerHaptic(200);

                    setStatus("success");
                    onRead({
                        serialNumber: event.serialNumber ?? "",
                        records,
                    });

                    // Reset status after brief display
                    setTimeout(() => {
                        if (!controller.signal.aborted) {
                            setStatus("reading");
                        }
                    }, 2000);
                },
                { signal: controller.signal }
            );

            reader.addEventListener(
                "readingerror",
                () => {
                    setStatus("error");
                    onError?.(S.readError);
                    setTimeout(() => {
                        if (!controller.signal.aborted) {
                            setStatus("reading");
                        }
                    }, 2000);
                },
                { signal: controller.signal }
            );
        } catch (err) {
            setIsReading(false);
            setStatus("error");
            const message = err instanceof Error ? err.message : S.readError;
            onError?.(message);
        }
    }, [enabled, onRead, onError]);

    const stopReading = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        setIsReading(false);
        setStatus("idle");
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    // Don't render if NFC is not supported
    if (!isNfcSupported()) return null;

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            {!isReading ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={startReading}
                    disabled={!enabled}
                    aria-label={S.tapPrompt}
                >
                    <Nfc className="h-4 w-4 mr-1" />
                    {S.tapPrompt}
                </Button>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={stopReading}
                        className={cn(
                            status === "reading" && "border-blue-500/50 text-blue-600",
                            status === "success" && "border-green-500/50 text-green-600",
                            status === "error" && "border-destructive/50 text-destructive"
                        )}
                    >
                        <NfcIcon
                            className={cn(
                                "h-4 w-4 mr-1",
                                status === "reading" && "motion-safe:animate-pulse"
                            )}
                        />
                        {status === "reading" && S.reading}
                        {status === "success" && S.readSuccess}
                        {status === "error" && S.readError}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center" aria-live="polite">
                        {status === "reading" && S.tapPrompt}
                        {status === "success" && S.readSuccess}
                        {status === "error" && S.readError}
                    </p>
                </div>
            )}
        </div>
    );
}
