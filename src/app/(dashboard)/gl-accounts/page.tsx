import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { GL_ACCOUNTS_PAGE } from "@/config/list-page-configs";

export default async function GLAccountsPage() {
    const data = await fetchEntityList("gl_account");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={GL_ACCOUNTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
