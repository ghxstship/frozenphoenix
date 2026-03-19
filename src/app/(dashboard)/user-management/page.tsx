import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { USER_MANAGEMENT_PAGE } from "@/config/list-page-configs";

export default async function UserManagementPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={USER_MANAGEMENT_PAGE} />
        </Suspense>
    );
}
