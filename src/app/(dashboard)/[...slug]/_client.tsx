"use client";

import { ListPageShell } from "@/components/shells";
import type { ListPageConfigKey } from "@/config/list-page-configs/registry";

export function CatchAllClient({ configKey }: { configKey: ListPageConfigKey }) {
    return <ListPageShell configKey={configKey} />;
}
