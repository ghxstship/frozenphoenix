import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { TimesheetsDetailClient } from "./_client";

export default async function TimesheetsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("timesheets", id);
    return <TimesheetsDetailClient id={id} initialRecord={initialRecord} />;
}
