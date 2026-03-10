"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_IP_RIGHT_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, Loader2, Plus } from "lucide-react";
import type { IPRight } from "@/types/governance";
import { useIpRights } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

const ASSET_TYPE_LABELS: Record<string, string> = {
    logo: "Logo",
    trademark: "Trademark",
    design: "Design",
    photograph: "Photograph",
    video: "Video",
    music: "Music",
    software: "Software",
    content: "Content",
    invention: "Invention",
    trade_secret: "Trade Secret",
    other: "Other",
};

const LICENSE_TYPE_LABELS: Record<string, string> = {
    exclusive: "Exclusive",
    non_exclusive: "Non-Exclusive",
    sole: "Sole",
    sublicensable: "Sublicensable",
    work_for_hire: "Work for Hire",
    assignment: "Assignment",
    creative_commons: "Creative Commons",
    other: "Other",
};

const OWNER_LABELS: Record<string, string> = {
    us: "Us (Company)",
    counterparty: "Counterparty",
    mutual: "Mutual",
    third_party: "Third Party",
};

export default function IPRightsPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");

    const { data: sbRights, isLoading } = useIpRights();

    const rights: IPRight[] = (sbRights ?? []).map(
        (r: Record<string, unknown>) =>
            ({
                id: (r.id as string) ?? "",
                contract_id: (r.contract_id as string) ?? "",
                asset_type: (r.asset_type as string) ?? "other",
                asset_description: (r.asset_description as string) ?? "",
                owner: (r.owner as string) ?? "us",
                license_type: (r.license_type as string) ?? "other",
                territory: (r.territory as string) ?? "",
                duration: (r.duration as string) ?? undefined,
                exclusivity: (r.exclusivity as boolean) ?? false,
                sublicensable: (r.sublicensable as boolean) ?? false,
                permitted_uses: (r.permitted_uses as string) ?? undefined,
                prohibited_uses: (r.prohibited_uses as string) ?? undefined,
            }) as IPRight
    );

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    const filtered = rights.filter((r) => {
        return (
            !search ||
            r.asset_description.toLowerCase().includes(search.toLowerCase()) ||
            r.asset_type.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <PermissionGate resource="ip_rights" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="IP & Usage Rights"
                    description="Intellectual property ownership, licensing terms, and usage rights tracking across all contracts"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4" /> Add IP Right
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Total IP Rights" value={rights.length} icon={Fingerprint} />
                    <StatCard
                        title="Work for Hire"
                        value={rights.filter((r) => r.license_type === "work_for_hire").length}
                        icon={Fingerprint}
                    />
                    <StatCard
                        title="Licensed"
                        value={rights.filter((r) => r.license_type !== "work_for_hire").length}
                        icon={Fingerprint}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search IP rights..."
                        className="flex-1 max-w-sm"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.map((r) => (
                        <Card
                            key={r.id}
                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-sm">{r.asset_description}</CardTitle>
                                    <Badge variant="secondary" className="text-[9px]">
                                        {ASSET_TYPE_LABELS[r.asset_type] || r.asset_type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <span className="text-muted-foreground">Owner:</span>{" "}
                                            <span className="font-medium">
                                                {OWNER_LABELS[r.owner] || r.owner}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">License:</span>{" "}
                                            <span className="font-medium">
                                                {LICENSE_TYPE_LABELS[r.license_type] ||
                                                    r.license_type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <span className="text-muted-foreground">
                                                Territory:
                                            </span>{" "}
                                            {r.territory}
                                        </div>
                                        {r.duration && (
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Duration:
                                                </span>{" "}
                                                {r.duration}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {r.exclusivity && (
                                            <Badge variant="warning" className="text-[9px]">
                                                Exclusive
                                            </Badge>
                                        )}
                                        {r.sublicensable && (
                                            <Badge variant="info" className="text-[9px]">
                                                Sublicensable
                                            </Badge>
                                        )}
                                    </div>
                                    {r.permitted_uses && (
                                        <div>
                                            <span className="text-muted-foreground">
                                                Permitted:
                                            </span>{" "}
                                            {r.permitted_uses}
                                        </div>
                                    )}
                                    {r.prohibited_uses && (
                                        <div className="text-destructive">
                                            <span className="text-muted-foreground">
                                                Prohibited:
                                            </span>{" "}
                                            {r.prohibited_uses}
                                        </div>
                                    )}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
                                    Contract: {r.contract_id}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <CreateEntityDialog config={CREATE_IP_RIGHT_CONFIG} open={createOpen} onClose={closeCreate} />
        </PermissionGate>
    );
}
