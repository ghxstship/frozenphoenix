"use client";

import { ListPageShell } from "@/components/shells";
import { CONTACTS_PAGE } from "@/config/list-page-configs";
import { useCreateContact } from "@/lib/supabase/hooks-crm";

export default function ContactsPage() {
    const _create = useCreateContact();
    return <ListPageShell config={CONTACTS_PAGE} />;
}
