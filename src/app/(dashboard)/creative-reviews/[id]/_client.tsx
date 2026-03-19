"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Eye } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "creative_review",
    titleKey: "title",
    statusKey: "status",
    icon: Eye,
    backHref: "/creative-reviews",
    backLabel: "Creative Reviews",
    chatterRecordType: "creative_review",
    fields: [],
    tabs: [],
};

export function CreativeReviewsDetailClient({ id }: { id: string }) {
    return <DetailPageShell config={CONFIG} id={id} />;
}
