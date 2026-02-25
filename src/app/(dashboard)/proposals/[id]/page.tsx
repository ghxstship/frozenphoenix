"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { brandConfig } from "@/config/brand";
import {
    ArrowLeft,
    Save,
    Send,
    Eye,
    Edit,
    Plus,
    Trash2,
    GripVertical,
    FileText,
    DollarSign,
    Building2,
    Calendar,
    Copy,
    Download,
    CheckCircle,
    Clock,
} from "lucide-react";

type ProposalTab = "editor" | "preview" | "activity";

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

const mockProposal = {
    id: "1",
    number: "PROP-2026-0001",
    title: "Nike Air Max Launch Experience",
    companyName: "Nike",
    contactName: "John Smith",
    contactEmail: "john.smith@nike.com",
    status: "draft" as const,
    validUntil: "2026-03-15",
    createdAt: "2026-02-08",
    version: 2,
    currency: "USD",
    notes: "This proposal includes all production, fabrication, and logistics for the Air Max Launch Experience activation.",
    terms: "Net 30. 50% deposit required upon acceptance. Balance due upon project completion.",
    sections: [
        {
            id: "s1",
            title: "Creative & Design",
            items: [
                { id: "i1", description: "Creative Direction & Concept Development", quantity: 1, unit: "lot", unitPrice: 45000, total: 45000 },
                { id: "i2", description: "3D Rendering & Visualization (4 views)", quantity: 4, unit: "ea", unitPrice: 3500, total: 14000 },
                { id: "i3", description: "Brand Guidelines Application & Adaptation", quantity: 1, unit: "lot", unitPrice: 8000, total: 8000 },
            ],
        },
        {
            id: "s2",
            title: "Fabrication & Build",
            items: [
                { id: "i4", description: "Custom Activation Booth (20x30ft)", quantity: 1, unit: "ea", unitPrice: 125000, total: 125000 },
                { id: "i5", description: "LED Video Wall (16x9ft, 2.5mm pitch)", quantity: 1, unit: "ea", unitPrice: 65000, total: 65000 },
                { id: "i6", description: "Interactive Product Display Pedestals", quantity: 8, unit: "ea", unitPrice: 4500, total: 36000 },
                { id: "i7", description: "Branded Signage & Graphics Package", quantity: 1, unit: "lot", unitPrice: 18000, total: 18000 },
            ],
        },
        {
            id: "s3",
            title: "Technology & Interactive",
            items: [
                { id: "i8", description: "RFID Experience Tracking System", quantity: 1, unit: "lot", unitPrice: 35000, total: 35000 },
                { id: "i9", description: "AR Photo Activation (Custom Filter)", quantity: 1, unit: "ea", unitPrice: 28000, total: 28000 },
                { id: "i10", description: "Social Media Integration Wall", quantity: 1, unit: "ea", unitPrice: 22000, total: 22000 },
            ],
        },
        {
            id: "s4",
            title: "Production & Logistics",
            items: [
                { id: "i11", description: "Project Management (8 weeks)", quantity: 8, unit: "wk", unitPrice: 5000, total: 40000 },
                { id: "i12", description: "Shipping & Freight (LA → NYC)", quantity: 1, unit: "lot", unitPrice: 18000, total: 18000 },
                { id: "i13", description: "Install & Strike Crew (12 ppl × 3 days)", quantity: 36, unit: "man-day", unitPrice: 850, total: 30600 },
                { id: "i14", description: "On-Site Production Manager (4 days)", quantity: 4, unit: "day", unitPrice: 2500, total: 10000 },
            ],
        },
    ],
    activity: [
        { date: "2026-02-24", action: "Version 2 saved", user: "Alex Rivera" },
        { date: "2026-02-20", action: "Line items updated — added AR photo activation", user: "Alex Rivera" },
        { date: "2026-02-15", action: "Client feedback received", user: "John Smith (Nike)" },
        { date: "2026-02-10", action: "Version 1 sent to client", user: "Alex Rivera" },
        { date: "2026-02-08", action: "Proposal created", user: "Alex Rivera" },
    ],
};

const statusConfig: Record<string, { label: string; variant: "default" | "info" | "success" | "warning" | "destructive" | "ghost" }> = {
    draft: { label: "Draft", variant: "ghost" },
    sent: { label: "Sent", variant: "info" },
    viewed: { label: "Viewed", variant: "warning" },
    accepted: { label: "Accepted", variant: "success" },
    rejected: { label: "Rejected", variant: "destructive" },
    expired: { label: "Expired", variant: "ghost" },
};


export default function ProposalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const proposalId = params.id as string;
    void proposalId;
    const [activeTab, setActiveTab] = useState<ProposalTab>("editor");
    const [sections, setSections] = useState<ProposalSection[]>(mockProposal.sections);
    const [title, setTitle] = useState(mockProposal.title);
    const [notes, setNotes] = useState(mockProposal.notes);
    const [terms, setTerms] = useState(mockProposal.terms);
    const counterRef = useRef(100);

    const grandTotal = sections.reduce((sum, s) => sum + s.items.reduce((si, item) => si + item.total, 0), 0);

    function addSection() {
        counterRef.current += 1;
        setSections((prev) => [...prev, { id: `s-new-${counterRef.current}`, title: "New Section", items: [] }]);
    }

    function removeSection(sectionId: string) {
        setSections((prev) => prev.filter((s) => s.id !== sectionId));
    }

    function addLineItem(sectionId: string) {
        counterRef.current += 1;
        setSections((prev) =>
            prev.map((s) =>
                s.id === sectionId
                    ? { ...s, items: [...s.items, { id: `i-new-${counterRef.current}`, description: "", quantity: 1, unit: "ea", unitPrice: 0, total: 0 }] }
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

    function updateLineItem(sectionId: string, itemId: string, field: keyof LineItem, value: string | number) {
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
        setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, title: newTitle } : s)));
    }

    const tabItems: { id: ProposalTab; label: string; icon: React.ElementType }[] = [
        { id: "editor", label: "Editor", icon: Edit },
        { id: "preview", label: "Preview", icon: Eye },
        { id: "activity", label: "Activity", icon: Clock },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/proposals")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-muted-foreground">{mockProposal.number}</span>
                            <Badge variant={statusConfig[mockProposal.status]?.variant}>{statusConfig[mockProposal.status]?.label}</Badge>
                            <Badge variant="ghost">v{mockProposal.version}</Badge>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{mockProposal.companyName}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Valid until {formatDate(mockProposal.validUntil)}</span>
                            <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{formatCurrency(grandTotal)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm"><Copy className="h-4 w-4 mr-1" />Duplicate</Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />PDF</Button>
                    <Button variant="outline" size="sm"><Save className="h-4 w-4 mr-1" />Save</Button>
                    <Button size="sm"><Send className="h-4 w-4 mr-1" />Send</Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
                {tabItems.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Editor Tab */}
            {activeTab === "editor" && (
                <div className="space-y-6">
                    {/* Proposal Details */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Proposal Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Client Contact</label>
                                    <Input value={mockProposal.contactName} disabled />
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

                    {/* Line Item Sections */}
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
                                        <span className="text-sm font-medium">{formatCurrency(sectionTotal)}</span>
                                        <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {/* Header Row */}
                                        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                                            <div className="col-span-5">Description</div>
                                            <div className="col-span-1 text-right">Qty</div>
                                            <div className="col-span-1 text-center">Unit</div>
                                            <div className="col-span-2 text-right">Unit Price</div>
                                            <div className="col-span-2 text-right">Total</div>
                                            <div className="col-span-1" />
                                        </div>

                                        {section.items.map((item) => (
                                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-5">
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateLineItem(section.id, item.id, "description", e.target.value)}
                                                        placeholder="Line item description..."
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateLineItem(section.id, item.id, "quantity", parseFloat(e.target.value) || 0)}
                                                        className="text-sm text-right"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Input
                                                        value={item.unit}
                                                        onChange={(e) => updateLineItem(section.id, item.id, "unit", e.target.value)}
                                                        className="text-sm text-center"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateLineItem(section.id, item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                                        className="text-sm text-right"
                                                    />
                                                </div>
                                                <div className="col-span-2 text-right text-sm font-medium px-2">
                                                    {formatCurrency(item.total)}
                                                </div>
                                                <div className="col-span-1 flex justify-end">
                                                    <Button variant="ghost" size="sm" onClick={() => removeLineItem(section.id, item.id)}>
                                                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => addLineItem(section.id)}>
                                            <Plus className="h-4 w-4 mr-1" />Add Line Item
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    <Button variant="outline" className="w-full" onClick={addSection}>
                        <Plus className="h-4 w-4 mr-1" />Add Section
                    </Button>

                    {/* Totals & Terms */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Terms & Conditions</CardTitle></CardHeader>
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
                            <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {sections.map((s) => (
                                    <div key={s.id} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{s.title}</span>
                                        <span className="font-medium">{formatCurrency(s.items.reduce((sum, i) => sum + i.total, 0))}</span>
                                    </div>
                                ))}
                                <div className="border-t border-border pt-3 flex justify-between">
                                    <span className="text-base font-semibold">Grand Total</span>
                                    <span className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Preview Tab */}
            {activeTab === "preview" && (
                <Card className="max-w-4xl mx-auto">
                    <CardContent className="p-8 space-y-8">
                        {/* Preview Header */}
                        <div className="border-b border-border pb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">{title}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">{mockProposal.number} · Version {mockProposal.version}</p>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                    <p>Date: {formatDate(mockProposal.createdAt)}</p>
                                    <p>Valid Until: {formatDate(mockProposal.validUntil)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div>
                                <p className="font-semibold mb-1">Prepared For</p>
                                <p>{mockProposal.contactName}</p>
                                <p className="text-muted-foreground">{mockProposal.companyName}</p>
                                <p className="text-muted-foreground">{mockProposal.contactEmail}</p>
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Prepared By</p>
                                <p>{brandConfig.name}</p>
                                <p className="text-muted-foreground">Los Angeles, CA</p>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        {notes && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Executive Summary</h3>
                                <p className="text-sm leading-relaxed">{notes}</p>
                            </div>
                        )}

                        {/* Line Item Sections */}
                        {sections.map((section) => {
                            const sectionTotal = section.items.reduce((sum, i) => sum + i.total, 0);
                            return (
                                <div key={section.id}>
                                    <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">{section.title}</h3>
                                    <div className="border border-border rounded-lg overflow-hidden">
                                        <div className="grid grid-cols-12 gap-2 bg-secondary/30 px-4 py-2 text-xs font-medium text-muted-foreground">
                                            <div className="col-span-6">Description</div>
                                            <div className="col-span-1 text-right">Qty</div>
                                            <div className="col-span-1 text-center">Unit</div>
                                            <div className="col-span-2 text-right">Rate</div>
                                            <div className="col-span-2 text-right">Amount</div>
                                        </div>
                                        {section.items.map((item) => (
                                            <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 text-sm border-t border-border/50">
                                                <div className="col-span-6">{item.description}</div>
                                                <div className="col-span-1 text-right">{item.quantity}</div>
                                                <div className="col-span-1 text-center text-muted-foreground">{item.unit}</div>
                                                <div className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</div>
                                                <div className="col-span-2 text-right font-medium">{formatCurrency(item.total)}</div>
                                            </div>
                                        ))}
                                        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-sm border-t border-border bg-secondary/20">
                                            <div className="col-span-10 text-right font-semibold">Section Total</div>
                                            <div className="col-span-2 text-right font-bold">{formatCurrency(sectionTotal)}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Grand Total */}
                        <div className="border-t-2 border-primary pt-4 flex justify-between items-center">
                            <span className="text-lg font-bold">Total Investment</span>
                            <span className="text-2xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
                        </div>

                        {/* Terms */}
                        {terms && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Terms & Conditions</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{terms}</p>
                            </div>
                        )}

                        {/* Signature Block */}
                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border">
                            <div className="space-y-8">
                                <p className="text-sm font-semibold">Client Acceptance</p>
                                <div className="border-b border-border" />
                                <p className="text-xs text-muted-foreground">Signature & Date</p>
                            </div>
                            <div className="space-y-8">
                                <p className="text-sm font-semibold">Prepared By</p>
                                <div className="border-b border-border" />
                                <p className="text-xs text-muted-foreground">Signature & Date</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
                <Card>
                    <CardHeader><CardTitle className="text-base">Proposal Activity</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockProposal.activity.map((event, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="mt-0.5 h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                        {i === 0 ? <Edit className="h-4 w-4 text-primary" /> :
                                         event.action.includes("sent") ? <Send className="h-4 w-4 text-info" /> :
                                         event.action.includes("feedback") ? <CheckCircle className="h-4 w-4 text-success" /> :
                                         <FileText className="h-4 w-4 text-muted-foreground" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{event.action}</p>
                                        <p className="text-xs text-muted-foreground">{event.user} · {formatDate(event.date)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
