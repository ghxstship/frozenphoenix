"use client";

import { ListPageShell } from "@/components/shells";
import { useCaseStudies } from "@/lib/supabase";
import { CASE_STUDIES_PAGE } from "@/config/list-page-configs";

export default function CaseStudiesPage() {
    const { data: rawData, isLoading } = useCaseStudies();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={CASE_STUDIES_PAGE} data={data} isLoading={isLoading} />;
}
