import { UpsellTriggersDetailClient } from "./_client";

export default async function UpsellTriggersDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <UpsellTriggersDetailClient id={id} />;
}
