import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { AccountDetailClient } from "./_client";

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("account", id);
    return <AccountDetailClient id={id} initialRecord={record} />;
}
