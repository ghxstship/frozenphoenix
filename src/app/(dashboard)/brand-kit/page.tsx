"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { StatCard } from "@/components/ui/stat-card";
import { useBrandKits, useProjects } from "@/lib/supabase/hooks";
import { useCreateBrandKit } from "@/lib/supabase/hooks-pages";
import { StaggerItem } from "@/components/ui/stagger-container";
import type { Project, ProjectPhase, ProjectStatus } from "@/types";
import {
    ArrowRight,
    CheckCircle2,
    Download,
    ExternalLink,
    FileText,
    Image as ImageIcon,
    Palette,
    Plus,
    Type,
    Upload,
    X,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

export default function BrandKitPage() {
    const router = useRouter();
    const createBrandKit = useCreateBrandKit();
    const [copiedColor, setCopiedColor] = React.useState<string | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [wizardData, setWizardData] = useState({
        clientName: "",
        primaryColor: "#000000",
        secondaryColor: "#FFFFFF",
        accentColor: "#FF6B00",
        fontFamily: "",
    });
    const { data: sbBrandKits, isLoading: loadingKits } = useBrandKits();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();

    const brandKits = (sbBrandKits ?? []).map((kit) => ({
        id: kit.id,
        clientId: kit.client_name.toLowerCase().replace(/\s+/g, "-"),
        clientName: kit.client_name,
        primaryColor: kit.primary_color,
        secondaryColor: kit.secondary_color,
        accentColor: kit.accent_color ?? "#000000",
        fontFamily: kit.font_family,
        logoUrl: kit.logo_url ?? undefined,
        guidelines: kit.guidelines ?? undefined,
    }));

    const projects: Project[] = (sbProjects ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        client: p.client,
        clientLogo: p.client_logo ?? undefined,
        status: p.status as ProjectStatus,
        currentPhase: p.current_phase as ProjectPhase,
        startDate: p.start_date,
        endDate: p.end_date,
        budgetPlanned: p.budget_planned,
        budgetActual: p.budget_actual,
        progress: p.progress,
        managerId: p.manager_id ?? "",
        teamIds: [],
        createdAt: p.created_at ?? new Date().toISOString(),
    }));

    const [copyAnnouncement, setCopyAnnouncement] = useState("");
    const isLoading = loadingKits || loadingProjects;

    if (isLoading) {
        return <LoadingState />;
    }
    const copyToClipboard = (color: string) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setCopyAnnouncement(`Copied ${color} to clipboard`);
        setTimeout(() => {
            setCopiedColor(null);
            setCopyAnnouncement("");
        }, 2000);
    };

    const wizardSteps = ["Client", "Colors", "Typography", "Review"];

    return (
        <PermissionGate resource="brand_kit" action="read">
            <div aria-live="polite" aria-atomic="true" className="sr-only">
                {copyAnnouncement}
            </div>
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Brand Kit Library"
                    description="Client brand guidelines, colors, and assets for consistent deliverables"
                >
                    <Button
                        size="sm"
                        onClick={() => {
                            setShowWizard(true);
                            setWizardStep(0);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        New Brand Kit
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Brand Kits" value={brandKits.length} icon={Palette} />
                    <StatCard
                        title="With Logo"
                        value={brandKits.filter((k) => k.logoUrl).length}
                        icon={ImageIcon}
                    />
                    <StatCard
                        title="Font Families"
                        value={[...new Set(brandKits.map((k) => k.fontFamily))].length}
                        icon={Type}
                    />
                    <StatCard
                        title="Linked Projects"
                        value={
                            projects.filter((p) =>
                                brandKits.some((k) =>
                                    p.client.toLowerCase().includes(k.clientName.toLowerCase())
                                )
                            ).length
                        }
                        icon={FileText}
                    />
                </div>

                {/* Creation Wizard Modal */}
                {showWizard && (
                    <Card className="border-primary/30 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                    Create Brand Kit — Step {wizardStep + 1} of {wizardSteps.length}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowWizard(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex gap-2 mt-2">
                                {wizardSteps.map((s, i) => (
                                    <div key={s} className="flex items-center gap-1 flex-1">
                                        <div
                                            className={`h-1.5 flex-1 rounded-full ${i <= wizardStep ? "bg-primary" : "bg-muted"}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {wizardStep === 0 && (
                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        Client Name
                                    </label>
                                    <Input
                                        placeholder="e.g., Nike, Red Bull"
                                        value={wizardData.clientName}
                                        onChange={(e) =>
                                            setWizardData({
                                                ...wizardData,
                                                clientName: e.target.value,
                                            })
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        The brand kit will be linked to this client across all
                                        projects.
                                    </p>
                                </div>
                            )}
                            {wizardStep === 1 && (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium">Brand Colors</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { key: "primaryColor" as const, label: "Primary" },
                                            { key: "secondaryColor" as const, label: "Secondary" },
                                            { key: "accentColor" as const, label: "Accent" },
                                        ].map(({ key, label }) => (
                                            <div key={key}>
                                                <label className="text-xs text-muted-foreground mb-1 block">
                                                    {label}
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={wizardData[key]}
                                                        onChange={(e) =>
                                                            setWizardData({
                                                                ...wizardData,
                                                                [key]: e.target.value,
                                                            })
                                                        }
                                                        className="h-8 w-8 rounded cursor-pointer border-0"
                                                    />
                                                    <Input
                                                        value={wizardData[key]}
                                                        onChange={(e) =>
                                                            setWizardData({
                                                                ...wizardData,
                                                                [key]: e.target.value,
                                                            })
                                                        }
                                                        className="font-mono text-xs"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-12 rounded-lg overflow-hidden flex">
                                        <div
                                            className="flex-1"
                                            style={{ backgroundColor: wizardData.primaryColor }}
                                        />
                                        <div
                                            className="flex-1"
                                            style={{ backgroundColor: wizardData.secondaryColor }}
                                        />
                                        <div
                                            className="flex-1"
                                            style={{ backgroundColor: wizardData.accentColor }}
                                        />
                                    </div>
                                </div>
                            )}
                            {wizardStep === 2 && (
                                <div>
                                    <label className="text-sm font-medium mb-1 block">
                                        Primary Font Family
                                    </label>
                                    <Input
                                        placeholder="e.g., Inter, Helvetica Neue"
                                        value={wizardData.fontFamily}
                                        onChange={(e) =>
                                            setWizardData({
                                                ...wizardData,
                                                fontFamily: e.target.value,
                                            })
                                        }
                                    />
                                    <div className="mt-3 p-4 rounded-lg bg-secondary/30">
                                        <p
                                            className="text-xl font-bold"
                                            style={{
                                                fontFamily: wizardData.fontFamily || "inherit",
                                            }}
                                        >
                                            {wizardData.fontFamily || "Preview"}
                                        </p>
                                        <p
                                            className="text-sm text-muted-foreground mt-1"
                                            style={{
                                                fontFamily: wizardData.fontFamily || "inherit",
                                            }}
                                        >
                                            The quick brown fox jumps over the lazy dog.
                                        </p>
                                    </div>
                                    <div className="mt-3 p-3 rounded-lg border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/30 transition-colors">
                                        <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                                        <p className="text-xs text-muted-foreground">
                                            Upload logo file (SVG, PNG)
                                        </p>
                                    </div>
                                </div>
                            )}
                            {wizardStep === 3 && (
                                <div className="space-y-3">
                                    <p className="text-sm font-medium">Review Brand Kit</p>
                                    <div
                                        className="h-16 rounded-lg overflow-hidden"
                                        style={{
                                            background: `linear-gradient(135deg, ${wizardData.primaryColor} 0%, ${wizardData.secondaryColor} 100%)`,
                                        }}
                                    >
                                        <div className="h-full flex items-center justify-center">
                                            <span className="text-2xl font-bold text-primary-foreground">
                                                {wizardData.clientName.charAt(0) || "?"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 rounded bg-secondary/30">
                                            <p className="text-[10px] text-muted-foreground">
                                                Client
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {wizardData.clientName || "—"}
                                            </p>
                                        </div>
                                        <div className="p-2 rounded bg-secondary/30">
                                            <p className="text-[10px] text-muted-foreground">
                                                Font
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {wizardData.fontFamily || "—"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setWizardStep(Math.max(0, wizardStep - 1))}
                                    disabled={wizardStep === 0}
                                >
                                    Back
                                </Button>
                                {wizardStep < wizardSteps.length - 1 ? (
                                    <Button
                                        onClick={() => setWizardStep(wizardStep + 1)}
                                        disabled={wizardStep === 0 && !wizardData.clientName}
                                    >
                                        Next <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        disabled={
                                            !wizardData.clientName || createBrandKit.isPending
                                        }
                                        onClick={() =>
                                            createBrandKit.mutate(
                                                {
                                                    client_name: wizardData.clientName,
                                                    primary_color: wizardData.primaryColor,
                                                    accent_color: wizardData.accentColor,
                                                    font_family: wizardData.fontFamily,
                                                },
                                                { onSuccess: () => setShowWizard(false) }
                                            )
                                        }
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Create Brand Kit
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {brandKits.map((kit, i) => {
                        const project = projects.find((p) =>
                            p.client.toLowerCase().includes(kit.clientName.toLowerCase())
                        );
                        return (
                            <StaggerItem key={kit.id} index={i} stagger="relaxed">
                                <Card className="overflow-hidden">
                                    <div
                                        className="h-24 relative"
                                        style={{
                                            background: `linear-gradient(135deg, ${kit.primaryColor} 0%, ${kit.secondaryColor} 100%)`,
                                        }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-16 w-16 rounded-2xl bg-foreground/20 backdrop-blur-sm flex items-center justify-center">
                                                <span className="text-2xl font-bold text-primary-foreground">
                                                    {kit.clientName.charAt(0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-base font-bold">
                                                    {kit.clientName}
                                                </h3>
                                                {project && (
                                                    <Badge
                                                        variant="info"
                                                        className="text-[9px] mt-1"
                                                    >
                                                        {project.name}
                                                    </Badge>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                aria-label="View asset details"
                                                onClick={() => router.push(`/brand-kit/${kit.id}`)}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <OverlineText className="mb-2 flex items-center gap-1">
                                                    <Palette className="h-3 w-3" />
                                                    Color Palette
                                                </OverlineText>
                                                <div className="flex gap-2">
                                                    {[
                                                        {
                                                            label: "Primary",
                                                            color: kit.primaryColor,
                                                        },
                                                        {
                                                            label: "Secondary",
                                                            color: kit.secondaryColor ?? "#666666",
                                                        },
                                                        { label: "Accent", color: kit.accentColor },
                                                    ].map((c) => (
                                                        <button
                                                            key={c.label}
                                                            onClick={() => copyToClipboard(c.color)}
                                                            className="group flex-1 text-center"
                                                        >
                                                            <div
                                                                className="h-10 rounded-lg mb-1 border border-border relative overflow-hidden transition-transform group-hover:scale-105"
                                                                style={{ backgroundColor: c.color }}
                                                            >
                                                                {copiedColor === c.color && (
                                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                        <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] text-muted-foreground">
                                                                {c.label}
                                                            </p>
                                                            <p className="text-[10px] font-mono">
                                                                {c.color}
                                                            </p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <OverlineText className="mb-2 flex items-center gap-1">
                                                    <Type className="h-3 w-3" />
                                                    Typography
                                                </OverlineText>
                                                <div className="p-3 rounded-lg bg-secondary/50">
                                                    <p
                                                        className="text-lg font-bold"
                                                        style={{ fontFamily: kit.fontFamily }}
                                                    >
                                                        {kit.fontFamily}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-1 text-xs"
                                                    onClick={() =>
                                                        router.push(
                                                            `/brand-kit/${kit.id}?tab=assets`
                                                        )
                                                    }
                                                >
                                                    <ImageIcon className="h-3.5 w-3.5" />
                                                    Assets
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-1 text-xs"
                                                    onClick={() => window.print()}
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Export
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        );
                    })}

                    <Card
                        className="border-dashed border-2 flex items-center justify-center min-h-[400px] cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors"
                        onClick={() => {
                            setShowWizard(true);
                            setWizardStep(0);
                        }}
                    >
                        <div className="text-center">
                            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                                <Plus className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">Add New Brand Kit</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Upload client brand guidelines
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </PermissionGate>
    );
}
