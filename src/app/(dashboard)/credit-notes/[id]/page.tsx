import { CreditNotesDetailClient } from "./_client";

export default async function CreditNotesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <CreditNotesDetailClient id={id} />;
}
