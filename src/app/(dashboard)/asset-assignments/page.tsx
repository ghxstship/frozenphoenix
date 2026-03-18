"use client";

import { ListPageShell } from "@/components/shells";
import { ASSET_ASSIGNMENTS_PAGE } from "@/config/list-page-configs";
import {
    useDeleteAssetAssignment,
    useUpdateAssetAssignment,
} from "@/lib/supabase/hooks-assets-inventory";

export default function Page() {
    const _update = useUpdateAssetAssignment();
    const _delete = useDeleteAssetAssignment();
    return <ListPageShell config={ASSET_ASSIGNMENTS_PAGE} />;
}
