"use client";

import { ListPageShell } from "@/components/shells";
import { useAllQualityChecks } from "@/lib/supabase";
import { QUALITY_CHECKS_PAGE } from "@/config/list-page-configs";

export default function QualityChecksPage() {
    const { data: rawData, isLoading } = useAllQualityChecks();
    const data = (rawData ?? []) as unknown as Record<string, unknown>[];

    return <ListPageShell config={QUALITY_CHECKS_PAGE} data={data} isLoading={isLoading} />;
}
