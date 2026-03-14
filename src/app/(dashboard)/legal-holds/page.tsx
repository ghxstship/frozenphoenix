"use client";

import { ListPageShell } from "@/components/shells";
import { LEGAL_HOLDS_PAGE } from "@/config/list-page-configs";

export default function LegalHoldsPage() {
    return <ListPageShell config={LEGAL_HOLDS_PAGE} />;
}
