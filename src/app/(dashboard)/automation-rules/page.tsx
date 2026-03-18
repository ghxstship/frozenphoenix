"use client";

import { ListPageShell } from "@/components/shells";
import { AUTOMATION_RULES_PAGE } from "@/config/list-page-configs";
import { useCreateAutomationRule } from "@/lib/supabase/hooks-automation";

export default function AutomationRulesPage() {
    const _create = useCreateAutomationRule();
    return <ListPageShell config={AUTOMATION_RULES_PAGE} />;
}
