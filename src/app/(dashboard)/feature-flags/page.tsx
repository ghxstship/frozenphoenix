"use client";

import { ListPageShell } from "@/components/shells";
import { PermissionGate } from "@/components/permission-guard";
import { useFeatureFlags } from "@/lib/settings/hooks";
import { FEATURE_FLAGS_PAGE } from "@/config/list-page-configs";

export default function FeatureFlagsPage() {
    const { data: rawData, isLoading } = useFeatureFlags();
    const data = (rawData ?? []) as unknown as Record<string, unknown>[];

    return (
        <PermissionGate resource="settings" action="manage">
            <ListPageShell config={FEATURE_FLAGS_PAGE} data={data} isLoading={isLoading} />
        </PermissionGate>
    );
}
