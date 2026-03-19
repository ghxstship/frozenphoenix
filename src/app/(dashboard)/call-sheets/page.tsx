import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CallSheetsPage() {
    const data = await fetchEntityList("call_sheet");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CALL_SHEETS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
