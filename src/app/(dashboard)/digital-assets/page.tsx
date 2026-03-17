"use client";

import { ListPageShell } from "@/components/shells";
import { useDigitalAssets } from "@/lib/supabase";
import { DIGITAL_ASSETS_PAGE } from "@/config/list-page-configs";

export default function DigitalAssetsPage() {
    const { data: rawData, isLoading } = useDigitalAssets();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={DIGITAL_ASSETS_PAGE} data={data} isLoading={isLoading} />;
}
