/* ═══════════════════════════════════════════════════════════════
   HAPTICS — Web Vibration API Utility
   
   Provides tactile feedback patterns for mobile interactions.
   Silently no-ops when Vibration API is unavailable (desktop,
   Firefox, older browsers). All patterns are tuned to iOS/Android
   haptic engine conventions.
   ═══════════════════════════════════════════════════════════════ */

const canVibrate = typeof navigator !== "undefined" && "vibrate" in navigator;

/** Light tap — button press, toggle, checkbox */
export function hapticTap(): void {
    if (canVibrate) navigator.vibrate(10);
}

/** Success — confirmation, save complete, action success */
export function hapticSuccess(): void {
    if (canVibrate) navigator.vibrate([10, 30, 10]);
}

/** Warning — destructive action trigger, error state */
export function hapticWarning(): void {
    if (canVibrate) navigator.vibrate([30, 20, 30]);
}

/** Selection — long-press activation, drag threshold crossing */
export function hapticSelection(): void {
    if (canVibrate) navigator.vibrate(50);
}

/** Impact — pull-to-refresh threshold, snap point crossing */
export function hapticImpact(): void {
    if (canVibrate) navigator.vibrate(20);
}
