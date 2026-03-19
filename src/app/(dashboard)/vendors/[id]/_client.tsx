"use client";

import { logger } from "@/lib/logger";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useCreatePurchaseOrder,
    useDeleteVendor,
    useInvoices,
    usePurchaseOrders,
    useUpdateVendor,
    useVendor,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
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

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "vendors",
    titleKey: "name",
    statusKey: "status",
    icon: Store,
    backHref: "/vendors",
    backLabel: "Vendors",
    chatter: false,
    fields: [],
    tabs: [],
};

export function VendorDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Vendor",
        listPath: "/vendors",
        useUpdateHook: useUpdateVendor,
        useDeleteHook: useDeleteVendor,
    });
    const [poDialogOpen, setPoDialogOpen] = useState(false);
    const [poDescription, setPoDescription] = useState("");
    const [poAmount, setPoAmount] = useState("");
    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);
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
    const { data: vendor, isLoading } = useVendor(id);

    const handleSuspendVendor = async () => {
        try {
            await updateVendor.mutateAsync({ id, status: "suspended" } as unknown as Parameters<
                typeof updateVendor.mutateAsync
            >[0]);
        } catch (error) {
            logger.error("Failed to suspend vendor", { error });
        }
    };
    const handleCreatePO = async () => {
        if (!poDescription.trim()) return;
        try {
            await createPO.mutateAsync({
                vendor_id: id,
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

    const { data: sbPOs } = usePurchaseOrders();
    const { data: sbInvoices } = useInvoices();
    const vendorPOs = (sbPOs ?? []).filter((po: Record<string, unknown>) => po.vendor_id === id);
    const vendorInvoices = (sbInvoices ?? []).filter(
        (inv: Record<string, unknown>) => inv.vendor_id === id
    );
    const totalPOValue = vendorPOs.reduce(
        (sum: number, po: Record<string, unknown>) => sum + Number(po.total_amount ?? 0),
        0
    );

    const sidebarSlot = vendor ? (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Contact Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div>
                        <p className="text-muted-foreground text-xs">Contact Person</p>
                        <p className="font-medium">{String(vendor.contact_name)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                            {String(vendor.email)}
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${vendor.phone}`} className="hover:underline">
                            {String(vendor.phone)}
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
                        <span className="text-2xl font-bold">{String(vendor.rating)}</span>
                        <span className="text-muted-foreground">/ 5</span>
                    </div>
                </CardContent>
            </Card>
            {(!vendor.coi_expiry_date ||
                new Date(vendor.coi_expiry_date).getTime() < Date.now()) && (
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
    ) : null;

    const overviewSlot = vendor ? (
        <div className="space-y-6">
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
                            <Star className="h-4 w-4" />
                            <span className="text-xs">Rating</span>
                        </div>
                        <p className="text-xl font-bold">{String(vendor.rating)}/5</p>
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
                                    vendor.coi_expiry_date &&
                                        new Date(vendor.coi_expiry_date).getTime() > Date.now(),
                                    vendor.nda_signed,
                                    vendor.w9_uploaded,
                                ].filter(Boolean).length
                            }
                            /3
                        </p>
                    </CardContent>
                </Card>
            </div>
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
                                        <p className="text-sm font-medium">PO #{String(po.id)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Issued:{" "}
                                            {formatDate(
                                                (po as Record<string, unknown>)
                                                    .issued_date as string
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">
                                            {formatCurrency(
                                                Number(
                                                    (po as Record<string, unknown>).total_amount ??
                                                        0
                                                )
                                            )}
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
    ) : null;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: (r) => ((r as Record<string, unknown>).specialty as string) ?? "",
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "orders",
                label: "Purchase Orders",
                count: vendorPOs.length,
                content: (
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
                                                <p className="text-sm font-medium">
                                                    PO #{String(po.id)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Issued{" "}
                                                    {formatDate(
                                                        (po as Record<string, unknown>)
                                                            .issued_date as string
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(
                                                        Number(
                                                            (po as Record<string, unknown>)
                                                                .total_amount ?? 0
                                                        )
                                                    )}
                                                </span>
                                                <StatusBadge status={po.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "invoices",
                label: "Invoices",
                count: vendorInvoices.length,
                content: (
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
                                                    Invoice #{String(inv.id)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Due:{" "}
                                                    {formatDate(
                                                        (inv as Record<string, unknown>)
                                                            .due_date as string
                                                    )}
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
                ),
            },
            {
                id: "compliance",
                label: "Compliance",
                content: vendor ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Compliance Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-2 w-2 rounded-full ${vendor.coi_expiry_date && new Date(vendor.coi_expiry_date).getTime() > Date.now() ? "bg-success" : "bg-destructive"}`}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Certificate of Insurance (COI)
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {vendor.coi_expiry_date
                                                    ? `Expires: ${formatDate(vendor.coi_expiry_date)}`
                                                    : "Not uploaded"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            vendor.coi_expiry_date &&
                                            new Date(vendor.coi_expiry_date).getTime() > Date.now()
                                                ? "success"
                                                : "destructive"
                                        }
                                    >
                                        {vendor.coi_expiry_date &&
                                        new Date(vendor.coi_expiry_date).getTime() > Date.now()
                                            ? "Valid"
                                            : "Expired"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-2 w-2 rounded-full ${vendor.nda_signed ? "bg-success" : "bg-warning"}`}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Non-Disclosure Agreement (NDA)
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {vendor.nda_signed ? "Signed" : "Pending signature"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={vendor.nda_signed ? "success" : "warning"}>
                                        {vendor.nda_signed ? "Signed" : "Pending"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`h-2 w-2 rounded-full ${vendor.w9_uploaded ? "bg-success" : "bg-warning"}`}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">W-9 Form</p>
                                            <p className="text-xs text-muted-foreground">
                                                {vendor.w9_uploaded ? "Uploaded" : "Not uploaded"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={vendor.w9_uploaded ? "success" : "warning"}>
                                        {vendor.w9_uploaded ? "Uploaded" : "Missing"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : null,
            },
            {
                id: "chatter",
                label: "Chatter",
                content: (
                    <RecordChatter
                        recordType="vendor"
                        recordId={id}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    return (
        <>
            <DetailPageShell
                config={config}
                id={id}
                record={(vendor ?? initialRecord) as Record<string, unknown> | null}
                isLoading={isLoading && !initialRecord}
                menuItems={[
                    { label: "Create Purchase Order", onClick: () => setPoDialogOpen(true) },
                    {
                        label: "Request Documents",
                        onClick: () =>
                            router.push(`/documents/new?entityType=vendor&entityId=${id}`),
                    },
                    {
                        label: updateVendor.isPending ? "Suspending..." : "Suspend Vendor",
                        onClick: handleSuspendVendor,
                        variant: "destructive",
                    },
                    ...crudMenuItems,
                ]}
                avatar={
                    vendor ? (
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                            {vendor.name.charAt(0)}
                        </div>
                    ) : undefined
                }
                actions={
                    <Button onClick={() => router.push(`/vendors/${id}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                }
            />
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
