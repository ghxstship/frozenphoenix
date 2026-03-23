import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ContactDetailClient } from "./_client";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("contacts", id);
    return <ContactDetailClient id={id} initialRecord={initialRecord} />;
}
