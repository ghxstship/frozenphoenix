import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { AUTOMATION_RULES_PAGE } from "@/config/list-page-configs";

export default async function AutomationRulesPage() {
    const data = await fetchEntityList("automation_rule");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={AUTOMATION_RULES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
