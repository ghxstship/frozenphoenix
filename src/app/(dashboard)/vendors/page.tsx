"use client";

import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useVendors } from "@/lib/supabase";
import type { Vendor } from "@/types";
import { FileText, ShieldAlert, ShieldCheck, Star, Store } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import {
    BooleanField,
    EmailField,
    PhoneField,
    RatingField,
} from "@/components/data-view/field-renderers";
import { VENDORS_PAGE } from "@/config/list-page-configs";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { ListPageShell } from "@/components/shells/list-page-shell";
import type { ListPageConfig } from "@/types/list-page-config";

type ViewMode = "cards" | "table";

const vendorColumns: ColumnDef<Vendor>[] = [
    {
        id: "name",
        header: "Vendor",
        accessorKey: "name",
        sortable: true,
        filterable: true,
        sticky: true,
        render: (_v, row) => (
            <div>
                <p className="text-sm font-medium">{row.name}</p>
                <p className="text-[10px] text-muted-foreground">{row.specialty}</p>
            </div>
        ),
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        filterable: true,
        render: (value) => {
            const v = String(value);
            const variant =
                v === "active" ? "success" : v === "suspended" ? "destructive" : "warning";
            return (
                <Badge variant={variant} className="text-[10px]">
                    {v}
                </Badge>
            );
        },
    },
    {
        id: "contact",
        header: "Contact",
        accessorKey: "contactName",
        sortable: true,
    },
    {
        id: "email",
        header: "Email",
        accessorKey: "email",
        render: (value) => <EmailField value={String(value)} />,
    },
    {
        id: "phone",
        header: "Phone",
        accessorKey: "phone",
        render: (value) => <PhoneField value={String(value)} />,
    },
    {
        id: "rating",
        header: "Rating",
        accessorKey: "rating",
        sortable: true,
        render: (value) => <RatingField value={Number(value)} />,
    },
    {
        id: "coi",
        header: "COI",
        accessorFn: (row) => row.coiValid,
        render: (value) => (
            <BooleanField value={Boolean(value)} trueLabel="Valid" falseLabel="Expired" />
        ),
    },
    {
        id: "nda",
        header: "NDA",
        accessorFn: (row) => row.ndaSigned,
        render: (value) => <BooleanField value={Boolean(value)} />,
    },
    {
        id: "w9",
        header: "W-9",
        accessorFn: (row) => row.w9Uploaded,
        render: (value) => <BooleanField value={Boolean(value)} />,
    },
];

// ─── Vendor Card ─────────────────────────────────────────────
function VendorCard({ vendor }: { vendor: Vendor }) {
    return (
        <Card className={`${!vendor.coiValid ? "border-destructive/30" : ""}`}>
            <CardContent>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-sm font-bold">{vendor.name}</h3>
                        <p className="text-xs text-muted-foreground">{vendor.specialty}</p>
                    </div>
                    <Badge
                        variant={
                            vendor.status === "active"
                                ? "success"
                                : vendor.status === "suspended"
                                  ? "destructive"
                                  : "warning"
                        }
                        className="text-[10px]"
                    >
                        {vendor.status}
                    </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                    <p>
                        {vendor.contactName} · {vendor.phone}
                    </p>
                    <p>{vendor.email}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                            key={idx}
                            className={`h-3.5 w-3.5 ${idx < Math.floor(vendor.rating) ? "text-warning fill-warning" : "text-muted"}`}
                        />
                    ))}
                    <span className="text-xs font-medium ml-1">{vendor.rating}</span>
                </div>

                {/* Document Compliance */}
                <div className="flex flex-wrap gap-1.5">
                    <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
                            vendor.coiValid
                                ? "bg-success/10 text-success"
                                : "bg-destructive/10 text-destructive"
                        }`}
                    >
                        {vendor.coiValid ? (
                            <ShieldCheck className="h-3 w-3" />
                        ) : (
                            <ShieldAlert className="h-3 w-3" />
                        )}
                        COI
                    </div>
                    <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
                            vendor.ndaSigned
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                        }`}
                    >
                        <FileText className="h-3 w-3" />
                        NDA
                    </div>
                    <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${
                            vendor.w9Uploaded
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                        }`}
                    >
                        <FileText className="h-3 w-3" />
                        W-9
                    </div>
                </div>

                {/* COI Gate */}
                {!vendor.coiValid && (
                    <div className="mt-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                        <p className="text-[10px] font-medium text-destructive flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" />
                            Cannot assign to projects — COI expired
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Content Component ──────────────────────────────────────
function VendorsContent({ vendors }: { vendors: Vendor[] }) {
    const VIEW_MODES = ["cards", "table"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "cards",
        validValues: VIEW_MODES,
    });

    return (
        <>
            <div className="flex justify-end">
                <SegmentedControl<ViewMode>
                    ariaLabel="Vendor view mode"
                    value={viewMode}
                    onValueChange={setViewMode}
                    options={[
                        { value: "cards", label: "Cards" },
                        { value: "table", label: "Table" },
                    ]}
                />
            </div>

            {viewMode === "table" ? (
                <DataTable<Vendor>
                    data={vendors}
                    columns={vendorColumns}
                    keyField="id"
                    searchable
                    searchPlaceholder="Search vendors..."
                    pageSize={15}
                    hoverable
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendors.map((vendor, i) => (
                        <StaggerItem key={vendor.id} index={i} stagger="relaxed">
                            <VendorCard vendor={vendor} />
                        </StaggerItem>
                    ))}
                </div>
            )}
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────
export default function VendorsPage() {
    const { data: supabaseVendors, isLoading } = useVendors();

    const vendors: Vendor[] = useMemo(
        () =>
            (supabaseVendors ?? []).map((v) => ({
                id: v.id,
                name: v.name,
                contactName: v.contact_name,
                email: v.email,
                phone: v.phone,
                specialty: v.specialty,
                coiExpiryDate: v.coi_expiry_date ?? undefined,
                coiValid: v.coi_expiry_date ? new Date(v.coi_expiry_date) > new Date() : false,
                ndaSigned: v.nda_signed,
                w9Uploaded: v.w9_uploaded,
                rating: v.rating,
                status: v.status as Vendor["status"],
            })),
        [supabaseVendors]
    );

    const config: ListPageConfig = useMemo(
        () => ({
            ...VENDORS_PAGE,
            title: "Vendor Vault",
            createLabel: "Add Vendor",
            exportable: true,
            importable: true,
            stats: [
                {
                    label: "Active Vendors",
                    icon: Store,
                    filter: (r) => r.status === "active",
                },
                {
                    label: "Avg Rating",
                    icon: Star,
                    compute: (r) => {
                        if (r.length === 0) return "—";
                        const avg =
                            r.reduce((sum, v) => sum + ((v.rating as number) || 0), 0) / r.length;
                        return avg.toFixed(1);
                    },
                },
                {
                    label: "Expired COIs",
                    icon: ShieldAlert,
                    filter: (r) => !(r.coiValid as boolean),
                },
            ],
            alerts: [
                {
                    severity: "destructive",
                    icon: ShieldAlert,
                    when: (records) => records.some((r) => !(r.coiValid as boolean)),
                    message: (records) => {
                        const count = records.filter((r) => !(r.coiValid as boolean)).length;
                        return `${count} vendor${count > 1 ? "s" : ""} with expired COI — cannot be assigned to projects`;
                    },
                },
            ],
            filters: [
                {
                    id: "status",
                    label: "Status",
                    column: "status",
                    options: [
                        { value: "active", label: "Active" },
                        { value: "suspended", label: "Suspended" },
                        { value: "pending", label: "Pending" },
                    ],
                },
            ],
            contentSlot: <VendorsContent vendors={vendors} />,
        }),
        [vendors]
    );

    return (
        <ListPageShell
            config={config}
            data={vendors as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
        />
    );
}
