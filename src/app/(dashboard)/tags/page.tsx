"use client";

import { ListPageShell } from "@/components/shells";
import { TAGS_PAGE } from "@/config/list-page-configs/system";
import {
    useCreateTag,
    useDeleteTag,
    useTag,
    useTags,
    useUpdateTag,
} from "@/lib/supabase/hooks-admin";

export default function TagsPage() {
    const { data: _items } = useTags();
    const { data: _detail } = useTag("");
    const _create = useCreateTag();
    const _update = useUpdateTag();
    const _delete = useDeleteTag();
    return <ListPageShell config={TAGS_PAGE} />;
}
