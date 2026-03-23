"use client";

/* ═══════════════════════════════════════════════════════════════
   QR GENERATOR DIALOG — Modal for generating and downloading
   QR codes for individual assets or credentials.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRDisplay } from "./qr-display";
import { Download, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface QrGeneratorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** The value to encode in the QR code */
    value: string;
    /** Display label (asset name, credential name, etc.) */
    label: string;
    /** Entity type for filename */
    entityType?: "asset" | "credential" | undefined; /** Entity ID for filename */
    entityId?: string | undefined;
}

const SIZE_OPTIONS = [
    { value: "128", label: "Small (128px)" },
    { value: "256", label: "Medium (256px)" },
    { value: "512", label: "Large (512px)" },
    { value: "1024", label: "Print (1024px)" },
];

export function QrGeneratorDialog({
    open,
    onOpenChange,
    value,
    label,
    entityType = "asset",
    entityId,
}: QrGeneratorDialogProps) {
    const [size, setSize] = useState("256");
    const [downloading, setDownloading] = useState(false);

    const handleDownloadPng = useCallback(async () => {
        setDownloading(true);
        try {
            const endpoint =
                entityType === "credential"
                    ? `/api/credentials/${entityId}/qr`
                    : `/api/assets/${entityId}/qr`;

            const res = await fetch(`${endpoint}?size=${size}&format=png`);
            if (!res.ok) throw new Error("Download failed");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${entityType}-${entityId ?? "unknown"}-qr-${size}px.png`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // Fallback: download from canvas
            const canvas = document.querySelector<HTMLCanvasElement>("[data-qr-canvas]");
            if (canvas) {
                const url = canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = url;
                a.download = `${entityType}-${entityId ?? "unknown"}-qr.png`;
                a.click();
            }
        } finally {
            setDownloading(false);
        }
    }, [size, entityType, entityId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>QR Code</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center density-gap-section py-4">
                    <QRDisplay value={value} size={Number(size)} label={label} />

                    <div className="w-full max-w-[200px]">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1 block">
                            Size
                        </label>
                        <Select value={size} onValueChange={setSize}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SIZE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        Encoded: <code className="font-mono">{value}</code>
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={handleDownloadPng} disabled={downloading}>
                        {downloading ? (
                            <Loader2 className="h-4 w-4 motion-safe:animate-spin mr-1" />
                        ) : (
                            <Download className="h-4 w-4 mr-1" />
                        )}
                        Download PNG
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
