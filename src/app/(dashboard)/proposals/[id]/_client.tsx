"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteProposal, useProposal, useUpdateProposal } from "@/lib/supabase";
import { useProposalWithItems } from "@/lib/supabase/hooks-crm";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { getActiveBrand } from "@/config/brands";
import { OverlineText } from "@/components/ui/overline-text";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    Building2,
    CheckCircle,
    Copy,
    Download,
    Edit,
    ExternalLink,
    FileText,
    GripVertical,
    Link2,
    Loader2,
    Package,
    PenLine,
    Plus,
    Send,
    Shield,
    Trash2,
} from "lucide-react";

function ProposalItemsTab({ proposalId }: { proposalId: string }) {
    const { data: proposalData, isLoading } = useProposalWithItems(proposalId);
    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }
    const items = Array.isArray((proposalData as Record<string, unknown> | null)?.proposal_items)
        ? ((proposalData as Record<string, unknown>).proposal_items as Record<string, unknown>[])
        : [];
    if (items.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No proposal items from the database.
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Proposal Items (DB) ({items.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div
                            key={String(item.id ?? i)}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {String(item.description ?? item.name ?? `Item ${i + 1}`)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Qty: {String(item.quantity ?? 1)} ×{" "}
                                    {formatCurrency(Number(item.unit_price ?? 0))}
                                </p>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                                {formatCurrency(Number(item.total ?? 0))}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

const brandConfig = getActiveBrand();

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "proposal",
    titleKey: "title",
    statusKey: "status",
    icon: FileText,
    backHref: "/proposals",
    backLabel: "Proposals",
    chatter: false,
    fields: [],
    tabs: [],
};

interface LineItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
}

interface ProposalSection {
    id: string;
    title: string;
    items: LineItem[];
}

function parseSections(raw: unknown): ProposalSection[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((s) => ({
        id: String(s.id ?? ""),
        title: String(s.title ?? ""),
        items: (Array.isArray(s.items) ? s.items : []).map((li: Record<string, unknown>) => ({
            id: String(li.id ?? ""),
            description: String(li.description ?? ""),
            quantity: (li.quantity as number) ?? 0,
            unit: String(li.unit ?? "ea"),
            unitPrice: (li.unit_price as number) ?? (li.unitPrice as number) ?? 0,
            total:
                ((li.quantity as number) ?? 0) *
                ((li.unit_price as number) ?? (li.unitPrice as number) ?? 0),
        })),
    }));
}

function parseActivity(raw: unknown): { date: string; action: string; user: string }[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((a) => ({
        date: String(a.date ?? ""),
        action: String(a.action ?? ""),
        user: String(a.user ?? ""),
    }));
}

export function ProposalDetailPageClient() {
    const params = useParams();
    const router = useRouter();
    const proposalId = params.id as string;
    const { data: sbRecord, isLoading } = useProposal(proposalId);
    const prop = sbRecord as Record<string, unknown> | null;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: proposalId,
        entityLabel: "Proposal",
        listPath: "/proposals",
        useUpdateHook: useUpdateProposal,
        useDeleteHook: useDeleteProposal,
    });
    // Tab state managed by DetailPageShell

    const proposalNumber = (prop?.number as string) ?? "";
    const companyName = (prop?.company_name as string) ?? "";
    const contactName = (prop?.contact_name as string) ?? "";
    const contactEmail = (prop?.contact_email as string) ?? "";
    const validUntil = (prop?.valid_until as string) ?? "";
    const createdAt = (prop?.created_at as string) ?? "";
    const version = (prop?.version as number) ?? 1;
    const activity = parseActivity(prop?.activity);

    const [sections, setSections] = useState<ProposalSection[]>([]);
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [terms, setTerms] = useState("");
    const [initialized, setInitialized] = useState(false);
    const counterRef = useRef(100);

    useEffect(() => {
        if (prop && !initialized) {
            setSections(parseSections(prop.sections));
            setTitle((prop.title as string) ?? "");
            setNotes((prop.notes as string) ?? "");
            setTerms((prop.terms as string) ?? "");
            setInitialized(true);
        }
    }, [prop, initialized]);

    // ─── Share link state ───
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareLink, setShareLink] = useState("");
    const [linkCopied, setLinkCopied] = useState(false);

    // ─── E-sign state ───
    const [eSignDialogOpen, setESignDialogOpen] = useState(false);
    const [signerName, setSignerName] = useState("");
    const [signerEmail, setSignerEmail] = useState("");

    useEffect(() => {
        if (prop && !signerName && contactName) setSignerName(contactName);
        if (prop && !signerEmail && contactEmail) setSignerEmail(contactEmail);
    }, [prop, contactName, contactEmail, signerName, signerEmail]);
    const [signatureAgreed, setSignatureAgreed] = useState(false);
    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);
    const handleAddChatterComment = async (content: string) => {
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

    const grandTotal = sections.reduce(
        (sum, s) => sum + s.items.reduce((si, item) => si + item.total, 0),
        0
    );

    function addSection() {
        counterRef.current += 1;
        setSections((prev) => [
            ...prev,
            { id: `s-new-${counterRef.current}`, title: "New Section", items: [] },
        ]);
    }

    function removeSection(sectionId: string) {
        setSections((prev) => prev.filter((s) => s.id !== sectionId));
    }

    function addLineItem(sectionId: string) {
        counterRef.current += 1;
        setSections((prev) =>
            prev.map((s) =>
                s.id === sectionId
                    ? {
                          ...s,
                          items: [
                              ...s.items,
                              {
                                  id: `i-new-${counterRef.current}`,
                                  description: "",
                                  quantity: 1,
                                  unit: "ea",
                                  unitPrice: 0,
                                  total: 0,
                              },
                          ],
                      }
                    : s
            )
        );
    }

    function removeLineItem(sectionId: string, itemId: string) {
        setSections((prev) =>
            prev.map((s) =>
                s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s
            )
        );
    }

    function updateLineItem(
        sectionId: string,
        itemId: string,
        field: keyof LineItem,
        value: string | number
    ) {
        setSections((prev) =>
            prev.map((s) =>
                s.id === sectionId
                    ? {
                          ...s,
                          items: s.items.map((i) => {
                              if (i.id !== itemId) return i;
                              const updated = { ...i, [field]: value };
                              if (field === "quantity" || field === "unitPrice") {
                                  updated.total = updated.quantity * updated.unitPrice;
                              }
                              return updated;
                          }),
                      }
                    : s
            )
        );
    }

    function updateSectionTitle(sectionId: string, newTitle: string) {
        setSections((prev) =>
            prev.map((s) => (s.id === sectionId ? { ...s, title: newTitle } : s))
        );
    }

    const generateShareLink = useCallback(() => {
        const token = crypto.randomUUID().replace(/-/g, "").slice(0, 24);
        const link = `${window.location.origin}/p/${token}`;
        setShareLink(link);
        setLinkCopied(false);
        setShareDialogOpen(true);
    }, []);

    const copyShareLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            // Fallback for non-HTTPS contexts
        }
    }, [shareLink]);

    const sidebarSlot = (
        <div className="density-gap-section">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Proposal Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Number</span>
                        <span className="text-sm font-mono">{proposalNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Version</span>
                        <span className="text-sm font-medium">v{version}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Valid Until</span>
                        <span className="text-sm font-medium">
                            {validUntil ? formatDate(validUntil) : "—"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Created</span>
                        <span className="text-sm font-medium">
                            {createdAt ? formatDate(createdAt) : "—"}
                        </span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{companyName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{contactName}</p>
                    <p className="text-xs text-muted-foreground">{contactEmail}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {sections.map((s) => (
                        <div key={s.id} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{s.title}</span>
                            <span className="font-medium">
                                {formatCurrency(s.items.reduce((sum, i) => sum + i.total, 0))}
                            </span>
                        </div>
                    ))}
                    <div className="border-t border-border pt-2 flex justify-between">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-sm font-bold text-primary">
                            {formatCurrency(grandTotal)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const overviewSlot = (
        <div className="density-gap-page">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Proposal Details</CardTitle>
                </CardHeader>
                <CardContent className="density-gap-section">
                    <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Client Contact</label>
                            <Input value={contactName} disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes / Executive Summary</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                </CardContent>
            </Card>

            {sections.map((section) => {
                const sectionTotal = section.items.reduce((sum, i) => sum + i.total, 0);
                return (
                    <Card key={section.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                <Input
                                    value={section.title}
                                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                    className="text-base font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {formatCurrency(sectionTotal)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSection(section.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                                    <div className="col-span-5">Description</div>
                                    <div className="col-span-1 text-right">Qty</div>
                                    <div className="col-span-1 text-center">Unit</div>
                                    <div className="col-span-2 text-right">Unit Price</div>
                                    <div className="col-span-2 text-right">Total</div>
                                    <div className="col-span-1" />
                                </div>
                                {section.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-12 gap-2 items-center"
                                    >
                                        <div className="col-span-5">
                                            <Input
                                                value={item.description}
                                                onChange={(e) =>
                                                    updateLineItem(
                                                        section.id,
                                                        item.id,
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Line item description..."
                                                className="text-sm"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateLineItem(
                                                        section.id,
                                                        item.id,
                                                        "quantity",
                                                        parseFloat(e.target.value) || 0
                                                    )
                                                }
                                                className="text-sm text-right"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Input
                                                value={item.unit}
                                                onChange={(e) =>
                                                    updateLineItem(
                                                        section.id,
                                                        item.id,
                                                        "unit",
                                                        e.target.value
                                                    )
                                                }
                                                className="text-sm text-center"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) =>
                                                    updateLineItem(
                                                        section.id,
                                                        item.id,
                                                        "unitPrice",
                                                        parseFloat(e.target.value) || 0
                                                    )
                                                }
                                                className="text-sm text-right"
                                            />
                                        </div>
                                        <div className="col-span-2 text-right text-sm font-medium px-2">
                                            {formatCurrency(item.total)}
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeLineItem(section.id, item.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => addLineItem(section.id)}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Line Item
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            <Button variant="outline" className="w-full" onClick={addSection}>
                <Plus className="h-4 w-4 mr-1" />
                Add Section
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Terms & Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            value={terms}
                            onChange={(e) => setTerms(e.target.value)}
                            rows={4}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {sections.map((s) => (
                            <div key={s.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{s.title}</span>
                                <span className="font-medium">
                                    {formatCurrency(s.items.reduce((sum, i) => sum + i.total, 0))}
                                </span>
                            </div>
                        ))}
                        <div className="border-t border-border pt-3 flex justify-between">
                            <span className="text-base font-semibold">Grand Total</span>
                            <span className="text-xl font-bold text-primary">
                                {formatCurrency(grandTotal)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => `${companyName} — ${formatCurrency(grandTotal)}`,
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "preview",
                label: "Preview",
                content: (
                    <Card className="max-w-4xl mx-auto">
                        <CardContent className="p-8 space-y-8">
                            <div className="border-b border-border pb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold">{title}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {proposalNumber} · Version {version}
                                        </p>
                                    </div>
                                    <div className="text-right text-sm text-muted-foreground">
                                        <p>Date: {createdAt ? formatDate(createdAt) : "—"}</p>
                                        <p>
                                            Valid Until: {validUntil ? formatDate(validUntil) : "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                                <div>
                                    <p className="font-semibold mb-1">Prepared For</p>
                                    <p>{contactName}</p>
                                    <p className="text-muted-foreground">{companyName}</p>
                                    <p className="text-muted-foreground">{contactEmail}</p>
                                </div>
                                <div>
                                    <p className="font-semibold mb-1">Prepared By</p>
                                    <p>{brandConfig.name}</p>
                                    <p className="text-muted-foreground">Los Angeles, CA</p>
                                </div>
                            </div>
                            {notes && (
                                <div>
                                    <OverlineText as="h3" className="text-sm mb-2">
                                        Executive Summary
                                    </OverlineText>
                                    <p className="text-sm leading-relaxed">{notes}</p>
                                </div>
                            )}
                            {sections.map((section) => {
                                const st = section.items.reduce((sum, i) => sum + i.total, 0);
                                return (
                                    <div key={section.id}>
                                        <OverlineText as="h3" className="text-sm mb-3">
                                            {section.title}
                                        </OverlineText>
                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <div className="grid grid-cols-12 gap-2 bg-secondary/30 px-4 py-2 text-xs font-medium text-muted-foreground">
                                                <div className="col-span-6">Description</div>
                                                <div className="col-span-1 text-right">Qty</div>
                                                <div className="col-span-1 text-center">Unit</div>
                                                <div className="col-span-2 text-right">Rate</div>
                                                <div className="col-span-2 text-right">Amount</div>
                                            </div>
                                            {section.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="grid grid-cols-12 gap-2 px-4 py-2.5 text-sm border-t border-border/50"
                                                >
                                                    <div className="col-span-6">
                                                        {item.description}
                                                    </div>
                                                    <div className="col-span-1 text-right">
                                                        {item.quantity}
                                                    </div>
                                                    <div className="col-span-1 text-center text-muted-foreground">
                                                        {item.unit}
                                                    </div>
                                                    <div className="col-span-2 text-right">
                                                        {formatCurrency(item.unitPrice)}
                                                    </div>
                                                    <div className="col-span-2 text-right font-medium">
                                                        {formatCurrency(item.total)}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-sm border-t border-border bg-secondary/20">
                                                <div className="col-span-10 text-right font-semibold">
                                                    Section Total
                                                </div>
                                                <div className="col-span-2 text-right font-bold">
                                                    {formatCurrency(st)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="border-t-2 border-primary pt-4 flex justify-between items-center">
                                <span className="text-lg font-bold">Total Investment</span>
                                <span className="text-2xl font-bold text-primary">
                                    {formatCurrency(grandTotal)}
                                </span>
                            </div>
                            {terms && (
                                <div>
                                    <OverlineText as="h3" className="text-sm mb-2">
                                        Terms & Conditions
                                    </OverlineText>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {terms}
                                    </p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-border">
                                <div className="space-y-8">
                                    <p className="text-sm font-semibold">Client Acceptance</p>
                                    <div className="border-b border-border" />
                                    <p className="text-xs text-muted-foreground">
                                        Signature & Date
                                    </p>
                                </div>
                                <div className="space-y-8">
                                    <p className="text-sm font-semibold">Prepared By</p>
                                    <div className="border-b border-border" />
                                    <p className="text-xs text-muted-foreground">
                                        Signature & Date
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "activity",
                label: "Activity",
                count: activity.length,
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Proposal Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="density-gap-section">
                                {activity.map((event, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                            {i === 0 ? (
                                                <Edit className="h-4 w-4 text-primary" />
                                            ) : event.action.includes("sent") ? (
                                                <Send className="h-4 w-4 text-info" />
                                            ) : event.action.includes("feedback") ? (
                                                <CheckCircle className="h-4 w-4 text-success" />
                                            ) : (
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{event.action}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {event.user} · {formatDate(event.date)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "items-db",
                label: "Items (DB)",
                content: <ProposalItemsTab proposalId={proposalId} />,
            },
            {
                id: "chatter",
                label: "Chatter",
                content: (
                    <RecordChatter
                        recordType="proposal"
                        recordId={proposalId}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddChatterComment}
                    />
                ),
            },
        ],
    };

    const record = prop ? { ...prop, title } : null;

    return (
        <>
            <DetailPageShell
                config={config}
                id={proposalId}
                record={record}
                isLoading={isLoading}
                menuItems={[
                    {
                        label: "Duplicate",
                        onClick: () => router.push(`/proposals/new?duplicateFrom=${proposalId}`),
                    },
                    { label: "Save Draft", onClick: () => handleUpdate({ status: "draft" }) },
                    ...crudMenuItems,
                ]}
                avatar={
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <FileText className="h-7 w-7 text-primary-foreground" />
                    </div>
                }
                actions={
                    <>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={generateShareLink}>
                            <Link2 className="h-4 w-4 mr-1" />
                            Share
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setESignDialogOpen(true)}
                        >
                            <PenLine className="h-4 w-4 mr-1" />
                            E-Sign
                        </Button>
                        <Button size="sm">
                            <Send className="h-4 w-4 mr-1" />
                            Send
                        </Button>
                    </>
                }
            />

            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Link2 className="h-5 w-5" />
                            Share Proposal Link
                        </DialogTitle>
                    </DialogHeader>
                    <div className="density-gap-section py-2">
                        <p className="text-sm text-muted-foreground">
                            Anyone with this link can view the proposal. The link does not expire
                            but can be revoked.
                        </p>
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={shareLink}
                                className="font-mono text-xs"
                                aria-label="Share link URL"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyShareLink}
                                className="shrink-0"
                            >
                                {linkCopied ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-1 text-success" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
                            <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>
                                This link grants read-only access to the proposal preview.
                                Recipients cannot edit the proposal or access other data.
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShareDialogOpen(false)}
                        >
                            Close
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                copyShareLink();
                                setShareDialogOpen(false);
                            }}
                        >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Copy & Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={eSignDialogOpen} onOpenChange={setESignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PenLine className="h-5 w-5" />
                            Request E-Signature
                        </DialogTitle>
                    </DialogHeader>
                    <div className="density-gap-section py-2">
                        <p className="text-sm text-muted-foreground">
                            Send this proposal to the client for electronic signature. They will
                            receive an email with a secure link.
                        </p>
                        <div className="space-y-3">
                            <div>
                                <label
                                    htmlFor="esign-name"
                                    className="text-sm font-medium mb-1 block"
                                >
                                    Signer Name
                                </label>
                                <Input
                                    id="esign-name"
                                    value={signerName}
                                    onChange={(e) => setSignerName(e.target.value)}
                                    placeholder="Full name of signer"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="esign-email"
                                    className="text-sm font-medium mb-1 block"
                                >
                                    Signer Email
                                </label>
                                <Input
                                    id="esign-email"
                                    type="email"
                                    value={signerEmail}
                                    onChange={(e) => setSignerEmail(e.target.value)}
                                    placeholder="client@company.com"
                                />
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg border">
                            <input
                                type="checkbox"
                                id="esign-agree"
                                checked={signatureAgreed}
                                onChange={(e) => setSignatureAgreed(e.target.checked)}
                                className="mt-1 rounded"
                            />
                            <label
                                htmlFor="esign-agree"
                                className="text-xs text-muted-foreground leading-relaxed"
                            >
                                I confirm this proposal is final and ready for client signature. The
                                signer will receive a legally binding e-signature request via email.
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setESignDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            disabled={!signatureAgreed || !signerName.trim() || !signerEmail.trim()}
                            onClick={() => {
                                setESignDialogOpen(false);
                                setSignatureAgreed(false);
                            }}
                        >
                            <Send className="h-4 w-4 mr-1" />
                            Send for Signature
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
