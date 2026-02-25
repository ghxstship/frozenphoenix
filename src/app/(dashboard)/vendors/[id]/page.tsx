"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { MOCK_VENDORS, MOCK_POS, MOCK_INVOICES } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Edit,
    Phone,
    Mail,
    Star,
    FileText,
    ShieldCheck,
    AlertTriangle,
    Store,
    Receipt,
} from "lucide-react";

type TabId = "overview" | "orders" | "invoices" | "compliance";

export default function VendorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const vendorId = params.id as string;
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    const vendor = MOCK_VENDORS.find((v) => v.id === vendorId);
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
        <DetailLayout
            backHref="/vendors"
            backLabel="Vendors"
            title={vendor.name}
            subtitle={vendor.specialty}
            status={vendor.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white">
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
                { label: "Create Purchase Order", onClick: () => {} },
                { label: "Request Documents", onClick: () => {} },
                { label: "Suspend Vendor", onClick: () => {}, variant: "destructive" },
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
                                <p className="text-xl font-bold">{formatCurrency(totalPOValue)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Receipt className="h-4 w-4" />
                                    <span className="text-xs">Total Invoiced</span>
                                </div>
                                <p className="text-xl font-bold">{formatCurrency(totalInvoiced)}</p>
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
                                    {[vendor.coiValid, vendor.ndaSigned, vendor.w9Uploaded].filter(Boolean).length}/3
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
                                <p className="text-sm text-muted-foreground text-center py-4">No purchase orders</p>
                            ) : (
                                <div className="space-y-3">
                                    {vendorPOs.slice(0, 5).map((po) => (
                                        <div key={po.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                            <div>
                                                <p className="text-sm font-medium">PO #{po.id}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Issued: {formatDate(po.issuedDate)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium">{formatCurrency(po.totalAmount)}</span>
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
                        <Button size="sm">Create PO</Button>
                    </CardHeader>
                    <CardContent>
                        {vendorPOs.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="No purchase orders"
                                description="Create a purchase order for this vendor"
                                action={{ label: "Create PO", onClick: () => {} }}
                            />
                        ) : (
                            <div className="space-y-2">
                                {vendorPOs.map((po) => (
                                    <div key={po.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
                                        <div>
                                            <p className="text-sm font-medium">PO #{po.id}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {po.items.length} items · Issued {formatDate(po.issuedDate)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium">{formatCurrency(po.totalAmount)}</span>
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
                                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
                                        <div>
                                            <p className="text-sm font-medium">Invoice #{inv.id}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Due: {formatDate(inv.dueDate)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium">{formatCurrency(inv.amount)}</span>
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
                                    <div className={`h-2 w-2 rounded-full ${vendor.coiValid ? "bg-success" : "bg-destructive"}`} />
                                    <div>
                                        <p className="text-sm font-medium">Certificate of Insurance (COI)</p>
                                        <p className="text-xs text-muted-foreground">
                                            {vendor.coiExpiryDate ? `Expires: ${formatDate(vendor.coiExpiryDate)}` : "Not uploaded"}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={vendor.coiValid ? "success" : "destructive"}>
                                    {vendor.coiValid ? "Valid" : "Expired"}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full ${vendor.ndaSigned ? "bg-success" : "bg-warning"}`} />
                                    <div>
                                        <p className="text-sm font-medium">Non-Disclosure Agreement (NDA)</p>
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
                                    <div className={`h-2 w-2 rounded-full ${vendor.w9Uploaded ? "bg-success" : "bg-warning"}`} />
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
        </DetailLayout>
    );
}
