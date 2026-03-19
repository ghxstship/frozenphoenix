import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { TESTIMONIALS_PAGE } from "@/config/list-page-configs";

export default async function TestimonialsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={TESTIMONIALS_PAGE} />
        </Suspense>
    );
}
