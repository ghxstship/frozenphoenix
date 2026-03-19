import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { CalendarPageClient } from "./_client";

export default async function CalendarPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <CalendarPageClient />
        </Suspense>
    );
}
