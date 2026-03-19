import { ObligationsDetailClient } from "./_client";

export default async function ObligationsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ObligationsDetailClient id={id} />;
}
