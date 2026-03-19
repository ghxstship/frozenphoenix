import { BomsDetailClient } from "./_client";

export default async function BomsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BomsDetailClient id={id} initialRecord={null} />;
}
