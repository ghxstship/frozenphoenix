"use client";

import { ListPageShell } from "@/components/shells";
import { E_SIGNATURES_PAGE } from "@/config/list-page-configs";
import { useCreateESignature } from "@/lib/supabase/hooks-workflows";

export default function ESignaturesPage() {
    const _create = useCreateESignature();
    return <ListPageShell config={E_SIGNATURES_PAGE} />;
}
