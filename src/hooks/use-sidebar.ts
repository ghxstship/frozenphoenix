"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BREAKPOINTS, SIDEBAR_WIDTH } from "@/config/constants";

interface SidebarState {
    isOpen: boolean;
    isCollapsed: boolean;
    isMobile: boolean;
    setOpen: (open: boolean) => void;
    setCollapsed: (collapsed: boolean) => void;
    setMobile: (mobile: boolean) => void;
    toggle: () => void;
    toggleCollapse: () => void;
}

export const useSidebar = create<SidebarState>()(
    persist(
        (set) => ({
            isOpen: false,
            isCollapsed: false,
            isMobile: false,
            setOpen: (open) => set({ isOpen: open }),
            setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
            setMobile: (mobile) => set({ isMobile: mobile }),
            toggle: () => set((state) => ({ isOpen: !state.isOpen })),
            toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
        }),
        {
            name: "sidebar-state",
            partialize: (state) => ({ isCollapsed: state.isCollapsed }),
        }
    )
);

export function getSidebarWidth(isCollapsed: boolean, isMobile: boolean): number {
    if (isMobile) return 0;
    return isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;
}

export { BREAKPOINTS, SIDEBAR_WIDTH };
