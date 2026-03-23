/* ═══════════════════════════════════════════════════════════════
   USE-WEDGE-SCANNER — Listen for USB/Bluetooth barcode scanner
   "wedge" input. These devices emulate keyboard input, sending
   characters rapidly followed by Enter. This hook detects that
   pattern and emits the scanned value.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef } from "react";

export interface UseWedgeScannerOptions {
    /** Called when a wedge scan is detected */
    onScan: (value: string) => void;
    /** Whether the hook is active (default true) */
    enabled?:
        | boolean
        | undefined; /** Max milliseconds between keystrokes to consider them part of a scan (default 50) */
    maxKeystrokeGap?: number | undefined; /** Minimum characters for a valid scan (default 4) */
    minLength?: number | undefined; /** Prefix characters that indicate a scan start (optional) */
    prefix?: string | undefined; /** Suffix characters that indicate a scan end (default: Enter) */
    suffix?: string | undefined;
}

/**
 * Detects rapid keyboard input from USB/Bluetooth barcode scanners
 * ("wedge" mode). Distinguishes scanner input from normal typing
 * by measuring inter-keystroke timing.
 */
export function useWedgeScanner({
    onScan,
    enabled = true,
    maxKeystrokeGap = 50,
    minLength = 4,
    prefix,
    suffix = "Enter",
}: UseWedgeScannerOptions) {
    const bufferRef = useRef("");
    const lastKeystrokeRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const flush = useCallback(() => {
        const value = bufferRef.current.trim();
        bufferRef.current = "";

        if (value.length >= minLength) {
            // Strip prefix if configured
            const cleaned = prefix && value.startsWith(prefix) ? value.slice(prefix.length) : value;

            if (cleaned.length >= minLength) {
                onScan(cleaned);
            }
        }
    }, [onScan, minLength, prefix]);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input/textarea
            const target = e.target as HTMLElement;
            const isInputFocused =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;

            // If an input is focused, don't intercept — let ScanInput handle it
            if (isInputFocused) return;

            const now = Date.now();
            const gap = now - lastKeystrokeRef.current;
            lastKeystrokeRef.current = now;

            // If gap is too large, this is a new sequence
            if (gap > maxKeystrokeGap && bufferRef.current.length > 0) {
                bufferRef.current = "";
            }

            // Check for termination
            if (e.key === suffix || e.key === "Enter") {
                if (bufferRef.current.length >= minLength) {
                    e.preventDefault();
                    flush();
                } else {
                    bufferRef.current = "";
                }
                return;
            }

            // Only accumulate printable characters
            if (e.key.length === 1) {
                bufferRef.current += e.key;

                // Set a timeout to flush if no more characters arrive
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                    if (bufferRef.current.length >= minLength) {
                        flush();
                    } else {
                        bufferRef.current = "";
                    }
                }, maxKeystrokeGap * 2);
            }
        };

        document.addEventListener("keydown", handleKeyDown, { capture: true });

        return () => {
            document.removeEventListener("keydown", handleKeyDown, { capture: true });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [enabled, maxKeystrokeGap, minLength, suffix, flush]);
}
