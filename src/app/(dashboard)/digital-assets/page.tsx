"use client";

import { ListPageShell } from "@/components/shells";
import { useDigitalAssets } from "@/lib/supabase";
import { useCreateDigitalAsset } from "@/lib/supabase/hooks-documents";
import { DIGITAL_ASSETS_PAGE } from "@/config/list-page-configs";

export default function DigitalAssetsPage() {
    const { data: rawData, isLoading } = useDigitalAssets();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateDigitalAsset();

    return <ListPageShell config={DIGITAL_ASSETS_PAGE} data={data} isLoading={isLoading} />;
}
