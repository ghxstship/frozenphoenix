"use client";

import { ListPageShell } from "@/components/shells";
import { useProjectTemplates } from "@/lib/supabase";
import { TEMPLATES_PAGE } from "@/config/list-page-configs";

export default function TemplatesPage() {
    const { data: rawData, isLoading } = useProjectTemplates();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={TEMPLATES_PAGE} data={data} isLoading={isLoading} />;
}
