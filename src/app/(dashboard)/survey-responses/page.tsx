import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function SurveyResponsesPage() {
    const data = await fetchEntityList("survey_response");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="SURVEY_RESPONSES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
