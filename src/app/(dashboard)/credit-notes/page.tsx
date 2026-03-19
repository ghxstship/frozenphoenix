import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CREDIT_NOTES_PAGE } from "@/config/list-page-configs";

export default async function CreditNotesPage() {
    const data = await fetchEntityList("credit_note");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CREDIT_NOTES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
