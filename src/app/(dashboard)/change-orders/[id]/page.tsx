import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { ChangeOrderDetailClient } from "./_client";

export default async function ChangeOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("change_order", id);
    return <ChangeOrderDetailClient id={id} initialRecord={record} />;
}
