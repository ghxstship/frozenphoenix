import { CallSheetDetailClient } from "./_client";

export default async function CallSheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CallSheetDetailClient id={id} initialRecord={null} />;
}
