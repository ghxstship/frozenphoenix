import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getConfigKeyForSlug } from "@/config/list-page-configs/slug-registry";
import type { ListPageConfigKey } from "@/config/list-page-configs/registry";
import { LoadingState } from "@/components/layouts/loading-state";
import { CatchAllClient } from "./_client";

interface Props {
    params: Promise<{ slug: string[] }>;
}

export default async function CatchAllPage({ params }: Props) {
    const { slug } = await params;

    // Resolve the first slug segment to a config key
    const configKey = getConfigKeyForSlug(slug[0]!);
    if (!configKey) {
        notFound();
    }

    return (
        <Suspense fallback={<LoadingState variant="table" rows={8} />}>
            <CatchAllClient configKey={configKey as ListPageConfigKey} />
        </Suspense>
    );
}
