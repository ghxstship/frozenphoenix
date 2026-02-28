"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { StatCard } from "@/components/ui/stat-card";
import { getStatusVariant, getStatusLabel } from "@/config/ui-variants";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    MOCK_BRAND_GUIDELINES,
    MOCK_BRAND_GUIDELINE_SECTIONS,
} from "@/lib/demo-data-creative-brand";
import { useBrandGuidelines, isSupabaseConfigured } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { BrandGuideline, BrandGuidelineSection, BrandLevel } from "@/types";
import {
    Plus,
    Palette,
    BookOpen,
    GitBranch,
    Globe,
    ChevronDown,
    ChevronRight,
    Eye,
    Layers,
    Type,
    Mic2,
    Accessibility,
    Move,
    Camera,
    Grid3X3,
    Layout,
    Brush,
    Loader2,
} from "lucide-react";

const LEVEL_LABELS: Record<BrandLevel, string> = {
    primary: "Primary Brand",
    sub_brand: "Sub-Brand",
    market_variant: "Market Variant",
    co_brand: "Co-Brand",
};

const LEVEL_INDENT: Record<BrandLevel, string> = {
    primary: "",
    sub_brand: "ml-6",
    market_variant: "ml-12",
    co_brand: "ml-6",
};

const SECTION_ICONS: Record<string, React.ElementType> = {
    visual_identity: Eye,
    color_system: Palette,
    typography: Type,
    tone_and_voice: Mic2,
    motion: Move,
    accessibility: Accessibility,
    co_branding: Layers,
    photography: Camera,
    iconography: Grid3X3,
    layout: Layout,
};

export default function BrandGuidelinesPage() {
    const [search, setSearch] = useState("");
    const [expandedGuideline, setExpandedGuideline] = useState<string | null>("bg-1");
    const { data: sbGuidelines, isLoading } = useBrandGuidelines();

    const guidelines = isSupabaseConfigured && sbGuidelines ? (sbGuidelines as unknown as BrandGuideline[]) : MOCK_BRAND_GUIDELINES;
    const sections = MOCK_BRAND_GUIDELINE_SECTIONS;

    const filtered = useMemo(() => {
        if (!search) return guidelines;
        return guidelines.filter(
            (g) =>
                g.name.toLowerCase().includes(search.toLowerCase()) ||
                (g.description ?? "").toLowerCase().includes(search.toLowerCase())
        );
    }, [guidelines, search]);

    const publishedCount = guidelines.filter((g) => g.status === "published").length;
    const totalSections = sections.length;
    const uniqueMarkets = [...new Set(guidelines.flatMap((g) => g.markets))];

    function getSectionsForGuideline(guidelineId: string): BrandGuidelineSection[] {
        return sections.filter((s) => s.brand_guideline_id === guidelineId);
    }

    function getChildren(parentId: string): BrandGuideline[] {
        return filtered.filter((g) => g.parent_id === parentId);
    }

    const rootGuidelines = filtered.filter((g) => g.parent_id === null);

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="brand_guidelines" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Brand Guidelines"
                description="Multi-brand governance with versioned visual identity, typography, voice, and compliance standards"
            >
                <Link href="/brand-guidelines/new">
                    <Button size="sm">
                        <Plus className="h-4 w-4" />
                        New Guideline
                    </Button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Brand Systems" value={guidelines.length} icon={BookOpen} />
                <StatCard title="Published" value={publishedCount} icon={Eye} />
                <StatCard title="Sections" value={totalSections} icon={Layers} />
                <StatCard title="Markets" value={uniqueMarkets.length} icon={Globe} />
            </div>

            {/* Search */}
            <SearchInput value={search} onValueChange={setSearch} placeholder="Search guidelines..." className="max-w-md" />

            {/* Hierarchy Tree */}
            <div className="space-y-3">
                {rootGuidelines.map((root, i) => (
                    <GuidelineNode
                        key={root.id}
                        guideline={root}
                        childGuidelines={getChildren(root.id)}
                        getChildren={getChildren}
                        sections={getSectionsForGuideline(root.id)}
                        getSectionsForGuideline={getSectionsForGuideline}
                        expanded={expandedGuideline}
                        onToggle={setExpandedGuideline}
                        index={i}
                    />
                ))}
                {rootGuidelines.length === 0 && (
                    <div className="text-center py-12">
                        <Brush className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No guidelines match your search</p>
                    </div>
                )}
            </div>
        </div>
        </PermissionGate>
    );
}

function GuidelineNode({
    guideline,
    childGuidelines,
    getChildren,
    sections,
    getSectionsForGuideline,
    expanded,
    onToggle,
    index,
}: {
    guideline: BrandGuideline;
    childGuidelines: BrandGuideline[];
    getChildren: (parentId: string) => BrandGuideline[];
    sections: BrandGuidelineSection[];
    getSectionsForGuideline: (id: string) => BrandGuidelineSection[];
    expanded: string | null;
    onToggle: (id: string | null) => void;
    index: number;
}) {
    const isExpanded = expanded === guideline.id;

    return (
        <div className={LEVEL_INDENT[guideline.brand_level]}>
            <StaggerItem index={index} stagger="relaxed">
            <Card
                className="hover:border-primary/30 transition-colors"
            >
                <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                                onClick={() => onToggle(isExpanded ? null : guideline.id)}
                                className="mt-0.5 flex-shrink-0"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                            </button>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold">{guideline.name}</h3>
                                    {guideline.parent_id && (
                                        <GitBranch className="h-3 w-3 text-muted-foreground" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{guideline.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <Badge variant="outline" className="text-[9px]">
                                {LEVEL_LABELS[guideline.brand_level]}
                            </Badge>
                            <Badge
                                variant={getStatusVariant(guideline.status) as "default"}
                                className="text-[9px]"
                            >
                                {getStatusLabel(guideline.status)}
                            </Badge>
                            {guideline.current_version > 0 && (
                                <span className="text-[10px] text-muted-foreground">v{guideline.current_version}</span>
                            )}
                        </div>
                    </div>

                    {/* Markets */}
                    {guideline.markets.length > 0 && (
                        <div className="flex gap-1 mt-2 ml-7">
                            <Globe className="h-3 w-3 text-muted-foreground mt-0.5" />
                            {guideline.markets.map((m) => (
                                <Badge key={m} variant="outline" className="text-[8px]">
                                    {m}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Expanded Sections */}
                    {isExpanded && sections.length > 0 && (
                        <div className="mt-4 ml-7 space-y-2">
                            <OverlineText>
                                Guideline Sections
                            </OverlineText>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {sections
                                    .sort((a, b) => a.display_order - b.display_order)
                                    .map((section) => {
                                        const SectionIcon = SECTION_ICONS[section.section_type] ?? Layers;
                                        return (
                                            <div
                                                key={section.id}
                                                className="p-3 rounded-lg border border-border hover:bg-secondary/20 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <SectionIcon className="h-3.5 w-3.5 text-primary" />
                                                    <p className="text-xs font-medium">{section.title}</p>
                                                    {section.is_inherited && (
                                                        <Badge variant="outline" className="text-[8px]">
                                                            Inherited
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground line-clamp-2">
                                                    {section.description}
                                                </p>
                                                <div className="mt-1.5">
                                                    <Badge variant="outline" className="text-[8px]">
                                                        {section.section_type.replace(/_/g, " ")}
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {isExpanded && sections.length === 0 && (
                        <div className="mt-4 ml-7 p-4 rounded-lg border border-dashed border-border text-center">
                            <p className="text-xs text-muted-foreground">No sections defined yet</p>
                            <Button variant="ghost" size="sm" className="mt-2 text-xs">
                                <Plus className="h-3 w-3" />
                                Add Section
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            </StaggerItem>

            {/* Child Guidelines */}
            {childGuidelines.map((child, ci) => (
                <GuidelineNode
                    key={child.id}
                    guideline={child}
                    childGuidelines={getChildren(child.id)}
                    getChildren={getChildren}
                    sections={getSectionsForGuideline(child.id)}
                    getSectionsForGuideline={getSectionsForGuideline}
                    expanded={expanded}
                    onToggle={onToggle}
                    index={ci}
                />
            ))}
        </div>
    );
}
