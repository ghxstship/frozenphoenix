import { CaseStudiesDetailClient } from "./_client";

export default async function CaseStudiesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <CaseStudiesDetailClient id={id} />;
}
