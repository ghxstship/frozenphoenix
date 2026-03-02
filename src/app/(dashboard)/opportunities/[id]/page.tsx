"use client";

import { useMemo, useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { MOCK_OPPORTUNITIES, OPPORTUNITY_STAGES } from "@/lib/demo-data-crm-revenue";
import { OPPORTUNITY_TYPE_MAP } from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Building2,
    Calendar,
    CheckCircle2,
    DollarSign,
    FileText,
    Mail,
    Phone,
    Target,
    TrendingUp,
    User,
} from "lucide-react";

type TabId = "overview" | "activity" | "chatter";
const TAB_VALUES = ["overview", "activity", "chatter"] as const;

const mockActivities = [
    {
        id: "a1",
        type: "stage_change",
        description: "Stage changed from Discovery to Qualification",
        date: "2026-02-18",
        user: "Sarah Chen",
    },
    {
        id: "a2",
        type: "meeting",
        description: "Client meeting — budget discussion",
        date: "2026-02-15",
        user: "Mike Torres",
    },
    {
        id: "a3",
        type: "email",
        description: "Proposal draft sent to stakeholders",
        date: "2026-02-12",
        user: "Sarah Chen",
    },
    {
        id: "a4",
        type: "note",
        description: "Client expressed interest in expanded scope for Q3",
        date: "2026-02-10",
        user: "Sarah Chen",
    },
    {
        id: "a5",
        type: "call",
        description: "Discovery call with VP of Marketing",
        date: "2026-02-05",
        user: "Mike Torres",
    },
];

export default function OpportunityDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });

    const opp = MOCK_OPPORTUNITIES[0]!;
    const stageCfg = OPPORTUNITY_STAGES.find((s) => s.id === opp.stage);
    const typeCfg = OPPORTUNITY_TYPE_MAP[opp.type as keyof typeof OPPORTUNITY_TYPE_MAP];
    const stageIndex = OPPORTUNITY_STAGES.findIndex((s) => s.id === opp.stage);
    const stageProgress =
        stageIndex >= 0 ? Math.round(((stageIndex + 1) / OPPORTUNITY_STAGES.length) * 100) : 0;

    const daysToClose = useMemo(() => {
        if (!opp.expectedCloseDate) return null;
        const now = new Date();
        return Math.ceil(
            (new Date(opp.expectedCloseDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
    }, [opp.expectedCloseDate]);

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

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "activity" as const, label: "Activity", count: mockActivities.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Opportunity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Stage</span>
                        <Badge style={{ backgroundColor: stageCfg?.color, color: "#fff" }}>
                            {stageCfg?.label}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline">{typeCfg?.label ?? opp.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Value</span>
                        <span className="font-bold">{formatCurrency(opp.value)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Weighted</span>
                        <span className="font-medium">{formatCurrency(opp.weightedValue)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Probability</span>
                        <span className="font-medium">{opp.probability}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Close Date</span>
                        <span className="font-medium">
                            {opp.expectedCloseDate ? formatDate(opp.expectedCloseDate) : "TBD"}
                        </span>
                    </div>
                    {daysToClose !== null && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Days to Close</span>
                            <Badge variant={daysToClose <= 14 ? "warning" : "ghost"}>
                                {daysToClose}d
                            </Badge>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{opp.companyName}</span>
                    </div>
                    {opp.contactName && (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{opp.contactName}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">
                            contact@
                            {(opp.companyName ?? "company").toLowerCase().replace(/\s/g, "")}.com
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">+1 (555) 123-4567</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Owner</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{opp.assignedToName ?? "Unassigned"}</p>
                            <p className="text-xs text-muted-foreground">Account Executive</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/opportunities"
            backLabel="Opportunities"
            title={opp.name}
            subtitle={`${opp.companyName} · ${typeCfg?.label ?? opp.type}`}
            status={opp.stage}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Target className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Advance Stage
                </Button>
            }
            menuItems={[
                { label: "Edit Opportunity", onClick: () => {} },
                { label: "Clone Opportunity", onClick: () => {} },
                { label: "Mark as Lost", onClick: () => {}, variant: "destructive" },
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Deal Value</p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(opp.value)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-info" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Weighted Value
                                        </p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(opp.weightedValue)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-warning" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Expected Close
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {opp.expectedCloseDate
                                                ? formatDate(opp.expectedCloseDate)
                                                : "TBD"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Pipeline Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProgressBar value={stageProgress} size="md" className="mb-3" />
                            <div className="flex flex-wrap gap-2">
                                {OPPORTUNITY_STAGES.map((stage, i) => (
                                    <Badge
                                        key={stage.id}
                                        variant={i <= stageIndex ? "default" : "ghost"}
                                        className="text-[10px]"
                                        style={
                                            i <= stageIndex
                                                ? { backgroundColor: stage.color, color: "#fff" }
                                                : {}
                                        }
                                    >
                                        {stage.label}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {opp.nextStep && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Next Step
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{opp.nextStep}</p>
                            </CardContent>
                        </Card>
                    )}

                    {opp.lostReasonId && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Lost Reason</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{opp.lostReasonId}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "activity" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Activity Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex gap-3 p-3 rounded-lg bg-secondary/20"
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm">{activity.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">
                                                {activity.user}
                                            </span>
                                            <span className="text-xs text-muted-foreground">·</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(activity.date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="opportunity"
                    recordId={opp.id}
                    activityItems={makeMockActivity("opportunity")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
