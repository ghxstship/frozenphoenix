import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { RENTAL_AGREEMENTS_PAGE } from "@/config/list-page-configs";

export default async function RentalAgreementsPage() {
    const data = await fetchEntityList("rental_agreement");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={RENTAL_AGREEMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
