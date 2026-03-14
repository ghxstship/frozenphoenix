"use client";

import { ListPageShell } from "@/components/shells";
import { LOAD_PLANS_PAGE } from "@/config/list-page-configs";

export default function LoadPlansPage() {
    return <ListPageShell config={LOAD_PLANS_PAGE} />;
}
