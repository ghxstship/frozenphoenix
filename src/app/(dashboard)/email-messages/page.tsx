import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { EMAIL_MESSAGES_PAGE } from "@/config/list-page-configs";

export default async function EmailMessagesPage() {
    const data = await fetchEntityList("email_message");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={EMAIL_MESSAGES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
