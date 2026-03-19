import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { SURVEY_RESPONSES_PAGE } from "@/config/list-page-configs";

export default async function SurveyResponsesPage() {
    const data = await fetchEntityList("survey_response");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SURVEY_RESPONSES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
