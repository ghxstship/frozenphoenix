"use client";

/* ═══════════════════════════════════════════════════════════════
   BARCODE SCANNER — Camera-based barcode/QR scanner component.
   Uses html5-qrcode for cross-browser support (incl. iOS Safari).
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, CameraOff, Flashlight, FlashlightOff, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playSuccessBeep, triggerHaptic } from "@/lib/audio/scan-audio";
import { useTranslation } from "@/lib/i18n/locale-provider";

const ALL_FORMATS = [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.CODE_93,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.CODABAR,
    Html5QrcodeSupportedFormats.DATA_MATRIX,
    Html5QrcodeSupportedFormats.AZTEC,
    Html5QrcodeSupportedFormats.PDF_417,
];

export interface BarcodeScannerProps {
    onScan: (value: string, format: string) => void;
    onError?: ((error: string) => void) | undefined;
    formats?: Html5QrcodeSupportedFormats[] | undefined;
    facingMode?: "environment" | "user" | undefined;
    showFileUpload?: boolean | undefined;
    showTorch?: boolean | undefined;
    className?: string | undefined;
    disabled?: boolean | undefined;
}

export function BarcodeScanner({
    onScan,
    onError,
    formats = ALL_FORMATS,
    facingMode = "environment",
    showFileUpload = true,
    showTorch = true,
    className,
    disabled = false,
}: BarcodeScannerProps) {
    const { t } = useTranslation("scanning");
    const elementId = useId().replace(/:/g, "_");
    const scannerId = `scanner_${elementId}`;
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const debounceRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isScanning, setIsScanning] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const [hasTorch, setHasTorch] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFormat, setLastFormat] = useState<string | null>(null);

    const handleScanSuccess = useCallback(
        (decodedText: string, decodedResult: { result: { format?: { formatName: string } } }) => {
            if (debounceRef.current) return;
            debounceRef.current = true;

            const format = decodedResult.result.format?.formatName ?? "UNKNOWN";
            setLastFormat(format);
            setError(null);

            playSuccessBeep();
            triggerHaptic(200);

            onScan(decodedText, format);

            // Debounce: prevent rapid duplicate scans
            setTimeout(() => {
                debounceRef.current = false;
            }, 1500);
        },
        [onScan]
    );

    const startScanner = useCallback(async () => {
        if (disabled || scannerRef.current) return;

        try {
            const scanner = new Html5Qrcode(scannerId, {
                formatsToSupport: formats,
                verbose: false,
            });
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                handleScanSuccess,
                () => {
                    // Ignore scan failures (no barcode in frame)
                }
            );

            setIsScanning(true);
            setError(null);

            // Check torch availability
            try {
                const track = scanner.getRunningTrackCameraCapabilities?.();
                if (track?.torchFeature?.().isSupported?.()) {
                    setHasTorch(true);
                }
            } catch {
                // Torch detection failed — not critical
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : t("scanner.permissionDenied");
            setError(message);
            onError?.(message);
            scannerRef.current = null;
        }
    }, [disabled, scannerId, facingMode, formats, handleScanSuccess, onError, t]);

    const stopScanner = useCallback(async () => {
        if (!scannerRef.current) return;
        try {
            if (scannerRef.current.isScanning) {
                await scannerRef.current.stop();
            }
            scannerRef.current.clear();
        } catch {
            // Ignore stop errors
        }
        scannerRef.current = null;
        setIsScanning(false);
        setTorchOn(false);
        setHasTorch(false);
    }, []);

    const toggleTorch = useCallback(async () => {
        if (!scannerRef.current) return;
        try {
            const track = scannerRef.current.getRunningTrackCameraCapabilities?.();
            const torch = track?.torchFeature?.();
            if (torch?.isSupported?.()) {
                await torch.apply(!torchOn);
                setTorchOn(!torchOn);
            }
        } catch {
            // Torch toggle failed
        }
    }, [torchOn]);

    const handleFileUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                const scanner = scannerRef.current ?? new Html5Qrcode(scannerId);
                const result = await scanner.scanFile(file, /* showImage */ false);
                playSuccessBeep();
                triggerHaptic(200);
                onScan(result, "FILE");
            } catch {
                setError(t("scanner.scanError"));
                onError?.(t("scanner.scanError"));
            }

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        },
        [scannerId, onScan, onError, t]
    );

    // Auto-start on mount, stop on unmount
    useEffect(() => {
        let cancelled = false;
        const init = async () => {
            if (!cancelled) await startScanner();
        };
        void init();
        return () => {
            cancelled = true;
            void stopScanner();
        };
    }, [startScanner, stopScanner, t]);

    return (
        <div className={cn("relative flex flex-col gap-3", className)}>
            {/* Viewfinder */}
            <div
                id={scannerId}
                className="relative w-full aspect-square max-w-[400px] mx-auto rounded-lg overflow-hidden bg-black/5"
                role="img"
                aria-label={isScanning ? t("scanner.scanning") : t("scanner.paused")}
            />

            {/* Status bar */}
            <div className="flex items-center justify-between gap-2 px-1" aria-live="polite">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isScanning ? (
                        <>
                            <Camera className="h-4 w-4 text-green-500 motion-safe:animate-pulse" />
                            <span>{t("scanner.scanning")}</span>
                        </>
                    ) : error ? (
                        <>
                            <CameraOff className="h-4 w-4 text-destructive" />
                            <span className="text-destructive">{error}</span>
                        </>
                    ) : (
                        <>
                            <Camera className="h-4 w-4" />
                            <span>{t("scanner.paused")}</span>
                        </>
                    )}
                </div>

                {lastFormat && (
                    <span className="text-xs font-mono text-muted-foreground">
                        {t("scanner.formatDetected").replace("{format}", lastFormat)}
                    </span>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                {showTorch && hasTorch && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleTorch}
                        aria-label={t("scanner.toggleTorch")}
                        aria-pressed={torchOn}
                    >
                        {torchOn ? (
                            <FlashlightOff className="h-4 w-4" />
                        ) : (
                            <Flashlight className="h-4 w-4" />
                        )}
                    </Button>
                )}

                {showFileUpload && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            aria-label={t("scanner.fileUpload")}
                        >
                            <Upload className="h-4 w-4 mr-1" />
                            {t("scanner.fileUpload")}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileUpload}
                            className="hidden"
                            aria-hidden="true"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
