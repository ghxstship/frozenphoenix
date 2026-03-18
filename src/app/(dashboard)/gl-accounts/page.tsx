"use client";

import { ListPageShell } from "@/components/shells";
import { useGlAccounts } from "@/lib/supabase";
import { GL_ACCOUNTS_PAGE } from "@/config/list-page-configs";
import { useCreateGlAccount, useUpdateGlAccount } from "@/lib/supabase/hooks-finance";

export default function GLAccountsPage() {
    const { data: rawData, isLoading } = useGlAccounts();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateGlAccount();
    const _update = useUpdateGlAccount();

    return <ListPageShell config={GL_ACCOUNTS_PAGE} data={data} isLoading={isLoading} />;
}
