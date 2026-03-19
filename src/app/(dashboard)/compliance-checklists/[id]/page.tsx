import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { ComplianceChecklistDetailClient } from "./_client";

export default async function ComplianceChecklistDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await fetchEntityDetail("compliance_checklist", id);
    return <ComplianceChecklistDetailClient id={id} initialRecord={record} />;
}
