"use client";

import { useParams, useRouter } from "next/navigation";
import {
    useCertification,
    useDeleteCertification,
    useUpdateCertification,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CERT_TYPE_LABELS, getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatDate } from "@/lib/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { AlertTriangle, BadgeCheck, Calendar, CheckCircle2, FileText } from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "certifications",
    titleKey: "title",
    subtitleFn: (r) => {
        const assetId = String(r.asset_id ?? "");
        const certType = String(r.cert_type ?? "");
        return `${assetId} · ${CERT_TYPE_LABELS[certType] ?? certType}`;
    },
    statusKey: "status",
    icon: BadgeCheck,
    backHref: "/certifications",
    backLabel: "Certifications",
    chatterRecordType: "certification",
    fields: [],
    tabs: [],
};

export default function CertificationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: cert, isLoading } = useCertification(entityId);
    const rec = cert as Record<string, unknown> | null;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Certification",
        listPath: "/certifications",
        useUpdateHook: useUpdateCertification,
        useDeleteHook: useDeleteCertification,
    });

    const status = String(rec?.status ?? "");
    const certType = String(rec?.cert_type ?? "");
    const certNumber = String(rec?.cert_number ?? "");
    const blocksUsage = (rec?.blocks_usage as boolean) ?? false;
    const assetId = String(rec?.asset_id ?? "");
    const issuedBy = String(rec?.issued_by ?? "");
    const issuerLicense = String(rec?.issuer_license ?? "");
    const issuedDate = String(rec?.issued_date ?? "");
    const expiryDate = String(rec?.expiry_date ?? "");
    const nextInspection = String(rec?.next_inspection_date ?? "");
    const documentUrl = String(rec?.document_url ?? "");
    const notes = String(rec?.notes ?? "");

    const sidebarSlot = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Certification Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline">{CERT_TYPE_LABELS[certType] ?? certType}</Badge>
                    </div>
                    {certNumber && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Cert #</span>
                            <span className="font-mono text-xs">{certNumber}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Blocks Usage</span>
                        <Badge variant={blocksUsage ? "destructive" : "ghost"}>
                            {blocksUsage ? "Yes" : "No"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Asset</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    <p className="font-medium">{assetId}</p>
                    <p className="text-xs text-muted-foreground mt-1">{assetId}</p>
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
                            {issuedBy}
                        </span>
                    </div>
                    {issuerLicense && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">License</span>
                            <span className="font-mono text-xs">{issuerLicense}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {issuedDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Issued</span>
                            <span className="font-medium">{formatDate(issuedDate, "compact")}</span>
                        </div>
                    )}
                    {expiryDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires</span>
                            <span className="font-medium">{formatDate(expiryDate, "compact")}</span>
                        </div>
                    )}
                    {nextInspection && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Inspection</span>
                            <span className="font-medium">
                                {formatDate(nextInspection, "compact")}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const overviewSlot = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <BadgeCheck className="h-5 w-5 text-success" />
                            <div>
                                <p className="text-xs text-muted-foreground">Status</p>
                                <p className="text-sm font-bold capitalize">
                                    {status.replace(/_/g, " ")}
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
                                    {issuedDate ? formatDate(issuedDate, "compact") : "\u2014"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            {blocksUsage ? (
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 text-success" />
                            )}
                            <div>
                                <p className="text-xs text-muted-foreground">Blocks Usage</p>
                                <p className="text-sm font-semibold">
                                    {blocksUsage ? "Yes \u2014 Blocking" : "No"}
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
                        <span className="font-medium">{issuedBy}</span>
                    </div>
                    {issuerLicense && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">License #</span>
                            <span className="font-mono text-xs">{issuerLicense}</span>
                        </div>
                    )}
                    {certNumber && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Certification #</span>
                            <span className="font-mono text-xs">{certNumber}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            {notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">{notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "documents",
                label: "Documents",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {documentUrl ? (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Certification Document
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {certType} certificate
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
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={entityId}
            record={rec}
            isLoading={isLoading}
            menuItems={[
                {
                    label: "Edit Certification",
                    onClick: () => router.push(`/certifications/${entityId}/edit`),
                },
                {
                    label: "Upload Document",
                    onClick: () =>
                        router.push(`/documents/new?entityType=certification&entityId=${entityId}`),
                },
                ...crudMenuItems,
            ]}
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
        />
    );
}
