"use client";

import { ListPageShell } from "@/components/shells";
import { STRIKE_SEQUENCES_PAGE } from "@/config/list-page-configs";

export default function StrikeSequencesPage() {
    return <ListPageShell config={STRIKE_SEQUENCES_PAGE} />;
}
