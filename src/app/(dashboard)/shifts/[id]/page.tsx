import { ShiftsDetailClient } from "./_client";

export default async function ShiftsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ShiftsDetailClient id={id} initialRecord={null} />;
}
