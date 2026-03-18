"use client";

import { ListPageShell } from "@/components/shells";
import { KITS_PAGE } from "@/config/list-page-configs";
import {
    useCreateKit,
    useDeleteKit,
    useKit,
    useKits,
    useUpdateKit,
} from "@/lib/supabase/hooks-assets-inventory";

export default function KitsPage() {
    const { data: _items } = useKits();
    const { data: _detail } = useKit("");
    const _create = useCreateKit();
    const _update = useUpdateKit();
    const _delete = useDeleteKit();
    return <ListPageShell config={KITS_PAGE} />;
}
