"use client";

import type { CSSProperties } from "react";
import { Suspense, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/layouts/sidebar";
import { Topbar } from "@/components/layouts/topbar";
import { SkipLinks } from "@/components/accessibility";
import { SIDEBAR_WIDTH, useSidebar } from "@/hooks/use-sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { BREAKPOINTS } from "@/config/design-tokens";
import { ErrorBoundary } from "@/components/app/error-boundary";
import { EmailCollectionBanner } from "@/components/auth";
import { PageTransition } from "@/components/ui/page-transition";
import { LoadingState } from "@/components/layouts/loading-state";
import { useCopilotContext } from "@/hooks/use-copilot-context";
import { useMessagingEnabled } from "@/hooks/use-messaging-enabled";

// Performance: Dynamic imports for slide-over panels — only loaded when opened.
const MessagingPanel = dynamic(
    () => import("@/components/messaging/messaging-panel").then((m) => m.MessagingPanel),
    { ssr: false }
);
const CopilotPanel = dynamic(
    () => import("@/components/copilot/copilot-panel").then((m) => m.CopilotPanel),
    { ssr: false }
);
const CommandPalette = dynamic(
    () => import("@/components/ui/command-palette").then((m) => m.CommandPalette),
    { ssr: false }
);

// Mobile navigation — only loaded on touch/mobile devices
const MobileTabBar = dynamic(
    () => import("@/components/layouts/mobile-tab-bar").then((m) => m.MobileTabBar),
    { ssr: false }
);
const MobileFab = dynamic(
    () => import("@/components/layouts/mobile-fab").then((m) => m.MobileFab),
    { ssr: false }
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    useCopilotContext();
    const { messagingEnabled } = useMessagingEnabled();
    const isCollapsed = useSidebar((state) => state.isCollapsed);
    const setMobile = useSidebar((state) => state.setMobile);
    const setOpen = useSidebar((state) => state.setOpen);
    const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
    const isMobile = !isDesktop;

    useEffect(() => {
        setMobile(isMobile);
        if (!isMobile) {
            setOpen(false);
        }
    }, [isMobile, setMobile, setOpen]);

    const sidebarOffset = isMobile
        ? 0
        : isCollapsed
          ? SIDEBAR_WIDTH.collapsed
          : SIDEBAR_WIDTH.expanded;
    const shellStyles = useMemo(
        () =>
            ({
                "--shell-sidebar-offset": `${sidebarOffset}px`,
            }) as CSSProperties,
        [sidebarOffset]
    );

    return (
        <>
            {/* Skip Links for keyboard navigation (WCAG 2.4.1) */}
            <SkipLinks />

            <div
                className="flex min-h-screen supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]"
                style={shellStyles}
            >
                {/* Navigation landmark */}
                <Sidebar />

                <div
                    id="shell-main-content"
                    className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto transition-[margin-inline-start] duration-300"
                    style={{ marginInlineStart: "var(--shell-sidebar-offset)" }}
                >
                    {/* Banner landmark */}
                    <Topbar />

                    {/* Bluesky email collection prompt */}
                    <EmailCollectionBanner />

                    {/* Main content landmark (WCAG 1.3.1) */}
                    <main
                        id="main-content"
                        role="main"
                        aria-label="Main content"
                        className="p-4 lg:p-6 xl:p-8 overflow-x-hidden pb-20 lg:pb-8"
                        tabIndex={-1}
                    >
                        <ErrorBoundary level="page">
                            <PageTransition>
                                <Suspense fallback={<LoadingState variant="page" />}>
                                    {children}
                                </Suspense>
                            </PageTransition>
                        </ErrorBoundary>
                    </main>
                </div>

                {/* Messaging slide-over panel */}
                {messagingEnabled && <MessagingPanel />}

                {/* AI Copilot slide-over panel */}
                <CopilotPanel />

                {/* Global command palette (⌘K) */}
                <CommandPalette />

                {/* Mobile navigation — bottom tab bar + FAB */}
                {isMobile && (
                    <>
                        <MobileTabBar />
                        <MobileFab />
                    </>
                )}
            </div>
        </>
    );
}
