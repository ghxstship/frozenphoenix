"use client";

import { useDeleteDocument, useDocument, useUpdateDocument } from "@/lib/supabase";
import { useDocumentVersions } from "@/lib/supabase/hooks-documents";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, History, Loader2 } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

function DocumentVersionsTab() {
    const { data: versions, isLoading } = useDocumentVersions();
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!versions || versions.length === 0)
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No document versions found.
                </CardContent>
            </Card>
        );
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Document Versions ({versions.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {versions.map((v) => (
                        <div
                            key={v.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                    v{String(v.version_number ?? "?")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {String(
                                        (v as unknown as Record<string, unknown>).change_summary ??
                                            ""
                                    )}
                                </p>
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                                {String(
                                    (v as unknown as Record<string, unknown>).created_by ?? ""
                                ).slice(0, 8)}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

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
    tabs: [{ id: "versions", label: "Versions", content: <DocumentVersionsTab /> }],
};

export function DocumentDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: doc, isLoading } = useDocument(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Document",
        listPath: "/documents",
        useUpdateHook: useUpdateDocument,
        useDeleteHook: useDeleteDocument,
    });

    const rec = (doc ?? initialRecord) as Record<string, unknown> | null;
    const url = rec?.url as string | undefined;

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={rec}
            isLoading={isLoading && !initialRecord}
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
