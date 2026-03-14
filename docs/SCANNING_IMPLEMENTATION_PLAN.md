# Scanning & Identification Implementation Plan

> **Version:** 1.0.0
> **Date:** 2026-03-14
> **Status:** Proposed
> **Scope:** Barcode, QR, RFID, NFC — all gaps from DB schema through UI

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Inventory](#2-current-state-inventory)
3. [Gap Analysis](#3-gap-analysis)
4. [Technology Decisions](#4-technology-decisions)
5. [Phase 1 — Shared Scanning Primitives](#5-phase-1--shared-scanning-primitives)
6. [Phase 2 — Credential Scanning Completion](#6-phase-2--credential-scanning-completion)
7. [Phase 3 — Asset & Inventory Scanning](#7-phase-3--asset--inventory-scanning)
8. [Phase 4 — QR Code Generation](#8-phase-4--qr-code-generation)
9. [Phase 5 — NFC & Advanced Hardware](#9-phase-5--nfc--advanced-hardware)
10. [Phase 6 — Offline & PWA](#10-phase-6--offline--pwa)
11. [RBAC & Permissions](#11-rbac--permissions)
12. [Database Changes](#12-database-changes)
13. [File Change Map](#13-file-change-map)
14. [Verification Matrix](#14-verification-matrix)
15. [Open Questions](#15-open-questions)

---

## 1. Executive Summary

FrozenPhoenix has **two separate scan event systems** in the database — one for asset/inventory logistics (`scan_events`, migration 019) and one for credential gate operations (`credential_scan_log`, migration 051). The credential system has a full vertical slice (DB → API → hooks → UI). The asset system has only DB + a basic list page. Neither system supports camera-based scanning, QR generation, RFID lookup, or NFC.

This plan closes **all 6 identified gaps** across **5 phases** totaling ~80 new/modified files over ~8 weeks:

| Gap                              | Current                        | Target | Phase |
| -------------------------------- | ------------------------------ | ------ | ----- |
| Camera-based barcode/QR scanning | MISSING                        | FULL   | 1     |
| Credential RFID lookup           | PARTIAL (stored, not queried)  | FULL   | 2     |
| Asset barcode/QR scanning        | DB ONLY                        | FULL   | 3     |
| Asset RFID scanning              | DB ONLY                        | FULL   | 3     |
| QR code generation               | DB ONLY (`qr_code_url` column) | FULL   | 4     |
| NFC scanning                     | MISSING                        | FULL   | 5     |

**Zero new tables.** All DB changes are column additions, enum extensions, and index additions to existing tables. Both `scan_events` and `credential_scan_log` schemas are already enterprise-grade.

---

## 2. Current State Inventory

### 2.1 Credential Scanning (Gate Operations)

**Status: FULL STACK (barcode text input only)**

| Layer                         | File                                                   | Status                                                                                        |
| ----------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| DB — `credential_assignments` | `051_credentialing_ticketing.sql`                      | ✅ `barcode_value TEXT NOT NULL` (unique), `rfid_tag TEXT` (unique partial)                   |
| DB — `credential_scan_log`    | `051_credentialing_ticketing.sql`                      | ✅ Immutable audit trail, scan_type/scan_result, zone/device/geo                              |
| DB — RLS                      | `051_credentialing_ticketing.sql`                      | ✅ org-scoped SELECT + INSERT                                                                 |
| Types                         | `src/types/credentialing.ts`                           | ✅ `CredentialAssignment`, `CredentialScanLog`, enums                                         |
| API                           | `src/app/api/credentials/scan/route.ts`                | ✅ POST — lookup by `barcode_value`, validate, log, update status                             |
| Hooks                         | `src/lib/supabase/hooks-credentialing.ts`              | ✅ `useGateScan()`, `useGateScanHistory()`, `useCreateScanEntry()`, `useCredentialScanLogs()` |
| UI                            | `src/app/(dashboard)/live-ops/gate/page.tsx`           | ✅ Text input + check-in/out toggle + result display + history                                |
| Component                     | `src/components/credentialing/scan-result-display.tsx` | ✅ Reusable result card                                                                       |
| RBAC                          | `src/config/rbac.ts`                                   | ✅ `gate_operations.read/write`, `credential_scans.read/write`                                |
| Nav                           | `src/config/navigation.ts`                             | ✅ Live Operations → Gate Scanner                                                             |

**Gap:** API only queries `barcode_value`. The `rfid_tag` column is stored but never used for lookup. No camera input — text field only (works with USB wedge scanners, not phone cameras).

### 2.2 Asset/Inventory Scan Events

**Status: DB + LIST PAGE (no scanning UI)**

| Layer                     | File                                            | Status                                                                                                                                                 |
| ------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DB — `scan_events`        | `019_asset_inventory_logistics_warehousing.sql` | ✅ Polymorphic (asset_id/consumable_id/kit_id), `scan_type` enum (check_in, check_out, transfer, count, receive, ship, verify, damage), device_id, geo |
| DB — `assets.rfid_tag`    | `019_asset_inventory_logistics_warehousing.sql` | ✅ TEXT, indexed                                                                                                                                       |
| DB — `assets.qr_code_url` | `082_deferred_enrichment_columns.sql`           | ✅ TEXT, "URL to generated QR/barcode image"                                                                                                           |
| DB — RLS                  | `019_asset_inventory_logistics_warehousing.sql` | ✅ org-scoped via loop pattern                                                                                                                         |
| Types                     | Generated in `database.types.ts`                | ✅ `Tables<"scan_events">`, `Tables<"assets">` with rfid_tag                                                                                           |
| Hooks                     | `src/lib/supabase/hooks-remaining-entities.ts`  | ✅ `useScanEvents()`, `useCreateScanEvent()` (API-route-backed)                                                                                        |
| API                       | `src/app/api/scan-events/route.ts`              | ✅ CRUD factory (list + create)                                                                                                                        |
| List page                 | `src/app/(dashboard)/scan-events/page.tsx`      | ✅ ListPageShell with `SCAN_EVENTS_PAGE` config                                                                                                        |
| Entity config             | `src/lib/api/entity-config.ts`                  | ✅ `scan_event` registered                                                                                                                             |
| RBAC                      | `src/config/rbac.ts`                            | ✅ `scan_log.read/write` for exec, director, pm, member, collaborator                                                                                  |

**Gap:** No scanning UI exists. The list page shows historical events but has no way to create new scan events via barcode/QR/RFID input. No asset lookup by barcode or RFID. No QR generation for asset labels.

### 2.3 Other Scan-Adjacent

| Item                       | Location                               | Notes                                                                                         |
| -------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| POS RFID payment method    | `055_external_sync_infrastructure.sql` | `pos_transactions.payment_method` includes `'rfid'` — informational only, no scan flow        |
| MFA QR code                | `src/app/auth/mfa-setup/page.tsx`      | TOTP enrollment QR — unrelated to product scanning                                            |
| `ScanBarcode` icon         | `src/config/navigation.ts`             | Used for Vendor Portal and Live Ops Equipment nav items                                       |
| Asset barcode display      | `src/app/(dashboard)/assets/page.tsx`  | Shows `QrCode` icon + `asset.barcode` in table and card views                                 |
| Catalog ticketing category | `047_master_catalog.sql`               | "Ticket scanners, turnstiles, box office supplies" — product category, not scan functionality |

---

## 3. Gap Analysis

### G1: No Camera-Based Scanning (MISSING — all layers)

The gate scanner page (`live-ops/gate`) uses a plain `<Input>` field. This works with USB barcode scanner wedge devices (which simulate keypresses) but **not with phone/tablet cameras**. No Web API for camera access (`getUserMedia`, `BarcodeDetector`) is used anywhere.

**Impact:** Field crew on mobile devices cannot scan credentials or assets. They must manually type barcode values.

### G2: Credential RFID Lookup (PARTIAL — API gap)

`credential_assignments.rfid_tag` is stored, uniquely indexed, and present in the TypeScript types. But `POST /api/credentials/scan` only queries:

```sql
.eq("barcode_value", barcode_value)
```

It never queries by `rfid_tag`. An RFID reader sending a tag value has no lookup path.

**Impact:** RFID wristbands/badges cannot be scanned at gates despite being modeled in the DB.

### G3: Asset Barcode/QR Scanning (DB ONLY — no scan UI)

`scan_events` table exists with full schema. `useScanEvents()` and `useCreateScanEvent()` hooks exist. But no page allows a user to scan an asset barcode/QR code and create a scan event (check-in, check-out, transfer, count, verify, damage).

**Impact:** Warehouse and logistics teams cannot scan assets for tracking. All scan_events must be created via direct API calls or not at all.

### G4: Asset RFID Scanning (DB ONLY — no lookup)

`assets.rfid_tag` column exists and is indexed. But no API endpoint looks up an asset by RFID tag. No UI supports RFID input for asset identification.

**Impact:** RFID-tagged assets cannot be identified by scanning. The column is write-only.

### G5: QR Code Generation (DB ONLY — no generation)

`assets.qr_code_url` column exists (migration 082) but nothing generates QR codes, stores them, or displays them on asset detail pages or printable labels.

**Impact:** Cannot print asset labels with scannable QR codes. The column is permanently null.

### G6: NFC Scanning (MISSING — all layers)

No Web NFC API usage exists. NFC is a common credential format for modern event wristbands and badges. The `credential_types.format` enum includes `'rfid'` but not `'nfc'` explicitly (NFC is a subset of RFID conceptually but uses different Web APIs).

**Impact:** NFC-enabled wristbands cannot be scanned via mobile devices, even though NFC readers are built into most modern Android phones and some specialized iOS devices.

---

## 4. Technology Decisions

### 4.1 Camera-Based Barcode/QR Scanning

**Recommendation: `@aspect-software/barcode-scanner` (wrapper around native `BarcodeDetector` API with ZXing WASM fallback)**

| Option                             | Size    | Browser Support                                             | Formats                     | Decision                                                                                                      |
| ---------------------------------- | ------- | ----------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Native `BarcodeDetector` API       | 0 KB    | Chrome 83+, Edge 83+, Opera 69+. **No Firefox, No Safari.** | All standard                | ❌ Insufficient browser support                                                                               |
| `html5-qrcode`                     | ~95 KB  | All modern browsers                                         | QR, EAN, Code128, UPC, etc. | ✅ **Recommended** — battle-tested, MIT, supports both camera and file upload, handles permissions gracefully |
| `@aspect-software/barcode-scanner` | ~180 KB | All modern browsers (ZXing WASM)                            | 15+ formats                 | ❌ Heavier, WASM complexity                                                                                   |
| `zxing-wasm`                       | ~250 KB | All modern browsers                                         | 15+ formats                 | ❌ Too heavy                                                                                                  |

**Final choice: `html5-qrcode`**

- ~95 KB gzipped (acceptable within 200KB animation budget precedent)
- Supports QR, Code128, EAN-13, EAN-8, UPC-A, UPC-E, Code39, Code93, ITF, Codabar, Data Matrix, Aztec, PDF417
- Built-in camera permission handling with fallback to file upload
- MIT license
- Tree-shakeable — only import `Html5QrcodeScanner` or `Html5Qrcode` as needed
- Works on iOS Safari (important for field crew on iPads)

### 4.2 QR Code Generation

**Recommendation: `qrcode` (npm)**

| Option                | Size   | Server/Client            | Decision                                                                     |
| --------------------- | ------ | ------------------------ | ---------------------------------------------------------------------------- |
| `qrcode`              | ~33 KB | Both (Node + Canvas/SVG) | ✅ **Recommended** — generates SVG/PNG/Data URL, works server-side for batch |
| `qrcode.react`        | ~20 KB | Client only              | ❌ React wrapper, but we also need server-side generation                    |
| `@keeex/qrcodegen-ts` | ~8 KB  | Both                     | ❌ QR only, no barcode formats                                               |

**Final choice: `qrcode` + `qrcode.react`**

- `qrcode` for server-side generation (API route for batch label generation, storing `qr_code_url`)
- `qrcode.react` for client-side inline display (asset detail pages, credential cards)

### 4.3 NFC

**Recommendation: Web NFC API (native, no library needed)**

The Web NFC API (`NDEFReader`) is available in Chrome for Android 89+. It is **not supported** on iOS or desktop browsers. Implementation must:

- Feature-detect with `"NDEFReader" in window`
- Gracefully degrade to camera/manual input when unavailable
- Only expose NFC UI on supported devices

### 4.4 RFID

RFID readers in the event/warehouse context are **external USB/Bluetooth HID devices** that behave as keyboard wedge inputs (like barcode scanners). No special Web API is needed — the existing `<Input>` field already captures their output. The gap is purely **server-side lookup** (querying by `rfid_tag` in addition to `barcode_value`).

---

## 5. Phase 1 — Shared Scanning Primitives

**Goal:** Create reusable scanning components that all scanning features (credentials, assets, inventory) can consume.

**Duration:** Week 1–2

### 5.1 Dependencies

```
npm install html5-qrcode qrcode qrcode.react
npm install -D @types/qrcode
```

### 5.2 New Files

#### 5.2.1 `src/components/scanning/barcode-scanner.tsx`

Universal camera-based scanner component.

```
Props:
  - onScan: (value: string, format: string) => void
  - onError?: (error: string) => void
  - formats?: string[]  // defaults to all supported
  - facingMode?: "environment" | "user"  // defaults to environment (rear camera)
  - showFileUpload?: boolean  // fallback for desktop/unsupported
  - showTorch?: boolean  // torch/flashlight toggle
  - scanRegion?: { x: number; y: number; width: number; height: number }
  - className?: string
  - disabled?: boolean

Behavior:
  - Requests camera permission via html5-qrcode
  - Renders live camera viewfinder with scan region overlay
  - On successful decode: calls onScan(decodedText, format)
  - Haptic feedback via navigator.vibrate(200) on scan
  - Audio feedback via short beep (Web Audio API, no audio file)
  - Auto-pauses scanning for 1.5s after successful scan (debounce)
  - Graceful degradation: shows file upload button when camera unavailable
  - Accessibility: aria-live region announces scan results
  - prefers-reduced-motion: disables scan region animation

Cleanup:
  - Stops camera on unmount via useEffect cleanup
  - Releases MediaStream tracks
```

#### 5.2.2 `src/components/scanning/nfc-reader.tsx`

NFC scanning component (Android Chrome only).

```
Props:
  - onRead: (serialNumber: string, records: NDEFRecord[]) => void
  - onError?: (error: string) => void
  - enabled?: boolean
  - className?: string

Behavior:
  - Feature-detects NDEFReader in window
  - If unavailable: renders nothing (parent must provide fallback)
  - If available: shows "Tap NFC" button + status indicator
  - On read: extracts serial number + NDEF text records
  - Haptic feedback on successful read
  - Aborts reading on unmount via AbortController
```

#### 5.2.3 `src/components/scanning/scan-input.tsx`

Unified scan input that combines all input methods.

```
Props:
  - onScan: (value: string, method: "keyboard" | "camera" | "nfc" | "file") => void
  - placeholder?: string
  - scanTypes?: ("keyboard" | "camera" | "nfc" | "file")[]  // defaults to all available
  - autoFocus?: boolean
  - disabled?: boolean
  - className?: string

Behavior:
  - Always renders text input (keyboard/wedge scanner — existing pattern)
  - Camera button: opens BarcodeScanner in a Dialog/Sheet
  - NFC button: visible only when NDEFReader available
  - File button: opens file picker for barcode image
  - Tab-style toggle between input methods on mobile
  - Keyboard shortcut: Cmd+Shift+S to toggle camera
```

#### 5.2.4 `src/components/scanning/qr-display.tsx`

QR code display component for asset labels and credentials.

```
Props:
  - value: string  // the data to encode
  - size?: number  // px, defaults to 128
  - level?: "L" | "M" | "Q" | "H"  // error correction, defaults to M
  - includeMargin?: boolean
  - className?: string
  - downloadable?: boolean  // show download button
  - printable?: boolean  // show print button

Behavior:
  - Renders QR code via qrcode.react <QRCodeSVG>
  - Download button: exports as PNG via canvas conversion
  - Print button: opens print dialog with QR code only
```

#### 5.2.5 `src/components/scanning/scan-feedback.tsx`

Shared audio/haptic/visual feedback for scan results.

```
Props:
  - result: "success" | "warning" | "error" | "info"
  - message: string
  - visible: boolean

Behavior:
  - Success: green flash + short beep + haptic pulse
  - Warning: amber flash + double beep
  - Error: red flash + error tone + long haptic
  - Info: blue flash + soft beep
  - All: respects prefers-reduced-motion (no flash, only audio/haptic)
  - Audio generated via Web Audio API (OscillatorNode), no asset files
```

#### 5.2.6 `src/components/scanning/index.ts`

Barrel export for all scanning components.

#### 5.2.7 `src/hooks/use-scan-device.ts`

Device capability detection hook.

```
Returns:
  - hasCamera: boolean
  - hasNfc: boolean
  - hasTorch: boolean
  - isMobile: boolean
  - preferredMethod: "camera" | "keyboard" | "nfc"

Behavior:
  - Checks navigator.mediaDevices.enumerateDevices()
  - Checks "NDEFReader" in window
  - Checks MediaTrackConstraints.torch support
  - Caches results in Zustand scan device store
```

#### 5.2.8 `src/lib/audio/scan-audio.ts`

Web Audio API beep generator (no audio files).

```
Exports:
  - playSuccessBeep(): void
  - playWarningBeep(): void
  - playErrorBeep(): void
  - playInfoBeep(): void

Implementation:
  - Creates AudioContext lazily on first call
  - OscillatorNode with gain envelope
  - Success: 880Hz, 150ms
  - Warning: 660Hz × 2, 100ms each
  - Error: 330Hz, 400ms
  - Info: 1047Hz, 100ms
  - Respects prefers-reduced-motion (silent)
```

#### 5.2.9 `src/lib/i18n/scanning-strings.ts`

i18n string catalog for all scanning UI.

```
Sections:
  - scanner (camera permission, scanning, formats)
  - nfc (tap prompt, reading, unsupported)
  - feedback (success, warning, error messages)
  - qr (generate, download, print)
  - input (placeholder, methods, toggle)
```

### 5.3 Modified Files

| File           | Change                                                        |
| -------------- | ------------------------------------------------------------- |
| `package.json` | Add `html5-qrcode`, `qrcode`, `qrcode.react`, `@types/qrcode` |

---

## 6. Phase 2 — Credential Scanning Completion

**Goal:** Enable RFID lookup and camera-based scanning on the gate scanner page.

**Duration:** Week 2–3

### 6.1 Database Changes

#### Migration: `084_scanning_enhancements.sql`

```sql
-- 1. Extend credential_types.format to include 'nfc'
ALTER TABLE credential_types
  DROP CONSTRAINT IF EXISTS credential_types_format_check;
ALTER TABLE credential_types
  ADD CONSTRAINT credential_types_format_check
  CHECK (format IN ('wristband', 'badge', 'lanyard', 'digital', 'rfid', 'nfc', 'ticket', 'qr'));

-- 2. Add nfc_tag to credential_assignments
ALTER TABLE credential_assignments
  ADD COLUMN IF NOT EXISTS nfc_serial TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cred_assign_nfc
  ON credential_assignments(nfc_serial) WHERE nfc_serial IS NOT NULL;

COMMENT ON COLUMN credential_assignments.nfc_serial IS
  'NFC tag serial number (UID) for tap-based credential scanning.';

-- 3. Add scan_method to credential_scan_log
ALTER TABLE credential_scan_log
  ADD COLUMN IF NOT EXISTS scan_method TEXT
  CHECK (scan_method IS NULL OR scan_method IN ('keyboard', 'camera', 'rfid', 'nfc', 'file', 'api'));

COMMENT ON COLUMN credential_scan_log.scan_method IS
  'Input method used to capture the scan value. NULL for legacy entries.';

-- 4. Extend scan_type enum for asset scan_events to include 'audit'
-- (inventory audit scans distinct from manual count)
ALTER TYPE scan_type ADD VALUE IF NOT EXISTS 'audit';

-- 5. Add scan_method to scan_events (asset/inventory)
ALTER TABLE scan_events
  ADD COLUMN IF NOT EXISTS scan_method TEXT
  CHECK (scan_method IS NULL OR scan_method IN ('keyboard', 'camera', 'rfid', 'nfc', 'file', 'api'));

-- 6. Add barcode column to scan_events (store the raw scanned value for traceability)
ALTER TABLE scan_events
  ADD COLUMN IF NOT EXISTS scanned_value TEXT;

COMMENT ON COLUMN scan_events.scanned_value IS
  'Raw barcode/RFID/NFC value captured during the scan for audit traceability.';

-- 7. Index for asset lookup by rfid_tag (already exists from 019 as idx_assets_rfid)
-- Verify it exists; create if somehow missing
CREATE INDEX IF NOT EXISTS idx_assets_rfid ON assets(rfid_tag);

-- 8. Index for asset lookup by barcode
CREATE INDEX IF NOT EXISTS idx_assets_barcode ON assets(barcode);
```

### 6.2 API Changes

#### 6.2.1 Modify `src/app/api/credentials/scan/route.ts`

Add **multi-identifier lookup** — try barcode_value first, then rfid_tag, then nfc_serial.

```
Current: .eq("barcode_value", barcode_value)

New logic:
  1. Accept { identifier_value, identifier_type?, scan_type, ... }
     - identifier_type: "barcode" | "rfid" | "nfc" | "auto" (default: "auto")
  2. If "auto": try barcode_value → rfid_tag → nfc_serial in sequence
  3. If explicit type: query only that column
  4. Log scan_method in credential_scan_log
  5. Backward compatible: still accepts { barcode_value } for existing gate page
```

### 6.3 Type Changes

#### 6.3.1 Modify `src/types/credentialing.ts`

```
Add to CredentialAssignment:
  - nfc_serial: string | null

Add to CredentialScanLog:
  - scan_method: ScanMethod | null

Add new type:
  - ScanMethod = "keyboard" | "camera" | "rfid" | "nfc" | "file" | "api"
  - IdentifierType = "barcode" | "rfid" | "nfc" | "auto"
```

### 6.4 Hook Changes

#### 6.4.1 Modify `src/lib/supabase/hooks-credentialing.ts`

Update `useGateScan()` mutation payload to accept `identifier_value` + `identifier_type` + `scan_method`.

### 6.5 UI Changes

#### 6.5.1 Modify `src/app/(dashboard)/live-ops/gate/page.tsx`

Replace the plain `<Input>` with the new `<ScanInput>` component:

- Keyboard input (existing behavior, preserved)
- Camera button → opens `BarcodeScanner` in a bottom sheet
- NFC button → activates `NfcReader` (Android only, auto-hidden elsewhere)
- Auto-detect identifier type from format (QR/barcode → barcode, RFID tag → rfid, NFC serial → nfc)
- Pass `scan_method` through to the API

**No layout changes.** The `ScanInput` replaces the existing `<Input>` + `<QrCode>` icon inline.

#### 6.5.2 New: `src/app/(dashboard)/live-ops/gate/scan-sheet.tsx`

Bottom sheet / dialog for camera scanning:

- Full-width viewfinder on mobile
- Dialog on desktop
- Format indicator showing detected barcode type
- Cancel button returns to keyboard input
- Auto-closes on successful scan

---

## 7. Phase 3 — Asset & Inventory Scanning

**Goal:** Full scanning workflow for assets, consumables, and kits in warehouse/logistics context.

**Duration:** Week 3–5

### 7.1 New API Routes

#### 7.1.1 `src/app/api/assets/lookup/route.ts`

Asset lookup by any identifier (barcode, RFID, NFC, QR, name).

```
GET /api/assets/lookup?identifier=ABC123&type=auto

Logic:
  1. type=auto (default): try barcode → rfid_tag → sku → id
  2. type=barcode: query .eq("barcode", value)
  3. type=rfid: query .eq("rfid_tag", value)
  4. type=sku: query .eq("sku", value)
  5. type=id: query .eq("id", value)
  6. Returns full asset with warehouse_location join
  7. 404 if not found
```

#### 7.1.2 `src/app/api/assets/scan/route.ts`

Create a scan event for an asset (wraps scan_events table).

```
POST /api/assets/scan
Body: {
  identifier_value: string,
  identifier_type: "barcode" | "rfid" | "nfc" | "sku" | "auto",
  scan_type: "check_in" | "check_out" | "transfer" | "count" | "receive" | "ship" | "verify" | "damage" | "audit",
  scan_method: "keyboard" | "camera" | "rfid" | "nfc" | "file" | "api",
  warehouse_location_id?: string,
  notes?: string,
  device_id?: string,
  latitude?: number,
  longitude?: number
}

Logic:
  1. Look up asset via /api/assets/lookup logic
  2. Validate scan_type is appropriate for asset state
  3. Insert scan_events record
  4. If check_in/check_out: update asset.warehouse_location_id
  5. If transfer: update asset.warehouse_location_id to new location
  6. If damage: flag asset condition
  7. Return: { asset, scan_event, message }
```

#### 7.1.3 `src/app/api/consumables/lookup/route.ts`

Same pattern as assets/lookup but for consumables table.

#### 7.1.4 `src/app/api/kits/lookup/route.ts`

Same pattern for kits table (includes kit_items join).

### 7.2 New Hooks

#### 7.2.1 `src/lib/supabase/hooks-scanning.ts`

```
Hooks:
  - useAssetLookup(identifier, type) — GET /api/assets/lookup
  - useAssetScan() — mutation, POST /api/assets/scan
  - useConsumableLookup(identifier, type) — GET /api/consumables/lookup
  - useKitLookup(identifier, type) — GET /api/kits/lookup
  - useAssetScanHistory(assetId?, limit?) — query scan_events filtered by asset_id
  - useRecentScans(limit?) — query scan_events ordered by scanned_at desc (user's org)
```

### 7.3 New Pages

#### 7.3.1 `src/app/(dashboard)/assets/scan/page.tsx`

Full-page asset scanner for warehouse operations.

```
Layout:
  ┌────────────────────────────────────────────┐
  │  PageHeader: "Asset Scanner"               │
  ├──────────────────────┬─────────────────────┤
  │                      │                     │
  │   ScanInput          │   Last Scan Result  │
  │   (camera/kbd/nfc)   │   (asset card +     │
  │                      │    quick actions)    │
  │   Scan Type Selector │                     │
  │   (check_in/out/     │   Location Picker   │
  │    transfer/count/   │   (warehouse zone)  │
  │    verify/damage)    │                     │
  │                      │                     │
  ├──────────────────────┴─────────────────────┤
  │  Recent Scans (last 25, auto-refresh)      │
  │  DataTable: asset name, type, result, time │
  └────────────────────────────────────────────┘

Behavior:
  - Scan an asset → lookup → show details → select action → confirm
  - Continuous scanning mode: scan → auto-action → scan next
  - Batch mode: scan multiple → review → submit all
  - Sound/haptic feedback per scan
  - Permission: scan_log.write
```

#### 7.3.2 `src/app/(dashboard)/assets/scan/batch/page.tsx`

Batch scanning page for inventory counts and bulk check-in/out.

```
Behavior:
  - Set scan type once (e.g. "count" for inventory audit)
  - Set warehouse location once
  - Scan continuously — each scan adds to running list
  - Review table with edit/remove capability
  - "Submit All" creates scan_events in bulk
  - Export scanned list as CSV
  - Counter showing scanned/expected (for inventory audits with audit_count_items)
```

### 7.4 Modified Pages

#### 7.4.1 Modify `src/app/(dashboard)/assets/[id]/page.tsx`

Add "Scan History" tab to asset detail page.

```
New tab: {
  id: "scans",
  label: "Scan History",
  icon: ScanBarcode,
  content: DataTable of scan_events where asset_id = current asset
  columns: scan_type, scan_method, scanned_by, scanned_at, location_context, notes
}

Add QR code display in sidebar:
  - QRDisplay component showing asset barcode value
  - Download/print buttons for label generation
  - RFID tag display (if set)
```

#### 7.4.2 Modify `src/app/(dashboard)/assets/page.tsx`

Add "Scan Assets" button in PageHeader actions (links to /assets/scan).

### 7.5 Navigation

#### 7.5.1 Modify `src/config/navigation.ts`

Add under Resources section:

```
{
  title: "Asset Scanner",
  path: "/assets/scan",
  icon: ScanBarcode,
  permission: "scan_log.write",
}
```

---

## 8. Phase 4 — QR Code Generation

**Goal:** Generate, store, display, and print QR codes for assets and credentials.

**Duration:** Week 5–6

### 8.1 New API Routes

#### 8.1.1 `src/app/api/assets/[id]/qr/route.ts`

Generate and store QR code for a single asset.

```
POST /api/assets/{id}/qr
  - Generates QR code encoding: { type: "asset", id, barcode, org_id }
  - Uploads SVG to Supabase Storage (bucket: asset-labels)
  - Updates assets.qr_code_url with signed URL
  - Returns: { qr_code_url, svg_data }

GET /api/assets/{id}/qr
  - Returns existing qr_code_url or generates on-demand
```

#### 8.1.2 `src/app/api/assets/qr/batch/route.ts`

Batch QR generation for multiple assets.

```
POST /api/assets/qr/batch
Body: { asset_ids: string[] }  // max 100

Logic:
  1. Fetch all assets by IDs
  2. Generate QR codes in parallel
  3. Upload to Supabase Storage
  4. Bulk update assets.qr_code_url
  5. Return: { results: Array<{ id, qr_code_url }>, errors: Array<{ id, error }> }
```

#### 8.1.3 `src/app/api/credentials/[id]/qr/route.ts`

Generate QR code for a credential assignment.

```
POST /api/credentials/{id}/qr
  - Generates QR code encoding: { type: "credential", id, barcode_value, org_id }
  - Returns: { qr_code_url, svg_data }
```

### 8.2 New Components

#### 8.2.1 `src/components/scanning/label-sheet.tsx`

Printable label sheet component (multiple QR codes per page).

```
Props:
  - items: Array<{ label: string; sublabel?: string; qrValue: string }>
  - layout: "avery-5160" | "avery-5163" | "2x4" | "3x10"  // label sheet formats
  - showBarcode?: boolean  // show human-readable barcode below QR

Behavior:
  - CSS @media print optimized layout
  - QR code + label text per cell
  - "Print Labels" button opens system print dialog
  - PDF export option via window.print()
```

#### 8.2.2 `src/components/scanning/qr-generator-dialog.tsx`

Dialog for generating QR codes for selected assets/credentials.

```
Props:
  - entityType: "asset" | "credential"
  - selectedIds: string[]
  - onComplete: () => void

Behavior:
  - Shows preview of QR codes to generate
  - "Generate" button calls batch API
  - Progress indicator for batch operations
  - "Print Labels" button after generation
```

### 8.3 Modified Files

| File                                                   | Change                                       |
| ------------------------------------------------------ | -------------------------------------------- |
| `src/app/(dashboard)/assets/page.tsx`                  | Add "Generate QR Labels" bulk action button  |
| `src/app/(dashboard)/assets/[id]/page.tsx`             | Add QRDisplay in sidebar with download/print |
| `src/app/(dashboard)/credentials/assignments/page.tsx` | Add "Generate QR" action per row             |
| `src/components/credentialing/scan-result-display.tsx` | Show QR code for valid credentials           |

---

## 9. Phase 5 — NFC & Advanced Hardware

**Goal:** NFC tag reading/writing for credentials and assets. Advanced RFID reader integration patterns.

**Duration:** Week 6–8

### 9.1 NFC Reading (Already in Phase 1 primitive)

The `NfcReader` component from Phase 1 handles reading. Phase 5 wires it into:

#### 9.1.1 Gate Scanner NFC Flow

- NFC read → extract serial number → POST /api/credentials/scan with `identifier_type: "nfc"`
- Auto-detect: if `NDEFReader` available and user taps NFC, prefer NFC mode
- Fallback: camera/keyboard always available

#### 9.1.2 Asset Scanner NFC Flow

- NFC read → extract serial number → GET /api/assets/lookup?type=nfc&identifier=SERIAL
- Requires `assets` table change: add `nfc_tag` column (see §12)

### 9.2 NFC Writing

#### 9.2.1 `src/components/scanning/nfc-writer.tsx`

Write asset/credential identifiers to NFC tags.

```
Props:
  - data: { type: "asset" | "credential"; id: string; identifier: string }
  - onWriteComplete: () => void
  - onError: (error: string) => void

Behavior:
  - Uses NDEFReader.write() to write NDEF Text record
  - Encodes: JSON { type, id, identifier, org_id, written_at }
  - Shows "Hold tag near device" prompt
  - Success confirmation with written data preview
  - Only available on Android Chrome (feature-detected)
```

#### 9.2.2 `src/app/api/assets/[id]/nfc/route.ts`

Record NFC tag association.

```
POST /api/assets/{id}/nfc
Body: { nfc_serial: string }

Logic:
  1. Validate asset exists and user has write permission
  2. Check nfc_serial is not already assigned to another asset
  3. Update assets.nfc_tag = nfc_serial
  4. Create scan_event with scan_type "verify", scan_method "nfc"
  5. Return updated asset
```

### 9.3 Database Changes (Phase 5)

```sql
-- In migration 084 (or separate 085 if phased):
ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS nfc_tag TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_nfc
  ON assets(nfc_tag) WHERE nfc_tag IS NOT NULL;

COMMENT ON COLUMN assets.nfc_tag IS
  'NFC tag serial number (UID) for tap-based asset identification.';
```

### 9.4 RFID Reader Integration Patterns

USB/Bluetooth RFID readers behave as HID keyboard wedge devices. They already work with the text `<Input>` field. To improve the experience:

#### 9.4.1 `src/hooks/use-wedge-scanner.ts`

Detect rapid keyboard input (wedge scanner pattern).

```
Props:
  - onScan: (value: string) => void
  - minLength?: number  // minimum barcode length (default: 4)
  - maxDelay?: number  // max ms between keystrokes (default: 50)
  - terminator?: string  // end character (default: "Enter")
  - enabled?: boolean

Behavior:
  - Listens for document-level keydown events
  - If keystrokes arrive faster than maxDelay ms apart → wedge scanner
  - Buffers until terminator → calls onScan with buffered value
  - Does NOT interfere with normal typing (slower keystrokes ignored)
  - Works globally — no need to focus an input field
  - Critical for hands-free warehouse scanning (scanner on belt, both hands on asset)
```

This hook makes the gate scanner and asset scanner work in **hands-free mode** where the operator doesn't need to click into an input field — any rapid barcode scan is auto-captured.

---

## 10. Phase 6 — Offline & PWA

**Goal:** Enable scanning when network is unavailable (warehouse dead zones, outdoor events).

**Duration:** Week 7–8

### 10.1 Offline Scan Queue

#### 10.1.1 `src/lib/scanning/offline-queue.ts`

IndexedDB-backed queue for offline scans.

```
Exports:
  - enqueueScan(scan: PendingScan): Promise<void>
  - getPendingScans(): Promise<PendingScan[]>
  - removeScan(id: string): Promise<void>
  - syncPendingScans(): Promise<SyncResult>
  - getPendingCount(): Promise<number>

PendingScan:
  - id: string (client-generated UUID)
  - type: "credential" | "asset" | "consumable" | "kit"
  - identifier_value: string
  - identifier_type: IdentifierType
  - scan_type: string
  - scan_method: ScanMethod
  - scanned_at: string (ISO timestamp)
  - device_id?: string
  - latitude?: number
  - longitude?: number
  - notes?: string

Behavior:
  - Uses IndexedDB (via idb library or raw API)
  - Stores scans when navigator.onLine === false
  - syncPendingScans() POSTs each to appropriate API endpoint
  - Retry with exponential backoff on failure
  - Conflict resolution: server timestamp wins, client scan preserved with offline flag
```

#### 10.1.2 `src/hooks/use-offline-sync.ts`

Hook to monitor and trigger offline sync.

```
Returns:
  - isOnline: boolean
  - pendingCount: number
  - isSyncing: boolean
  - sync: () => Promise<void>
  - lastSyncAt: string | null

Behavior:
  - Monitors navigator.onLine + online/offline events
  - Auto-syncs when coming back online
  - Shows pending count badge in scanning UI
```

#### 10.1.3 `src/components/scanning/offline-indicator.tsx`

Visual indicator for offline state and pending syncs.

```
Behavior:
  - Shows "Offline — X scans queued" banner when offline
  - Shows "Syncing..." with progress when reconnecting
  - Shows "All synced" confirmation after successful sync
  - Integrates into asset scanner and gate scanner pages
```

### 10.2 Service Worker Registration

#### 10.2.1 Modify `src/app/layout.tsx`

Register service worker for offline scanning pages.

#### 10.2.2 `public/sw-scanning.js`

Minimal service worker that caches:

- `/assets/scan` page shell
- `/live-ops/gate` page shell
- Scanning component JS bundles
- `html5-qrcode` library bundle

Does NOT cache API responses — those go through the offline queue.

---

## 11. RBAC & Permissions

### 11.1 Existing Permissions (No Changes Needed)

| Resource                 | Actions             | Roles                                       | Scanning Feature               |
| ------------------------ | ------------------- | ------------------------------------------- | ------------------------------ |
| `gate_operations`        | read, write         | exec, director, pm, member, collaborator    | Gate scanner page              |
| `credential_scans`       | read, write         | exec, director, pm, member                  | Credential scan log            |
| `scan_log`               | read, write         | exec, director, pm, member, collaborator    | Asset scan events              |
| `assets`                 | read, write         | exec, director, pm, member                  | Asset lookup/detail            |
| `inventory`              | read, write         | exec, director, pm, member                  | Consumable/kit scanning        |
| `credential_assignments` | read, write, manage | exec (manage), director (write), pm (write) | Credential RFID/NFC assignment |
| `credential_types`       | read, write, manage | exec (manage), director (write), pm (write) | Credential format config       |

### 11.2 New Permission Needed

| Resource        | Actions     | Roles              | Feature                                              |
| --------------- | ----------- | ------------------ | ---------------------------------------------------- |
| `qr_generation` | read, write | exec, director, pm | QR code batch generation (cost/storage implications) |
| `nfc_write`     | write       | exec, director, pm | Writing NFC tags (irreversible physical action)      |

Add to `src/config/rbac.ts` in exec, director, and pm role blocks.

---

## 12. Database Changes Summary

All changes in a single migration `084_scanning_enhancements.sql`:

| Table                    | Column/Change       | Type                       | Purpose                       |
| ------------------------ | ------------------- | -------------------------- | ----------------------------- |
| `credential_types`       | Extend format CHECK | —                          | Add 'nfc', 'qr' formats       |
| `credential_assignments` | `nfc_serial`        | TEXT, unique partial index | NFC tag identifier            |
| `credential_scan_log`    | `scan_method`       | TEXT with CHECK            | Input method tracking         |
| `scan_events`            | `scan_method`       | TEXT with CHECK            | Input method tracking         |
| `scan_events`            | `scanned_value`     | TEXT                       | Raw scanned value audit trail |
| `scan_type` enum         | Add 'audit'         | ENUM value                 | Inventory audit scan type     |
| `assets`                 | `nfc_tag`           | TEXT, unique partial index | NFC tag for assets            |
| `assets`                 | Index on `barcode`  | INDEX                      | Fast barcode lookup           |

**Zero new tables. Zero breaking changes.**

---

## 13. File Change Map

### Phase 1 — Shared Primitives (9 new files)

| File                                          | Type | Description                         |
| --------------------------------------------- | ---- | ----------------------------------- |
| `src/components/scanning/barcode-scanner.tsx` | NEW  | Camera-based scanner (html5-qrcode) |
| `src/components/scanning/nfc-reader.tsx`      | NEW  | Web NFC reader                      |
| `src/components/scanning/scan-input.tsx`      | NEW  | Unified multi-method input          |
| `src/components/scanning/qr-display.tsx`      | NEW  | QR code display (qrcode.react)      |
| `src/components/scanning/scan-feedback.tsx`   | NEW  | Audio/haptic/visual feedback        |
| `src/components/scanning/index.ts`            | NEW  | Barrel export                       |
| `src/hooks/use-scan-device.ts`                | NEW  | Device capability detection         |
| `src/lib/audio/scan-audio.ts`                 | NEW  | Web Audio beep generator            |
| `src/lib/i18n/scanning-strings.ts`            | NEW  | i18n strings                        |

### Phase 2 — Credential Completion (2 new, 5 modified)

| File                                                | Type | Description                   |
| --------------------------------------------------- | ---- | ----------------------------- |
| `supabase/migrations/084_scanning_enhancements.sql` | NEW  | All DB changes                |
| `src/app/(dashboard)/live-ops/gate/scan-sheet.tsx`  | NEW  | Camera scan bottom sheet      |
| `src/app/api/credentials/scan/route.ts`             | MOD  | Multi-identifier lookup       |
| `src/types/credentialing.ts`                        | MOD  | nfc_serial, scan_method types |
| `src/lib/supabase/hooks-credentialing.ts`           | MOD  | Updated payload types         |
| `src/app/(dashboard)/live-ops/gate/page.tsx`        | MOD  | ScanInput integration         |
| `package.json`                                      | MOD  | Add dependencies              |

### Phase 3 — Asset Scanning (5 new, 4 modified)

| File                                             | Type | Description                       |
| ------------------------------------------------ | ---- | --------------------------------- |
| `src/app/api/assets/lookup/route.ts`             | NEW  | Multi-identifier asset lookup     |
| `src/app/api/assets/scan/route.ts`               | NEW  | Create asset scan event           |
| `src/app/(dashboard)/assets/scan/page.tsx`       | NEW  | Asset scanner page                |
| `src/app/(dashboard)/assets/scan/batch/page.tsx` | NEW  | Batch scanning page               |
| `src/lib/supabase/hooks-scanning.ts`             | NEW  | Scanning-specific hooks           |
| `src/app/(dashboard)/assets/[id]/page.tsx`       | MOD  | Add Scan History tab + QR sidebar |
| `src/app/(dashboard)/assets/page.tsx`            | MOD  | Add "Scan Assets" button          |
| `src/config/navigation.ts`                       | MOD  | Add Asset Scanner nav item        |
| `src/lib/supabase/index.ts`                      | MOD  | Export new hooks                  |

### Phase 4 — QR Generation (5 new, 4 modified)

| File                                                   | Type | Description                |
| ------------------------------------------------------ | ---- | -------------------------- |
| `src/app/api/assets/[id]/qr/route.ts`                  | NEW  | Single asset QR generation |
| `src/app/api/assets/qr/batch/route.ts`                 | NEW  | Batch QR generation        |
| `src/app/api/credentials/[id]/qr/route.ts`             | NEW  | Credential QR generation   |
| `src/components/scanning/label-sheet.tsx`              | NEW  | Printable label sheet      |
| `src/components/scanning/qr-generator-dialog.tsx`      | NEW  | QR generation dialog       |
| `src/app/(dashboard)/assets/page.tsx`                  | MOD  | Bulk QR generation action  |
| `src/app/(dashboard)/assets/[id]/page.tsx`             | MOD  | QR display in sidebar      |
| `src/app/(dashboard)/credentials/assignments/page.tsx` | MOD  | QR action per row          |
| `src/components/credentialing/scan-result-display.tsx` | MOD  | QR display for valid creds |

### Phase 5 — NFC & Advanced (4 new, 3 modified)

| File                                         | Type | Description                            |
| -------------------------------------------- | ---- | -------------------------------------- |
| `src/components/scanning/nfc-writer.tsx`     | NEW  | NFC tag writer                         |
| `src/app/api/assets/[id]/nfc/route.ts`       | NEW  | NFC tag association API                |
| `src/hooks/use-wedge-scanner.ts`             | NEW  | HID wedge scanner detection            |
| `src/app/api/consumables/lookup/route.ts`    | NEW  | Consumable lookup                      |
| `src/app/(dashboard)/live-ops/gate/page.tsx` | MOD  | Wedge scanner + NFC integration        |
| `src/app/(dashboard)/assets/scan/page.tsx`   | MOD  | Wedge scanner + NFC integration        |
| `src/config/rbac.ts`                         | MOD  | Add qr_generation, nfc_write resources |

### Phase 6 — Offline & PWA (4 new, 3 modified)

| File                                            | Type | Description                      |
| ----------------------------------------------- | ---- | -------------------------------- |
| `src/lib/scanning/offline-queue.ts`             | NEW  | IndexedDB offline scan queue     |
| `src/hooks/use-offline-sync.ts`                 | NEW  | Online/offline monitoring + sync |
| `src/components/scanning/offline-indicator.tsx` | NEW  | Offline state banner             |
| `public/sw-scanning.js`                         | NEW  | Service worker for scan pages    |
| `src/app/(dashboard)/live-ops/gate/page.tsx`    | MOD  | Offline indicator integration    |
| `src/app/(dashboard)/assets/scan/page.tsx`      | MOD  | Offline indicator integration    |
| `src/app/layout.tsx`                            | MOD  | Service worker registration      |

### Totals

|           | New    | Modified | Total  |
| --------- | ------ | -------- | ------ |
| Phase 1   | 9      | 1        | 10     |
| Phase 2   | 2      | 5        | 7      |
| Phase 3   | 5      | 4        | 9      |
| Phase 4   | 5      | 4        | 9      |
| Phase 5   | 4      | 3        | 7      |
| Phase 6   | 4      | 3        | 7      |
| **Total** | **29** | **20**   | **49** |

---

## 14. Verification Matrix

### Per-Phase Gates

| Phase | tsc | eslint | Tests                            | Build | a11y                        | Mobile                      | Description                               |
| ----- | --- | ------ | -------------------------------- | ----- | --------------------------- | --------------------------- | ----------------------------------------- |
| 1     | ✅  | ✅     | Unit: scanner mocks, QR gen      | ✅    | WCAG scan region, aria-live | iOS Safari + Android Chrome | Primitives render, camera permission flow |
| 2     | ✅  | ✅     | Integration: multi-ID lookup     | ✅    | —                           | Gate page on tablet         | RFID + NFC lookup paths                   |
| 3     | ✅  | ✅     | Integration: asset scan→event    | ✅    | Batch table a11y            | Warehouse on Android        | Scan creates events, updates locations    |
| 4     | ✅  | ✅     | Unit: QR encode/decode roundtrip | ✅    | Print layout                | —                           | Generated QR scans back correctly         |
| 5     | ✅  | ✅     | Mock: NFC read/write             | ✅    | NFC prompts                 | Android Chrome              | Feature detection + fallback              |
| 6     | ✅  | ✅     | Unit: queue/sync                 | ✅    | Offline banner              | Airplane mode test          | Queues offline, syncs on reconnect        |

### Cross-Cutting Verification

- [ ] Credential scan via barcode (keyboard) → valid result
- [ ] Credential scan via barcode (camera) → valid result
- [ ] Credential scan via RFID tag → valid result
- [ ] Credential scan via NFC serial → valid result (Android only)
- [ ] Asset scan via barcode (keyboard) → scan_event created
- [ ] Asset scan via barcode (camera) → scan_event created
- [ ] Asset scan via RFID → scan_event created
- [ ] Asset scan via NFC → scan_event created (Android only)
- [ ] QR code generated for asset → scannable by camera scanner
- [ ] QR code generated for credential → scannable by camera scanner
- [ ] Batch QR generation → all codes stored + printable
- [ ] Offline scan → queued → synced on reconnect
- [ ] Wedge scanner (rapid keystroke) → auto-captured without focus
- [ ] prefers-reduced-motion → no scan animation, audio only
- [ ] Screen reader → scan results announced via aria-live
- [ ] Camera permission denied → graceful fallback to file upload
- [ ] NFC unavailable (iOS/desktop) → NFC button hidden, no errors

---

## 15. Open Questions

1. **Barcode format for assets:** The `assets.barcode` column exists but what format should generated barcodes use? Options: UUID-based (unique but long), sequential org-prefixed (e.g. `FP-A-00001`), or user-defined. Affects QR content and label layout.

2. **Supabase Storage bucket:** Should QR code images go in the existing 8 canonical buckets or a new `asset-labels` bucket? New bucket needs CORS and RLS configuration.

3. **Offline scan retention:** How long should unsynced scans be retained in IndexedDB before expiry? Recommendation: 7 days with warning at 72 hours.

4. **NFC data format:** Should NFC tags store plain text (barcode value only) or structured NDEF records (JSON with type/id/org)? Structured is more robust but requires custom reader logic.

5. **Label sheet formats:** Which Avery label formats should be supported? 5160 (30/sheet, 1"×2⅝") is most common for asset tags. 5163 (10/sheet, 2"×4") for larger QR codes.

6. **Audio feedback opt-out:** Should scan audio respect a user preference separate from `prefers-reduced-motion`? Some warehouse environments may want visual but not audio feedback (or vice versa).

7. **Consumable/kit scanning pages:** Should consumables and kits have dedicated scanner pages like assets, or should the asset scanner page handle all three entity types via a type selector? Recommendation: single scanner with entity type toggle to reduce nav clutter.

---

## Appendix A: Dependency Sizes

| Package           | Gzipped     | Purpose                    | Phase |
| ----------------- | ----------- | -------------------------- | ----- |
| `html5-qrcode`    | ~95 KB      | Camera barcode/QR scanning | 1     |
| `qrcode`          | ~33 KB      | Server-side QR generation  | 1     |
| `qrcode.react`    | ~20 KB      | Client-side QR display     | 1     |
| `@types/qrcode`   | dev only    | TypeScript types           | 1     |
| **Total runtime** | **~148 KB** |                            |       |

All packages are MIT licensed. Total runtime addition is within the 200KB budget established in MOTION_STRATEGY.md.

## Appendix B: Existing DB Schema Reference

### scan_events (migration 019)

```
id, asset_id, consumable_id, kit_id, warehouse_location_id,
scan_type (enum: check_in, check_out, transfer, count, receive, ship, verify, damage),
scanned_by, scanned_at, location_context, device_id, latitude, longitude,
notes, organization_id, created_at
```

### credential_scan_log (migration 051)

```
id, organization_id, assignment_id,
scan_type (CHECK: check_in, check_out, verify, deny),
scan_result (CHECK: valid, denied, expired, revoked, zone_denied, flagged),
zone_id, device_id, latitude, longitude,
scanned_by, scanned_at, notes, created_at
```

### credential_assignments (migration 051)

```
id, organization_id, pool_id, credential_type_id,
profile_id, crew_member_id, vip_guest_id, vendor_id,
assignee_name, assignee_email,
barcode_value (TEXT NOT NULL, UNIQUE),
rfid_tag (TEXT, UNIQUE partial),
status (enum), zone_access (TEXT[]),
valid_from, valid_until, lifecycle timestamps...
```

### assets scanning columns

```
barcode TEXT          (migration 001)
rfid_tag TEXT         (migration 019, indexed)
qr_code_url TEXT      (migration 082)
sku TEXT              (migration 019, indexed)
```

## Appendix C: Web API Browser Support

| API                        | Chrome | Firefox | Safari | Edge | Android Chrome | iOS Safari |
| -------------------------- | ------ | ------- | ------ | ---- | -------------- | ---------- |
| `getUserMedia` (camera)    | 53+    | 36+     | 11+    | 12+  | 53+            | 11+        |
| `BarcodeDetector` (native) | 83+    | ❌      | ❌     | 83+  | 83+            | ❌         |
| `html5-qrcode` (polyfill)  | All    | All     | All    | All  | All            | All        |
| `Web NFC (NDEFReader)`     | ❌     | ❌      | ❌     | ❌   | 89+            | ❌         |
| `navigator.vibrate`        | 32+    | 16+     | ❌     | 79+  | 32+            | ❌         |
| `Web Audio API`            | 35+    | 25+     | 14.1+  | 79+  | 35+            | 14.5+      |
| `IndexedDB`                | 24+    | 16+     | 10+    | 12+  | 25+            | 10+        |
| `Service Worker`           | 40+    | 44+     | 11.1+  | 17+  | 40+            | 11.3+      |

**Key constraint:** Web NFC is Android Chrome only. All other APIs have universal modern browser support. The plan uses progressive enhancement — every feature degrades gracefully when hardware/browser support is missing.
