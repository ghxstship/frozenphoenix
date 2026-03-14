/* ═══════════════════════════════════════════════════════════════
   SCANNING I18N STRINGS — Single source of truth for all
   scanning-related UI copy. Swap this file (or load from a
   remote catalog) to localise scanning surfaces.
   ═══════════════════════════════════════════════════════════════ */

export const SCANNING_STRINGS = {
    // ─── Scanner (camera) ─────────────────────────────────────
    scanner: {
        title: "Camera Scanner",
        subtitle: "Point camera at a barcode or QR code",
        permissionPrompt: "Camera access is required for scanning",
        permissionDenied: "Camera access was denied. Use manual entry or file upload instead.",
        permissionDeniedAction: "Open Settings",
        scanning: "Scanning\u2026",
        paused: "Scanner paused",
        noCamera: "No camera detected on this device",
        switchCamera: "Switch Camera",
        toggleTorch: "Toggle Flashlight",
        fileUpload: "Upload barcode image",
        fileUploadHint: "Select an image containing a barcode or QR code",
        formatDetected: "Detected: {format}",
        scanSuccess: "Code scanned successfully",
        scanError: "Could not read barcode. Try adjusting the angle or distance.",
        close: "Close Scanner",
    },

    // ─── NFC ──────────────────────────────────────────────────
    nfc: {
        tapPrompt: "Hold NFC tag near device",
        reading: "Reading NFC tag\u2026",
        readSuccess: "NFC tag read successfully",
        readError: "Failed to read NFC tag. Try again.",
        unsupported: "NFC is not supported on this device",
        writePrompt: "Hold NFC tag near device to write",
        writing: "Writing to NFC tag\u2026",
        writeSuccess: "NFC tag written successfully",
        writeError: "Failed to write NFC tag. Try again.",
        aborted: "NFC reading cancelled",
    },

    // ─── Scan Feedback ────────────────────────────────────────
    feedback: {
        success: "Scan successful",
        warning: "Attention required",
        error: "Scan failed",
        info: "Scan recorded",
        denied: "Access denied",
        expired: "Credential expired",
        revoked: "Credential revoked",
        zoneDenied: "Zone access denied",
        notFound: "No match found for scanned value",
        flagged: "Credential flagged \u2014 contact supervisor",
    },

    // ─── QR Code ──────────────────────────────────────────────
    qr: {
        generate: "Generate QR Code",
        generating: "Generating\u2026",
        download: "Download QR",
        downloadPng: "Download as PNG",
        downloadSvg: "Download as SVG",
        print: "Print QR",
        printLabels: "Print Labels",
        batchGenerate: "Generate QR Labels",
        batchGenerating: "Generating {count} labels\u2026",
        batchComplete: "{count} QR codes generated",
        batchError: "Failed to generate {count} QR codes",
        labelSheetTitle: "Label Sheet Preview",
        noData: "No data to encode",
    },

    // ─── Scan Input ───────────────────────────────────────────
    input: {
        placeholder: "Scan or enter value\u2026",
        credentialPlaceholder: "Scan or enter barcode\u2026",
        assetPlaceholder: "Scan asset barcode or RFID\u2026",
        methodKeyboard: "Keyboard",
        methodCamera: "Camera",
        methodNfc: "NFC",
        methodFile: "File",
        toggleCamera: "Open camera scanner",
        toggleNfc: "Start NFC reader",
        toggleFile: "Upload barcode image",
    },

    // ─── Scan Methods ─────────────────────────────────────────
    methods: {
        keyboard: "Keyboard",
        camera: "Camera",
        rfid: "RFID",
        nfc: "NFC",
        file: "File Upload",
        api: "API",
    },

    // ─── Offline ──────────────────────────────────────────────
    offline: {
        banner: "Offline \u2014 {count} scans queued",
        offlineTitle: "You are offline",
        pendingCount: "{count} scans pending",
        syncNow: "Sync Now",
        clearQueue: "Clear",
        syncing: "Syncing {count} scans\u2026",
        syncComplete: "All scans synced",
        syncError: "Failed to sync {count} scans",
        syncRetry: "Retry Sync",
        pendingWarning: "{count} scans pending for over 72 hours",
    },

    // ─── Asset Scanner ────────────────────────────────────────
    assetScanner: {
        title: "Asset Scanner",
        subtitle: "Scan assets for check-in, check-out, transfer, and inventory",
        batchTitle: "Batch Scanner",
        batchSubtitle: "Scan multiple assets for bulk operations",
        scanType: "Scan Type",
        checkIn: "Check In",
        checkOut: "Check Out",
        transfer: "Transfer",
        verify: "Verify",
        count: "Count",
        damage: "Report Damage",
        audit: "Audit",
        receive: "Receive",
        ship: "Ship",
        continuousMode: "Continuous Mode",
        continuousModeHint: "Automatically process each scan without confirmation",
        batchMode: "Batch Mode",
        batchSubmit: "Submit All ({count})",
        batchClear: "Clear All",
        batchExport: "Export CSV",
        recentScans: "Recent Scans",
        lastScan: "Last Scan",
        locationPicker: "Transfer Location",
        assetNotFound: "Asset not found for scanned value",
        scanHistory: "Scan History",
    },

    // ─── Gate Scanner ─────────────────────────────────────────
    gateScanner: {
        title: "Gate Scanner",
        identifierType: "Identifier Type",
        auto: "Auto-detect",
        barcode: "Barcode",
        rfid: "RFID",
        nfcTag: "NFC",
        assignee: "Assignee",
        credentialType: "Credential Type",
        zoneAccess: "Zone Access",
        scanDetails: "Scan Details",
        matchedBy: "Matched By",
        method: "Method",
        time: "Time",
    },
} as const;

export type ScanningStringKey = keyof typeof SCANNING_STRINGS;
