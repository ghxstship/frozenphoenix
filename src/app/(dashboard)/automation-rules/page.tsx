"use client";

import { ListPageShell } from "@/components/shells";
import { AUTOMATION_RULES_PAGE } from "@/config/list-page-configs";

export default function AutomationRulesPage() {
    return <ListPageShell config={AUTOMATION_RULES_PAGE} />;
}
