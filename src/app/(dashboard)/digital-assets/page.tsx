"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { Chip } from "@/components/ui/chip";
import { FileText, Film, Image, Loader2, Lock, Music } from "lucide-react";
import { useDigitalAssets } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

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

const CLASS_ICONS: Record<string, typeof Image> = {
    image: Image,
    video: Film,
    audio: Music,
    document: FileText,
};

export default function DigitalAssetsPage() {
    const [search, setSearch] = useState("");

    const { data: sbAssets, isLoading } = useDigitalAssets();

    const assets: MockDigitalAsset[] = (sbAssets ?? []).map((a: Record<string, unknown>) => ({
        id: (a.id as string) ?? "",
        name: (a.name as string) ?? "",
        assetClass: (a.asset_class as string) ?? "document",
        status: (a.status as string) ?? "draft",
        version: (a.version as number) ?? 1,
        mimeType: (a.mime_type as string) ?? "",
        fileSize: (a.file_size as string) ?? "0 B",
        uploadedBy: (a.uploaded_by as string) ?? "",
        uploadedAt: (a.uploaded_at as string) ?? "",
        projectName: (a.project_name as string) ?? undefined,
        tags: (a.tags as string[]) ?? [],
        isLocked: (a.is_locked as boolean) ?? false,
    }));

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    const filtered = assets.filter(
        (a) =>
            !search ||
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.tags.some((t) => t.includes(search.toLowerCase()))
    );

    const byStatus = {
        approved: assets.filter((a) => a.status === "approved").length,
        inReview: assets.filter((a) => a.status === "in_review").length,
        locked: assets.filter((a) => a.isLocked).length,
    };

    return (
        <PermissionGate resource="digital_assets" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Digital Assets"
                    description="Centralized asset library — images, video, documents, audio — with versioning and access control"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Assets" value={assets.length} icon={Image} />
                    <StatCard title="Approved" value={byStatus.approved} icon={Image} />
                    <StatCard title="In Review" value={byStatus.inReview} icon={FileText} />
                    <StatCard title="Locked" value={byStatus.locked} icon={Lock} />
                </div>

                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search assets or tags..."
                    className="max-w-sm"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((asset, i) => {
                        const Icon = CLASS_ICONS[asset.assetClass] ?? FileText;
                        return (
                            <StaggerItem key={asset.id} index={i} stagger="tight">
                                <Card className="hover:shadow-sm transition-all">
                                    <CardContent className="py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center shrink-0">
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-semibold truncate">
                                                        {asset.name}
                                                    </h3>
                                                    {asset.isLocked && (
                                                        <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <StatusBadge
                                                        status={asset.status}
                                                        className="text-[10px]"
                                                    />
                                                    <span className="text-[10px] text-muted-foreground">
                                                        v{asset.version}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {asset.fileSize}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-1">
                                                    {asset.uploadedBy} — {asset.uploadedAt}
                                                </p>
                                                {asset.projectName && (
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {asset.projectName}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {asset.tags.map((t) => (
                                                        <Chip key={t} size="sm">
                                                            {t}
                                                        </Chip>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        );
                    })}
                </div>
            </div>
        </PermissionGate>
    );
}
