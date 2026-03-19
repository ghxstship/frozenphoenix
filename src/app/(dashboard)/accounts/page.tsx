import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ACCOUNTS_PAGE } from "@/config/list-page-configs";

export default async function AccountsPage() {
    const data = await fetchEntityList("account");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ACCOUNTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
