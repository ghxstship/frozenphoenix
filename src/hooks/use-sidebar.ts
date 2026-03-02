"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LAYOUT } from "@/config/design-tokens";

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

export { SIDEBAR_WIDTH };
