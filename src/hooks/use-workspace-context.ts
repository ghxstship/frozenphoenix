"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkspaceContextState } from "@/types/workspace-context";

const STORAGE_KEY_PREFIX = "fp-workspace-context";

/**
 * Returns a localStorage key scoped to the given org.
 * Falls back to a generic key if orgId is not yet available.
 */
function storageKey(orgId?: string | null): string {
    return orgId ? `${STORAGE_KEY_PREFIX}-${orgId}` : STORAGE_KEY_PREFIX;
}

/**
 * Workspace context store.
 *
 * Manages the active team, client, project, and activation selections
 * with cascade reset rules:
 *   - setActiveTeam   → resets client, project, activation
 *   - setActiveClient → resets project, activation
 *   - setActiveProject → resets activation
 *
 * Persisted per-org to localStorage via zustand/persist.
 */
function createWorkspaceStore(orgId?: string | null) {
    return create<WorkspaceContextState>()(
        persist(
            (set) => ({
                activeTeamId: null,
                activeClientId: null,
                activeProjectId: null,
                activeActivationId: null,

                setActiveTeam: (id) =>
                    set((state) => {
                        if (state.activeTeamId === id) return state;
                        return {
                            activeTeamId: id,
                            activeClientId: null,
                            activeProjectId: null,
                            activeActivationId: null,
                        };
                    }),

                setActiveClient: (id) =>
                    set((state) => {
                        if (state.activeClientId === id) return state;
                        return {
                            activeClientId: id,
                            activeProjectId: null,
                            activeActivationId: null,
                        };
                    }),

                setActiveProject: (id) =>
                    set((state) => {
                        if (state.activeProjectId === id) return state;
                        return {
                            activeProjectId: id,
                            activeActivationId: null,
                        };
                    }),

                setActiveActivation: (id) =>
                    set((state) => {
                        if (state.activeActivationId === id) return state;
                        return { activeActivationId: id };
                    }),

                clearAll: () =>
                    set({
                        activeTeamId: null,
                        activeClientId: null,
                        activeProjectId: null,
                        activeActivationId: null,
                    }),
            }),
            {
                name: storageKey(orgId),
                partialize: (state) => ({
                    activeTeamId: state.activeTeamId,
                    activeClientId: state.activeClientId,
                    activeProjectId: state.activeProjectId,
                    activeActivationId: state.activeActivationId,
                }),
            }
        )
    );
}

// ─── Singleton store cache per orgId ─────────────────────────

const storeCache = new Map<string, ReturnType<typeof createWorkspaceStore>>();

/**
 * Returns the workspace context Zustand store for the given org.
 * Creates one lazily and caches it. Pass `orgId` to scope persistence.
 */
export function getWorkspaceStore(orgId?: string | null) {
    const key = orgId ?? "__default__";
    let store = storeCache.get(key);
    if (!store) {
        store = createWorkspaceStore(orgId);
        storeCache.set(key, store);
    }
    return store;
}

/**
 * React hook — returns the workspace context store for the current org.
 * Use with a selector for optimal re-render performance:
 *
 * ```ts
 * const activeProjectId = useWorkspaceContext(orgId, (s) => s.activeProjectId);
 * ```
 */
export function useWorkspaceContext<T>(
    orgId: string | null | undefined,
    selector: (state: WorkspaceContextState) => T
): T {
    const store = getWorkspaceStore(orgId);
    return store(selector);
}

/**
 * Imperative accessor for use outside React (e.g., in auth-context switchOrg).
 */
export function clearWorkspaceContext(orgId?: string | null) {
    const key = orgId ?? "__default__";
    const store = storeCache.get(key);
    if (store) {
        store.getState().clearAll();
    }
}
