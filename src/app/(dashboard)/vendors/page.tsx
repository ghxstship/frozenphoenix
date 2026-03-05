"use client";

import React from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useVendors } from "@/lib/supabase/hooks";
import { MOCK_VENDORS } from "@/lib/demo-data";
import {
    FileText,
    LayoutGrid,
    Loader2,
    Plus,
    ShieldAlert,
    ShieldCheck,
    Star,
    Store,
    Table2,
} from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import {
    BooleanField,
    EmailField,
    PhoneField,
    RatingField,
} from "@/components/data-view/field-renderers";
import { PermissionGate } from "@/components/permission-guard";
import { SegmentedControl } from "@/components/ui/segmented-control";

type Vendor = (typeof MOCK_VENDORS)[number];
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

export default function VendorsPage() {
    const VIEW_MODES = ["cards", "table"] as const;
    const [viewMode, setViewMode] = useQueryTabState({
        key: "view",
        defaultValue: "cards",
        validValues: VIEW_MODES,
    });
    const { data: supabaseVendors, isLoading } = useVendors();

    // Use Supabase data if configured and available, otherwise fall back to mock data
    const vendors = (supabaseVendors ?? []).map((v) => ({
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
    }));

    const activeVendors = vendors.filter((v) => v.status === "active");
    const expiredCOIs = vendors.filter((v) => !v.coiValid);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="vendors" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Vendor Vault"
                    description="Centralized vendor management with COI validation, 1099s, and NDAs"
                >
                    <div className="flex items-center gap-2">
                        <SegmentedControl<ViewMode>
                            ariaLabel="Vendor view mode"
                            value={viewMode}
                            onValueChange={setViewMode}
                            options={[
                                {
                                    value: "cards",
                                    label: "Cards",
                                    icon: <LayoutGrid className="h-4 w-4" />,
                                    labelHidden: true,
                                },
                                {
                                    value: "table",
                                    label: "Table",
                                    icon: <Table2 className="h-4 w-4" />,
                                    labelHidden: true,
                                },
                            ]}
                        />
                        <Button size="sm">
                            <Plus className="h-4 w-4" /> Add Vendor
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Active Vendors" value={activeVendors.length} icon={Store} />
                    <StatCard
                        title="Avg Rating"
                        value="4.5"
                        description="across all vendors"
                        icon={Star}
                    />
                    <StatCard title="Expired COIs" value={expiredCOIs.length} icon={ShieldAlert} />
                </div>

                {/* Table View */}
                {viewMode === "table" && (
                    <DataTable<Vendor>
                        data={vendors}
                        columns={vendorColumns}
                        keyField="id"
                        searchable
                        searchPlaceholder="Search vendors..."
                        pageSize={15}
                        hoverable
                    />
                )}

                {/* Cards View */}
                {viewMode === "cards" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vendors.map((vendor, i) => (
                            <StaggerItem key={vendor.id} index={i} stagger="relaxed">
                                <Card
                                    className={`${!vendor.coiValid ? "border-destructive/30" : ""}`}
                                >
                                    <CardContent>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-sm font-bold">{vendor.name}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {vendor.specialty}
                                                </p>
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
                                            <span className="text-xs font-medium ml-1">
                                                {vendor.rating}
                                            </span>
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
                            </StaggerItem>
                        ))}
                    </div>
                )}
            </div>
        </PermissionGate>
    );
}
