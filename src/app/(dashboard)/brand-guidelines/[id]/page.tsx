import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { BrandGuidelineDetailClient } from "./_client";

export default async function BrandGuidelineDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("brand_guideline", id);
    return <BrandGuidelineDetailClient id={id} initialRecord={record} />;
}
