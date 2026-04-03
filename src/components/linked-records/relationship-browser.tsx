"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ENTITY_RELATIONSHIP_MAP } from "@/config/production-config";
import type { EntityType, LinkedRecord } from "@/types/production";
import { ChevronRight, ExternalLink, Plus } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface RelationshipGroup {
    entityType: EntityType;
    label: string;
    records: LinkedRecord[];
    canCreate?: boolean | undefined;
    createHref?: string | undefined;
}

interface RelationshipBrowserProps {
    currentEntity: {
        type: EntityType;
        id: string;
        name: string;
    };
    parentRecords?: LinkedRecord[] | undefined;
    childGroups?: RelationshipGroup[] | undefined;
    relatedGroups?: RelationshipGroup[] | undefined;
    className?: string | undefined;
}

export function RelationshipBrowser({
    currentEntity,
    parentRecords = [],
    childGroups = [],
    relatedGroups = [],
    className,
}: RelationshipBrowserProps) {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["children"]));

    const toggleGroup = (groupId: string) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    };

    const currentConfig = ENTITY_RELATIONSHIP_MAP[currentEntity.type];

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    {currentConfig && <currentConfig.icon className="h-4 w-4" />}
                    Relationships
                </CardTitle>
            </CardHeader>
            <CardContent className="density-gap-section">
                {parentRecords.length > 0 && (
                    <div className="space-y-1">
                        <p className="density-caption uppercase tracking-wider text-muted-foreground font-medium">
                            Parent Records
                        </p>
                        <div className="flex flex-wrap items-center gap-1 text-sm">
                            {parentRecords.map((parent, index) => {
                                const config = ENTITY_RELATIONSHIP_MAP[parent.type];
                                return (
                                    <React.Fragment key={parent.id}>
                                        {index > 0 && (
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                        )}
                                        <Link
                                            href={`${config?.path}/${parent.id}`}
                                            className="inline-flex items-center gap-1 text-primary hover:underline"
                                        >
                                            {config && <config.icon className="h-3 w-3" />}
                                            {parent.name}
                                        </Link>
                                    </React.Fragment>
                                );
                            })}
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{currentEntity.name}</span>
                        </div>
                    </div>
                )}

                {childGroups.length > 0 && (
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            onClick={() => toggleGroup("children")}
                            className="w-full justify-start gap-1 h-auto p-0 density-caption uppercase tracking-wider text-muted-foreground font-medium hover:text-foreground"
                            aria-expanded={expandedGroups.has("children")}
                        >
                            <ChevronRight
                                className={`h-3 w-3 transition-transform duration-normal ${expandedGroups.has("children") ? "rotate-90" : ""}`}
                            />
                            Child Records
                        </Button>

                        <div
                            className={`grid transition-[grid-template-rows,opacity] duration-normal ease-out ${expandedGroups.has("children") ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                            <div className="overflow-hidden">
                                <div className="space-y-3 pl-4 pt-1">
                                    {childGroups.map((group) => (
                                        <RelationshipGroupSection
                                            key={group.entityType}
                                            group={group}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {relatedGroups.length > 0 && (
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            onClick={() => toggleGroup("related")}
                            className="w-full justify-start gap-1 h-auto p-0 density-caption uppercase tracking-wider text-muted-foreground font-medium hover:text-foreground"
                            aria-expanded={expandedGroups.has("related")}
                        >
                            <ChevronRight
                                className={`h-3 w-3 transition-transform duration-normal ${expandedGroups.has("related") ? "rotate-90" : ""}`}
                            />
                            Related Records
                        </Button>

                        <div
                            className={`grid transition-[grid-template-rows,opacity] duration-normal ease-out ${expandedGroups.has("related") ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                            <div className="overflow-hidden">
                                <div className="space-y-3 pl-4 pt-1">
                                    {relatedGroups.map((group) => (
                                        <RelationshipGroupSection
                                            key={group.entityType}
                                            group={group}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function RelationshipGroupSection({ group }: { group: RelationshipGroup }) {
    const config = ENTITY_RELATIONSHIP_MAP[group.entityType];
    if (!config) return null;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                    <config.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {group.label}
                    <Badge variant="secondary" className="density-caption h-4 px-1">
                        {group.records.length}
                    </Badge>
                </div>
                {group.canCreate && group.createHref && (
                    <Tooltip content="Create new record" side="left">
                        <Link href={group.createHref}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                aria-label="Create new record"
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </Link>
                    </Tooltip>
                )}
            </div>

            {group.records.length === 0 ? (
                <p className="density-caption text-muted-foreground pl-5">None</p>
            ) : (
                <div className="space-y-0.5 pl-5">
                    {group.records.slice(0, 5).map((record) => (
                        <Link
                            key={record.id}
                            href={`${config.path}/${record.id}`}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-secondary/50 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <span className="truncate text-primary group-hover:underline">
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
                        </Link>
                    ))}
                    {group.records.length > 5 && (
                        <Link
                            href={`${config.path}?filter=${group.entityType}`}
                            className="flex items-center gap-1 density-caption text-muted-foreground hover:text-primary pl-2"
                        >
                            +{group.records.length - 5} more
                            <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
