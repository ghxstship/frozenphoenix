import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ContactsPage() {
    const data = await fetchEntityList("contact");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CONTACTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
