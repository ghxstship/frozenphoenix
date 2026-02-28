"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { OverlineText } from "@/components/ui/overline-text";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    ArrowLeft,
    Palette,
    Type,
    Image as ImageIcon,
    Download,
    FileText,
    Upload,
    Copy,
    CheckCircle2,
    Plus,
    Trash2,
    FolderOpen,
    Grid3X3,
    BookOpen,
} from "lucide-react";

type BrandTab = "colors" | "assets" | "guidelines";

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

const mockBrand = {
    id: "bk-nike",
    clientName: "Nike",
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    accentColor: "#FF6B00",
    fontFamily: "Futura",
    headingFont: "Futura Bold",
    bodyFont: "Helvetica Neue",
    logoUrl: "/brands/nike/logo.svg",
    createdAt: "2025-09-15",
    updatedAt: "2026-02-20",
};

const mockAssets: BrandAsset[] = [
    { id: "a1", name: "Primary Logo", type: "logo", format: "SVG", size: "24 KB", url: "#", thumbnail: "" },
    { id: "a2", name: "Logo Mark (Swoosh)", type: "icon", format: "SVG", size: "8 KB", url: "#", thumbnail: "" },
    { id: "a3", name: "Logo White on Dark", type: "logo", format: "PNG", size: "156 KB", url: "#", thumbnail: "" },
    { id: "a4", name: "Brand Pattern (Geometric)", type: "pattern", format: "SVG", size: "42 KB", url: "#", thumbnail: "" },
    { id: "a5", name: "Hero Photo — Air Max Launch", type: "photo", format: "JPG", size: "2.4 MB", url: "#", thumbnail: "" },
    { id: "a6", name: "Social Media Template", type: "illustration", format: "PNG", size: "890 KB", url: "#", thumbnail: "" },
    { id: "a7", name: "Favicon", type: "icon", format: "ICO", size: "4 KB", url: "#", thumbnail: "" },
    { id: "a8", name: "Email Header", type: "illustration", format: "PNG", size: "320 KB", url: "#", thumbnail: "" },
];

const mockGuidelines: GuidelineSection[] = [
    { id: "g1", title: "Brand Voice", content: "Nike communicates with confidence, inspiration, and directness. The tone is motivational yet grounded — empowering athletes of all levels. Avoid corporate jargon; prefer action-oriented language." },
    { id: "g2", title: "Logo Usage", content: "The Swoosh must always have clear space equal to 50% of the logo height on all sides. Never distort, rotate, or recolor the logo outside approved color variations. Minimum size: 24px height for digital, 0.5\" for print." },
    { id: "g3", title: "Color Application", content: "Primary black (#000000) is used for headlines, key CTAs, and logo. White (#FFFFFF) is the default background. Orange accent (#FF6B00) is reserved for highlights, hover states, and promotional callouts. Never use accent as a background color for large areas." },
    { id: "g4", title: "Typography Rules", content: "Futura Bold for headings (all caps optional for hero text). Helvetica Neue for body copy. Minimum body text size: 14px digital, 10pt print. Line height: 1.5 for body, 1.2 for headings." },
    { id: "g5", title: "Photography Style", content: "High-contrast, dynamic imagery showing athletes in motion. Natural lighting preferred. Avoid heavily staged or overly retouched images. Diversity and inclusivity are non-negotiable in all visual content." },
    { id: "g6", title: "Do Not", content: "• Do not place logo on busy backgrounds without a container\n• Do not use gradients on the Swoosh\n• Do not combine with competitor imagery\n• Do not use Comic Sans (or any non-approved font)\n• Do not alter brand color hex values" },
];

const ASSET_TYPE_VARIANTS: Record<string, "info" | "default" | "success" | "warning" | "destructive"> = {
    logo: "info",
    icon: "default",
    photo: "success",
    pattern: "warning",
    illustration: "destructive",
};

export default function BrandKitDetailPage() {
    const params = useParams();
    const router = useRouter();
    const kitId = params.id as string;
    void kitId;
    const [activeTab, setActiveTab] = useState<BrandTab>("colors");
    const [copiedColor, setCopiedColor] = useState<string | null>(null);
    const [assetFilter, setAssetFilter] = useState<string>("all");
    const [guidelineSections, setGuidelineSections] = useState(mockGuidelines);

    const copyColor = (color: string) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    const filteredAssets = assetFilter === "all" ? mockAssets : mockAssets.filter((a) => a.type === assetFilter);

    const tabItems: { id: BrandTab; label: string; icon: React.ElementType }[] = [
        { id: "colors", label: "Colors & Typography", icon: Palette },
        { id: "assets", label: "Asset Library", icon: FolderOpen },
        { id: "guidelines", label: "Brand Guidelines", icon: BookOpen },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/brand-kit")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-bold text-primary-foreground" style={{ background: `linear-gradient(135deg, ${mockBrand.primaryColor}, ${mockBrand.accentColor})` }}>
                                {mockBrand.clientName.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{mockBrand.clientName} Brand Kit</h1>
                                <p className="text-sm text-muted-foreground">Last updated Feb 20, 2026</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export ZIP</Button>
                    <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" />Export PDF</Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
                {tabItems.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Colors & Typography Tab */}
            {activeTab === "colors" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" />Color Palette</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { label: "Primary", color: mockBrand.primaryColor },
                                { label: "Secondary", color: mockBrand.secondaryColor },
                                { label: "Accent", color: mockBrand.accentColor },
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
                                            <button onClick={() => copyColor(c.color)} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                                                <Copy className="h-2.5 w-2.5" />HEX
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Palette Preview */}
                            <div className="pt-4 border-t border-border">
                                <OverlineText className="mb-2">Palette Preview</OverlineText>
                                <div className="h-12 rounded-lg overflow-hidden flex">
                                    <div className="flex-[3]" style={{ backgroundColor: mockBrand.primaryColor }} />
                                    <div className="flex-[2]" style={{ backgroundColor: mockBrand.secondaryColor }} />
                                    <div className="flex-1" style={{ backgroundColor: mockBrand.accentColor }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Type className="h-4 w-4" />Typography</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <OverlineText className="mb-2">Heading Font</OverlineText>
                                <div className="p-4 rounded-lg bg-secondary/30">
                                    <p className="text-3xl font-bold" style={{ fontFamily: mockBrand.fontFamily }}>{mockBrand.headingFont}</p>
                                    <p className="text-sm text-muted-foreground mt-1">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                                    <p className="text-sm text-muted-foreground">abcdefghijklmnopqrstuvwxyz</p>
                                    <p className="text-sm text-muted-foreground">0123456789 !@#$%^&*()</p>
                                </div>
                            </div>
                            <div>
                                <OverlineText className="mb-2">Body Font</OverlineText>
                                <div className="p-4 rounded-lg bg-secondary/30">
                                    <p className="text-lg">{mockBrand.bodyFont}</p>
                                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                        The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.
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
                                        <div key={item.label} className="flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-secondary/30">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="ghost" className="w-12 justify-center">{item.label}</Badge>
                                                <span>{item.weight}</span>
                                            </div>
                                            <span className="font-mono text-xs text-muted-foreground">{item.size}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Asset Library Tab */}
            {activeTab === "assets" && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {["all", "logo", "icon", "photo", "pattern", "illustration"].map((type) => (
                                <Button
                                    key={type}
                                    variant={assetFilter === type ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setAssetFilter(type)}
                                >
                                    {type === "all" ? "All" : ({ logo: "Logo", icon: "Icon", photo: "Photo", pattern: "Pattern", illustration: "Illustration" }[type] ?? type)}
                                    {type !== "all" && (
                                        <span className="ml-1 text-xs">({mockAssets.filter((a) => a.type === type).length})</span>
                                    )}
                                </Button>
                            ))}
                        </div>
                        <Button size="sm"><Upload className="h-4 w-4 mr-1" />Upload Asset</Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredAssets.map((asset) => (
                            <Card key={asset.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="h-32 rounded-lg bg-secondary/30 flex items-center justify-center mb-3 border border-border/50">
                                        <div className="text-center">
                                            {asset.type === "logo" || asset.type === "icon" ? (
                                                <div className="h-16 w-16 rounded-xl mx-auto flex items-center justify-center text-2xl font-bold text-primary-foreground" style={{ backgroundColor: mockBrand.primaryColor }}>
                                                    {mockBrand.clientName.charAt(0)}
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
                                            <p className="text-sm font-medium truncate">{asset.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={ASSET_TYPE_VARIANTS[asset.type] ?? "ghost"} className="text-[9px]">{asset.type}</Badge>
                                                <span className="text-[10px] text-muted-foreground">{asset.format} · {asset.size}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="shrink-0"><Download className="h-3.5 w-3.5" /></Button>
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
                                    <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG, PDF</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Guidelines Tab */}
            {activeTab === "guidelines" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Document brand rules, voice, and visual standards for consistent deliverables.</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export PDF</Button>
                            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Section</Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {guidelineSections.map((section, i) => (
                            <StaggerItem key={section.id} index={i} stagger="relaxed">
                            <Card>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                                        <Input
                                            value={section.title}
                                            onChange={(e) => {
                                                const updated = [...guidelineSections];
                                                updated[i] = { ...updated[i], title: e.target.value };
                                                setGuidelineSections(updated);
                                            }}
                                            className="text-base font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0 max-w-md"
                                        />
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setGuidelineSections((prev) => prev.filter((s) => s.id !== section.id))}>
                                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <textarea
                                        value={section.content}
                                        onChange={(e) => {
                                            const updated = [...guidelineSections];
                                            updated[i] = { ...updated[i], content: e.target.value };
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
            )}
        </div>
    );
}
