/* ═══════════════════════════════════════════════════════════════
   SCANNING — Barrel export for all scanning components and types.
   ═══════════════════════════════════════════════════════════════ */

export { BarcodeScanner } from "./barcode-scanner";
export type { BarcodeScannerProps } from "./barcode-scanner";

export { isNfcSupported, NfcReader } from "./nfc-reader";
export type { NfcReaderProps, NfcReadResult } from "./nfc-reader";

export { ScanInput } from "./scan-input";
export type { ScanInputProps, ScanMethod } from "./scan-input";

export { ScanFeedback } from "./scan-feedback";
export type { ScanFeedbackProps, ScanFeedbackResult } from "./scan-feedback";

export { QRDisplay } from "./qr-display";
export type { QRDisplayProps } from "./qr-display";

export { LabelSheet } from "./label-sheet";
export type { LabelItem } from "./label-sheet";

export { QrGeneratorDialog } from "./qr-generator-dialog";

export { NfcWriter, isNfcWriteSupported } from "./nfc-writer";
export type { NfcWriterProps } from "./nfc-writer";

export { OfflineIndicator } from "./offline-indicator";
export type { OfflineIndicatorProps } from "./offline-indicator";
