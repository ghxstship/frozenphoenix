"use client";

import { ListPageShell } from "@/components/shells";
import { FOH_ZONES_PAGE } from "@/config/list-page-configs";

export default function FohZonesPage() {
    return <ListPageShell config={FOH_ZONES_PAGE} />;
}
