import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { EXPENSES_PAGE } from "@/config/list-page-configs";

export default async function ExpensesPage() {
    const data = await fetchEntityList("expense");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={EXPENSES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
