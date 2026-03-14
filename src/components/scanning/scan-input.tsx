"use client";

/* ═══════════════════════════════════════════════════════════════
   SCAN INPUT — Unified multi-method scan input component.
   Combines keyboard/wedge input, camera scanner dialog, and
   NFC reader into a single composable input.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useRef, useState } from "react";
import { Camera, Keyboard, Nfc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useScanDevice } from "@/hooks/use-scan-device";
import { BarcodeScanner } from "./barcode-scanner";
import { isNfcSupported, NfcReader } from "./nfc-reader";
import type { NfcReadResult } from "./nfc-reader";
import { SCANNING_STRINGS } from "@/lib/i18n/scanning-strings";

const S = SCANNING_STRINGS.input;
const SCANNER_S = SCANNING_STRINGS.scanner;

export type ScanMethod = "keyboard" | "camera" | "nfc";

export interface ScanInputProps {
    /** Called when a value is scanned or entered. */
    onScan: (value: string, method: ScanMethod) => void;
    /** Placeholder text for the input. */
    placeholder?: string;
    /** Whether to show the camera toggle. Auto-detected if undefined. */
    showCamera?: boolean;
    /** Whether to show the NFC toggle. Auto-detected if undefined. */
    showNfc?: boolean;
    /** Whether to auto-submit on Enter key. Default true. */
    submitOnEnter?: boolean;
    /** Whether to clear input after scan. Default true. */
    clearOnScan?: boolean;
    /** Disable all inputs. */
    disabled?: boolean;
    /** Auto-focus the text input on mount. Default true. */
    autoFocus?: boolean;
    className?: string;
}

export function ScanInput({
    onScan,
    placeholder = S.placeholder,
    showCamera: showCameraProp,
    showNfc: showNfcProp,
    submitOnEnter = true,
    clearOnScan = true,
    disabled = false,
    autoFocus = true,
    className,
}: ScanInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [cameraOpen, setCameraOpen] = useState(false);
    const [nfcActive, setNfcActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const device = useScanDevice();

    // Auto-detect capabilities if not explicitly set
    const showCamera = showCameraProp ?? device.hasCamera;
    const showNfc = showNfcProp ?? (device.hasNfc || isNfcSupported());

    const handleSubmit = useCallback(
        (value: string, method: ScanMethod) => {
            const trimmed = value.trim();
            if (!trimmed) return;

            onScan(trimmed, method);

            if (clearOnScan) {
                setInputValue("");
            }

            // Re-focus input for next scan
            inputRef.current?.focus();
        },
        [onScan, clearOnScan]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (submitOnEnter && e.key === "Enter") {
                e.preventDefault();
                handleSubmit(inputValue, "keyboard");
            }
        },
        [submitOnEnter, inputValue, handleSubmit]
    );

    const handleCameraScan = useCallback(
        (value: string) => {
            setCameraOpen(false);
            handleSubmit(value, "camera");
        },
        [handleSubmit]
    );

    const handleNfcRead = useCallback(
        (result: NfcReadResult) => {
            // Use serial number or first text record as the scan value
            const value =
                result.records.find((r) => r.recordType === "text")?.data || result.serialNumber;
            if (value) {
                setNfcActive(false);
                handleSubmit(value, "nfc");
            }
        },
        [handleSubmit]
    );

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="flex items-center gap-2">
                {/* Text input — works with keyboard and USB wedge scanners */}
                <div className="relative flex-1">
                    <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoFocus={autoFocus}
                        className="pl-9"
                        aria-label={placeholder}
                    />
                </div>

                {/* Camera toggle */}
                {showCamera && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCameraOpen(true)}
                        disabled={disabled}
                        aria-label={S.toggleCamera}
                        title={S.toggleCamera}
                    >
                        <Camera className="h-4 w-4" />
                    </Button>
                )}

                {/* NFC toggle */}
                {showNfc && (
                    <Button
                        variant={nfcActive ? "default" : "outline"}
                        size="icon"
                        onClick={() => setNfcActive(!nfcActive)}
                        disabled={disabled}
                        aria-label={S.toggleNfc}
                        aria-pressed={nfcActive}
                        title={S.toggleNfc}
                    >
                        <Nfc className={cn("h-4 w-4", nfcActive && "animate-pulse")} />
                    </Button>
                )}
            </div>

            {/* Inline NFC reader when active */}
            {nfcActive && <NfcReader onRead={handleNfcRead} enabled={nfcActive} />}

            {/* Camera scanner dialog */}
            <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
                <DialogContent size="lg" showClose>
                    <DialogHeader>
                        <DialogTitle>{SCANNER_S.title}</DialogTitle>
                        <DialogDescription>{SCANNER_S.subtitle}</DialogDescription>
                    </DialogHeader>
                    {cameraOpen && (
                        <BarcodeScanner
                            onScan={handleCameraScan}
                            onError={() => {
                                // Error is displayed inside BarcodeScanner
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
