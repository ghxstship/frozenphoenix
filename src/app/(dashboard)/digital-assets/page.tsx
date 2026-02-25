"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Image, Search, FileText, Film, Music, Lock } from "lucide-react";

interface MockDigitalAsset {
    id: string;
    name: string;
    assetClass: string;
    status: string;
    version: number;
    mimeType: string;
    fileSize: string;
    uploadedBy: string;
    uploadedAt: string;
    projectName?: string;
    tags: string[];
    isLocked: boolean;
}

const mockAssets: MockDigitalAsset[] = [
    { id: "1", name: "Main Stage Hero Render v3", assetClass: "image", status: "approved", version: 3, mimeType: "image/png", fileSize: "24.5 MB", uploadedBy: "Alex Torres", uploadedAt: "2026-02-20", projectName: "Acme Summit 2026", tags: ["hero", "render", "3d"], isLocked: false },
    { id: "2", name: "Event Promo Video — 30s Cut", assetClass: "video", status: "in_review", version: 2, mimeType: "video/mp4", fileSize: "156 MB", uploadedBy: "Morgan Blake", uploadedAt: "2026-02-22", projectName: "Acme Summit 2026", tags: ["promo", "social", "video"], isLocked: false },
    { id: "3", name: "Brand Guidelines — Acme Corp", assetClass: "document", status: "approved", version: 1, mimeType: "application/pdf", fileSize: "8.2 MB", uploadedBy: "Creative Director", uploadedAt: "2026-01-15", projectName: "Acme Summit 2026", tags: ["brand", "guidelines"], isLocked: true },
    { id: "4", name: "Walk-in Music Playlist", assetClass: "audio", status: "approved", version: 1, mimeType: "audio/mp3", fileSize: "42 MB", uploadedBy: "Sam Chen", uploadedAt: "2026-02-18", projectName: "Acme Summit 2026", tags: ["audio", "playlist", "walk-in"], isLocked: false },
    { id: "5", name: "Floor Plan — Convention Center L1", assetClass: "document", status: "approved", version: 5, mimeType: "application/pdf", fileSize: "3.1 MB", uploadedBy: "Pat Davis", uploadedAt: "2026-02-21", tags: ["floorplan", "venue", "cad"], isLocked: false },
    { id: "6", name: "LED Wall Content — Sponsor Loop", assetClass: "video", status: "processing", version: 1, mimeType: "video/mp4", fileSize: "890 MB", uploadedBy: "Morgan Blake", uploadedAt: "2026-02-24", projectName: "Acme Summit 2026", tags: ["led", "sponsor", "loop"], isLocked: false },
    { id: "7", name: "Social Media Photo Pack", assetClass: "image", status: "draft", version: 1, mimeType: "application/zip", fileSize: "245 MB", uploadedBy: "Creative Team", uploadedAt: "2026-02-23", tags: ["social", "photo", "pack"], isLocked: false },
    { id: "8", name: "NDA — Vendor Confidential", assetClass: "document", status: "locked", version: 2, mimeType: "application/pdf", fileSize: "1.2 MB", uploadedBy: "Legal", uploadedAt: "2026-01-10", tags: ["legal", "nda", "confidential"], isLocked: true },
];

const CLASS_ICONS: Record<string, typeof Image> = {
    image: Image,
    video: Film,
    audio: Music,
    document: FileText,
};

export default function DigitalAssetsPage() {
    const [search, setSearch] = useState("");

    const filtered = mockAssets.filter(a =>
        !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.tags.some(t => t.includes(search.toLowerCase()))
    );

    const byStatus = {
        approved: mockAssets.filter(a => a.status === "approved").length,
        inReview: mockAssets.filter(a => a.status === "in_review").length,
        locked: mockAssets.filter(a => a.isLocked).length,
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Digital Assets" description="Centralized asset library — images, video, documents, audio — with versioning and access control" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Assets" value={mockAssets.length} icon={Image} />
                <StatCard title="Approved" value={byStatus.approved} icon={Image} />
                <StatCard title="In Review" value={byStatus.inReview} icon={FileText} />
                <StatCard title="Locked" value={byStatus.locked} icon={Lock} />
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search assets or tags..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((asset, i) => {
                    const Icon = CLASS_ICONS[asset.assetClass] ?? FileText;
                    return (
                        <Card key={asset.id} className="hover:shadow-sm transition-all animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                            <CardContent className="py-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center shrink-0">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold truncate">{asset.name}</h3>
                                            {asset.isLocked && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <StatusBadge status={asset.status} className="text-[10px]" />
                                            <span className="text-[10px] text-muted-foreground">v{asset.version}</span>
                                            <span className="text-[10px] text-muted-foreground">{asset.fileSize}</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1">{asset.uploadedBy} — {asset.uploadedAt}</p>
                                        {asset.projectName && <p className="text-[10px] text-muted-foreground">{asset.projectName}</p>}
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {asset.tags.map(t => (
                                                <span key={t} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
