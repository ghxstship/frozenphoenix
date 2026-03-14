/* ═══════════════════════════════════════════════════════════════
   SCAN AUDIO — Web Audio API beep generator for scan feedback.
   No audio files required. Generates tones programmatically.
   Respects prefers-reduced-motion (silent when enabled).
   ═══════════════════════════════════════════════════════════════ */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    // Respect prefers-reduced-motion
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        return null;
    }

    if (!audioCtx) {
        try {
            audioCtx = new AudioContext();
        } catch {
            return null;
        }
    }
    return audioCtx;
}

function playTone(
    frequency: number,
    durationMs: number,
    type: OscillatorType = "sine",
    volume = 0.3
): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === "suspended") {
        void ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Envelope: quick attack, sustain, quick release
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime + durationMs / 1000 - 0.02);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + durationMs / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + durationMs / 1000);
}

/** Short high-pitched beep — successful scan. 880Hz, 150ms. */
export function playSuccessBeep(): void {
    playTone(880, 150, "sine", 0.25);
}

/** Double medium beep — warning/attention needed. 660Hz x2, 100ms each. */
export function playWarningBeep(): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    playTone(660, 100, "sine", 0.3);
    setTimeout(() => playTone(660, 100, "sine", 0.3), 150);
}

/** Low sustained tone — error/denied. 330Hz, 400ms. */
export function playErrorBeep(): void {
    playTone(330, 400, "square", 0.2);
}

/** Quick bright beep — informational. 1047Hz, 100ms. */
export function playInfoBeep(): void {
    playTone(1047, 100, "sine", 0.2);
}

/** Trigger haptic feedback if available. */
export function triggerHaptic(pattern: number | number[] = 200): void {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch {
            // Silently ignore — vibration not supported
        }
    }
}
