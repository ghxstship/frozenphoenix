"use client";

import { ListPageShell } from "@/components/shells";
import { AUTOMATION_EXECUTIONS_PAGE } from "@/config/list-page-configs";
import {
    useAutomationExecutions,
    useCreateAutomationExecution,
    useUpdateAutomationExecution,
} from "@/lib/supabase/hooks-automation";

export default function Page() {
    const { data: _items } = useAutomationExecutions();
    const _create = useCreateAutomationExecution();
    const _update = useUpdateAutomationExecution();
    return <ListPageShell config={AUTOMATION_EXECUTIONS_PAGE} />;
}
