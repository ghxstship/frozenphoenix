import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { CatchAllClient } from "@/app/(dashboard)/[...slug]/_client";

export default async function Page() {
    return (
        <Suspense fallback={<LoadingState variant="table" rows={8} />}>
            <CatchAllClient configKey="ROLES_PAGE" />
        </Suspense>
    );
}
