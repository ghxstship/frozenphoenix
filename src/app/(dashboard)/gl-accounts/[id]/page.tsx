import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { GlAccountsDetailClient } from "./_client";

export default async function GlAccountsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("gl-accounts", id);
    return <GlAccountsDetailClient id={id} initialRecord={initialRecord} />;
}
