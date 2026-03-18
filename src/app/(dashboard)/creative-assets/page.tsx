"use client";

import { ListPageShell } from "@/components/shells";
import { useCreativeAssets } from "@/lib/supabase";
import { useCreateCreativeAsset } from "@/lib/supabase/hooks-documents";
import { CREATIVE_ASSETS_PAGE } from "@/config/list-page-configs";

export default function CreativeAssetsPage() {
    const { data: rawData, isLoading } = useCreativeAssets();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateCreativeAsset();

    return <ListPageShell config={CREATIVE_ASSETS_PAGE} data={data} isLoading={isLoading} />;
}
