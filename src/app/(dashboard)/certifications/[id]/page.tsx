"use client";

import { useParams, useRouter } from "next/navigation";
import { useCertification, useDeleteCertification, useUpdateCertification } from "@/lib/supabase";
import { useHrCertifications, useUserCertifications } from "@/lib/supabase/hooks-workforce";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CERT_TYPE_LABELS } from "@/config/ui-variants";
import { formatDate } from "@/lib/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    AlertTriangle,
    BadgeCheck,
    Calendar,
    CheckCircle2,
    FileText,
    Loader2,
    Users,
} from "lucide-react";

function HrCertificationsTab() {
    const { data: certs, isLoading } = useHrCertifications();
    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }
    if (!certs || certs.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No HR certifications found.
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    HR Certifications ({certs.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {certs.map((c) => (
                        <div
                            key={c.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {String(c.label ?? c.id)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {c.expiry_date
                                        ? `Expires ${formatDate(c.expiry_date, "compact")}`
                                        : "No expiry"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function UserCertificationsTab() {
    // Wire with current user ID — placeholder "u1" until auth context is wired
    const { data: userCerts, isLoading } = useUserCertifications("u1");
    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }
    const items = userCerts?.data ?? [];
    if (items.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No user certifications found.
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    User Certifications ({items.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {items.map((uc: Record<string, unknown>) => (
                        <div
                            key={String(uc.id)}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {String(uc.certification_name ?? uc.id)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {String(uc.status ?? "active")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

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
    fields: [
        { id: "cert_type", label: "Type", accessorKey: "cert_type", fieldType: "status" },
        { id: "cert_number", label: "Cert #", accessorKey: "cert_number" },
        {
            id: "blocks_usage",
            label: "Blocks Usage",
            accessorKey: "blocks_usage",
            fieldType: "status",
        },
        {
            id: "issued_date",
            label: "Issued",
            accessorKey: "issued_date",
            fieldType: "date",
            icon: Calendar,
        },
        {
            id: "expiry_date",
            label: "Expires",
            accessorKey: "expiry_date",
            fieldType: "date",
            icon: Calendar,
        },
        { id: "issued_by", label: "Issued By", accessorKey: "issued_by" },
    ],
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        { id: "cert_type", label: "Type", accessorKey: "cert_type", fieldType: "status" },
        { id: "cert_number", label: "Cert #", accessorKey: "cert_number" },
        {
            id: "blocks_usage",
            label: "Blocks Usage",
            accessorKey: "blocks_usage",
            fieldType: "status",
        },
        { id: "issued_by", label: "Issued By", accessorKey: "issued_by" },
        { id: "issuer_license", label: "License", accessorKey: "issuer_license" },
        { id: "issued_date", label: "Issued", accessorKey: "issued_date", fieldType: "date" },
        { id: "expiry_date", label: "Expires", accessorKey: "expiry_date", fieldType: "date" },
        {
            id: "next_inspection_date",
            label: "Next Inspection",
            accessorKey: "next_inspection_date",
            fieldType: "date",
        },
    ],
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
    const _expiryDate = String(rec?.expiry_date ?? "");
    const _nextInspection = String(rec?.next_inspection_date ?? "");
    const documentUrl = String(rec?.document_url ?? "");
    const notes = String(rec?.notes ?? "");

    const sidebarSlot = (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Asset</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
                <p className="font-medium">{assetId}</p>
                <p className="text-xs text-muted-foreground mt-1">{assetId}</p>
            </CardContent>
        </Card>
    );

    const overviewSlot = (
        <div className="space-y-6">
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
        stats: [
            { label: "Status", icon: BadgeCheck, compute: () => status.replace(/_/g, " ") },
            {
                label: "Issued",
                icon: Calendar,
                compute: () => (issuedDate ? formatDate(issuedDate, "compact") : "—"),
            },
            {
                label: "Blocks Usage",
                icon: blocksUsage ? AlertTriangle : CheckCircle2,
                compute: () => (blocksUsage ? "Yes — Blocking" : "No"),
            },
        ],
        tabs: [
            {
                id: "hr-certs",
                label: "HR Certs",
                content: <HrCertificationsTab />,
            },
            {
                id: "user-certs",
                label: "User Certs",
                content: <UserCertificationsTab />,
            },
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
