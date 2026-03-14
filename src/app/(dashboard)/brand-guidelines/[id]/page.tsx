"use client";

import { useParams } from "next/navigation";
import {
    useBrandGuideline,
    useDeleteBrandGuideline,
    useUpdateBrandGuideline,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { EmptyState } from "@/components/layouts/empty-state";
import { FileText, Palette } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "brand_guidelines",
    titleKey: "name",
    statusKey: "status",
    icon: Palette,
    backHref: "/brand-guidelines",
    backLabel: "Brand Guidelines",
    chatterRecordType: "brand_guideline",
    sidebarFields: [
        { id: "category", label: "Category", accessorKey: "category" },
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "created_at", label: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    fields: [
        { id: "description", label: "Description", accessorKey: "description", fullWidth: true },
        { id: "content", label: "Content", accessorKey: "content", fullWidth: true },
    ],
    tabs: [
        {
            id: "rules",
            label: "Rules",
            content: (
                <EmptyState
                    icon={FileText}
                    title="No brand rules defined"
                    description="Detailed brand rules and guidelines will appear here."
                    compact
                />
            ),
        },
    ],
};

export default function BrandGuidelineDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: guideline, isLoading } = useBrandGuideline(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Brand Guideline",
        listPath: "/brand-guidelines",
        useUpdateHook: useUpdateBrandGuideline,
        useDeleteHook: useDeleteBrandGuideline,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={entityId}
            record={guideline as Record<string, unknown> | null}
            isLoading={isLoading}
            menuItems={crudMenuItems}
        />
    );
}
