"use client";

import { ListPageShell } from "@/components/shells";
import { WORK_PACKAGES_PAGE } from "@/config/list-page-configs";

export default function WorkPackagesPage() {
    return <ListPageShell config={WORK_PACKAGES_PAGE} />;
}
