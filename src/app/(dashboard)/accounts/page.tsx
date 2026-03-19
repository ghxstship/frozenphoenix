import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function AccountsPage() {
    const data = await fetchEntityList("account");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="ACCOUNTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
