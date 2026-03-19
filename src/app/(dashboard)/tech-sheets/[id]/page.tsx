import { TechSheetDetailClient } from "./_client";

export default async function TechSheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <TechSheetDetailClient id={id} initialRecord={null} />;
}
