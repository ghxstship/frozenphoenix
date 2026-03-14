"use client";

import { useRouter } from "next/navigation";
import { useDeletePermit, useUpdatePermit } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    DollarSign,
    MapPin,
    ScrollText,
} from "lucide-react";
import { useParams } from "next/navigation";
import { usePermit } from "@/lib/supabase/hooks-pages";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "permits",
    titleKey: "title",
    statusKey: "status",
    icon: ScrollText,
    backHref: "/permits",
    backLabel: "Permits",
    chatter: false,
    fields: [],
    tabs: [],
};

export default function PermitDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: permit, isLoading } = usePermit(entityId);
    const updatePermit = useUpdatePermit();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Permit",
        listPath: "/permits",
        useUpdateHook: useUpdatePermit,
        useDeleteHook: useDeletePermit,
    });

    const chatterComments: CommentItem[] = [];
    const handleAddComment = async (content: string) => {
        void content;
    };

    const sidebarSlot = permit ? (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Permit Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(permit.status)}>
                            {getStatusLabel(permit.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline" className="capitalize">
                            {permit.permit_type.replace(/_/g, " ")}
                        </Badge>
                    </div>
                    {permit.permit_number && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Number</span>
                            <span className="font-mono text-xs">{permit.permit_number}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Entity</span>
                        <Badge variant="outline" className="capitalize">
                            {permit.entity_type}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Jurisdiction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Authority</span>
                        <span className="font-medium text-xs text-right max-w-[140px]">
                            {permit.issuing_authority ?? permit.jurisdiction}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Level</span>
                        <Badge variant="outline" className="capitalize">
                            {permit.jurisdiction_level ?? "—"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {permit.applied_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Applied</span>
                            <span className="font-medium">
                                {formatDate(permit.applied_date, "compact")}
                            </span>
                        </div>
                    )}
                    {permit.approved_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Approved</span>
                            <span className="font-medium">
                                {formatDate(permit.approved_date, "compact")}
                            </span>
                        </div>
                    )}
                    {permit.effective_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Effective</span>
                            <span className="font-medium">
                                {formatDate(permit.effective_date, "compact")}
                            </span>
                        </div>
                    )}
                    {permit.expiry_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expires</span>
                            <span className="font-medium">
                                {formatDate(permit.expiry_date, "compact")}
                            </span>
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
                        {(permit.tags ?? []).length > 0 ? (
                            (permit.tags ?? []).map((t: string) => (
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
    ) : undefined;

    const overviewSlot = permit ? (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-success" />
                            <div>
                                <p className="text-xs text-muted-foreground">Total Cost</p>
                                <p className="text-lg font-bold">
                                    {permit.total_cost ? formatCurrency(permit.total_cost) : "N/A"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-info" />
                            <div>
                                <p className="text-xs text-muted-foreground">Jurisdiction</p>
                                <p className="text-sm font-semibold truncate">
                                    {permit.jurisdiction}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            {permit.blocks_entity === true ? (
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 text-success" />
                            )}
                            <div>
                                <p className="text-xs text-muted-foreground">Blocks Entity</p>
                                <p className="text-sm font-semibold">
                                    {permit.blocks_entity === true ? "Yes — Blocking" : "No"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {permit.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {permit.description}
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Fees</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Application Fee</span>
                        <span className="font-medium">
                            {permit.application_fee ? formatCurrency(permit.application_fee) : "—"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Permit Fee</span>
                        <span className="font-medium">
                            {permit.permit_fee ? formatCurrency(permit.permit_fee) : "—"}
                        </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">
                            {permit.total_cost ? formatCurrency(permit.total_cost) : "—"}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {permit.conditions && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Conditions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">{permit.conditions}</p>
                        <Badge variant={permit.conditions_met === true ? "success" : "warning"}>
                            {permit.conditions_met === true
                                ? "Conditions Met"
                                : "Conditions Pending"}
                        </Badge>
                    </CardContent>
                </Card>
            )}

            {permit.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {permit.notes}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () =>
            `${permit?.jurisdiction ?? ""} - ${(permit?.permit_type ?? "").replace(/_/g, " ")}`,
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "inspections",
                label: "Inspections",
                content: permit ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Inspection Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Requires Inspection</span>
                                <Badge
                                    variant={permit.requires_inspection === true ? "info" : "ghost"}
                                >
                                    {permit.requires_inspection === true ? "Yes" : "No"}
                                </Badge>
                            </div>
                            {permit.inspection_date && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="font-medium">
                                        {formatDate(permit.inspection_date, "compact")}
                                    </span>
                                </div>
                            )}
                            {permit.inspection_passed != null && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Result</span>
                                    <Badge
                                        variant={
                                            permit.inspection_passed === true
                                                ? "success"
                                                : "destructive"
                                        }
                                    >
                                        {permit.inspection_passed === true ? "Passed" : "Failed"}
                                    </Badge>
                                </div>
                            )}
                            {permit.inspector_name && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Inspector</span>
                                    <span className="font-medium">{permit.inspector_name}</span>
                                </div>
                            )}
                            {permit.requires_inspection !== true && (
                                <p className="text-muted-foreground text-center py-6">
                                    No inspection required for this permit.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ) : undefined,
            },
            {
                id: "chatter",
                label: "Chatter",
                content: (
                    <RecordChatter
                        recordType="permit"
                        recordId={entityId}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    const rec = permit as unknown as Record<string, unknown> | null;
    const record = rec ? { ...rec } : null;

    return (
        <DetailPageShell
            config={config}
            id={entityId}
            record={record}
            isLoading={isLoading}
            menuItems={[
                { label: "Edit Permit", onClick: () => router.push(`/permits/${entityId}/edit`) },
                {
                    label: "Upload Document",
                    onClick: () =>
                        router.push(`/documents/new?entityType=permit&entityId=${entityId}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <ScrollText className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={updatePermit.isPending}
                        onClick={() =>
                            updatePermit.mutate({ id: entityId, status: "pending_renewal" })
                        }
                    >
                        <Calendar className="h-4 w-4 mr-1" />
                        Renew
                    </Button>
                    <Button
                        size="sm"
                        disabled={updatePermit.isPending}
                        onClick={() => updatePermit.mutate({ id: entityId, status: "approved" })}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark Approved
                    </Button>
                </div>
            }
        />
    );
}
