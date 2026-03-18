"use client";

import { ListPageShell } from "@/components/shells";
import { CONTRACT_AMENDMENTS_PAGE } from "@/config/list-page-configs";
import { useCreateContractAmendment, useUpdateContractAmendment } from "@/lib/supabase/hooks-legal";

export default function ContractAmendmentsPage() {
    const _create = useCreateContractAmendment();
    const _update = useUpdateContractAmendment();
    return <ListPageShell config={CONTRACT_AMENDMENTS_PAGE} />;
}
