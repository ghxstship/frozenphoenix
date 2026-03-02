"use client";

import { logger } from "@/lib/logger";
import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { PermissionGate } from "@/components/permission-guard";
import { isSupabaseConfigured, useCreateProposal } from "@/lib/supabase/hooks-pages";
import { formatCurrency } from "@/lib/utils";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    ChevronRight,
    ClipboardList,
    DollarSign,
    FileText,
    GripVertical,
    Loader2,
    Plus,
    Trash2,
    Upload,
} from "lucide-react";

// ─── Types ───
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

interface RateCardItem {
    id: string;
    name: string;
    description: string;
    unit: string;
    rate: number;
    category: string;
}

// ─── Step definitions ───
const STEPS = [
    { id: "client", label: "Client & Deal", icon: Building2 },
    { id: "items", label: "Line Items", icon: ClipboardList },
    { id: "terms", label: "Terms & Review", icon: FileText },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// ─── Mock companies & deals for demo mode ───
const MOCK_COMPANIES = [
    { id: "co1", name: "Nike" },
    { id: "co2", name: "Red Bull" },
    { id: "co3", name: "Coachella Valley Music" },
    { id: "co4", name: "TechStart Inc" },
    { id: "co5", name: "Momentum Worldwide" },
];

const MOCK_CONTACTS = [
    { id: "ct1", name: "John Smith", companyId: "co1", email: "john@nike.com" },
    { id: "ct2", name: "Maria Garcia", companyId: "co2", email: "maria@redbull.com" },
    { id: "ct3", name: "Alex Johnson", companyId: "co3", email: "alex@coachella.com" },
    { id: "ct4", name: "Sam Wilson", companyId: "co4", email: "sam@techstart.com" },
    { id: "ct5", name: "Chris Lee", companyId: "co5", email: "chris@momentum.com" },
];

const MOCK_DEALS = [
    { id: "d1", title: "Air Max Launch Experience", companyId: "co1", value: 500000 },
    { id: "d2", title: "Festival Activation 2026", companyId: "co2", value: 350000 },
    { id: "d3", title: "Brand Experience Package", companyId: "co3", value: 800000 },
];

const MOCK_RATE_CARD_ITEMS: RateCardItem[] = [
    {
        id: "rc1",
        name: "Creative Direction",
        description: "Creative Direction & Concept Development",
        unit: "lot",
        rate: 45000,
        category: "Creative",
    },
    {
        id: "rc2",
        name: "3D Rendering",
        description: "3D Rendering & Visualization (per view)",
        unit: "ea",
        rate: 3500,
        category: "Creative",
    },
    {
        id: "rc3",
        name: "Brand Adaptation",
        description: "Brand Guidelines Application",
        unit: "lot",
        rate: 8000,
        category: "Creative",
    },
    {
        id: "rc4",
        name: "Custom Booth (20x30)",
        description: "Custom Activation Booth 20×30ft",
        unit: "ea",
        rate: 125000,
        category: "Fabrication",
    },
    {
        id: "rc5",
        name: "LED Wall (16x9)",
        description: "LED Video Wall 16×9ft 2.5mm pitch",
        unit: "ea",
        rate: 65000,
        category: "Fabrication",
    },
    {
        id: "rc6",
        name: "Display Pedestals",
        description: "Interactive Product Display Pedestals",
        unit: "ea",
        rate: 4500,
        category: "Fabrication",
    },
    {
        id: "rc7",
        name: "RFID Tracking",
        description: "RFID Experience Tracking System",
        unit: "lot",
        rate: 35000,
        category: "Technology",
    },
    {
        id: "rc8",
        name: "AR Activation",
        description: "AR Photo Activation (Custom Filter)",
        unit: "ea",
        rate: 28000,
        category: "Technology",
    },
    {
        id: "rc9",
        name: "Project Management",
        description: "Project Management (per week)",
        unit: "wk",
        rate: 5000,
        category: "Production",
    },
    {
        id: "rc10",
        name: "Install Crew",
        description: "Install & Strike Crew (per man-day)",
        unit: "man-day",
        rate: 850,
        category: "Production",
    },
    {
        id: "rc11",
        name: "Shipping",
        description: "Shipping & Freight (domestic)",
        unit: "lot",
        rate: 18000,
        category: "Logistics",
    },
    {
        id: "rc12",
        name: "On-Site PM",
        description: "On-Site Production Manager (per day)",
        unit: "day",
        rate: 2500,
        category: "Production",
    },
];

export default function NewProposalPage() {
    const router = useRouter();
    const createProposal = useCreateProposal();
    const counterRef = useRef(0);

    // ─── Step state ───
    const [currentStep, setCurrentStep] = useState<StepId>("client");
    const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

    // ─── Step 1: Client & Deal ───
    const [title, setTitle] = useState("");
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedContact, setSelectedContact] = useState("");
    const [selectedDeal, setSelectedDeal] = useState("");
    const [validUntil, setValidUntil] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split("T")[0];
    });
    const [currency, setCurrency] = useState("USD");

    // ─── Step 2: Line Items ───
    const [sections, setSections] = useState<ProposalSection[]>([
        { id: "s1", title: "Services", items: [] },
    ]);
    const [rateCardSearch, setRateCardSearch] = useState("");
    const [showRateCard, setShowRateCard] = useState(false);

    // ─── Step 3: Terms ───
    const [notes, setNotes] = useState("");
    const [terms, setTerms] = useState(
        "Net 30. 50% deposit required upon acceptance. Balance due upon project completion."
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ─── Computed ───
    const grandTotal = sections.reduce(
        (sum, s) => sum + s.items.reduce((si, item) => si + item.total, 0),
        0
    );

    const filteredContacts = MOCK_CONTACTS.filter(
        (c) => !selectedCompany || c.companyId === selectedCompany
    );

    const filteredDeals = MOCK_DEALS.filter(
        (d) => !selectedCompany || d.companyId === selectedCompany
    );

    const filteredRateItems = MOCK_RATE_CARD_ITEMS.filter(
        (item) =>
            !rateCardSearch ||
            item.name.toLowerCase().includes(rateCardSearch.toLowerCase()) ||
            item.category.toLowerCase().includes(rateCardSearch.toLowerCase())
    );

    const rateCategories = [...new Set(filteredRateItems.map((i) => i.category))];

    // ─── Step validation ───
    const isStep1Valid = title.trim().length > 0 && selectedCompany.length > 0;
    const isStep2Valid = sections.some((s) => s.items.length > 0);

    function canProceed(): boolean {
        if (currentStep === "client") return isStep1Valid;
        if (currentStep === "items") return isStep2Valid;
        return true;
    }

    // ─── Line item helpers ───
    const nextId = useCallback(() => {
        counterRef.current += 1;
        return `new-${counterRef.current}`;
    }, []);

    function addSection() {
        setSections((prev) => [...prev, { id: `s-${nextId()}`, title: "New Section", items: [] }]);
    }

    function removeSection(sectionId: string) {
        setSections((prev) => prev.filter((s) => s.id !== sectionId));
    }

    function addLineItem(sectionId: string, item?: Partial<LineItem>) {
        const id = `i-${nextId()}`;
        const newItem: LineItem = {
            id,
            description: item?.description ?? "",
            quantity: item?.quantity ?? 1,
            unit: item?.unit ?? "ea",
            unitPrice: item?.unitPrice ?? 0,
            total: (item?.quantity ?? 1) * (item?.unitPrice ?? 0),
        };
        setSections((prev) =>
            prev.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s))
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

    function importRateCardItem(rateItem: RateCardItem) {
        // Add to first section by default
        const targetSection = sections[0];
        if (!targetSection) return;
        addLineItem(targetSection.id, {
            description: rateItem.description,
            quantity: 1,
            unit: rateItem.unit,
            unitPrice: rateItem.rate,
        });
    }

    // ─── Navigation ───
    function goNext() {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < STEPS.length) {
            setCurrentStep(STEPS[nextIndex]!.id);
        }
    }

    function goBack() {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(STEPS[prevIndex]!.id);
        }
    }

    // ─── Submit ───
    async function handleSubmit() {
        setIsSubmitting(true);
        try {
            if (isSupabaseConfigured) {
                await createProposal.mutateAsync({
                    title,
                    deal_id: selectedDeal || null,
                    status: "draft",
                    currency,
                    valid_until: validUntil,
                    notes,
                    terms,
                    total: grandTotal,
                });
            }
            router.push("/proposals");
        } catch (error) {
            logger.error("Failed to create proposal", { error });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <PermissionGate resource="proposals" action="write">
            <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/proposals")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">New Proposal</h1>
                        <p className="text-sm text-muted-foreground">
                            Create a client proposal in three steps
                        </p>
                    </div>
                </div>

                {/* Step Indicator */}
                <nav aria-label="Proposal creation steps">
                    <ol className="flex items-center gap-2">
                        {STEPS.map((step, i) => {
                            const StepIcon = step.icon;
                            const isActive = step.id === currentStep;
                            const isComplete = i < currentStepIndex;
                            return (
                                <li key={step.id} className="flex items-center gap-2">
                                    {i > 0 && (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isComplete) setCurrentStep(step.id);
                                        }}
                                        disabled={!isComplete && !isActive}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                            isActive
                                                ? "bg-primary text-primary-foreground font-medium"
                                                : isComplete
                                                  ? "bg-success/10 text-success cursor-pointer hover:bg-success/20"
                                                  : "bg-secondary/50 text-muted-foreground"
                                        }`}
                                    >
                                        {isComplete ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <StepIcon className="h-4 w-4" />
                                        )}
                                        <span className="hidden sm:inline">{step.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                {/* ═══════════════════════════════════════════════════
                    STEP 1: Client & Deal
                   ═══════════════════════════════════════════════════ */}
                {currentStep === "client" && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Proposal Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="proposal-title" className="text-sm font-medium">
                                        Proposal Title
                                    </label>
                                    <Input
                                        id="proposal-title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Nike Air Max Launch Experience"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="company-select"
                                            className="text-sm font-medium"
                                        >
                                            Company
                                        </label>
                                        <select
                                            id="company-select"
                                            value={selectedCompany}
                                            onChange={(e) => {
                                                setSelectedCompany(e.target.value);
                                                setSelectedContact("");
                                                setSelectedDeal("");
                                            }}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="">Select a company</option>
                                            {MOCK_COMPANIES.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="contact-select"
                                            className="text-sm font-medium"
                                        >
                                            Primary Contact
                                        </label>
                                        <select
                                            id="contact-select"
                                            value={selectedContact}
                                            onChange={(e) => setSelectedContact(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            disabled={!selectedCompany}
                                        >
                                            <option value="">Select a contact</option>
                                            {filteredContacts.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="deal-select"
                                            className="text-sm font-medium"
                                        >
                                            Link to Deal (optional)
                                        </label>
                                        <select
                                            id="deal-select"
                                            value={selectedDeal}
                                            onChange={(e) => setSelectedDeal(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="">No linked deal</option>
                                            {filteredDeals.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.title} ({formatCurrency(d.value)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="valid-until"
                                            className="text-sm font-medium"
                                        >
                                            Valid Until
                                        </label>
                                        <Input
                                            id="valid-until"
                                            type="date"
                                            value={validUntil}
                                            onChange={(e) => setValidUntil(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="currency-select"
                                            className="text-sm font-medium"
                                        >
                                            Currency
                                        </label>
                                        <select
                                            id="currency-select"
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="CAD">CAD</option>
                                            <option value="AUD">AUD</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    STEP 2: Line Items + Rate Card Import
                   ═══════════════════════════════════════════════════ */}
                {currentStep === "items" && (
                    <div className="space-y-6">
                        {/* Rate Card Import Panel */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        Import from Rate Card
                                    </CardTitle>
                                    <Button
                                        variant={showRateCard ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setShowRateCard(!showRateCard)}
                                    >
                                        {showRateCard ? "Hide Rate Card" : "Show Rate Card"}
                                    </Button>
                                </div>
                            </CardHeader>
                            {showRateCard && (
                                <CardContent>
                                    <div className="space-y-3">
                                        <SearchInput
                                            value={rateCardSearch}
                                            onValueChange={setRateCardSearch}
                                            placeholder="Search rate card items..."
                                            className="max-w-sm"
                                        />
                                        <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
                                            {rateCategories.map((cat) => (
                                                <div key={cat}>
                                                    <div className="px-3 py-1.5 bg-secondary/30 text-xs font-semibold text-muted-foreground sticky top-0">
                                                        {cat}
                                                    </div>
                                                    {filteredRateItems
                                                        .filter((i) => i.category === cat)
                                                        .map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex items-center justify-between px-3 py-2 border-b border-border/30 hover:bg-secondary/20 transition-colors"
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">
                                                                        {item.name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground truncate">
                                                                        {item.description}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-3 shrink-0">
                                                                    <span className="text-sm font-medium">
                                                                        {formatCurrency(item.rate)}
                                                                        <span className="text-xs text-muted-foreground ml-1">
                                                                            / {item.unit}
                                                                        </span>
                                                                    </span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            importRateCardItem(item)
                                                                        }
                                                                    >
                                                                        <Plus className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* Line Item Sections */}
                        {sections.map((section) => {
                            const sectionTotal = section.items.reduce((sum, i) => sum + i.total, 0);
                            return (
                                <Card key={section.id}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={section.title}
                                                onChange={(e) =>
                                                    updateSectionTitle(section.id, e.target.value)
                                                }
                                                className="text-base font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {formatCurrency(sectionTotal)}
                                            </span>
                                            {sections.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSection(section.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {/* Header Row */}
                                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                                                <div className="col-span-5">Description</div>
                                                <div className="col-span-1 text-right">Qty</div>
                                                <div className="col-span-1 text-center">Unit</div>
                                                <div className="col-span-2 text-right">
                                                    Unit Price
                                                </div>
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
                                                            onClick={() =>
                                                                removeLineItem(section.id, item.id)
                                                            }
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
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    STEP 3: Terms & Review
                   ═══════════════════════════════════════════════════ */}
                {currentStep === "terms" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Terms */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Notes & Terms</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="exec-summary"
                                            className="text-sm font-medium"
                                        >
                                            Executive Summary
                                        </label>
                                        <textarea
                                            id="exec-summary"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={4}
                                            placeholder="Brief description of the proposal scope..."
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="terms-input"
                                            className="text-sm font-medium"
                                        >
                                            Terms & Conditions
                                        </label>
                                        <textarea
                                            id="terms-input"
                                            value={terms}
                                            onChange={(e) => setTerms(e.target.value)}
                                            rows={4}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Review Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Review Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <FileText className="h-3.5 w-3.5" />
                                                Title
                                            </span>
                                            <span className="font-medium">{title}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <Building2 className="h-3.5 w-3.5" />
                                                Company
                                            </span>
                                            <span className="font-medium">
                                                {MOCK_COMPANIES.find(
                                                    (c) => c.id === selectedCompany
                                                )?.name ?? "—"}
                                            </span>
                                        </div>
                                        {selectedDeal && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Linked Deal
                                                </span>
                                                <span className="font-medium">
                                                    {MOCK_DEALS.find((d) => d.id === selectedDeal)
                                                        ?.title ?? "—"}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Valid Until
                                            </span>
                                            <span className="font-medium">{validUntil}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-3 space-y-2">
                                        {sections.map((s) => (
                                            <div
                                                key={s.id}
                                                className="flex justify-between text-sm"
                                            >
                                                <span className="text-muted-foreground">
                                                    {s.title} ({s.items.length} items)
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        s.items.reduce((sum, i) => sum + i.total, 0)
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t-2 border-primary pt-3 flex justify-between items-center">
                                        <span className="text-base font-semibold">Grand Total</span>
                                        <span className="text-xl font-bold text-primary flex items-center gap-1">
                                            <DollarSign className="h-5 w-5" />
                                            {formatCurrency(grandTotal)}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Badge variant="ghost">
                                            {sections.length} section
                                            {sections.length !== 1 ? "s" : ""}
                                        </Badge>
                                        <Badge variant="ghost">
                                            {sections.reduce((s, sec) => s + sec.items.length, 0)}{" "}
                                            line items
                                        </Badge>
                                        <Badge variant="ghost">{currency}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    Navigation Footer
                   ═══════════════════════════════════════════════════ */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                    <Button
                        variant="outline"
                        onClick={currentStepIndex === 0 ? () => router.push("/proposals") : goBack}
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        {currentStepIndex === 0 ? "Cancel" : "Back"}
                    </Button>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        Step {currentStepIndex + 1} of {STEPS.length}
                    </div>

                    {currentStep === "terms" ? (
                        <Button onClick={handleSubmit} disabled={isSubmitting || !canProceed()}>
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 mr-1" />
                            )}
                            Create Proposal
                        </Button>
                    ) : (
                        <Button onClick={goNext} disabled={!canProceed()}>
                            Next
                            <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
        </PermissionGate>
    );
}
