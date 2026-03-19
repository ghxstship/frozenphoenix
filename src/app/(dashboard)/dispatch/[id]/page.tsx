import { DispatchDetailClient } from "./_client";

export default async function DispatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <DispatchDetailClient id={id} initialRecord={null} />;
}
