import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function TechSheetsPage() {
    const data = await fetchEntityList("tech_sheet");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="TECH_SHEETS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
