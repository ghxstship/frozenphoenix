"use client";

import { ListPageShell } from "@/components/shells";
import { useGlAccounts } from "@/lib/supabase";
import { GL_ACCOUNTS_PAGE } from "@/config/list-page-configs";

export default function GLAccountsPage() {
    const { data: rawData, isLoading } = useGlAccounts();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={GL_ACCOUNTS_PAGE} data={data} isLoading={isLoading} />;
}
