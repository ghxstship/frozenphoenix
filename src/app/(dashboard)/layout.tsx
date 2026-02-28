"use client";

import { Sidebar } from "@/components/layouts/sidebar";
import { Topbar } from "@/components/layouts/topbar";
import { SkipLinks } from "@/components/accessibility";
import { useSidebar, SIDEBAR_WIDTH } from "@/hooks/use-sidebar";
import { ErrorBoundary } from "@/components/error-boundary";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isCollapsed, isMobile } = useSidebar();
    const marginLeft = isMobile ? 0 : isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;

    return (
        <>
            {/* Skip Links for keyboard navigation (WCAG 2.4.1) */}
            <SkipLinks />
            
            <div className="flex min-h-screen">
                {/* Navigation landmark */}
                <Sidebar />
                
                <div
                    className="flex-1 transition-all duration-300"
                    style={{ marginLeft }}
                >
                    {/* Banner landmark */}
                    <Topbar />
                    
                    {/* Main content landmark (WCAG 1.3.1) */}
                    <main 
                        id="main-content"
                        role="main"
                        aria-label="Main content"
                        className="p-4 lg:p-6"
                        tabIndex={-1}
                    >
                        <ErrorBoundary level="page">
                            {children}
                        </ErrorBoundary>
                    </main>
                </div>
            </div>
        </>
    );
}
