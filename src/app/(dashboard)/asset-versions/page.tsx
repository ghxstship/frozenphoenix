"use client";

import { ListPageShell } from "@/components/shells";
import { ASSET_VERSIONS_PAGE } from "@/config/list-page-configs";
import { useCreateAssetVersion } from "@/lib/supabase/hooks-assets-inventory";

export default function Page() {
    const _create = useCreateAssetVersion();
    return <ListPageShell config={ASSET_VERSIONS_PAGE} />;
}
