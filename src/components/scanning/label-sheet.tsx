"use client";

/* ═══════════════════════════════════════════════════════════════
   LABEL SHEET — Printable grid of QR codes for asset labels.
   Renders a print-optimized layout with QR code + label text.
   ═══════════════════════════════════════════════════════════════ */

import React, { useRef } from "react";
import { QRDisplay } from "./qr-display";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export interface LabelItem {
    id: string;
    name: string;
    /** Value to encode in QR (barcode, ID, etc.) */
    qrValue: string;
    /** Optional subtitle (category, location, etc.) */
    subtitle?: string;
}

interface LabelSheetProps {
    items: LabelItem[];
    /** QR code size in px (default 96) */
    qrSize?: number;
    /** Columns per row (default 3) */
    columns?: number;
    /** Show print button (default true) */
    showPrintButton?: boolean;
}

export function LabelSheet({
    items,
    qrSize = 96,
    columns = 3,
    showPrintButton = true,
}: LabelSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const content = sheetRef.current;
        if (!content) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Asset Labels</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: system-ui, -apple-system, sans-serif; }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(${columns}, 1fr);
                        gap: 8px;
                        padding: 16px;
                    }
                    .label {
                        border: 1px dashed #ccc;
                        padding: 8px;
                        text-align: center;
                        page-break-inside: avoid;
                    }
                    .label img { max-width: ${qrSize}px; margin: 0 auto 4px; }
                    .name { font-size: 10px; font-weight: 600; line-height: 1.2; }
                    .subtitle { font-size: 8px; color: #666; }
                    .qr-value { font-size: 7px; font-family: monospace; color: #999; margin-top: 2px; }
                    @media print {
                        .grid { padding: 0; }
                        .label { border: 1px dashed #ddd; }
                    }
                </style>
            </head>
            <body>
                ${content.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    if (items.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">No items to display</p>
        );
    }

    return (
        <div className="density-gap-section">
            {showPrintButton && (
                <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-1" />
                        Print Labels
                    </Button>
                </div>
            )}

            <div
                ref={sheetRef}
                className="grid gap-3"
                style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                }}
            >
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="border border-dashed border-border rounded-lg p-3 flex flex-col items-center text-center"
                    >
                        <QRDisplay value={item.qrValue} size={qrSize} />
                        <p className="density-caption font-semibold mt-1 leading-tight truncate max-w-full">
                            {item.name}
                        </p>
                        {item.subtitle && (
                            <p className="text-[8px] text-muted-foreground truncate max-w-full">
                                {item.subtitle}
                            </p>
                        )}
                        <p className="text-[7px] font-mono text-muted-foreground/60 mt-0.5 truncate max-w-full">
                            {item.qrValue}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
