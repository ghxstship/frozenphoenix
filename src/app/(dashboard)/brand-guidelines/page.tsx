"use client";

import { ListPageShell } from "@/components/shells";
import { useBrandGuidelines } from "@/lib/supabase/hooks-pages";
import { CREATE_BRAND_GUIDELINE_CONFIG } from "@/config/create-entity-configs";
import { Accessibility } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "brand_guidelines",
    title: "Brand Guidelines",
    description:
        "Multi-brand governance with versioned visual identity, typography, voice, and compliance standards",
    icon: Accessibility,
    createConfig: CREATE_BRAND_GUIDELINE_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function BrandGuidelinesPage() {
    const { data: rawData, isLoading } = useBrandGuidelines();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
