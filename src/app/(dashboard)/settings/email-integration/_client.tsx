"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
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
import { useToast } from "@/components/ui/toast";
import { useEmailMessages } from "@/lib/supabase";
import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_EMAIL_ACCOUNT_CONFIG } from "@/config/create-entity-configs";
import { SettingsPageShell } from "@/components/shells/settings-page-shell";
import type { SettingsPageConfig } from "@/types/settings-page-config";
import { LoadingState } from "@/components/layouts/loading-state";

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

const ENTITY_ICONS: Record<string, React.ReactNode> = {
    project: <FileText className="h-3.5 w-3.5" />,
    invoice: <FileText className="h-3.5 w-3.5" />,
    vendor: <Building2 className="h-3.5 w-3.5" />,
    company: <Building2 className="h-3.5 w-3.5" />,
    contact: <Users className="h-3.5 w-3.5" />,
};

export function EmailIntegrationPageClient() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const { addToast } = useToast();

    const { data: sbEmails, isLoading } = useEmailMessages();

    const emails: EmailMessage[] = useMemo(
        () =>
            (sbEmails ?? []).map((e: Record<string, unknown>) => ({
                id: String(e.id),
                subject: String(e.subject ?? ""),
                from: String(e.from_address ?? ""),
                to: String(e.to_address ?? ""),
                receivedAt: String(e.received_at ?? e.created_at ?? ""),
                direction: (e.direction as "inbound" | "outbound") ?? "inbound",
                linkedEntity: e.linked_entity_name ? String(e.linked_entity_name) : null,
                linkedEntityType: e.linked_entity_type ? String(e.linked_entity_type) : null,
                linkedEntityId: e.linked_entity_id ? String(e.linked_entity_id) : null,
                snippet: String(e.snippet ?? e.body_preview ?? ""),
                hasAttachments: e.has_attachments === true,
                isRead: e.is_read !== false,
            })),
        [sbEmails]
    );

    // Derive accounts from unique from/to addresses
    const accounts: EmailAccount[] = useMemo(() => {
        const seen = new Map<string, { count: number; lastSeen: string }>();
        for (const e of emails) {
            const addr = e.direction === "outbound" ? e.from : e.to;
            if (!addr) continue;
            const prev = seen.get(addr);
            seen.set(addr, {
                count: (prev?.count ?? 0) + 1,
                lastSeen: !prev || e.receivedAt > prev.lastSeen ? e.receivedAt : prev.lastSeen,
            });
        }
        return Array.from(seen.entries()).map(([email, stats]) => ({
            id: email,
            email,
            provider: "gmail" as const,
            status: "connected" as const,
            lastSyncAt: stats.lastSeen,
            messagesProcessed: stats.count,
        }));
    }, [emails]);

    if (isLoading) return <LoadingState />;

    const unreadCount = emails.filter((e) => !e.isRead).length;
    const linkedCount = emails.filter((e) => e.linkedEntity).length;
    const inboundToday = emails.filter((e) => e.direction === "inbound").length;
    const outboundToday = emails.filter((e) => e.direction === "outbound").length;

    const inboxContent = (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 density-gap-card">
                <StatCard title="Unread" value={unreadCount} icon={Mail} />
                <StatCard title="Linked to Records" value={linkedCount} icon={Link2} />
                <StatCard title="Inbound Today" value={inboundToday} icon={ArrowDownRight} />
                <StatCard title="Outbound Today" value={outboundToday} icon={ArrowUpRight} />
            </div>
            <div className="space-y-2">
                {emails.map((email) => (
                    <Card
                        key={email.id}
                        className={!email.isRead ? "border-primary/20 bg-primary/[0.02]" : ""}
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
                                                <Badge variant="ghost" className="density-caption">
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
                                                    className="density-caption flex items-center gap-1"
                                                >
                                                    {ENTITY_ICONS[email.linkedEntityType || ""]}
                                                    {email.linkedEntity}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="density-caption text-muted-foreground shrink-0 ml-3">
                                    {formatDate(email.receivedAt)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );

    const linkedContent = (
        <div className="density-gap-section">
            {Object.entries(
                emails
                    .filter((e) => e.linkedEntity)
                    .reduce<Record<string, EmailMessage[]>>((acc, email) => {
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
                                <CardTitle className="text-sm">{first.linkedEntity}</CardTitle>
                                <Badge variant="ghost" className="density-caption capitalize">
                                    {first.linkedEntityType}
                                </Badge>
                                <Badge variant="info" className="density-caption">
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
    );

    const accountsContent = (
        <div className="density-gap-section">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Connected Accounts</h3>
                <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Add Account
                </Button>
            </div>
            {accounts.map((account) => (
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
                                    <h4 className="text-sm font-semibold">{account.email}</h4>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                        <Badge
                                            variant={
                                                account.status === "connected"
                                                    ? "success"
                                                    : account.status === "error"
                                                      ? "destructive"
                                                      : "ghost"
                                            }
                                            className="density-caption"
                                        >
                                            {account.status === "connected" ? (
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                            ) : (
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                            )}
                                            {account.status}
                                        </Badge>
                                        <span className="capitalize">{account.provider}</span>
                                        <span>·</span>
                                        <span>{account.messagesProcessed} messages</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="density-caption text-muted-foreground">
                                    Last sync: {formatDate(account.lastSyncAt)}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        addToast({
                                            title: "Syncing",
                                            description: `Syncing ${account.email}…`,
                                            variant: "default",
                                        })
                                    }
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        addToast({
                                            title: "Coming soon",
                                            description: `Account settings for ${account.email} coming soon.`,
                                            variant: "default",
                                        })
                                    }
                                >
                                    <Settings className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    const config: SettingsPageConfig = {
        resource: "settings",
        action: "read",
        title: "Email Integration",
        description: "Bi-directional email sync with automatic record linking",
        headerActions: (
            <Button
                size="sm"
                onClick={() =>
                    addToast({
                        title: "Syncing",
                        description: "Email sync started for all accounts.",
                        variant: "default",
                    })
                }
            >
                <RefreshCw className="h-4 w-4" /> Sync Now
            </Button>
        ),
        tabs: [
            { id: "inbox", label: "Activity Feed", icon: Inbox, content: inboxContent },
            { id: "linked", label: "Linked Emails", icon: Link2, content: linkedContent },
            { id: "settings", label: "Accounts", icon: Settings, content: accountsContent },
        ],
    };

    return (
        <>
            <SettingsPageShell config={config} />
            <CreateEntityDialog
                config={CREATE_EMAIL_ACCOUNT_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </>
    );
}
