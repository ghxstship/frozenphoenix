import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CreditNotesPage() {
    const data = await fetchEntityList("credit_note");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CREDIT_NOTES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
