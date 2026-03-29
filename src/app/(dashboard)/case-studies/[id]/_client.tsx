"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { BookOpen } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "case_study",
    titleKey: "title",
    statusKey: "status",
    icon: BookOpen,
    backHref: "/case-studies",
    backLabel: "Case Studies",
    chatterRecordType: "case_study",
    fields: [],
    relatedEntities: [
        {
            title: "Testimonials",
            entityKey: "testimonial",
            foreignKey: "case_study_id",
            columns: [
                { id: "author_name", header: "Author", accessorKey: "author_name" },
                { id: "quote", header: "Quote", accessorKey: "quote" },
                { id: "created_at", header: "Date", accessorKey: "created_at", fieldType: "date" },
            ],
        },
    ],
    tabs: [],
};

export function CaseStudiesDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord?: Record<string, unknown> | null;
}) {
    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={initialRecord as Record<string, unknown> | undefined}
        />
    );
}
