import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { TIMESHEETS_PAGE } from "@/config/list-page-configs";

export default async function TimesheetsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={TIMESHEETS_PAGE} />
        </Suspense>
    );
}
