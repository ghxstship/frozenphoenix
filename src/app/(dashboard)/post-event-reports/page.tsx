"use client";

import { ListPageShell } from "@/components/shells";
import { POST_EVENT_REPORTS_PAGE } from "@/config/list-page-configs";
import {
    useCreateLiveFinancialSnapshot,
    useCreatePostEventReport,
    useUpdatePostEventReport,
} from "@/lib/supabase/hooks-live-ops";

export default function PostEventReportsPage() {
    const _create = useCreatePostEventReport();
    const _update = useUpdatePostEventReport();
    const _createSnapshot = useCreateLiveFinancialSnapshot();
    return <ListPageShell config={POST_EVENT_REPORTS_PAGE} />;
}
