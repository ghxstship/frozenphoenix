"use client";

import { ListPageShell } from "@/components/shells";
import { useSavedViews } from "@/lib/supabase";
import { SAVED_VIEWS_PAGE } from "@/config/list-page-configs";

export default function SavedViewsPage() {
    const { data: rawData, isLoading } = useSavedViews();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={SAVED_VIEWS_PAGE} data={data} isLoading={isLoading} />;
}
