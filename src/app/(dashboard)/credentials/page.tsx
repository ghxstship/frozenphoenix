import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function CredentialsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CREDENTIALS_PAGE" />
        </Suspense>
    );
}
