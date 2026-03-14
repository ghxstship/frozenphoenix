"use client";

/* ═══════════════════════════════════════════════════════════════
   USE-SCAN-DEVICE — Device capability detection for scanning.
   Checks camera, NFC, torch, and mobile status.
   ═══════════════════════════════════════════════════════════════ */

import { useEffect, useState } from "react";

export interface ScanDeviceCapabilities {
    /** Device has at least one video input (camera). */
    hasCamera: boolean;
    /** Browser supports Web NFC API (Android Chrome 89+). */
    hasNfc: boolean;
    /** Camera supports torch/flashlight. */
    hasTorch: boolean;
    /** Device is likely a mobile/tablet (touch + small screen). */
    isMobile: boolean;
    /** Recommended primary input method based on device. */
    preferredMethod: "camera" | "keyboard" | "nfc";
    /** Detection has completed. */
    ready: boolean;
}

const DEFAULT_CAPABILITIES: ScanDeviceCapabilities = {
    hasCamera: false,
    hasNfc: false,
    hasTorch: false,
    isMobile: false,
    preferredMethod: "keyboard",
    ready: false,
};

export function useScanDevice(): ScanDeviceCapabilities {
    const [capabilities, setCapabilities] = useState<ScanDeviceCapabilities>(DEFAULT_CAPABILITIES);

    useEffect(() => {
        let cancelled = false;

        async function detect() {
            if (typeof window === "undefined" || typeof navigator === "undefined") {
                if (!cancelled) setCapabilities({ ...DEFAULT_CAPABILITIES, ready: true });
                return;
            }

            // Mobile detection
            const isMobile =
                "ontouchstart" in window &&
                (window.innerWidth < 1024 || /Mobi|Android|iPad|iPhone/i.test(navigator.userAgent));

            // NFC detection
            const hasNfc = "NDEFReader" in window;

            // Camera detection
            let hasCamera = false;
            let hasTorch = false;

            try {
                if (navigator.mediaDevices?.enumerateDevices) {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    hasCamera = devices.some((d) => d.kind === "videoinput");
                }
            } catch {
                // Permission denied or API unavailable
                hasCamera = false;
            }

            // Torch detection — requires a temporary stream on mobile
            if (hasCamera && isMobile) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: "environment" },
                    });
                    const track = stream.getVideoTracks()[0];
                    if (track) {
                        const capabilities = track.getCapabilities?.();
                        hasTorch = !!(capabilities as Record<string, unknown>)?.torch;
                        track.stop();
                    }
                } catch {
                    // Cannot test torch without camera permission
                    hasTorch = false;
                }
            }

            // Determine preferred method
            let preferredMethod: ScanDeviceCapabilities["preferredMethod"] = "keyboard";
            if (isMobile && hasCamera) {
                preferredMethod = "camera";
            } else if (hasNfc) {
                preferredMethod = "nfc";
            }

            if (!cancelled) {
                setCapabilities({
                    hasCamera,
                    hasNfc,
                    hasTorch,
                    isMobile,
                    preferredMethod,
                    ready: true,
                });
            }
        }

        void detect();

        return () => {
            cancelled = true;
        };
    }, []);

    return capabilities;
}
