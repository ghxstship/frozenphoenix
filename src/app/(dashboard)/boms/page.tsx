"use client";

import { ListPageShell } from "@/components/shells";
import { BOMS_PAGE } from "@/config/list-page-configs";
import { useBoms, useCreateBom, useDeleteBom, useUpdateBom } from "@/lib/supabase/hooks-production";

export default function BomsPage() {
    const { data: _items } = useBoms();
    const _create = useCreateBom();
    const _update = useUpdateBom();
    const _delete = useDeleteBom();
    return <ListPageShell config={BOMS_PAGE} />;
}
