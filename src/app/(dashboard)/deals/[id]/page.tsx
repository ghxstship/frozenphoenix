"use client";

import { logger } from "@/lib/logger";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteDeal, useUpdateDeal as useUpdateDealHook } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
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
import { useCreateComment, useCreateProject, useDeals, useUpdateDeal } from "@/lib/supabase/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    Building2,
    Calendar,
    DollarSign,
    Edit,
    FolderKanban,
    Loader2,
    Mail,
    TrendingUp,
    User,
} from "lucide-react";

function computeDaysToClose(dateStr: string): number {
    return Math.max(
        0,
        Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "deals",
    titleKey: "title",
    statusKey: "stage",
    icon: DollarSign,
    backHref: "/pipeline",
    backLabel: "Pipeline",
    chatterRecordType: "deal",
    fields: [],
    tabs: [],
};

export default function DealDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dealId = params.id as string;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: dealId,
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

    const sbDeal = sbDeals?.find((d) => d.id === dealId);
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
            await updateDeal.mutateAsync({
                id: dealId,
                stage: "closed_won",
            } as unknown as Parameters<typeof updateDeal.mutateAsync>[0]);
        } catch (error) {
            logger.error("Failed to mark deal as won", { error });
        }
    };

    const handleMarkLost = async () => {
        try {
            await updateDeal.mutateAsync({
                id: dealId,
                stage: "closed_lost",
            } as unknown as Parameters<typeof updateDeal.mutateAsync>[0]);
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
            const projectData = {
                name: convertProjectName || deal.title,
                client: deal.company,
                status: "draft",
                budget_planned: convertBudget || deal.value,
            };
            const newProject = await createProject.mutateAsync(
                projectData as unknown as Parameters<typeof createProject.mutateAsync>[0]
            );
            await updateDeal.mutateAsync({
                id: dealId,
                stage: "closed_won",
            } as unknown as Parameters<typeof updateDeal.mutateAsync>[0]);
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
                entity_id: dealId,
                content: noteText,
            } as unknown as Parameters<typeof createComment.mutateAsync>[0]);
            setNoteText("");
            setNoteDialogOpen(false);
        } catch (error) {
            logger.error("Failed to add note", { error });
        }
    };

    const stageConfig = deal ? DEAL_STAGE_MAP[deal.stage as keyof typeof DEAL_STAGE_MAP] : null;
    const weightedValue = deal ? deal.value * (deal.probability / 100) : 0;
    const daysToClose = deal ? computeDaysToClose(deal.expectedCloseDate) : 0;

    const sidebarSlot =
        deal && stageConfig ? (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Deal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Stage</span>
                            <Badge variant={stageConfig.variant}>{stageConfig.label}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Probability</span>
                            <span className="font-medium">{deal.probability}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Expected Close</span>
                            <span>{formatDate(deal.expectedCloseDate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Assigned To</span>
                            <span>{deal.assignedTo}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{deal.contactName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a
                                href={`mailto:${deal.contactEmail}`}
                                className="text-primary hover:underline"
                            >
                                {deal.contactEmail}
                            </a>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{deal.company}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        ) : undefined;

    const overviewSlot = deal ? (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Deal Value" value={formatCurrency(deal.value)} icon={DollarSign} />
                <StatCard
                    title="Weighted Value"
                    value={formatCurrency(weightedValue)}
                    icon={TrendingUp}
                />
                <StatCard title="Days to Close" value={daysToClose} icon={Calendar} />
            </div>
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
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "activity",
                label: "Activity",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Activity Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Activity tracking will be available when connected to Supabase
                            </p>
                        </CardContent>
                    </Card>
                ),
            },
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
                                    No notes yet. Add a note to track important information.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ) : null,
            },
        ],
    };

    const record = deal ? { ...(deal as unknown as Record<string, unknown>) } : null;

    return (
        <>
            <DetailPageShell
                config={config}
                id={dealId}
                record={record}
                isLoading={isLoading}
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
                    <Button onClick={() => router.push(`/deals/${dealId}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                }
            />

            {/* Convert to Project Dialog */}
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
                            <label htmlFor="convert-name" className="text-sm font-medium">
                                Project Name
                            </label>
                            <Input
                                id="convert-name"
                                value={convertProjectName}
                                onChange={(e) => setConvertProjectName(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="convert-client" className="text-sm font-medium">
                                    Client
                                </label>
                                <Input id="convert-client" value={deal?.company ?? ""} disabled />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="convert-budget" className="text-sm font-medium">
                                    Budget
                                </label>
                                <Input
                                    id="convert-budget"
                                    type="number"
                                    value={convertBudget}
                                    onChange={(e) =>
                                        setConvertBudget(parseFloat(e.target.value) || 0)
                                    }
                                />
                            </div>
                        </div>
                        <div className="rounded-lg bg-secondary/30 p-3 text-sm">
                            <p className="font-medium mb-1">What happens next:</p>
                            <ul className="space-y-1 text-muted-foreground text-xs">
                                <li>
                                    • A new project will be created with status &quot;Draft&quot;
                                </li>
                                <li>• This deal will be marked as &quot;Closed Won&quot;</li>
                                <li>• You&apos;ll be redirected to the new project</li>
                            </ul>
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

            {/* Add Note Dialog */}
            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                    </DialogHeader>
                    <textarea
                        className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px]"
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
