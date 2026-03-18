"use client";

import { ListPageShell } from "@/components/shells";
import { useAllQualityChecks } from "@/lib/supabase";
import {
    useCreateQualityCheck,
    useQualityChecks,
    useQualityCheckTemplates,
    useUpdateQualityCheck,
} from "@/lib/supabase/hooks-feature-gaps";
import { QUALITY_CHECKS_PAGE } from "@/config/list-page-configs";

export default function QualityChecksPage() {
    const { data: rawData, isLoading } = useAllQualityChecks();
    const data = (rawData ?? []) as unknown as Record<string, unknown>[];
    const { data: _templates } = useQualityCheckTemplates();
    const { data: _checks } = useQualityChecks("", "");
    const _create = useCreateQualityCheck();
    const _update = useUpdateQualityCheck();

    return <ListPageShell config={QUALITY_CHECKS_PAGE} data={data} isLoading={isLoading} />;
}
