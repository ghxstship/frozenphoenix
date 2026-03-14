"use client";

import { useParams, useRouter } from "next/navigation";
import {
    useDeleteInsurancePolicy,
    useInsurancePolicy,
    useUpdateInsurancePolicy,
} from "@/lib/supabase/hooks-pages";
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
    fields: [],
    tabs: [],
};

export default function InsurancePolicyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: policy, isLoading } = useInsurancePolicy(entityId);
    const rec = policy as Record<string, unknown> | null;
    const updatePolicy = useUpdateInsurancePolicy();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Insurance Policy",
        listPath: "/insurance-policies",
        useUpdateHook: useUpdateInsurancePolicy,
        useDeleteHook: useDeleteInsurancePolicy,
    });

    const carrier = (rec?.carrier as string) ?? "";
    const coverageAmount = (rec?.coverage_amount as number) ?? 0;
    const curr = (rec?.currency as string) ?? "USD";
    const deductible = rec?.deductible as number | null;
    const premium = rec?.premium as number | null;
    const policyType = (rec?.policy_type as string) ?? "";
    const policyNumber = (rec?.policy_number as string) ?? "";
    const holderType = (rec?.holder_type as string) ?? "";
    const effectiveDate = (rec?.effective_date as string) ?? "";
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
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Policy Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="outline" className="capitalize">
                            {String(rec?.status ?? "")}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline" className="capitalize">
                            {policyType.replace(/_/g, " ")}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Policy #</span>
                        <span className="font-mono text-xs">{policyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Holder</span>
                        <Badge variant="outline" className="capitalize">
                            {holderType}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold">{formatCurrency(coverageAmount, curr)}</span>
                    </div>
                    {deductible != null && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Deductible</span>
                            <span className="font-medium">
                                {formatCurrency(deductible ?? 0, curr)}
                            </span>
                        </div>
                    )}
                    {premium != null && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Premium</span>
                            <span className="font-medium">
                                {formatCurrency(premium ?? 0, curr)}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {effectiveDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Effective</span>
                            <span className="font-medium">
                                {formatDate(effectiveDate, "compact")}
                            </span>
                        </div>
                    )}
                    {expiryDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires</span>
                            <span className="font-medium">{formatDate(expiryDate, "compact")}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-success" />
                            <div>
                                <p className="text-xs text-muted-foreground">Coverage</p>
                                <p className="text-lg font-bold">
                                    {formatCurrency(coverageAmount, curr)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-info" />
                            <div>
                                <p className="text-xs text-muted-foreground">Carrier</p>
                                <p className="text-sm font-semibold">{carrier}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-warning" />
                            <div>
                                <p className="text-xs text-muted-foreground">Days Until Expiry</p>
                                <p className="text-sm font-semibold">{daysUntilExpiry}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
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
            id={entityId}
            record={rec}
            isLoading={isLoading}
            menuItems={[
                {
                    label: "Edit Policy",
                    onClick: () => router.push(`/insurance-policies/${entityId}/edit`),
                },
                {
                    label: "Upload Certificate",
                    onClick: () =>
                        router.push(
                            `/documents/new?entityType=insurance_policy&entityId=${entityId}`
                        ),
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
                        onClick={() =>
                            updatePolicy.mutate({ id: entityId, status: "pending_renewal" })
                        }
                    >
                        <Calendar className="h-4 w-4 mr-1" />
                        Renew
                    </Button>
                    <Button
                        size="sm"
                        disabled={updatePolicy.isPending}
                        onClick={() => updatePolicy.mutate({ id: entityId, status: "verified" })}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Verify
                    </Button>
                </div>
            }
        />
    );
}
