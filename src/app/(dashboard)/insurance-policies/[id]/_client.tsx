"use client";

import { useRouter } from "next/navigation";
import {
    useDeleteInsurancePolicy,
    useInsurancePolicy,
    useUpdateInsurancePolicy,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { Calendar, CheckCircle2, DollarSign, FileText, Shield } from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "insurance_policies",
    titleFn: (r) =>
        `${String(r.carrier ?? "")} — ${String(r.policy_type ?? "").replace(/_/g, " ")}`,
    subtitleFn: (r) => `Policy ${String(r.policy_number ?? "")} · ${String(r.holder_type ?? "")}`,
    statusKey: "status",
    icon: Shield,
    backHref: "/insurance-policies",
    backLabel: "Insurance Policies",
    chatterRecordType: "insurance_policy",
    fields: [
        { id: "policy_type", label: "Type", accessorKey: "policy_type", fieldType: "status" },
        { id: "policy_number", label: "Policy #", accessorKey: "policy_number" },
        {
            id: "coverage_amount",
            label: "Coverage",
            accessorKey: "coverage_amount",
            fieldType: "currency",
            icon: DollarSign,
        },
        {
            id: "effective_date",
            label: "Effective",
            accessorKey: "effective_date",
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
    ],
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        { id: "policy_type", label: "Type", accessorKey: "policy_type", fieldType: "status" },
        { id: "policy_number", label: "Policy #", accessorKey: "policy_number" },
        { id: "holder_type", label: "Holder", accessorKey: "holder_type", fieldType: "status" },
        {
            id: "coverage_amount",
            label: "Coverage",
            accessorKey: "coverage_amount",
            fieldType: "currency",
        },
        { id: "deductible", label: "Deductible", accessorKey: "deductible", fieldType: "currency" },
        { id: "premium", label: "Premium", accessorKey: "premium", fieldType: "currency" },
        {
            id: "effective_date",
            label: "Effective",
            accessorKey: "effective_date",
            fieldType: "date",
        },
        { id: "expiry_date", label: "Expires", accessorKey: "expiry_date", fieldType: "date" },
    ],
    tabs: [],
};

export function InsurancePolicyDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { data: policy, isLoading } = useInsurancePolicy(id);
    const rec = (policy ?? initialRecord) as Record<string, unknown> | null;
    const updatePolicy = useUpdateInsurancePolicy();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Insurance Policy",
        listPath: "/insurance-policies",
        useUpdateHook: useUpdateInsurancePolicy,
        useDeleteHook: useDeleteInsurancePolicy,
    });

    const carrier = (rec?.carrier as string) ?? "";
    const coverageAmount = (rec?.coverage_amount as number) ?? 0;
    const curr = (rec?.currency as string) ?? "USD";
    const expiryDate = (rec?.expiry_date as string) ?? "";
    const tags = (rec?.tags as string[]) ?? [];
    const documentUrl = (rec?.document_url as string) ?? "";
    const certificateUrl = (rec?.certificate_url as string) ?? "";
    const additionalInsuredRequired = (rec?.additional_insured_required as boolean) ?? false;
    const additionalInsured = (rec?.additional_insured as string[]) ?? [];
    const verifiedBy = (rec?.verified_by as string) ?? "";
    const verifiedAt = (rec?.verified_at as string) ?? "";
    const verificationNotes = (rec?.verification_notes as string) ?? "";
    const notes = (rec?.notes as string) ?? "";
    const daysUntilExpiry = expiryDate
        ? Math.max(0, Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000))
        : 0;

    const sidebarSlot = (
        <div className="density-gap-section">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                        {tags.length > 0 ? (
                            tags.map((t) => (
                                <Chip key={t} size="sm">
                                    {t}
                                </Chip>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">No tags</span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const overviewSlot = (
        <div className="density-gap-page">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Additional Insured</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Required</span>
                        <Badge variant={additionalInsuredRequired ? "info" : "ghost"}>
                            {additionalInsuredRequired ? "Yes" : "No"}
                        </Badge>
                    </div>
                    {additionalInsured.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {additionalInsured.map((name) => (
                                <Chip key={name} size="sm">
                                    {name}
                                </Chip>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
            {verifiedBy && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Verification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Verified By</span>
                            <span className="font-medium">{verifiedBy}</span>
                        </div>
                        {verifiedAt && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span className="font-medium">
                                    {formatDate(verifiedAt, "compact")}
                                </span>
                            </div>
                        )}
                        {verificationNotes && (
                            <p className="text-muted-foreground pt-1">{verificationNotes}</p>
                        )}
                    </CardContent>
                </Card>
            )}
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
            {
                label: "Coverage",
                icon: DollarSign,
                compute: () => formatCurrency(coverageAmount, curr),
            },
            { label: "Carrier", icon: Shield, compute: () => carrier },
            { label: "Days Until Expiry", icon: Calendar, compute: () => daysUntilExpiry },
        ],
        tabs: [
            {
                id: "documents",
                label: "Documents",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Policy Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {documentUrl && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-semibold">Policy Document</p>
                                            <p className="text-xs text-muted-foreground">
                                                Full policy document
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        View
                                    </Button>
                                </div>
                            )}
                            {certificateUrl && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Certificate of Insurance
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                COI document
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        View
                                    </Button>
                                </div>
                            )}
                            {!documentUrl && !certificateUrl && (
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
            id={id}
            record={rec}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                {
                    label: "Edit Policy",
                    onClick: () => router.push(`/insurance-policies/${id}/edit`),
                },
                {
                    label: "Upload Certificate",
                    onClick: () =>
                        router.push(`/documents/new?entityType=insurance_policy&entityId=${id}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Shield className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={updatePolicy.isPending}
                        onClick={() => updatePolicy.mutate({ id, status: "pending_renewal" })}
                    >
                        <Calendar className="h-4 w-4 mr-1" />
                        Renew
                    </Button>
                    <Button
                        size="sm"
                        disabled={updatePolicy.isPending}
                        onClick={() => updatePolicy.mutate({ id, status: "verified" })}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Verify
                    </Button>
                </div>
            }
        />
    );
}
