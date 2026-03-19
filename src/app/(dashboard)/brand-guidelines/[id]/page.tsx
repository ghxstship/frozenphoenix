import { BrandGuidelineDetailClient } from "./_client";

export default async function BrandGuidelineDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <BrandGuidelineDetailClient id={id} initialRecord={null} />;
}
