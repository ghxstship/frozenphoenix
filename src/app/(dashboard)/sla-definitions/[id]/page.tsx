import { SlaDefinitionsDetailClient } from "./_client";

export default async function SlaDefinitionsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <SlaDefinitionsDetailClient id={id} />;
}
