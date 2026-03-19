import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function GLAccountsPage() {
    const data = await fetchEntityList("gl_account");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="GL_ACCOUNTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
