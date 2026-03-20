"use client";

import * as React from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdvanceTemplates } from "@/lib/supabase/hooks-advancing";
import { useAdvanceCart } from "@/hooks/use-advance-cart";
import type { AdvanceType } from "@/types/advancing";

interface AdvanceTemplatePickerProps {
    onClose?: () => void;
}

export function AdvanceTemplatePicker({ onClose }: AdvanceTemplatePickerProps) {
    const { data: templates, isLoading } = useAdvanceTemplates();
    const addItem = useAdvanceCart((s) => s.addItem);
    const setAdvanceType = useAdvanceCart((s) => s.setAdvanceType);

    const list = (templates as Record<string, unknown>[] | undefined) ?? [];

    function applyTemplate(template: Record<string, unknown>) {
        if (template.advance_type) {
            setAdvanceType(String(template.advance_type) as AdvanceType);
        }
        const items = (template.template_data as Record<string, unknown>)?.items;
        if (Array.isArray(items)) {
            for (const item of items as Record<string, unknown>[]) {
                addItem({
                    catalog_item_id: String(item.catalog_item_id),
                    name: String(item.name ?? "Template Item"),
                    sku: String(item.sku ?? ""),
                    unit_cost: Number(item.unit_cost ?? 0),
                    quantity: Number(item.quantity ?? 1),
                    is_critical_path: Boolean(item.is_critical_path),
                });
            }
        }
        onClose?.();
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 motion-safe:animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (list.length === 0) {
        return (
            <p className="py-4 text-center text-sm text-muted-foreground">No templates available</p>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-medium">Load from Template</h3>
            <div className="grid gap-2">
                {list.map((tpl) => (
                    <Card
                        key={tpl.id as string}
                        className="cursor-pointer transition-shadow hover:shadow-md"
                    >
                        <CardContent className="flex items-center gap-3 py-3">
                            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{String(tpl.name)}</p>
                                {Boolean(tpl.description) && (
                                    <p className="truncate text-xs text-muted-foreground">
                                        {String(tpl.description)}
                                    </p>
                                )}
                            </div>
                            <Button size="sm" variant="outline" onClick={() => applyTemplate(tpl)}>
                                <Plus className="h-3.5 w-3.5" />
                                Use
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
