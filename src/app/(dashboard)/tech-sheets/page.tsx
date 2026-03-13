"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_TECH_SHEET_CONFIG } from "@/config/create-entity-configs";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { TECH_SHEET_STATUS_MAP, type TechSheetStatusType } from "@/config/domain-config";
import { formatDate } from "@/lib/utils";
import { StaggerItem } from "@/components/ui/stagger-container";
import { CheckCircle2, Cpu, FileText, MapPin, Plus, Shield, Wifi, Zap } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { useTechSheets } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

interface TechSheetListItem {
    id: string;
    title: string;
    techSheetNumber: string;
    projectName: string;
    venueName: string;
    version: number;
    status: TechSheetStatusType;
    totalAmperage: number;
    generatorRequired: boolean;
    internetRequired: boolean;
    equipmentCount: number;
    createdAt: string;
}

export default function TechSheetsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbSheets, isLoading } = useTechSheets();
    const [createOpen, openCreate, closeCreate] = useCreateAction();

    const techSheets: TechSheetListItem[] = (sbSheets ?? []).map((ts: Record<string, unknown>) => ({
        id: (ts.id as string) ?? "",
        title: (ts.title as string) ?? "",
        techSheetNumber: (ts.tech_sheet_number as string) ?? "",
        projectName: (ts.project_name as string) ?? "",
        venueName: (ts.venue_name as string) ?? "",
        version: (ts.version as number) ?? 1,
        status: ((ts.status as string) ?? "draft") as TechSheetStatusType,
        totalAmperage: (ts.total_amperage as number) ?? 0,
        generatorRequired: (ts.generator_required as boolean) ?? false,
        internetRequired: (ts.internet_required as boolean) ?? false,
        equipmentCount: (ts.equipment_count as number) ?? 0,
        createdAt: (ts.created_at as string) ?? "",
    }));

    if (isLoading) {
        return <LoadingState />;
    }

    const filtered = techSheets.filter((ts) => {
        const matchesSearch =
            ts.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ts.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ts.venueName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || ts.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalEquipment = techSheets.reduce((sum, ts) => sum + ts.equipmentCount, 0);

    return (
        <PermissionGate resource="tech_sheets" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Tech Sheets"
                    description="Technical riders and equipment specifications for venues and events"
                >
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Tech Sheet
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Tech Sheets" value={techSheets.length} icon={Cpu} />
                    <StatCard
                        title="Approved"
                        value={techSheets.filter((ts) => ts.status === "approved").length}
                        icon={CheckCircle2}
                    />
                    <StatCard title="Equipment Items" value={totalEquipment} icon={FileText} />
                    <StatCard
                        title="Generator Req."
                        value={techSheets.filter((ts) => ts.generatorRequired).length}
                        icon={Zap}
                    />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <SearchInput
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        placeholder="Search tech sheets..."
                        className="flex-1 max-w-sm"
                    />
                    <div className="flex gap-2 flex-wrap">
                        {["all", "draft", "reviewed", "approved", "distributed", "archived"].map(
                            (s) => (
                                <Button
                                    key={s}
                                    variant={statusFilter === s ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter(s)}
                                >
                                    {s === "all"
                                        ? "All"
                                        : (TECH_SHEET_STATUS_MAP[s as TechSheetStatusType]?.label ??
                                          s)}
                                </Button>
                            )
                        )}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={Cpu}
                        title="No tech sheets found"
                        description={
                            searchQuery || statusFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "Create your first tech sheet to get started"
                        }
                        action={
                            !searchQuery && statusFilter === "all"
                                ? { label: "New Tech Sheet", onClick: openCreate }
                                : undefined
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {filtered.map((ts, i) => {
                            const statusCfg = TECH_SHEET_STATUS_MAP[ts.status];
                            return (
                                <StaggerItem key={ts.id} index={i} stagger="relaxed">
                                    <Link href={`/tech-sheets/${ts.id}`}>
                                        <Card className="cursor-pointer hover:shadow-md transition-all">
                                            <CardContent className="py-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                            <Cpu className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-mono text-muted-foreground">
                                                                    {ts.techSheetNumber}
                                                                </span>
                                                                <Badge variant={statusCfg?.variant}>
                                                                    {statusCfg?.label}
                                                                </Badge>
                                                                <Badge variant="ghost">
                                                                    v{ts.version}
                                                                </Badge>
                                                            </div>
                                                            <h3 className="text-sm font-semibold mt-1">
                                                                {ts.title}
                                                            </h3>
                                                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {ts.venueName}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <FileText className="h-3 w-3" />
                                                                    {ts.equipmentCount} items
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0 space-y-1">
                                                        <div className="flex items-center gap-2 justify-end flex-wrap">
                                                            <Badge
                                                                variant={
                                                                    ts.generatorRequired
                                                                        ? "warning"
                                                                        : "ghost"
                                                                }
                                                                className="text-[10px]"
                                                            >
                                                                <Zap className="mr-1 h-3 w-3" />
                                                                {ts.totalAmperage}A
                                                            </Badge>
                                                            {ts.internetRequired && (
                                                                <Badge
                                                                    variant="info"
                                                                    className="text-[10px]"
                                                                >
                                                                    <Wifi className="mr-1 h-3 w-3" />
                                                                    Network
                                                                </Badge>
                                                            )}
                                                            {ts.generatorRequired && (
                                                                <Badge
                                                                    variant="warning"
                                                                    className="text-[10px]"
                                                                >
                                                                    <Shield className="mr-1 h-3 w-3" />
                                                                    Generator
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {formatDate(ts.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </StaggerItem>
                            );
                        })}
                    </div>
                )}
            </div>
            <CreateEntityDialog
                config={CREATE_TECH_SHEET_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
