"use client";

import React from "react";
import { Globe, Lock, Play, Shield } from "lucide-react";
import { getActiveBrand } from "@/config/brands";
import { cn } from "@/lib/utils";

const brandConfig = getActiveBrand();

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    className?: string;
}

const TRUST_SIGNALS = [
    { icon: Shield, text: "Enterprise-grade encryption" },
    { icon: Lock, text: "SOC 2 compliant infrastructure" },
    { icon: Globe, text: "99.9% uptime SLA" },
];

export function AuthLayout({ children, title, subtitle, className }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex bg-background">
            {/* Skip-nav link — WCAG 2.2 AA §2.4.1 */}
            <a
                href="#auth-main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
                Skip to main content
            </a>
            {/* Left: Branded Panel (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0 flex-col justify-between bg-gradient-to-br from-primary/10 via-background to-accent/10 border-r border-border p-10">
                <div>
                    <div className="flex items-center gap-2.5 mb-16">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                            <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            {brandConfig.name}
                        </span>
                    </div>

                    <div className="density-gap-section">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            {brandConfig.tagline}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                            Manage productions, coordinate teams, and deliver exceptional
                            experiences — all from one command center.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {TRUST_SIGNALS.map((signal) => (
                        <div
                            key={signal.text}
                            className="flex items-center gap-2.5 text-sm text-muted-foreground"
                        >
                            <signal.icon
                                className="h-4 w-4 text-primary/70 shrink-0"
                                aria-hidden="true"
                            />
                            {signal.text}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Auth Form */}
            <main
                id="auth-main-content"
                className="flex-1 flex items-center justify-center p-4 sm:p-8"
            >
                <div className={cn("w-full max-w-md density-gap-page", className)}>
                    {/* Mobile-only brand header */}
                    <div className="text-center lg:hidden">
                        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg mb-4">
                            <Play className="h-7 w-7 text-primary-foreground fill-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            {brandConfig.name}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">{brandConfig.tagline}</p>
                    </div>

                    {/* Desktop title */}
                    <div className="hidden lg:block space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                    </div>

                    {/* Mobile title inside card context */}
                    <div className="lg:hidden text-center">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
                        )}
                    </div>

                    {children}

                    <p className="text-center text-xs text-muted-foreground">
                        By continuing, you agree to our{" "}
                        <a href="/legal/terms" className="text-primary hover:underline">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/legal/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </main>
        </div>
    );
}
