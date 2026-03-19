import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { TechSheetDetailClient } from "./_client";

export default async function TechSheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("tech_sheet", id);
    return <TechSheetDetailClient id={id} initialRecord={record} />;
}
