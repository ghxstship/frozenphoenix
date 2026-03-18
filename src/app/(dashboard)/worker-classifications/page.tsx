"use client";

import { ListPageShell } from "@/components/shells";
import { WORKER_CLASSIFICATIONS_PAGE } from "@/config/list-page-configs";
import {
    useCreateWorkerClassification,
    useUpdateWorkerClassification,
    useWorkerClassification,
    useWorkerClassifications,
} from "@/lib/supabase/hooks-workforce";

export default function Page() {
    const { data: _items } = useWorkerClassifications();
    const { data: _detail } = useWorkerClassification("");
    const _create = useCreateWorkerClassification();
    const _update = useUpdateWorkerClassification();
    return <ListPageShell config={WORKER_CLASSIFICATIONS_PAGE} />;
}
