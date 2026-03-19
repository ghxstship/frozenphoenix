import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function TimesheetsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="TIMESHEETS_PAGE" />
        </Suspense>
    );
}
