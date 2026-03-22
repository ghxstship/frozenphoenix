import { Suspense } from "react";
import { DealsPageClient } from "./client";

export default function DealsPage() {
    return (
        <Suspense>
            <DealsPageClient />
        </Suspense>
    );
}
