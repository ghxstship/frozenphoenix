"use client";

import { ListPageShell } from "@/components/shells";
import { useCaseStudies } from "@/lib/supabase/hooks";
import { CREATE_CASE_STUDY_CONFIG } from "@/config/create-entity-configs";
import { Award } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "case_studies",
    title: "Case Studies",
    description: "Auto-published from completed productions",
    icon: Award,
    createConfig: CREATE_CASE_STUDY_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function CaseStudiesPage() {
    const { data: rawData, isLoading } = useCaseStudies();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
