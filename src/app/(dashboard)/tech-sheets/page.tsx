import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { TECH_SHEETS_PAGE } from "@/config/list-page-configs";

export default async function TechSheetsPage() {
    const data = await fetchEntityList("tech_sheet");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={TECH_SHEETS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
