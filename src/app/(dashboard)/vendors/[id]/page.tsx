"use client";

import { logger } from "@/lib/logger";
import React, { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { useParams, useRouter } from "next/navigation";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { MOCK_INVOICES, MOCK_POS, MOCK_VENDORS } from "@/lib/demo-data";
import {
    isSupabaseConfigured,
    useCreatePurchaseOrder,
    useUpdateVendor,
} from "@/lib/supabase/hooks";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    AlertTriangle,
    Edit,
    FileText,
    Loader2,
    Mail,
    Phone,
    Receipt,
    ShieldCheck,
    Star,
    Store,
} from "lucide-react";

type TabId = "overview" | "orders" | "invoices" | "compliance" | "chatter";
const TAB_VALUES = ["overview", "orders", "invoices", "compliance", "chatter"] as const;

export default function VendorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const vendorId = params.id as string;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [poDialogOpen, setPoDialogOpen] = useState(false);
    const [poDescription, setPoDescription] = useState("");
    const [poAmount, setPoAmount] = useState("");
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
    const updateVendor = useUpdateVendor();
    const createPO = useCreatePurchaseOrder();

    const vendor = MOCK_VENDORS.find((v) => v.id === vendorId);

    const handleSuspendVendor = async () => {
        if (!isSupabaseConfigured) return;
        try {
            await updateVendor.mutateAsync({
                id: vendorId,
                status: "suspended",
            } as unknown as Parameters<typeof updateVendor.mutateAsync>[0]);
        } catch (error) {
            logger.error("Failed to suspend vendor", { error });
        }
    };

    const handleCreatePO = async () => {
        if (!poDescription.trim() || !isSupabaseConfigured) return;
        try {
            await createPO.mutateAsync({
                vendor_id: vendorId,
                description: poDescription,
                total_amount: poAmount ? Number(poAmount) : 0,
                status: "draft",
            } as unknown as Parameters<typeof createPO.mutateAsync>[0]);
            setPoDialogOpen(false);
            setPoDescription("");
            setPoAmount("");
        } catch (error) {
            logger.error("Failed to create PO", { error });
        }
    };
    const vendorPOs = MOCK_POS.filter((po) => po.vendorId === vendorId);
    const vendorInvoices = MOCK_INVOICES.filter((inv) => inv.vendorId === vendorId);

    if (!vendor) {
        return (
            <EmptyState
                icon={Store}
                title="Vendor not found"
                description="The vendor you're looking for doesn't exist."
                action={{ label: "Back to Vendors", onClick: () => router.push("/vendors") }}
            />
        );
    }

    const totalPOValue = vendorPOs.reduce((sum, po) => sum + po.totalAmount, 0);
    const totalInvoiced = vendorInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "orders" as const, label: "Purchase Orders", count: vendorPOs.length },
        { id: "invoices" as const, label: "Invoices", count: vendorInvoices.length },
        { id: "compliance" as const, label: "Compliance" },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Contact Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div>
                        <p className="text-muted-foreground text-xs">Contact Person</p>
                        <p className="font-medium">{vendor.contactName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                            {vendor.email}
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${vendor.phone}`} className="hover:underline">
                            {vendor.phone}
                        </a>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Rating</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-warning fill-warning" />
                        <span className="text-2xl font-bold">{vendor.rating}</span>
                        <span className="text-muted-foreground">/ 5</span>
                    </div>
                </CardContent>
            </Card>

            {!vendor.coiValid && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">COI Expired</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Certificate of Insurance has expired
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    return (
        <>
            <DetailLayout
                backHref="/vendors"
                backLabel="Vendors"
                title={vendor.name}
                subtitle={vendor.specialty}
                status={vendor.status}
                avatar={
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                        {vendor.name.charAt(0)}
                    </div>
                }
                actions={
                    <Button onClick={() => router.push(`/vendors/${vendorId}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                }
                menuItems={[
                    { label: "Create Purchase Order", onClick: () => setPoDialogOpen(true) },
                    { label: "Request Documents", onClick: () => {} },
                    {
                        label: updateVendor.isPending ? "Suspending..." : "Suspend Vendor",
                        onClick: handleSuspendVendor,
                        variant: "destructive",
                    },
                ]}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as TabId)}
                sidebar={sidebar}
            >
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-xs">Total PO Value</span>
                                    </div>
                                    <p className="text-xl font-bold">
                                        {formatCurrency(totalPOValue)}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Receipt className="h-4 w-4" />
                                        <span className="text-xs">Total Invoiced</span>
                                    </div>
                                    <p className="text-xl font-bold">
                                        {formatCurrency(totalInvoiced)}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Star className="h-4 w-4" />
                                        <span className="text-xs">Rating</span>
                                    </div>
                                    <p className="text-xl font-bold">{vendor.rating}/5</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span className="text-xs">Compliance</span>
                                    </div>
                                    <p className="text-xl font-bold">
                                        {
                                            [
                                                vendor.coiValid,
                                                vendor.ndaSigned,
                                                vendor.w9Uploaded,
                                            ].filter(Boolean).length
                                        }
                                        /3
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Recent Purchase Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {vendorPOs.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No purchase orders
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {vendorPOs.slice(0, 5).map((po) => (
                                            <div
                                                key={po.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        PO #{po.id}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Issued: {formatDate(po.issuedDate)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium">
                                                        {formatCurrency(po.totalAmount)}
                                                    </span>
                                                    <StatusBadge status={po.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === "orders" && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Purchase Orders</CardTitle>
                            <Button size="sm" onClick={() => setPoDialogOpen(true)}>
                                Create PO
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {vendorPOs.length === 0 ? (
                                <EmptyState
                                    icon={FileText}
                                    title="No purchase orders"
                                    description="Create a purchase order for this vendor"
                                    action={{
                                        label: "Create PO",
                                        onClick: () => setPoDialogOpen(true),
                                    }}
                                />
                            ) : (
                                <div className="space-y-2">
                                    {vendorPOs.map((po) => (
                                        <div
                                            key={po.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">PO #{po.id}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {po.items.length} items · Issued{" "}
                                                    {formatDate(po.issuedDate)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(po.totalAmount)}
                                                </span>
                                                <StatusBadge status={po.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {activeTab === "invoices" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {vendorInvoices.length === 0 ? (
                                <EmptyState
                                    icon={Receipt}
                                    title="No invoices"
                                    description="No invoices from this vendor yet"
                                />
                            ) : (
                                <div className="space-y-2">
                                    {vendorInvoices.map((inv) => (
                                        <div
                                            key={inv.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Invoice #{inv.id}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Due: {formatDate(inv.dueDate)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(inv.amount)}
                                                </span>
                                                <StatusBadge status={inv.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {activeTab === "compliance" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Compliance Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-2 w-2 rounded-full ${vendor.coiValid ? "bg-success" : "bg-destructive"}`}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Certificate of Insurance (COI)
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {vendor.coiExpiryDate
                                                    ? `Expires: ${formatDate(vendor.coiExpiryDate)}`
                                                    : "Not uploaded"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={vendor.coiValid ? "success" : "destructive"}>
                                        {vendor.coiValid ? "Valid" : "Expired"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-2 w-2 rounded-full ${vendor.ndaSigned ? "bg-success" : "bg-warning"}`}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Non-Disclosure Agreement (NDA)
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {vendor.ndaSigned ? "Signed" : "Pending signature"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={vendor.ndaSigned ? "success" : "warning"}>
                                        {vendor.ndaSigned ? "Signed" : "Pending"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-2 w-2 rounded-full ${vendor.w9Uploaded ? "bg-success" : "bg-warning"}`}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">W-9 Form</p>
                                            <p className="text-xs text-muted-foreground">
                                                {vendor.w9Uploaded ? "Uploaded" : "Not uploaded"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={vendor.w9Uploaded ? "success" : "warning"}>
                                        {vendor.w9Uploaded ? "Uploaded" : "Missing"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {activeTab === "chatter" && (
                    <RecordChatter
                        recordType="vendor"
                        recordId={vendorId}
                        activityItems={makeMockActivity("vendor")}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                )}
            </DetailLayout>

            {/* Create PO Dialog */}
            <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Purchase Order</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                placeholder="PO description"
                                value={poDescription}
                                onChange={(e) => setPoDescription(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Amount</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={poAmount}
                                onChange={(e) => setPoAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setPoDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreatePO}
                            disabled={!poDescription.trim() || createPO.isPending}
                        >
                            {createPO.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Create PO
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
