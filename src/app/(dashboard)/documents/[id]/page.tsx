"use client";

import { useParams } from "next/navigation";
import { useDeleteDocument, useDocument, useUpdateDocument } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "documents",
    titleKey: "name",
    subtitleFn: (r) => `${String(r.category ?? "")} · ${String(r.mime_type ?? "")}`,
    statusKey: "category",
    icon: FileText,
    backHref: "/documents",
    backLabel: "Documents",
    chatterRecordType: "document",
    sidebarFields: [
        { id: "category", label: "Category", accessorKey: "category" },
        { id: "access_level", label: "Access Level", accessorKey: "access_level" },
        { id: "size", label: "Size", accessorKey: "size" },
        { id: "mime_type", label: "Type", accessorKey: "mime_type" },
        { id: "created_at", label: "Uploaded", accessorKey: "created_at", fieldType: "date" },
    ],
    fields: [
        { id: "access_level", label: "Access Level", accessorKey: "access_level" },
        { id: "created_at", label: "Uploaded", accessorKey: "created_at", fieldType: "date" },
        { id: "uploaded_by", label: "Uploaded By", accessorKey: "uploaded_by" },
        { id: "url", label: "File URL", accessorKey: "url" },
        { id: "expiring_link_url", label: "Expiring Link", accessorKey: "expiring_link_url" },
    ],
};

export default function DocumentDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: doc, isLoading } = useDocument(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Document",
        listPath: "/documents",
        useUpdateHook: useUpdateDocument,
        useDeleteHook: useDeleteDocument,
    });

    const rec = doc as Record<string, unknown> | null;
    const url = rec?.url as string | undefined;

    return (
        <DetailPageShell
            config={CONFIG}
            id={entityId}
            record={rec}
            isLoading={isLoading}
            menuItems={crudMenuItems}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileText className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                url ? (
                    <Button size="sm" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </a>
                    </Button>
                ) : undefined
            }
        />
    );
}
