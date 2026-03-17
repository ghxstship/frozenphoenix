"use client";

import { ListPageShell } from "@/components/shells";
import { useCreativeAssets } from "@/lib/supabase";
import { CREATIVE_ASSETS_PAGE } from "@/config/list-page-configs";

export default function CreativeAssetsPage() {
    const { data: rawData, isLoading } = useCreativeAssets();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={CREATIVE_ASSETS_PAGE} data={data} isLoading={isLoading} />;
}
