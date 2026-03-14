"use client";

import { ListPageShell } from "@/components/shells";
import { INVITATIONS_PAGE } from "@/config/list-page-configs";

export default function InvitationsPage() {
    return <ListPageShell config={INVITATIONS_PAGE} />;
}
