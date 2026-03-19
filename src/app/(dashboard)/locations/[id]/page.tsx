import { LocationDetailClient } from "./_client";

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <LocationDetailClient id={id} initialRecord={null} />;
}
