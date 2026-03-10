"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { formatDate } from "@/lib/utils";
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    FileText,
    Inbox,
    Link2,
    Mail,
    Plus,
    RefreshCw,
    Settings,
    Users,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { useToast } from "@/components/ui/toast";

type EmailTab = "inbox" | "linked" | "settings";

interface EmailMessage {
    id: string;
    subject: string;
    from: string;
    to: string;
    receivedAt: string;
    direction: "inbound" | "outbound";
    linkedEntity: string | null;
    linkedEntityType: string | null;
    linkedEntityId: string | null;
    snippet: string;
    hasAttachments: boolean;
    isRead: boolean;
}

interface EmailAccount {
    id: string;
    email: string;
    provider: "gmail" | "outlook" | "smtp";
    status: "connected" | "error" | "disconnected";
    lastSyncAt: string;
    messagesProcessed: number;
}

const PLACEHOLDER_EMAILS: EmailMessage[] = [
    {
        id: "em1",
        subject: "Re: Air Max Launch — Stage Design Approval",
        from: "maria@nike.com",
        to: "team@playbook.io",
        receivedAt: "2026-03-12T14:30:00Z",
        direction: "inbound",
        linkedEntity: "Nike Air Max Launch",
        linkedEntityType: "project",
        linkedEntityId: "proj-1",
        snippet: "Hi team, the stage design looks great. We've approved the final render...",
        hasAttachments: true,
        isRead: false,
    },
    {
        id: "em2",
        subject: "Invoice INV-2026-0012 — Payment Confirmation",
        from: "ap@redbull.com",
        to: "billing@playbook.io",
        receivedAt: "2026-03-12T11:15:00Z",
        direction: "inbound",
        linkedEntity: "INV-2026-0012",
        linkedEntityType: "invoice",
        linkedEntityId: "inv-12",
        snippet: "Payment has been processed for the above invoice. Please confirm receipt...",
        hasAttachments: false,
        isRead: true,
    },
    {
        id: "em3",
        subject: "Vendor Insurance Certificate Reminder",
        from: "team@playbook.io",
        to: "compliance@stageco.com",
        receivedAt: "2026-03-12T09:00:00Z",
        direction: "outbound",
        linkedEntity: "StageCo Productions",
        linkedEntityType: "vendor",
        linkedEntityId: "v-3",
        snippet: "This is a reminder that your insurance certificate expires on March 15...",
        hasAttachments: false,
        isRead: true,
    },
    {
        id: "em4",
        subject: "Quote Request — Samsung Galaxy Pop-Up AV Package",
        from: "procurement@samsung.com",
        to: "sales@playbook.io",
        receivedAt: "2026-03-11T16:45:00Z",
        direction: "inbound",
        linkedEntity: "Samsung Electronics",
        linkedEntityType: "company",
        linkedEntityId: "co-5",
        snippet:
            "We'd like to request a quote for the AV package for our upcoming Galaxy pop-up...",
        hasAttachments: true,
        isRead: true,
    },
    {
        id: "em5",
        subject: "Crew Schedule Update — Coachella Week 1",
        from: "team@playbook.io",
        to: "crew@playbook.io",
        receivedAt: "2026-03-11T08:30:00Z",
        direction: "outbound",
        linkedEntity: "Coachella Main Stage 2026",
        linkedEntityType: "project",
        linkedEntityId: "proj-5",
        snippet:
            "Updated crew schedule for Coachella Week 1. Please review your assigned shifts...",
        hasAttachments: true,
        isRead: true,
    },
];

const PLACEHOLDER_ACCOUNTS: EmailAccount[] = [
    {
        id: "ea1",
        email: "team@playbook.io",
        provider: "gmail",
        status: "connected",
        lastSyncAt: "2026-03-12T14:35:00Z",
        messagesProcessed: 1245,
    },
    {
        id: "ea2",
        email: "billing@playbook.io",
        provider: "gmail",
        status: "connected",
        lastSyncAt: "2026-03-12T14:30:00Z",
        messagesProcessed: 567,
    },
    {
        id: "ea3",
        email: "sales@playbook.io",
        provider: "outlook",
        status: "error",
        lastSyncAt: "2026-03-11T22:00:00Z",
        messagesProcessed: 312,
    },
];

const ENTITY_ICONS: Record<string, React.ReactNode> = {
    project: <FileText className="h-3.5 w-3.5" />,
    invoice: <FileText className="h-3.5 w-3.5" />,
    vendor: <Building2 className="h-3.5 w-3.5" />,
    company: <Building2 className="h-3.5 w-3.5" />,
    contact: <Users className="h-3.5 w-3.5" />,
};

export default function EmailIntegrationPage() {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useQueryTabState<EmailTab>({
        key: "tab",
        defaultValue: "inbox",
        validValues: ["inbox", "linked", "settings"],
    });

    const unreadCount = PLACEHOLDER_EMAILS.filter((e) => !e.isRead).length;
    const linkedCount = PLACEHOLDER_EMAILS.filter((e) => e.linkedEntity).length;
    const inboundToday = PLACEHOLDER_EMAILS.filter((e) => e.direction === "inbound").length;
    const outboundToday = PLACEHOLDER_EMAILS.filter((e) => e.direction === "outbound").length;

    const tabs = [
        {
            id: "inbox" as const,
            label: "Activity Feed",
            count: PLACEHOLDER_EMAILS.length,
            icon: <Inbox className="h-4 w-4" />,
        },
        {
            id: "linked" as const,
            label: "Linked Emails",
            count: linkedCount,
            icon: <Link2 className="h-4 w-4" />,
        },
        {
            id: "settings" as const,
            label: "Accounts",
            count: PLACEHOLDER_ACCOUNTS.length,
            icon: <Settings className="h-4 w-4" />,
        },
    ];

    return (
        <PermissionGate resource="settings" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Email Integration"
                    description="Bi-directional email sync with automatic record linking"
                >
                    <Button size="sm" onClick={() => addToast({ title: "Syncing", description: "Email sync started for all accounts.", variant: "default" })}>
                        <RefreshCw className="h-4 w-4" /> Sync Now
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Unread" value={unreadCount} icon={Mail} />
                    <StatCard title="Linked to Records" value={linkedCount} icon={Link2} />
                    <StatCard title="Inbound Today" value={inboundToday} icon={ArrowDownRight} />
                    <StatCard title="Outbound Today" value={outboundToday} icon={ArrowUpRight} />
                </div>

                <TabBar
                    items={tabs}
                    value={activeTab}
                    onValueChange={(id) => setActiveTab(id as EmailTab)}
                />

                <TabPanel value="inbox" activeValue={activeTab}>
                    <div className="space-y-2">
                        {PLACEHOLDER_EMAILS.map((email) => (
                            <Card
                                key={email.id}
                                className={
                                    !email.isRead ? "border-primary/20 bg-primary/[0.02]" : ""
                                }
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div
                                                className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${email.direction === "inbound" ? "bg-info/10" : "bg-success/10"}`}
                                            >
                                                {email.direction === "inbound" ? (
                                                    <ArrowDownRight className="h-4 w-4 text-info" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4 text-success" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4
                                                        className={`text-sm truncate ${!email.isRead ? "font-bold" : "font-medium"}`}
                                                    >
                                                        {email.subject}
                                                    </h4>
                                                    {!email.isRead && (
                                                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                                    <span>
                                                        {email.direction === "inbound"
                                                            ? email.from
                                                            : `To: ${email.to}`}
                                                    </span>
                                                    {email.hasAttachments && (
                                                        <Badge
                                                            variant="ghost"
                                                            className="text-[9px]"
                                                        >
                                                            Attachment
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                    {email.snippet}
                                                </p>
                                                {email.linkedEntity && (
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <Link2 className="h-3 w-3 text-primary" />
                                                        <Badge
                                                            variant="info"
                                                            className="text-[10px] flex items-center gap-1"
                                                        >
                                                            {
                                                                ENTITY_ICONS[
                                                                    email.linkedEntityType || ""
                                                                ]
                                                            }
                                                            {email.linkedEntity}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground shrink-0 ml-3">
                                            {formatDate(email.receivedAt)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabPanel>

                <TabPanel value="linked" activeValue={activeTab}>
                    <div className="space-y-4">
                        {Object.entries(
                            PLACEHOLDER_EMAILS.filter((e) => e.linkedEntity).reduce<
                                Record<string, EmailMessage[]>
                            >((acc, email) => {
                                const key = `${email.linkedEntityType}:${email.linkedEntity}`;
                                if (!acc[key]) acc[key] = [];
                                acc[key]!.push(email);
                                return acc;
                            }, {})
                        ).map(([key, emails]) => {
                            const first = emails[0]!;
                            return (
                                <Card key={key}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2">
                                            {ENTITY_ICONS[first.linkedEntityType || ""]}
                                            <CardTitle className="text-sm">
                                                {first.linkedEntity}
                                            </CardTitle>
                                            <Badge
                                                variant="ghost"
                                                className="text-[10px] capitalize"
                                            >
                                                {first.linkedEntityType}
                                            </Badge>
                                            <Badge variant="info" className="text-[10px]">
                                                {emails.length} emails
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {emails.map((email) => (
                                            <div
                                                key={email.id}
                                                className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-xs"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {email.direction === "inbound" ? (
                                                        <ArrowDownRight className="h-3 w-3 text-info" />
                                                    ) : (
                                                        <ArrowUpRight className="h-3 w-3 text-success" />
                                                    )}
                                                    <span className="font-medium truncate max-w-xs">
                                                        {email.subject}
                                                    </span>
                                                </div>
                                                <span className="text-muted-foreground">
                                                    {formatDate(email.receivedAt)}
                                                </span>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabPanel>

                <TabPanel value="settings" activeValue={activeTab}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Connected Accounts</h3>
                            <Button size="sm" onClick={() => addToast({ title: "Coming soon", description: "Email account connection is not yet available.", variant: "default" })}>
                                <Plus className="h-4 w-4" /> Add Account
                            </Button>
                        </div>
                        {PLACEHOLDER_ACCOUNTS.map((account) => (
                            <Card key={account.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`h-10 w-10 rounded-lg flex items-center justify-center ${account.status === "connected" ? "bg-success/10" : account.status === "error" ? "bg-destructive/10" : "bg-muted"}`}
                                            >
                                                <Mail
                                                    className={`h-5 w-5 ${account.status === "connected" ? "text-success" : account.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold">
                                                    {account.email}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                                    <Badge
                                                        variant={
                                                            account.status === "connected"
                                                                ? "success"
                                                                : account.status === "error"
                                                                  ? "destructive"
                                                                  : "ghost"
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {account.status === "connected" ? (
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        ) : (
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                        )}
                                                        {account.status}
                                                    </Badge>
                                                    <span className="capitalize">
                                                        {account.provider}
                                                    </span>
                                                    <span>·</span>
                                                    <span>
                                                        {account.messagesProcessed} messages
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground">
                                                Last sync: {formatDate(account.lastSyncAt)}
                                            </span>
                                            <Button size="sm" variant="outline" onClick={() => addToast({ title: "Syncing", description: `Syncing ${account.email}…`, variant: "default" })}>
                                                <RefreshCw className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => addToast({ title: "Coming soon", description: `Account settings for ${account.email} coming soon.`, variant: "default" })}>
                                                <Settings className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabPanel>
            </div>
        </PermissionGate>
    );
}
