import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { SURVEY_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default async function SurveyTemplatesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SURVEY_TEMPLATES_PAGE} />
        </Suspense>
    );
}
