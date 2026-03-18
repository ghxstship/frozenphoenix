"use client";

import { ListPageShell } from "@/components/shells";
import { ASSET_TAGS_PAGE } from "@/config/list-page-configs";
import { useCreateAssetTag, useDeleteAssetTag } from "@/lib/supabase/hooks-assets-inventory";

export default function Page() {
    const _create = useCreateAssetTag();
    const _delete = useDeleteAssetTag();
    return <ListPageShell config={ASSET_TAGS_PAGE} />;
}
