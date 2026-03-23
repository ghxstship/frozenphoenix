/**
 * Web NFC API Type Declarations
 *
 * The Web NFC API (NDEFReader) is not included in TypeScript's standard DOM
 * types because it is only available in Chrome on Android 89+. This declaration
 * file provides proper types so that NFC components can access window.NDEFReader
 * without `as any` casts.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API
 * @canon §2.2 — Trust boundary: Web NFC is a non-standard API not in TS DOM types
 */

interface NDEFMessage {
    records: ReadonlyArray<NDEFRecord>;
}

interface NDEFRecord {
    recordType: string;
    mediaType?: string | undefined;
    id?: string | undefined;
    data?: DataView | undefined;
    encoding?: string | undefined;
    lang?: string | undefined;
    toRecords?: () => NDEFRecord[] | undefined;
}

interface NDEFReadingEvent extends Event {
    serialNumber: string;
    message: NDEFMessage;
}

interface NDEFWriteOptions {
    overwrite?: boolean | undefined;
    signal?: AbortSignal | undefined;
}

interface NDEFScanOptions {
    signal?: AbortSignal | undefined;
}

interface NDEFMessageInit {
    records: NDEFRecordInit[];
}

interface NDEFRecordInit {
    recordType: string;
    mediaType?: string | undefined;
    id?: string | undefined;
    encoding?: string | undefined;
    lang?: string | undefined;
    data?: string | BufferSource | NDEFMessageInit | undefined;
}

declare class NDEFReader extends EventTarget {
    constructor();
    scan(options?: NDEFScanOptions): Promise<void>;
    write(message: NDEFMessageInit | string, options?: NDEFWriteOptions): Promise<void>;
    addEventListener(
        type: "reading",
        listener: (event: NDEFReadingEvent) => void,
        options?: AddEventListenerOptions
    ): void;
    addEventListener(
        type: "readingerror",
        listener: (event: Event) => void,
        options?: AddEventListenerOptions
    ): void;
}

interface Window {
    NDEFReader?: typeof NDEFReader | undefined;
}
