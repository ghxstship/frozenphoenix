"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns `true` once the component is hydrated on the client.
 * Returns `false` during SSR and the first client render.
 *
 * Use this to prevent identity-sensitive components from rendering
 * fallback text (e.g. "Guest", "User", "Select Organization") into
 * the server HTML, which would cause a visible flash before auth
 * context hydrates on the client.
 */
const emptySubscribe = () => () => {};
function getSnapshot() {
    return true;
}
function getServerSnapshot() {
    return false;
}

export function useHydrated(): boolean {
    return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}
