import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { CREDENTIALS_PAGE } from "@/config/list-page-configs";

export default async function CredentialsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CREDENTIALS_PAGE} />
        </Suspense>
    );
}
