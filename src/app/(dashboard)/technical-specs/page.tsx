"use client";

import { ListPageShell } from "@/components/shells";
import { TECHNICAL_SPECS_PAGE } from "@/config/list-page-configs";

export default function TechnicalSpecsPage() {
    return <ListPageShell config={TECHNICAL_SPECS_PAGE} />;
}
