"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_VAULT_DOCUMENT_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVaultDocuments } from "@/lib/supabase/hooks";
import { Clock, Eye, FileText, Link, Loader2, Lock, Plus, Shield } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { PermissionGate } from "@/components/permission-guard";

const ACCESS_LEVEL_LABELS: Record<string, string> = {
    exec: "Executive",
    director: "Director",
    pm: "Project Manager",
    member: "Team Member",
    client: "Client",
    collaborator: "Collaborator",
};

const categoryIcons: Record<string, typeof FileText> = {
    site_map: Shield,
    nda: Lock,
    permit: FileText,
    blueprint: FileText,
    contract: FileText,
    other: FileText,
};

export default function VaultPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const { data: sbDocs, isLoading } = useVaultDocuments();

    const docs = (sbDocs ?? []).map((doc) => ({
        id: doc.id,
        name: doc.name,
        category: doc.category,
        accessLevel: doc.access_level,
        uploadedBy: (doc as unknown as { profiles?: { name: string } }).profiles?.name || "Unknown",
        uploadedAt: (doc.created_at ?? new Date().toISOString()).split("T")[0],
        hasExpLink: !!(doc as unknown as { expiring_link_token?: string }).expiring_link_token,
        expLinkExpiry:
            (doc as unknown as { expiring_link_expires_at?: string }).expiring_link_expires_at ??
            undefined,
    }));

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    return (
        <PermissionGate resource="vault" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Secure Document Vault"
                    description="Encrypted storage with expiring view-only links for external stakeholders"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4" /> Upload Document
                    </Button>
                </PageHeader>

                <div className="space-y-3">
                    {docs.map((doc, i) => {
                        const Icon = categoryIcons[doc.category] || FileText;
                        return (
                            <StaggerItem key={doc.id} index={i} stagger="relaxed">
                                <Card>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold truncate">
                                                    {doc.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                                                    <Badge variant="ghost" className="text-[9px]">
                                                        {doc.category.replace("_", " ")}
                                                    </Badge>
                                                    <span>Uploaded by {doc.uploadedBy}</span>
                                                    <span>·</span>
                                                    <span>{doc.uploadedAt}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        doc.accessLevel === "exec"
                                                            ? "destructive"
                                                            : "warning"
                                                    }
                                                    className="text-[9px]"
                                                >
                                                    <Lock className="h-2.5 w-2.5 mr-0.5" />
                                                    {ACCESS_LEVEL_LABELS[doc.accessLevel] ??
                                                        doc.accessLevel}
                                                </Badge>
                                                {doc.hasExpLink && (
                                                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-info/10 text-info text-[10px] font-medium">
                                                        <Link className="h-3 w-3" />
                                                        Expiring Link
                                                        <Clock className="h-3 w-3 ml-0.5" />
                                                    </div>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7"
                                                    aria-label="View secret"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        );
                    })}
                </div>
            </div>
            <CreateEntityDialog config={CREATE_VAULT_DOCUMENT_CONFIG} open={createOpen} onClose={closeCreate} />
        </PermissionGate>
    );
}
