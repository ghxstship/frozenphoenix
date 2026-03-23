import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { AccountDetailClient } from "./_client";

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("accounts", id);
    return <AccountDetailClient id={id} initialRecord={initialRecord} />;
}
