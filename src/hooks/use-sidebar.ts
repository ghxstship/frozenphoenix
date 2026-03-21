"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LAYOUT } from "@/config/design-tokens";

const SIDEBAR_WIDTH = LAYOUT.sidebar;

const RECENT_ITEMS_MAX = 5;
const RECENT_ITEMS_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface RecentItem {
    path: string;
    title: string;
    icon: string;
    entityType: string;
    visitedAt: number;
}

interface SidebarState {
    isOpen: boolean;
    isCollapsed: boolean;
    isMobile: boolean;
    filterQuery: string;
    pinnedPaths: string[];
    /** R7: Persisted section expand/collapse state keyed by section title */
    expandedSections: Record<string, boolean>;
    /** R8: Recently visited pages (max 5, 7-day expiry) */
    recentItems: RecentItem[];
    _hasHydrated: boolean;

    setOpen: (open: boolean) => void;
    setCollapsed: (collapsed: boolean) => void;
    setMobile: (mobile: boolean) => void;
    setFilterQuery: (query: string) => void;
    togglePin: (path: string) => void;
    toggleCollapse: () => void;
    /** R7: Set a section's expanded state (persisted to localStorage) */
    setExpandedSection: (title: string, expanded: boolean) => void;
    /** R8: Track a page visit in recents (max 5, deduped, auto-expires after 7 days) */
    addRecentItem: (item: Omit<RecentItem, "visitedAt">) => void;
}

export const useSidebar = create<SidebarState>()(
    persist(
        (set) => ({
            isOpen: false,
            isCollapsed: false,
            isMobile: false,
            filterQuery: "",
            pinnedPaths: [],
            expandedSections: {},
            recentItems: [],
            _hasHydrated: false,
            setOpen: (open) => set((state) => (state.isOpen === open ? state : { isOpen: open })),
            setCollapsed: (collapsed) =>
                set((state) =>
                    state.isCollapsed === collapsed ? state : { isCollapsed: collapsed }
                ),
            setMobile: (mobile) =>
                set((state) => (state.isMobile === mobile ? state : { isMobile: mobile })),
            setFilterQuery: (filterQuery) =>
                set((state) => (state.filterQuery === filterQuery ? state : { filterQuery })),
            togglePin: (path) =>
                set((state) => ({
                    pinnedPaths: state.pinnedPaths.includes(path)
                        ? state.pinnedPaths.filter((p) => p !== path)
                        : [...state.pinnedPaths, path],
                })),
            toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

            // R7: Persist section collapse state
            setExpandedSection: (title, expanded) =>
                set((state) => ({
                    expandedSections: { ...state.expandedSections, [title]: expanded },
                })),

            // R8: Add to recent items (dedupe, cap at 5, prune expired)
            addRecentItem: (item) =>
                set((state) => {
                    const now = Date.now();
                    const cutoff = now - RECENT_ITEMS_EXPIRY_MS;
                    const filtered = state.recentItems
                        .filter((r) => r.path !== item.path && r.visitedAt > cutoff)
                        .slice(0, RECENT_ITEMS_MAX - 1);
                    return {
                        recentItems: [{ ...item, visitedAt: now }, ...filtered],
                    };
                }),
        }),
        {
            name: "sidebar-state",
            partialize: (state) => ({
                isCollapsed: state.isCollapsed,
                pinnedPaths: state.pinnedPaths,
                expandedSections: state.expandedSections,
                recentItems: state.recentItems,
            }),
            // Performance: Mark hydration complete so consumers can avoid layout shift
            onRehydrateStorage: () => () => {
                useSidebar.setState({ _hasHydrated: true });
            },
        }
    )
);

/** Performance: True once localStorage state has been loaded. Use to suppress
 *  sidebar rendering until persisted collapse state is known, preventing layout shift. */
export const useSidebarHasHydrated = () => useSidebar((s) => s._hasHydrated);

export { SIDEBAR_WIDTH };
