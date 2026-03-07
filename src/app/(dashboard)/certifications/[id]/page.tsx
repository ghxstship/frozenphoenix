"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteCertification, useUpdateCertification } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { CERT_TYPE_LABELS, getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatDate } from "@/lib/locale";
import { AlertTriangle, BadgeCheck, Calendar, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCertification } from "@/lib/supabase/hooks-pages";

type TabId = "details" | "documents" | "chatter";
const TAB_VALUES = ["details", "documents", "chatter"] as const;

export default function CertificationDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: cert, isLoading } = useCertification(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Certification",
        listPath: "/certifications",
        useUpdateHook: useUpdateCertification,
        useDeleteHook: useDeleteCertification,
    });
    void router;
    void handleUpdate;

    const [chatterComments, setChatterComments] = useState<CommentItem[]>(makeMockComments());

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!cert) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Record not found</p>
            </div>
        );
    }
    const assetName = cert.asset_id;
    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Sarah Chen",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "documents" as const, label: "Documents" },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Certification Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(cert.status)}>
                            {getStatusLabel(cert.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline">
                            {CERT_TYPE_LABELS[cert.cert_type] ?? cert.cert_type}
                        </Badge>
                    </div>
                    {cert.cert_number && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Cert #</span>
                            <span className="font-mono text-xs">{cert.cert_number}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Blocks Usage</span>
                        <Badge variant={cert.blocks_usage ? "destructive" : "ghost"}>
                            {cert.blocks_usage ? "Yes" : "No"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Asset</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    <p className="font-medium">{assetName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cert.asset_id}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Issuer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Issued By</span>
                        <span className="font-medium text-xs text-right max-w-[140px]">
                            {cert.issued_by}
                        </span>
                    </div>
                    {cert.issuer_license && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">License</span>
                            <span className="font-mono text-xs">{cert.issuer_license}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Issued</span>
                        <span className="font-medium">
                            {formatDate(cert.issued_date, "compact")}
                        </span>
                    </div>
                    {cert.expiry_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires</span>
                            <span className="font-medium">
                                {formatDate(cert.expiry_date, "compact")}
                            </span>
                        </div>
                    )}
                    {cert.next_inspection_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Inspection</span>
                            <span className="font-medium">
                                {formatDate(cert.next_inspection_date, "compact")}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/certifications"
            backLabel="Certifications"
            entityType="certifications"
            entityId={entityId}
            title={cert.title}
            subtitle={`${assetName} · ${CERT_TYPE_LABELS[cert.cert_type] ?? cert.cert_type}`}
            status={cert.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <BadgeCheck className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule Inspection
                    </Button>
                    <Button size="sm">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Renew
                    </Button>
                </div>
            }
            menuItems={[
                { label: "Edit Certification", onClick: () => {} },
                { label: "Upload Document", onClick: () => {} },
                ...crudMenuItems,
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "details" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <BadgeCheck className="h-5 w-5 text-success" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <p className="text-sm font-bold capitalize">
                                            {cert.status.replace(/_/g, " ")}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-info" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Issued</p>
                                        <p className="text-sm font-semibold">
                                            {formatDate(cert.issued_date, "compact")}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    {cert.blocks_usage ? (
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5 text-success" />
                                    )}
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Blocks Usage
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {cert.blocks_usage ? "Yes — Blocking" : "No"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Issuer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Issued By</span>
                                <span className="font-medium">{cert.issued_by}</span>
                            </div>
                            {cert.issuer_license && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">License #</span>
                                    <span className="font-mono text-xs">{cert.issuer_license}</span>
                                </div>
                            )}
                            {cert.cert_number && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Certification #</span>
                                    <span className="font-mono text-xs">{cert.cert_number}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {cert.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {cert.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "documents" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {cert.document_url ? (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Certification Document
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {cert.cert_type} certificate
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    View
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-6">
                                No documents uploaded yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="certification"
                    recordId={cert.id}
                    activityItems={makeMockActivity("certification")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
