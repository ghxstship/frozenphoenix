import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { CallSheetDetailClient } from "./_client";

export default async function CallSheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("call_sheet", id);
    return <CallSheetDetailClient id={id} initialRecord={record} />;
}
