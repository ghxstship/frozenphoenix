import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ExpensesPage() {
    const data = await fetchEntityList("expense");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="EXPENSES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
