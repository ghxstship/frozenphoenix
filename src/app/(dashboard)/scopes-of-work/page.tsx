"use client";

import { ListPageShell } from "@/components/shells";
import { useScopesOfWork } from "@/lib/supabase";
import {
    useCreateDeliverableProgressSnapshot,
    useCreateInvoiceTimeEntry,
    useCreateScopeOfWork,
    useCreateSOWDeliverable,
    useDeleteSOWDeliverable,
    useDeliverableProgressSnapshots,
    useUpdateSOWDeliverable,
} from "@/lib/supabase/hooks-sow";
import { SCOPES_OF_WORK_PAGE } from "@/config/list-page-configs";

export default function ScopesOfWorkPage() {
    const { data: rawData, isLoading } = useScopesOfWork();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _createSow = useCreateScopeOfWork();
    const _createDeliverable = useCreateSOWDeliverable();
    const _updateDeliverable = useUpdateSOWDeliverable();
    const _deleteDeliverable = useDeleteSOWDeliverable();
    const { data: _snapshots } = useDeliverableProgressSnapshots("");
    const _createSnapshot = useCreateDeliverableProgressSnapshot();
    const _createTimeEntry = useCreateInvoiceTimeEntry();

    return <ListPageShell config={SCOPES_OF_WORK_PAGE} data={data} isLoading={isLoading} />;
}
