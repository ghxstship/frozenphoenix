import { TimeOffRequestsDetailClient } from "./_client";

export default async function TimeOffRequestsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <TimeOffRequestsDetailClient id={id} />;
}
