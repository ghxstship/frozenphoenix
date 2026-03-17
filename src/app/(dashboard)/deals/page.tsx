// Performance: Server Component — data fetched during SSR, arrives WITH the HTML.
// Eliminates the JS→hydrate→fetch→render waterfall for this page.

import { prefetchList } from "@/lib/api/server-prefetch";
import { DealsPageClient } from "./client";

export default async function DealsPage() {
    const { data } = await prefetchList("/api/deals");
    return <DealsPageClient initialData={data as Record<string, unknown>[]} />;
}
