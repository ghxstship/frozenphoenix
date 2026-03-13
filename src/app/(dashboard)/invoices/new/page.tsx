"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateClientInvoice } from "@/lib/supabase/hooks-pages";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    DollarSign,
    FileText,
    Plus,
    Trash2,
} from "lucide-react";

interface LineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

const WIZARD_STEPS = ["Client & Project", "Line Items", "Terms & Notes", "Review"];

export default function NewInvoicePage() {
    const router = useRouter();
    const createInvoice = useCreateClientInvoice();
    const [step, setStep] = useState(0);
    const [client, setClient] = useState({ companyName: "", projectName: "", poNumber: "" });
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: "1", description: "", quantity: 1, unitPrice: 0 },
    ]);
    const [terms, setTerms] = useState({
        paymentTerms: "Net 30",
        taxRate: "8.875",
        notes: "",
        dueInDays: "30",
    });

    const addLineItem = () =>
        setLineItems([
            ...lineItems,
            { id: String(Date.now()), description: "", quantity: 1, unitPrice: 0 },
        ]);
    const removeLineItem = (id: string) => setLineItems(lineItems.filter((li) => li.id !== id));
    const updateLineItem = (id: string, field: keyof LineItem, value: string | number) =>
        setLineItems(lineItems.map((li) => (li.id === id ? { ...li, [field]: value } : li)));

    const subtotal = lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
    const tax = subtotal * (parseFloat(terms.taxRate) / 100);
    const total = subtotal + tax;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Create Invoice"
                description="Generate a new invoice for a client project"
            >
                <Link href="/invoices">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                </Link>
            </PageHeader>

            {/* Step Progress */}
            <div className="flex gap-2">
                {WIZARD_STEPS.map((s, i) => (
                    <div key={s} className="flex-1">
                        <div
                            className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
                        />
                        <p
                            className={`text-[10px] mt-1 ${i <= step ? "font-semibold text-primary" : "text-muted-foreground"}`}
                        >
                            {s}
                        </p>
                    </div>
                ))}
            </div>

            {/* Step 0: Client & Project */}
            {step === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Client & Project Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Company Name</label>
                            <Input
                                placeholder="e.g., Nike Inc."
                                value={client.companyName}
                                onChange={(e) =>
                                    setClient({ ...client, companyName: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Project Name</label>
                            <Input
                                placeholder="e.g., Air Max Launch Experience"
                                value={client.projectName}
                                onChange={(e) =>
                                    setClient({ ...client, projectName: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                PO Number (optional)
                            </label>
                            <Input
                                placeholder="e.g., PO-NIKE-2026-0089"
                                value={client.poNumber}
                                onChange={(e) => setClient({ ...client, poNumber: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 1: Line Items */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Line Items
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={addLineItem}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {lineItems.map((li, i) => (
                            <div
                                key={li.id}
                                className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg bg-secondary/20"
                            >
                                <div className="col-span-5">
                                    {i === 0 && (
                                        <label className="text-xs text-muted-foreground mb-1 block">
                                            Description
                                        </label>
                                    )}
                                    <Input
                                        placeholder="Service or item description"
                                        value={li.description}
                                        onChange={(e) =>
                                            updateLineItem(li.id, "description", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="col-span-2">
                                    {i === 0 && (
                                        <label className="text-xs text-muted-foreground mb-1 block">
                                            Qty
                                        </label>
                                    )}
                                    <Input
                                        type="number"
                                        min={1}
                                        value={li.quantity}
                                        onChange={(e) =>
                                            updateLineItem(
                                                li.id,
                                                "quantity",
                                                parseInt(e.target.value) || 0
                                            )
                                        }
                                    />
                                </div>
                                <div className="col-span-2">
                                    {i === 0 && (
                                        <label className="text-xs text-muted-foreground mb-1 block">
                                            Unit Price
                                        </label>
                                    )}
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={li.unitPrice}
                                        onChange={(e) =>
                                            updateLineItem(
                                                li.id,
                                                "unitPrice",
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                    />
                                </div>
                                <div className="col-span-2 text-right">
                                    {i === 0 && (
                                        <p className="text-xs text-muted-foreground mb-1">Total</p>
                                    )}
                                    <p className="text-sm font-semibold py-2">
                                        {formatCurrency(li.quantity * li.unitPrice)}
                                    </p>
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    {lineItems.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeLineItem(li.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end pt-2 border-t">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                    Subtotal:{" "}
                                    <span className="font-semibold text-foreground">
                                        {formatCurrency(subtotal)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Terms */}
            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Payment Terms & Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    Payment Terms
                                </label>
                                <Input
                                    value={terms.paymentTerms}
                                    onChange={(e) =>
                                        setTerms({ ...terms, paymentTerms: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">
                                    Due In (days)
                                </label>
                                <Input
                                    type="number"
                                    value={terms.dueInDays}
                                    onChange={(e) =>
                                        setTerms({ ...terms, dueInDays: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Tax Rate (%)</label>
                            <Input
                                type="number"
                                step={0.001}
                                value={terms.taxRate}
                                onChange={(e) => setTerms({ ...terms, taxRate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Notes</label>
                            <textarea
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                                placeholder="Payment instructions, late fees, etc."
                                value={terms.notes}
                                onChange={(e) => setTerms({ ...terms, notes: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Review Invoice
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-secondary/30">
                                <p className="text-[10px] text-muted-foreground">Client</p>
                                <p className="text-sm font-semibold">{client.companyName || "—"}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {client.projectName}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/30">
                                <p className="text-[10px] text-muted-foreground">Terms</p>
                                <p className="text-sm font-semibold">{terms.paymentTerms}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Due in {terms.dueInDays} days · Tax {terms.taxRate}%
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {lineItems
                                .filter((li) => li.description)
                                .map((li) => (
                                    <div
                                        key={li.id}
                                        className="flex items-center justify-between py-2 border-b border-border/50"
                                    >
                                        <span className="text-sm">{li.description}</span>
                                        <span className="text-sm font-medium">
                                            {formatCurrency(li.quantity * li.unitPrice)}
                                        </span>
                                    </div>
                                ))}
                        </div>
                        <div className="text-right space-y-1 pt-2">
                            <p className="text-sm text-muted-foreground">
                                Subtotal: {formatCurrency(subtotal)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Tax: {formatCurrency(tax)}
                            </p>
                            <p className="text-lg font-bold">Total: {formatCurrency(total)}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                >
                    Back
                </Button>
                {step < WIZARD_STEPS.length - 1 ? (
                    <Button
                        onClick={() => setStep(step + 1)}
                        disabled={step === 0 && !client.companyName}
                    >
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        disabled={
                            !client.companyName ||
                            lineItems.every((li) => !li.description) ||
                            createInvoice.isPending
                        }
                        onClick={() =>
                            createInvoice.mutate(
                                {
                                    client_name: client.companyName,
                                    notes: terms.notes,
                                    payment_terms: terms.paymentTerms,
                                    due_date: new Date(
                                        Date.now() + Number(terms.dueInDays) * 86400000
                                    )
                                        .toISOString()
                                        .slice(0, 10),
                                    status: "draft",
                                },
                                { onSuccess: () => router.push("/invoices") }
                            )
                        }
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Button>
                )}
            </div>
        </div>
    );
}
