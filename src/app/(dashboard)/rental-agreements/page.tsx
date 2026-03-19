import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function RentalAgreementsPage() {
    const data = await fetchEntityList("rental_agreement");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="RENTAL_AGREEMENTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
