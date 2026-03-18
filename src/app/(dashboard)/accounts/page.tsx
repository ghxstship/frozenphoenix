"use client";

import { ListPageShell } from "@/components/shells";
import { useAccounts } from "@/lib/supabase";
import { ACCOUNTS_PAGE } from "@/config/list-page-configs";
import { useCreateAccount } from "@/lib/supabase/hooks-crm";

export default function AccountsPage() {
    const { data: rawData, isLoading } = useAccounts();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateAccount();

    return <ListPageShell config={ACCOUNTS_PAGE} data={data} isLoading={isLoading} />;
}
