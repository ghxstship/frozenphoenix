import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { MessagesPageClient } from "./_client";

export default async function MessagesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <MessagesPageClient />
        </Suspense>
    );
}
