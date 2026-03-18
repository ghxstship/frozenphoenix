"use client";

import { ListPageShell } from "@/components/shells";
import { CONTRACT_OBLIGATIONS_PAGE } from "@/config/list-page-configs";
import {
    useCreateContractObligation,
    useUpdateContractObligation,
} from "@/lib/supabase/hooks-legal";

export default function Page() {
    const _create = useCreateContractObligation();
    const _update = useUpdateContractObligation();
    return <ListPageShell config={CONTRACT_OBLIGATIONS_PAGE} />;
}
