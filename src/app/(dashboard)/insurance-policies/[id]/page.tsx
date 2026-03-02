"use client";

import { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import { MOCK_INSURANCE_POLICIES } from "@/lib/demo-data-governance";
import { Calendar, CheckCircle2, DollarSign, FileText, Shield } from "lucide-react";

type TabId = "details" | "documents" | "chatter";
const TAB_VALUES = ["details", "documents", "chatter"] as const;

export default function InsurancePolicyDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const policy = MOCK_INSURANCE_POLICIES[0]!;

    const [chatterComments, setChatterComments] = useState<CommentItem[]>(makeMockComments());
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

    const daysUntilExpiry = Math.max(
        0,
        Math.ceil((new Date(policy.expiry_date).getTime() - new Date().getTime()) / 86400000)
    );

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "documents" as const, label: "Documents" },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Policy Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(policy.status)}>
                            {getStatusLabel(policy.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline" className="capitalize">
                            {policy.policy_type.replace(/_/g, " ")}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Policy #</span>
                        <span className="font-mono text-xs">{policy.policy_number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Holder</span>
                        <Badge variant="outline" className="capitalize">
                            {policy.holder_type}
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
                        <span className="font-bold">
                            {formatCurrency(policy.coverage_amount, policy.currency)}
                        </span>
                    </div>
                    {policy.deductible !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Deductible</span>
                            <span className="font-medium">
                                {formatCurrency(policy.deductible, policy.currency)}
                            </span>
                        </div>
                    )}
                    {policy.premium !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Premium</span>
                            <span className="font-medium">
                                {formatCurrency(policy.premium, policy.currency)}
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
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Effective</span>
                        <span className="font-medium">
                            {formatDate(policy.effective_date, "compact")}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires</span>
                        <span className="font-medium">
                            {formatDate(policy.expiry_date, "compact")}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                        {policy.tags.length > 0 ? (
                            policy.tags.map((t) => (
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

    return (
        <DetailLayout
            backHref="/insurance-policies"
            backLabel="Insurance Policies"
            title={`${policy.carrier} — ${policy.policy_type.replace(/_/g, " ")}`}
            subtitle={`Policy ${policy.policy_number} · ${policy.holder_type}`}
            status={policy.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Shield className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        Renew
                    </Button>
                    <Button size="sm">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Verify
                    </Button>
                </div>
            }
            menuItems={[
                { label: "Edit Policy", onClick: () => {} },
                { label: "Upload Certificate", onClick: () => {} },
                { label: "Cancel Policy", onClick: () => {}, variant: "destructive" },
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
                                    <DollarSign className="h-5 w-5 text-success" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Coverage</p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(
                                                policy.coverage_amount,
                                                policy.currency
                                            )}
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
                                        <p className="text-sm font-semibold">{policy.carrier}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Days Until Expiry
                                        </p>
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
                                <Badge
                                    variant={policy.additional_insured_required ? "info" : "ghost"}
                                >
                                    {policy.additional_insured_required ? "Yes" : "No"}
                                </Badge>
                            </div>
                            {policy.additional_insured && policy.additional_insured.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {policy.additional_insured.map((name) => (
                                        <Chip key={name} size="sm">
                                            {name}
                                        </Chip>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {policy.verified_by && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Verification</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Verified By</span>
                                    <span className="font-medium">{policy.verified_by}</span>
                                </div>
                                {policy.verified_at && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Date</span>
                                        <span className="font-medium">
                                            {formatDate(policy.verified_at, "compact")}
                                        </span>
                                    </div>
                                )}
                                {policy.verification_notes && (
                                    <p className="text-muted-foreground pt-1">
                                        {policy.verification_notes}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {policy.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {policy.notes}
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
                            Policy Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {policy.document_url && (
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
                        {policy.certificate_url && (
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
                        {!policy.document_url && !policy.certificate_url && (
                            <p className="text-sm text-muted-foreground text-center py-6">
                                No documents uploaded yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="insurance_policy"
                    recordId={policy.id}
                    activityItems={makeMockActivity("insurance_policy")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
