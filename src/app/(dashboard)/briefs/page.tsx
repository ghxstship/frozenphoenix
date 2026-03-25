import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getConfigKeyForSlug } from "@/config/list-page-configs/slug-registry";
import type { ListPageConfigKey } from "@/config/list-page-configs/registry";
import { LoadingState } from "@/components/layouts/loading-state";
import { CatchAllClient } from "../[...slug]/_client";

export default function Page() {
    const configKey = getConfigKeyForSlug("briefs");
    if (!configKey) notFound();
    return (
        <Suspense fallback={<LoadingState variant="table" rows={8} />}>
            <CatchAllClient configKey={configKey as ListPageConfigKey} />
        </Suspense>
    );
}
