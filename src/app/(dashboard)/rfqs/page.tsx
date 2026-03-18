"use client";

import { ListPageShell } from "@/components/shells";
import { RFQS_PAGE } from "@/config/list-page-configs";
import {
    useCreateRFQ,
    useDeleteRFQ,
    useRFQ,
    useRFQs,
    useUpdateRFQ,
} from "@/lib/supabase/hooks-legal";

export default function RfqsPage() {
    const { data: _items } = useRFQs();
    const { data: _detail } = useRFQ("");
    const _create = useCreateRFQ();
    const _update = useUpdateRFQ();
    const _delete = useDeleteRFQ();
    return <ListPageShell config={RFQS_PAGE} />;
}
