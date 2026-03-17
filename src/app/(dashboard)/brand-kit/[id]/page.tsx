"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    useBrandKit,
    useDeleteBrandKit as useDeleteHook,
    useUpdateBrandKit as useUpdateHook,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OverlineText } from "@/components/ui/overline-text";
import { StaggerItem } from "@/components/ui/stagger-container";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    CheckCircle2,
    Copy,
    Download,
    FileText,
    Grid3X3,
    Image as ImageIcon,
    Palette,
    Plus,
    Trash2,
    Type,
    Upload,
} from "lucide-react";

interface BrandAsset {
    id: string;
    name: string;
    type: "logo" | "icon" | "photo" | "pattern" | "illustration";
    format: string;
    size: string;
    url: string;
    thumbnail: string;
}

interface GuidelineSection {
    id: string;
    title: string;
    content: string;
}

function parseAssets(raw: unknown): BrandAsset[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((a) => ({
        id: String(a.id ?? ""),
        name: String(a.name ?? ""),
        type: (a.type as BrandAsset["type"]) ?? "logo",
        format: String(a.format ?? ""),
        size: String(a.size ?? ""),
        url: String(a.url ?? "#"),
        thumbnail: String(a.thumbnail ?? ""),
    }));
}

function parseGuidelines(raw: unknown): GuidelineSection[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((g) => ({
        id: String(g.id ?? ""),
        title: String(g.title ?? ""),
        content: String(g.content ?? ""),
    }));
}

const ASSET_TYPE_VARIANTS: Record<
    string,
    "info" | "default" | "success" | "warning" | "destructive"
> = {
    logo: "info",
    icon: "default",
    photo: "success",
    pattern: "warning",
    illustration: "destructive",
};

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "brand-kit",
    titleKey: "title",
    statusKey: "status",
    icon: Palette,
    backHref: "/brand-kit",
    backLabel: "Brand Kits",
    chatter: false,
    fields: [],
    tabs: [],
};

export default function BrandKitDetailPage() {
    const params = useParams();
    const kitId = params.id as string;
    const { data: sbRecord, isLoading } = useBrandKit(kitId);
    const bk = sbRecord as Record<string, unknown> | null;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: kitId,
        entityLabel: "Brand Kit",
        listPath: "/brand-kit",
        useUpdateHook,
        useDeleteHook,
    });
    const [copiedColor, setCopiedColor] = useState<string | null>(null);
    const [assetFilter, setAssetFilter] = useState<string>("all");
    const [guidelineSections, setGuidelineSections] = useState<GuidelineSection[]>([]);
    const [initialized, setInitialized] = useState(false);

    const clientName = (bk?.client_name as string) ?? "";
    const primaryColor = (bk?.primary_color as string) ?? "#000000";
    const secondaryColor = (bk?.secondary_color as string) ?? "#FFFFFF";
    const accentColor = (bk?.accent_color as string) ?? "#FF6B00";
    const fontFamily = (bk?.font_family as string) ?? "";
    const headingFont = (bk?.heading_font as string) ?? "";
    const bodyFont = (bk?.body_font as string) ?? "";
    const updatedAt = (bk?.updated_at as string) ?? "";
    const assets = parseAssets(bk?.assets);

    useEffect(() => {
        if (bk && !initialized) {
            setGuidelineSections(parseGuidelines(bk.guidelines));
            setInitialized(true);
        }
    }, [bk, initialized]);
    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);
    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Sarah Chen",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const copyColor = (color: string) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    const filteredAssets =
        assetFilter === "all" ? assets : assets.filter((a) => a.type === assetFilter);

    const sidebarSlot = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Brand Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-bold text-primary-foreground"
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                            }}
                        >
                            {clientName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{clientName}</p>
                            <p className="text-xs text-muted-foreground">
                                {updatedAt ? `Updated ${updatedAt}` : ""}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Quick Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {[
                        { label: "Primary", color: primaryColor },
                        { label: "Secondary", color: secondaryColor },
                        { label: "Accent", color: accentColor },
                    ].map((c) => (
                        <button
                            key={c.label}
                            onClick={() => copyColor(c.color)}
                            className="flex items-center gap-2 w-full text-left hover:bg-secondary/30 rounded px-1 py-0.5"
                        >
                            <div
                                className="h-5 w-5 rounded border border-border shrink-0"
                                style={{ backgroundColor: c.color }}
                            />
                            <span className="text-xs">{c.label}</span>
                            <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                                {c.color}
                            </span>
                        </button>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Fonts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Heading</span>
                        <span className="font-medium">{headingFont}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Body</span>
                        <span className="font-medium">{bodyFont}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const overviewSlot = (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Color Palette
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        { label: "Primary", color: primaryColor },
                        { label: "Secondary", color: secondaryColor },
                        { label: "Accent", color: accentColor },
                    ].map((c) => (
                        <div key={c.label} className="flex items-center gap-4">
                            <button
                                onClick={() => copyColor(c.color)}
                                className="h-16 w-16 rounded-xl border border-border shrink-0 relative overflow-hidden transition-transform hover:scale-105"
                                style={{ backgroundColor: c.color }}
                            >
                                {copiedColor === c.color && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                )}
                            </button>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">{c.label}</p>
                                <p className="text-xs font-mono text-muted-foreground">{c.color}</p>
                                <div className="flex gap-1 mt-1">
                                    <button
                                        onClick={() => copyColor(c.color)}
                                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                                    >
                                        <Copy className="h-2.5 w-2.5" />
                                        HEX
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Palette Preview */}
                    <div className="pt-4 border-t border-border">
                        <OverlineText className="mb-2">Palette Preview</OverlineText>
                        <div className="h-12 rounded-lg overflow-hidden flex">
                            <div className="flex-[3]" style={{ backgroundColor: primaryColor }} />
                            <div className="flex-[2]" style={{ backgroundColor: secondaryColor }} />
                            <div className="flex-1" style={{ backgroundColor: accentColor }} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Typography
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <OverlineText className="mb-2">Heading Font</OverlineText>
                        <div className="p-4 rounded-lg bg-secondary/30">
                            <p className="text-3xl font-bold" style={{ fontFamily: fontFamily }}>
                                {headingFont}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                ABCDEFGHIJKLMNOPQRSTUVWXYZ
                            </p>
                            <p className="text-sm text-muted-foreground">
                                abcdefghijklmnopqrstuvwxyz
                            </p>
                            <p className="text-sm text-muted-foreground">0123456789 !@#$%^&*()</p>
                        </div>
                    </div>
                    <div>
                        <OverlineText className="mb-2">Body Font</OverlineText>
                        <div className="p-4 rounded-lg bg-secondary/30">
                            <p className="text-lg">{bodyFont}</p>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                The quick brown fox jumps over the lazy dog. Pack my box with five
                                dozen liquor jugs. How vexingly quick daft zebras jump.
                            </p>
                        </div>
                    </div>
                    <div>
                        <OverlineText className="mb-2">Type Scale</OverlineText>
                        <div className="space-y-2">
                            {[
                                { label: "H1", size: "36px", weight: "Bold" },
                                { label: "H2", size: "28px", weight: "Bold" },
                                { label: "H3", size: "22px", weight: "Semibold" },
                                { label: "Body", size: "16px", weight: "Regular" },
                                { label: "Small", size: "14px", weight: "Regular" },
                                { label: "Caption", size: "12px", weight: "Medium" },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-secondary/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge variant="ghost" className="w-12 justify-center">
                                            {item.label}
                                        </Badge>
                                        <span>{item.weight}</span>
                                    </div>
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {item.size}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        titleFn: () => `${clientName} Brand Kit`,
        subtitleFn: () => (updatedAt ? `Last updated ${updatedAt}` : ""),
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "assets",
                label: "Asset Library",
                count: assets.length,
                content: (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-2 flex-wrap">
                                {["all", "logo", "icon", "photo", "pattern", "illustration"].map(
                                    (type) => (
                                        <Button
                                            key={type}
                                            variant={assetFilter === type ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setAssetFilter(type)}
                                        >
                                            {type === "all"
                                                ? "All"
                                                : ({
                                                      logo: "Logo",
                                                      icon: "Icon",
                                                      photo: "Photo",
                                                      pattern: "Pattern",
                                                      illustration: "Illustration",
                                                  }[type] ?? type)}
                                            {type !== "all" && (
                                                <span className="ml-1 text-xs">
                                                    ({assets.filter((a) => a.type === type).length})
                                                </span>
                                            )}
                                        </Button>
                                    )
                                )}
                            </div>
                            <Button size="sm" disabled>
                                <Upload className="h-4 w-4 mr-1" />
                                Upload Asset
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredAssets.map((asset) => (
                                <Card key={asset.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="h-32 rounded-lg bg-secondary/30 flex items-center justify-center mb-3 border border-border/50">
                                            <div className="text-center">
                                                {asset.type === "logo" || asset.type === "icon" ? (
                                                    <div
                                                        className="h-16 w-16 rounded-xl mx-auto flex items-center justify-center text-2xl font-bold text-primary-foreground"
                                                        style={{
                                                            backgroundColor: primaryColor,
                                                        }}
                                                    >
                                                        {clientName.charAt(0)}
                                                    </div>
                                                ) : asset.type === "pattern" ? (
                                                    <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto" />
                                                ) : (
                                                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {asset.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge
                                                        variant={
                                                            ASSET_TYPE_VARIANTS[asset.type] ??
                                                            "ghost"
                                                        }
                                                        className="text-[9px]"
                                                    >
                                                        {asset.type}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {asset.format} · {asset.size}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="shrink-0"
                                                disabled
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Upload Card */}
                            <Card className="border-dashed border-2 hover:border-primary/50 hover:bg-secondary/20 transition-colors cursor-pointer">
                                <CardContent className="p-4 h-full flex items-center justify-center min-h-[200px]">
                                    <div className="text-center">
                                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm font-medium">Upload Asset</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            SVG, PNG, JPG, PDF
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ),
            },
            {
                id: "guidelines",
                label: "Brand Guidelines",
                count: guidelineSections.length,
                content: (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Document brand rules, voice, and visual standards for consistent
                                deliverables.
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => window.print()}>
                                    <Download className="h-4 w-4 mr-1" />
                                    Export PDF
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        setGuidelineSections((prev) => [
                                            ...prev,
                                            {
                                                id: `g-${Date.now()}`,
                                                title: "New Section",
                                                content: "",
                                            },
                                        ])
                                    }
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Section
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {guidelineSections.map((section, i) => (
                                <StaggerItem key={section.id} index={i} stagger="relaxed">
                                    <Card>
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {i + 1}
                                                </div>
                                                <Input
                                                    value={section.title}
                                                    onChange={(e) => {
                                                        const updated = [...guidelineSections];
                                                        const current = updated[i];
                                                        if (current)
                                                            updated[i] = {
                                                                ...current,
                                                                title: e.target.value,
                                                            };
                                                        setGuidelineSections(updated);
                                                    }}
                                                    className="text-base font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0 max-w-md"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setGuidelineSections((prev) =>
                                                        prev.filter((s) => s.id !== section.id)
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <textarea
                                                value={section.content}
                                                onChange={(e) => {
                                                    const updated = [...guidelineSections];
                                                    const current = updated[i];
                                                    if (current)
                                                        updated[i] = {
                                                            ...current,
                                                            content: e.target.value,
                                                        };
                                                    setGuidelineSections(updated);
                                                }}
                                                rows={4}
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                                            />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            ))}
                        </div>
                    </div>
                ),
            },
            {
                id: "chatter",
                label: "Chatter",
                content: (
                    <RecordChatter
                        recordType="brand_kit"
                        recordId={kitId}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={kitId}
            record={bk}
            isLoading={isLoading}
            menuItems={crudMenuItems}
            avatar={
                <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold text-primary-foreground"
                    style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                    }}
                >
                    {clientName.charAt(0)}
                </div>
            }
            actions={
                <>
                    <Button variant="outline" size="sm" disabled>
                        <Download className="h-4 w-4 mr-1" />
                        Export ZIP
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <FileText className="h-4 w-4 mr-1" />
                        Export PDF
                    </Button>
                </>
            }
        />
    );
}
