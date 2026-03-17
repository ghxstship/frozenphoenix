"use client";

import { ListPageShell } from "@/components/shells";
import { useAdvances } from "@/lib/supabase/hooks-advancing";
import { PRODUCTION_ADVANCES_PAGE } from "@/config/list-page-configs";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    ...PRODUCTION_ADVANCES_PAGE,
    title: "Advancing",
};

export default function AdvancingPage() {
    const { data: rawData, isLoading } = useAdvances();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
