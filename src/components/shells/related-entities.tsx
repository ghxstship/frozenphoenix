"use client";

/* ═══════════════════════════════════════════════════════════════
   RELATED ENTITIES — Sub-entity DataTable with header and link
   
   Renders a section showing related entity records in a DataTable,
   with a title, optional icon, and "View all" link. Used by
   DetailPageShell for related entity tabs/sections.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiList } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-view/data-table";
import { EmptyState } from "@/components/layouts/empty-state";
import { LoadingState } from "@/components/layouts/loading-state";
import { ChevronRight, LayoutList } from "lucide-react";
import type { RelatedEntityDef } from "@/types/detail-page-config";
import { toDataTableColumn } from "@/lib/formatters/record-utils";
import { useEntityMeta } from "@/hooks/use-entity-meta";
import type { EntityRecord } from "@/types/entity";

interface RelatedEntitiesSectionProps {
    def: RelatedEntityDef;
    parentId: string;
    className?: string | undefined;
}

export function RelatedEntitiesSection({ def, parentId, className }: RelatedEntitiesSectionProps) {
    const router = useRouter();
    const { basePath, slug } = useEntityMeta(def.entityKey);
    const Icon = def.icon ?? LayoutList;
    const limit = def.limit ?? 10;

    const { data: rawData, isLoading } = useQuery({
        queryKey: [def.entityKey, "related", parentId, def.foreignKey],
        queryFn: async () => {
            const res = await apiList<EntityRecord>(basePath);
            return res.data;
        },
        enabled: !!parentId,
    });

    const records = React.useMemo(() => {
        const all = rawData ?? [];
        const filtered = all.filter((r) => String(r[def.foreignKey] ?? "") === parentId);
        return filtered.slice(0, limit);
    }, [rawData, parentId, def.foreignKey, limit]);

    const dtColumns = React.useMemo(() => def.columns.map(toDataTableColumn), [def.columns]);

    if (isLoading) {
        return <LoadingState variant="card" />;
    }

    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {def.title}
                        <span className="text-muted-foreground font-normal">
                            ({records.length})
                        </span>
                    </CardTitle>
                    {def.linkPattern && (
                        <Link
                            href={`/${slug}`}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                        >
                            View all <ChevronRight className="h-3 w-3" />
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {records.length === 0 ? (
                    <div className="px-6 pb-6">
                        <EmptyState
                            icon={Icon}
                            title={def.emptyMessage ?? `No ${def.title.toLowerCase()} yet`}
                            description={`No ${def.title.toLowerCase()} are linked to this record.`}
                        />
                    </div>
                ) : (
                    <DataTable
                        data={records}
                        columns={dtColumns}
                        keyField={"id" as keyof EntityRecord}
                        searchable={false}
                        pagination={records.length > limit}
                        pageSize={limit}
                        compact
                        className="border-0 rounded-none"
                        onRowClick={
                            def.linkPattern
                                ? (row) => {
                                      const href = (def.linkPattern ?? "").replace(
                                          "{id}",
                                          String(row.id ?? "")
                                      );
                                      router.push(href);
                                  }
                                : undefined
                        }
                    />
                )}
            </CardContent>
        </Card>
    );
}

RelatedEntitiesSection.displayName = "RelatedEntitiesSection";
