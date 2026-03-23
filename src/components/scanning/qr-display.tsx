"use client";

/* ═══════════════════════════════════════════════════════════════
   QR DISPLAY — Renders a QR code with download/print actions.
   Uses qrcode.react for client rendering.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SCANNING_STRINGS } from "@/lib/i18n/scanning-strings";

const S = SCANNING_STRINGS.qr;

export interface QRDisplayProps {
    /** The data to encode in the QR code. */
    value: string;
    /** Display size in pixels. Default 200. */
    size?: number | undefined; /** Optional label rendered below the QR. */
    label?: string | undefined; /** Optional secondary label (e.g. barcode value). */
    sublabel?: string | undefined; /** Include download button. Default true. */
    showDownload?: boolean | undefined; /** Include print button. Default true. */
    showPrint?: boolean | undefined;
    className?: string | undefined;
}

export function QRDisplay({
    value,
    size = 200,
    label,
    sublabel,
    showDownload = true,
    showPrint = true,
    className,
}: QRDisplayProps) {
    const svgContainerRef = useRef<HTMLDivElement>(null);

    const handleDownload = useCallback(() => {
        if (!svgContainerRef.current) return;

        const svgElement = svgContainerRef.current.querySelector("svg");
        if (!svgElement) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `qr-${(label ?? value).replace(/\s+/g, "-").toLowerCase()}.svg`;
        link.click();

        URL.revokeObjectURL(url);
    }, [value, label]);

    const handlePrint = useCallback(() => {
        if (!svgContainerRef.current) return;

        const svgElement = svgContainerRef.current.querySelector("svg");
        if (!svgElement) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>${S.print} — ${label ?? value}</title></head>
            <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:system-ui,sans-serif;">
                ${svgString}
                ${label ? `<p style="margin-top:12px;font-size:14px;font-weight:600;">${label}</p>` : ""}
                ${sublabel ? `<p style="margin-top:4px;font-size:12px;color:#666;font-family:monospace;">${sublabel}</p>` : ""}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, [value, label, sublabel]);

    if (!value) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center p-4 text-sm text-muted-foreground",
                    className
                )}
            >
                {S.noData}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col items-center gap-3", className)}>
            <div ref={svgContainerRef} className="rounded-lg border bg-white p-3">
                <QRCodeSVG value={value} size={size} level="M" includeMargin={false} />
            </div>

            {(label || sublabel) && (
                <div className="text-center">
                    {label && <p className="text-sm font-medium">{label}</p>}
                    {sublabel && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{sublabel}</p>
                    )}
                </div>
            )}

            {(showDownload || showPrint) && (
                <div className="flex items-center gap-2">
                    {showDownload && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            aria-label={S.downloadSvg}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            {S.download}
                        </Button>
                    )}
                    {showPrint && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            aria-label={S.print}
                        >
                            <Printer className="h-4 w-4 mr-1" />
                            {S.print}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
