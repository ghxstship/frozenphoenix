"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ENTITY_RELATIONSHIP_MAP } from "@/config/production-config";
import { useLinkRecords, useRecordLinks, useUnlinkRecords } from "@/lib/supabase";
import { LinkedRecordPicker } from "./linked-record-picker";
import type { EntityType, LinkedRecord } from "@/types/production";
import type { EntitySearchResult } from "@/lib/data-hooks/hooks-record-links";
import { ChevronRight, Link2, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════
// LINKED RECORDS PANEL
// ═══════════════════════════════════════════════════════════════

interface LinkedRecordsPanelProps {
    /** The entity type of the current record. */
    entityType: EntityType;
    /** The ID of the current record. */
    entityId: string;
    /** Additional CSS class names. */
    className?: string | undefined;
}

export function LinkedRecordsPanel({ entityType, entityId, className }: LinkedRecordsPanelProps) {
    const [pickerOpen, setPickerOpen] = useState(false);

    const { data: linkedRecords, isLoading } = useRecordLinks(entityType, entityId);
    const linkMutation = useLinkRecords();
    const unlinkMutation = useUnlinkRecords();

    // Group linked records by entity type
    const groupedRecords = useMemo(() => {
        if (!linkedRecords) return new Map<string, LinkedRecord[]>();
        const groups = new Map<string, LinkedRecord[]>();
        for (const record of linkedRecords) {
            const existing = groups.get(record.type) ?? [];
            existing.push(record);
            groups.set(record.type, existing);
        }
        return groups;
    }, [linkedRecords]);

    const totalCount = linkedRecords?.length ?? 0;

    const handleLinkRecord = async (result: EntitySearchResult) => {
        await linkMutation.mutateAsync({
            sourceEntityType: entityType,
            sourceEntityId: entityId,
            targetEntityType: result.entityType,
            targetEntityId: result.id,
        });
    };

    const handleUnlink = async (linkId: string) => {
        await unlinkMutation.mutateAsync(linkId);
    };

    const excludeIds = useMemo(() => (linkedRecords ?? []).map((r) => r.id), [linkedRecords]);

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={cn("density-gap-section", className)}>
            {/* Header card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-primary" />
                            Linked Records
                            {totalCount > 0 && (
                                <Badge variant="secondary" className="density-caption">
                                    {totalCount}
                                </Badge>
                            )}
                        </CardTitle>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPickerOpen(!pickerOpen)}
                            disabled={linkMutation.isPending}
                        >
                            {pickerOpen ? (
                                <>Close</>
                            ) : (
                                <>
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Link Record
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Picker */}
                    {pickerOpen && (
                        <div className="mb-4">
                            <LinkedRecordPicker
                                currentEntityType={entityType}
                                currentEntityId={entityId}
                                excludeIds={excludeIds}
                                onSelect={handleLinkRecord}
                                onClose={() => setPickerOpen(false)}
                            />
                        </div>
                    )}

                    {/* Empty state */}
                    {totalCount === 0 && !pickerOpen && (
                        <div className="text-center py-8">
                            <Link2 className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground mb-3">
                                No linked records yet.
                            </p>
                            <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Link a Record
                            </Button>
                        </div>
                    )}

                    {/* Grouped linked records */}
                    {totalCount > 0 && (
                        <div className="space-y-4">
                            {Array.from(groupedRecords.entries()).map(([type, records]) => {
                                const config = ENTITY_RELATIONSHIP_MAP[type];
                                if (!config) return null;
                                const Icon = config.icon;
                                return (
                                    <div key={type} className="space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            <Icon className="h-3.5 w-3.5" />
                                            {config.pluralLabel}
                                            <Badge
                                                variant="secondary"
                                                className="density-caption h-4 px-1"
                                            >
                                                {records.length}
                                            </Badge>
                                        </div>
                                        <div className="space-y-0.5 pl-5">
                                            {records.map((record) => (
                                                <div
                                                    key={record.linkId ?? record.id}
                                                    className="flex items-center justify-between group text-sm py-1.5 px-2 rounded hover:bg-secondary/50 transition-colors"
                                                >
                                                    <Link
                                                        href={`${config.path}/${record.id}`}
                                                        className="flex items-center gap-2 flex-1 min-w-0 text-primary hover:underline"
                                                    >
                                                        <span className="truncate">
                                                            {record.name}
                                                        </span>
                                                        {record.status && (
                                                            <Badge
                                                                variant="outline"
                                                                className="density-caption h-4 px-1 shrink-0"
                                                            >
                                                                {record.status}
                                                            </Badge>
                                                        )}
                                                        {record.linkType &&
                                                            record.linkType !== "related" && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="density-caption h-4 px-1 shrink-0"
                                                                >
                                                                    {record.linkType}
                                                                </Badge>
                                                            )}
                                                        <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                    </Link>
                                                    {record.linkId && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                            onClick={() =>
                                                                handleUnlink(record.linkId!)
                                                            }
                                                            disabled={unlinkMutation.isPending}
                                                            aria-label={`Unlink ${record.name}`}
                                                        >
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
