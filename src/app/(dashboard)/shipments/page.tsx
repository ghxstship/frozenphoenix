"use client";

import { useMemo } from "react";
import { ListPageShell } from "@/components/shells";
import { useLocations, useProjects, useShipments } from "@/lib/supabase/hooks";
import { CREATE_SHIPMENT_CONFIG } from "@/config/create-entity-configs";
import { Package, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "shipments",
    title: "Shipments",
    description: "Track and manage logistics and freight",
    icon: Truck,
    createConfig: CREATE_SHIPMENT_CONFIG,
    createLabel: "New Shipment",
    exportable: true,
    searchKeys: ["number", "description", "carrier_name"],
    stats: [
        { label: "Total Shipments", icon: Truck, filter: () => true },
        {
            label: "In Transit",
            icon: Truck,
            filter: (r) => r.status === "in_transit" || r.status === "picked_up",
        },
        {
            label: "Total Pieces",
            icon: Package,
            compute: (records) =>
                records.reduce((sum, r) => sum + (Number(r.total_pieces) || 0), 0),
        },
        {
            label: "Total Cost",
            icon: Truck,
            compute: (records) =>
                formatCurrency(records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0)),
        },
    ],
    filters: [
        {
            id: "status",
            label: "Status",
            column: "status",
            options: [
                { value: "planning", label: "Planning" },
                { value: "booked", label: "Booked" },
                { value: "in_transit", label: "In Transit" },
                { value: "delivered", label: "Delivered" },
            ],
        },
    ],
    columns: [
        { id: "number", header: "Number", accessorKey: "number" },
        { id: "description", header: "Description", accessorKey: "description" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "priority", header: "Priority", accessorKey: "priority", fieldType: "priority" },
        { id: "carrier_name", header: "Carrier", accessorKey: "carrier_name" },
        { id: "pickup_date", header: "Pickup", accessorKey: "pickup_date", fieldType: "date" },
        { id: "total_pieces", header: "Pieces", accessorKey: "total_pieces" },
        { id: "cost", header: "Cost", accessorKey: "cost", fieldType: "currency" },
    ],
};

export default function ShipmentsPage() {
    const { data: sbShipments, isLoading: loadingShipments } = useShipments();
    const { data: sbLocations } = useLocations();
    const { data: sbProjects } = useProjects();

    const data = useMemo(() => {
        const locations = new Map((sbLocations ?? []).map((l) => [l.id, l.name]));
        const projects = new Map((sbProjects ?? []).map((p) => [p.id, p.name]));
        return (sbShipments ?? []).map((s) => ({
            ...s,
            origin_name: locations.get(s.origin_location_id ?? "") ?? "",
            destination_name: locations.get(s.destination_location_id ?? "") ?? "",
            project_name: projects.get(s.project_id) ?? "",
        })) as unknown as Record<string, unknown>[];
    }, [sbShipments, sbLocations, sbProjects]);

    return <ListPageShell config={config} data={data} isLoading={loadingShipments} />;
}
