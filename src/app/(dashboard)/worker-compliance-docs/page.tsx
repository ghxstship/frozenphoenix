"use client";

import { ListPageShell } from "@/components/shells";
import { WORKER_COMPLIANCE_DOCS_PAGE } from "@/config/list-page-configs";
import {
    useCreateWorkerComplianceDoc,
    useUpdateWorkerComplianceDoc,
    useWorkerComplianceDoc,
    useWorkerComplianceDocs,
} from "@/lib/supabase/hooks-workforce";

export default function Page() {
    const { data: _items } = useWorkerComplianceDocs();
    const { data: _detail } = useWorkerComplianceDoc("");
    const _create = useCreateWorkerComplianceDoc();
    const _update = useUpdateWorkerComplianceDoc();
    return <ListPageShell config={WORKER_COMPLIANCE_DOCS_PAGE} />;
}
