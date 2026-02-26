"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BREAKPOINTS, LAYOUT } from "@/config/design-tokens";

const SIDEBAR_WIDTH = LAYOUT.sidebar;

interface SidebarState {
    isOpen: boolean;
    isCollapsed: boolean;
    isMobile: boolean;
    filterQuery: string;
    pinnedPaths: string[];
    setOpen: (open: boolean) => void;
    setCollapsed: (collapsed: boolean) => void;
    setMobile: (mobile: boolean) => void;
    setFilterQuery: (query: string) => void;
    togglePin: (path: string) => void;
    toggle: () => void;
    toggleCollapse: () => void;
}

export const useSidebar = create<SidebarState>()(
    persist(
        (set) => ({
            isOpen: false,
            isCollapsed: false,
            isMobile: false,
            filterQuery: "",
            pinnedPaths: [],
            setOpen: (open) => set({ isOpen: open }),
            setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
            setMobile: (mobile) => set({ isMobile: mobile }),
            setFilterQuery: (filterQuery) => set({ filterQuery }),
            togglePin: (path) =>
                set((state) => ({
                    pinnedPaths: state.pinnedPaths.includes(path)
                        ? state.pinnedPaths.filter((p) => p !== path)
                        : [...state.pinnedPaths, path],
                })),
            toggle: () => set((state) => ({ isOpen: !state.isOpen })),
            toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
        }),
        {
            name: "sidebar-state",
            partialize: (state) => ({
                isCollapsed: state.isCollapsed,
                pinnedPaths: state.pinnedPaths,
            }),
        }
    )
);

export function getSidebarWidth(isCollapsed: boolean, isMobile: boolean): number {
    if (isMobile) return 0;
    return isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;
}

export { BREAKPOINTS, SIDEBAR_WIDTH };
