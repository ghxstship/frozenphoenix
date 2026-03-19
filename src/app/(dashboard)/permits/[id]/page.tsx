import { PermitDetailClient } from "./_client";

export default async function PermitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <PermitDetailClient id={id} initialRecord={null} />;
}
