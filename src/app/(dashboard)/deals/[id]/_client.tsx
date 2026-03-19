"use client";

import { logger } from "@/lib/logger";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useCreateComment,
    useCreateProject,
    useDeals,
    useDeleteDeal,
    useLostReasons,
    usePipelines,
    useRecordActivityLog,
    useUpdateDeal,
} from "@/lib/supabase";
import { useUpdateDeal as useUpdateDealHook } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DEAL_STAGE_MAP } from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Clock,
    DollarSign,
    Edit,
    FolderKanban,
    GitBranch,
    Loader2,
    ThumbsDown,
    TrendingUp,
} from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";

function PipelinesTab() {
    const { data: pipelines, isLoading } = usePipelines();
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!pipelines || pipelines.length === 0)
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Pipelines
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={GitBranch}
                        title="No pipelines"
                        description="Sales pipelines will appear here"
                    />
                </CardContent>
            </Card>
        );
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Pipelines ({pipelines.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {pipelines.map((p) => {
                        const rec = p as Record<string, unknown>;
                        return (
                            <div
                                key={String(rec.id)}
                                className="flex items-center justify-between p-3 rounded-lg border"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {String(rec.name ?? "Pipeline")}
                                    </p>
                                    {rec.description ? (
                                        <p className="text-xs text-muted-foreground">
                                            {String(rec.description)}
                                        </p>
                                    ) : null}
                                </div>
                                <Badge variant={rec.is_default ? "success" : "secondary"}>
                                    {rec.is_default ? "Default" : "Custom"}
                                </Badge>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function LostReasonsTab() {
    const { data: reasons, isLoading } = useLostReasons();
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!reasons || reasons.length === 0)
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ThumbsDown className="h-5 w-5" />
                        Lost Reasons
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={ThumbsDown}
                        title="No lost reasons"
                        description="Deal lost reasons will appear here"
                    />
                </CardContent>
            </Card>
        );
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5" />
                    Lost Reasons ({reasons.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {reasons.map((r) => {
                        const rec = r as Record<string, unknown>;
                        return (
                            <div
                                key={String(rec.id)}
                                className="flex items-center justify-between p-3 rounded-lg border"
                            >
                                <p className="text-sm font-medium">
                                    {String(rec.name ?? rec.reason ?? "Reason")}
                                </p>
                                {typeof rec.count === "number" ? (
                                    <Badge variant="secondary">{rec.count} deals</Badge>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function DealActivityTab({ dealId }: { dealId: string }) {
    const { data: activity } = useRecordActivityLog("deal", dealId);
    const items = (activity ?? []) as unknown as Array<Record<string, unknown>>;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title="No activity yet"
                        description="Activity will appear here as actions are taken on this deal"
                    />
                ) : (
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div
                                key={String(item.id)}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {String(item.action ?? "Activity")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {String(
                                            (item.user_profiles as Record<string, unknown> | null)
                                                ?.display_name ?? "System"
                                        )}
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {item.created_at ? formatDate(String(item.created_at)) : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "deal",
    titleKey: "title",
    statusKey: "stage",
    icon: DollarSign,
    backHref: "/pipeline",
    backLabel: "Pipeline",
    chatterRecordType: "deal",
    fields: [
        {
            id: "value",
            label: "Deal Value",
            accessorKey: "value",
            fieldType: "currency",
            icon: DollarSign,
        },
        {
            id: "probability",
            label: "Probability",
            accessorKey: "probability",
            fieldType: "percentage",
        },
        {
            id: "expected_close_date",
            label: "Expected Close",
            accessorKey: "expected_close_date",
            fieldType: "date",
            icon: Calendar,
        },
        { id: "assigned_to", label: "Assigned To", accessorKey: "assigned_to" },
        { id: "contact_name", label: "Contact", accessorKey: "contact_name" },
        { id: "contact_email", label: "Email", accessorKey: "contact_email", fieldType: "email" },
        { id: "company", label: "Company", accessorKey: "company" },
    ],
    sidebarFields: [
        { id: "stage", label: "Stage", accessorKey: "stage", fieldType: "status" },
        {
            id: "probability",
            label: "Probability",
            accessorKey: "probability",
            fieldType: "percentage",
        },
        {
            id: "expected_close_date",
            label: "Expected Close",
            accessorKey: "expected_close_date",
            fieldType: "date",
        },
        { id: "assigned_to", label: "Assigned To", accessorKey: "assigned_to" },
        { id: "contact_name", label: "Contact", accessorKey: "contact_name" },
        { id: "contact_email", label: "Email", accessorKey: "contact_email", fieldType: "email" },
        { id: "company", label: "Company", accessorKey: "company" },
    ],
    tabs: [],
};

export function DealDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Deal",
        listPath: "/deals",
        useUpdateHook: useUpdateDealHook,
        useDeleteHook: useDeleteDeal,
    });
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [convertDialogOpen, setConvertDialogOpen] = useState(false);
    const [convertProjectName, setConvertProjectName] = useState("");
    const [convertBudget, setConvertBudget] = useState(0);
    const updateDeal = useUpdateDeal();
    const createProject = useCreateProject();
    const createComment = useCreateComment();
    const { data: sbDeals, isLoading } = useDeals();

    const sbDeal = sbDeals?.find((d) => d.id === id);
    const deal = sbDeal
        ? {
              id: sbDeal.id,
              title: sbDeal.title,
              company: sbDeal.company,
              contactName: sbDeal.contact_name,
              contactEmail: sbDeal.contact_email,
              value: sbDeal.value,
              stage: sbDeal.stage,
              probability: sbDeal.probability,
              expectedCloseDate: sbDeal.expected_close_date,
              assignedTo: sbDeal.assigned_to ?? "",
              notes: sbDeal.notes ?? "",
              createdAt: sbDeal.created_at ?? "",
              updatedAt: sbDeal.updated_at ?? "",
          }
        : null;

    const handleMarkWon = async () => {
        try {
            await updateDeal.mutateAsync({ id, stage: "closed_won" } as unknown as Parameters<
                typeof updateDeal.mutateAsync
            >[0]);
        } catch (error) {
            logger.error("Failed to mark deal as won", { error });
        }
    };
    const handleMarkLost = async () => {
        try {
            await updateDeal.mutateAsync({ id, stage: "closed_lost" } as unknown as Parameters<
                typeof updateDeal.mutateAsync
            >[0]);
        } catch (error) {
            logger.error("Failed to mark deal as lost", { error });
        }
    };
    const openConvertDialog = () => {
        if (!deal) return;
        setConvertProjectName(deal.title);
        setConvertBudget(deal.value);
        setConvertDialogOpen(true);
    };
    const handleConvertToProject = async () => {
        if (!deal) return;
        try {
            const newProject = await createProject.mutateAsync({
                name: convertProjectName || deal.title,
                client: deal.company,
                status: "draft",
                budget_planned: convertBudget || deal.value,
            } as unknown as Parameters<typeof createProject.mutateAsync>[0]);
            await updateDeal.mutateAsync({ id, stage: "closed_won" } as unknown as Parameters<
                typeof updateDeal.mutateAsync
            >[0]);
            setConvertDialogOpen(false);
            router.push(`/projects/${(newProject as { id: string }).id}`);
        } catch (error) {
            logger.error("Failed to convert deal to project", { error });
        }
    };
    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        try {
            await createComment.mutateAsync({
                entity_type: "deal",
                entity_id: id,
                content: noteText,
            } as unknown as Parameters<typeof createComment.mutateAsync>[0]);
            setNoteText("");
            setNoteDialogOpen(false);
        } catch (error) {
            logger.error("Failed to add note", { error });
        }
    };

    const _stageConfig = deal ? DEAL_STAGE_MAP[deal.stage as keyof typeof DEAL_STAGE_MAP] : null;
    const weightedValue = deal ? deal.value * (deal.probability / 100) : 0;
    const daysToClose = deal
        ? Math.max(
              0,
              Math.ceil(
                  (new Date(deal.expectedCloseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
          )
        : 0;

    const overviewSlot = deal ? (
        <div className="space-y-6">
            {!!deal.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{deal.notes}</p>
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                            <div>
                                <p className="text-sm font-medium">Deal Created</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(deal.createdAt)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-muted-foreground mt-2" />
                            <div>
                                <p className="text-sm font-medium">Last Updated</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(deal.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => deal?.company ?? "",
        overviewSlot,
        stats: [
            {
                label: "Deal Value",
                icon: DollarSign,
                compute: (r) => formatCurrency(Number(r.value ?? 0)),
            },
            {
                label: "Weighted Value",
                icon: TrendingUp,
                compute: () => formatCurrency(weightedValue),
            },
            { label: "Days to Close", icon: Calendar, compute: () => daysToClose },
        ],
        tabs: [
            { id: "pipelines", label: "Pipelines", content: <PipelinesTab /> },
            { id: "lost-reasons", label: "Lost Reasons", content: <LostReasonsTab /> },
            { id: "activity", label: "Activity", content: <DealActivityTab dealId={id} /> },
            {
                id: "notes",
                label: "Notes",
                content: deal ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Notes & Comments</CardTitle>
                            <Button size="sm" onClick={() => setNoteDialogOpen(true)}>
                                Add Note
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {deal.notes ? (
                                <div className="p-4 rounded-lg bg-secondary/30">
                                    <p className="text-sm">{deal.notes}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Added on {formatDate(deal.createdAt)}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No notes yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ) : null,
            },
        ],
    };

    const record = deal ? { ...(deal as unknown as Record<string, unknown>) } : initialRecord;

    return (
        <>
            <DetailPageShell
                config={config}
                id={id}
                record={record as Record<string, unknown> | null}
                isLoading={isLoading && !initialRecord}
                menuItems={[
                    {
                        label: createProject.isPending ? "Converting..." : "Convert to Project",
                        onClick: openConvertDialog,
                    },
                    {
                        label: updateDeal.isPending ? "Updating..." : "Mark as Won",
                        onClick: handleMarkWon,
                    },
                    { label: "Mark as Lost", onClick: handleMarkLost, variant: "destructive" },
                    ...crudMenuItems,
                ]}
                avatar={
                    deal ? (
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                            {deal.company.charAt(0)}
                        </div>
                    ) : undefined
                }
                actions={
                    <Button onClick={() => router.push(`/deals/${id}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                }
            />
            <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderKanban className="h-5 w-5 text-primary" />
                            Convert Deal to Project
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            This will create a new project from this deal and mark the deal as won.
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Name</label>
                            <Input
                                value={convertProjectName}
                                onChange={(e) => setConvertProjectName(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Client</label>
                                <Input value={deal?.company ?? ""} disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Budget</label>
                                <Input
                                    type="number"
                                    value={convertBudget}
                                    onChange={(e) =>
                                        setConvertBudget(parseFloat(e.target.value) || 0)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setConvertDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConvertToProject}
                            disabled={!convertProjectName.trim() || createProject.isPending}
                        >
                            {createProject.isPending && (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            )}
                            Convert to Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                    </DialogHeader>
                    <textarea
                        className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[120px]"
                        placeholder="Enter your note..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setNoteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddNote}
                            disabled={!noteText.trim() || createComment.isPending}
                        >
                            {createComment.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Save Note
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
