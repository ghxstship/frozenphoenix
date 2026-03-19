import { SopsDetailClient } from "./_client";

export default async function SopsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <SopsDetailClient id={id} initialRecord={null} />;
}
