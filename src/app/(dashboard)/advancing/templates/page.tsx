"use client";

import * as React from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import { PageShell } from "@/components/layouts/page-shell";
import { PermissionGate } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/layouts/empty-state";
import { useAdvanceTemplates } from "@/lib/supabase/hooks-advancing";

export default function AdvanceTemplatesPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const { data: templates, isLoading } = useAdvanceTemplates();

    const list = React.useMemo(
        () => (templates as Record<string, unknown>[] | undefined) ?? [],
        [templates]
    );

    const filtered = React.useMemo(() => {
        if (!searchQuery) return list;
        const q = searchQuery.toLowerCase();
        return list.filter((t) =>
            String(t.name ?? "")
                .toLowerCase()
                .includes(q)
        );
    }, [list, searchQuery]);

    return (
        <PermissionGate resource="advancing" action="manage">
            <PageShell
                title="Advance Templates"
                description="Create and manage reusable advance templates"
                actions={
                    <Button disabled onClick={() => void 0}>
                        <Plus className="h-4 w-4" />
                        New Template
                    </Button>
                }
            >
                <SearchInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="Search templates..."
                    className="max-w-sm"
                />

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No templates yet"
                        description="Create templates to streamline recurring advance requests"
                    />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((tpl) => {
                            const itemCount =
                                ((tpl.template_data as Record<string, unknown>)?.items as unknown[])
                                    ?.length ?? 0;
                            return (
                                <Card key={tpl.id as string}>
                                    <CardContent className="flex flex-col gap-2 pt-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                                                <div>
                                                    <h3 className="text-sm font-medium">
                                                        {String(tpl.name)}
                                                    </h3>
                                                    {Boolean(tpl.description) && (
                                                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                                            {String(tpl.description)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled
                                                onClick={() => void 0}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{itemCount} items</span>
                                            {Boolean(tpl.advance_type) && (
                                                <span>Type: {String(tpl.advance_type)}</span>
                                            )}
                                            {Boolean(tpl.is_global) && (
                                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                                    Global
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </PageShell>
        </PermissionGate>
    );
}
