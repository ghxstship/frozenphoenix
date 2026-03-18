"use client";

import { ListPageShell } from "@/components/shells";
import { EMAIL_MESSAGES_PAGE } from "@/config/list-page-configs";
import { useCreateEmailMessage } from "@/lib/supabase/hooks-automation";

export default function Page() {
    const _create = useCreateEmailMessage();
    return <ListPageShell config={EMAIL_MESSAGES_PAGE} />;
}
