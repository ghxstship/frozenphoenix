"use client";

/**
 * Assets & Inventory entity hooks: assets, asset_assignments, asset_versions,
 * asset_tags, vehicles, kits, load_plans, inventory_audits, inventory_items (catalog),
 * warehouses, rental_agreements, space_bookings, shipments, consumables,
 * consumable_usage, maintenance_records, storage_objects.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCreate } from "@/lib/api/client";
import type { Tables } from "@/types/generated/database.types";
import {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";

// ═══════════════════════════════════════════════════════════════
// ASSETS
// ═══════════════════════════════════════════════════════════════

export const useAssets = makeListHook<Tables<"assets">>("asset", "/api/entities/assets", {
    sort_by: "name",
    sort_order: "asc",
});
export const useAsset = makeDetailHook<Tables<"assets">>("asset", "/api/entities/assets");
export const useCreateAsset = makeCreateHook<Tables<"assets">>("asset", "/api/entities/assets");
export const useUpdateAsset = makeUpdateHook<Tables<"assets">>("asset", "/api/entities/assets");
export const useDeleteAsset = makeDeleteHook("asset", "/api/entities/assets");

// ═══════════════════════════════════════════════════════════════
// ASSET ASSIGNMENTS
// ═══════════════════════════════════════════════════════════════

export const useAssetAssignments = makeListHook<Tables<"asset_assignments">>(
    "asset_assignment",
    "/api/entities/asset-assignments",
    { sort_by: "check_out_date", sort_order: "desc" }
);
export const useAssetAssignment = makeDetailHook<Tables<"asset_assignments">>(
    "asset_assignment",
    "/api/entities/asset-assignments"
);
export const useCreateAssetAssignment = makeCreateHook<Tables<"asset_assignments">>(
    "asset_assignment",
    "/api/entities/asset-assignments",
    ["asset"]
);
export const useUpdateAssetAssignment = makeUpdateHook<Tables<"asset_assignments">>(
    "asset_assignment",
    "/api/entities/asset-assignments"
);
export const useDeleteAssetAssignment = makeDeleteHook(
    "asset_assignment",
    "/api/entities/asset-assignments"
);

// ═══════════════════════════════════════════════════════════════
// ASSET VERSIONS
// ═══════════════════════════════════════════════════════════════

export const useAssetVersions = makeListHook<Tables<"asset_versions">>(
    "asset_version",
    "/api/entities/asset-versions",
    { sort_by: "version_number", sort_order: "desc" }
);
export const useAssetVersion = makeDetailHook<Tables<"asset_versions">>(
    "asset_version",
    "/api/entities/asset-versions"
);
export const useCreateAssetVersion = makeCreateHook<Tables<"asset_versions">>(
    "asset_version",
    "/api/entities/asset-versions",
    ["asset"]
);

// ═══════════════════════════════════════════════════════════════
// ASSET TAGS
// ═══════════════════════════════════════════════════════════════

export const useAssetTags = makeListHook<Tables<"asset_tags">>(
    "asset_tag",
    "/api/entities/asset-tags",
    {
        sort_by: "tag_key",
        sort_order: "asc",
    }
);
export const useCreateAssetTag = makeCreateHook<Tables<"asset_tags">>(
    "asset_tag",
    "/api/entities/asset-tags",
    ["asset"]
);
export const useDeleteAssetTag = makeDeleteHook("asset_tag", "/api/entities/asset-tags");

// ═══════════════════════════════════════════════════════════════
// VEHICLES
// ═══════════════════════════════════════════════════════════════

export const useVehicles = makeListHook<Tables<"vehicles">>("vehicle", "/api/entities/fleet", {
    sort_by: "name",
    sort_order: "asc",
});
export const useVehicle = makeDetailHook<Tables<"vehicles">>("vehicle", "/api/entities/fleet");
export const useCreateVehicle = makeCreateHook<Tables<"vehicles">>(
    "vehicle",
    "/api/entities/fleet"
);
export const useUpdateVehicle = makeUpdateHook<Tables<"vehicles">>(
    "vehicle",
    "/api/entities/fleet"
);
export const useDeleteVehicle = makeDeleteHook("vehicle", "/api/entities/fleet");

// ─── Fleet aliases ───
export const useFleetVehicles = useVehicles;
export const useCreateFleetVehicle = useCreateVehicle;

// ═══════════════════════════════════════════════════════════════
// KITS
// ═══════════════════════════════════════════════════════════════

export const useKits = makeListHook<Tables<"kits">>("kit", "/api/entities/kits", {
    sort_by: "name",
    sort_order: "asc",
});
export const useKit = makeDetailHook<Tables<"kits">>("kit", "/api/entities/kits");
export const useCreateKit = makeCreateHook<Tables<"kits">>("kit", "/api/entities/kits");
export const useUpdateKit = makeUpdateHook<Tables<"kits">>("kit", "/api/entities/kits");
export const useDeleteKit = makeDeleteHook("kit", "/api/entities/kits");

// ═══════════════════════════════════════════════════════════════
// LOAD PLANS
// ═══════════════════════════════════════════════════════════════

export const useLoadPlans = makeListHook<Tables<"load_plans">>(
    "load_plan",
    "/api/entities/load-plans",
    {
        sort_by: "created_at",
        sort_order: "desc",
    }
);
export const useLoadPlan = makeDetailHook<Tables<"load_plans">>(
    "load_plan",
    "/api/entities/load-plans"
);
export const useCreateLoadPlan = makeCreateHook<Tables<"load_plans">>(
    "load_plan",
    "/api/entities/load-plans"
);
export const useUpdateLoadPlan = makeUpdateHook<Tables<"load_plans">>(
    "load_plan",
    "/api/entities/load-plans"
);

// ═══════════════════════════════════════════════════════════════
// INVENTORY AUDITS
// ═══════════════════════════════════════════════════════════════

export const useInventoryAudits = makeListHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/entities/inventory-audits",
    { sort_by: "audit_date", sort_order: "desc" }
);
export const useInventoryAudit = makeDetailHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/entities/inventory-audits"
);
export const useCreateInventoryAudit = makeCreateHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/entities/inventory-audits"
);
export const useUpdateInventoryAudit = makeUpdateHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/entities/inventory-audits"
);

// ═══════════════════════════════════════════════════════════════
// INVENTORY ITEMS (catalog)
// ═══════════════════════════════════════════════════════════════

export const useInventoryItems = makeListHook<Tables<"catalog_items">>(
    "catalog",
    "/api/entities/catalog",
    {
        sort_by: "name",
        sort_order: "asc",
    }
);
export const useCreateInventoryItem = makeCreateHook<Tables<"catalog_items">>(
    "catalog",
    "/api/entities/catalog"
);

// ═══════════════════════════════════════════════════════════════
// WAREHOUSES
// ═══════════════════════════════════════════════════════════════

export const useWarehouses = makeListHook<Tables<"warehouses">>(
    "warehouse",
    "/api/entities/warehouses",
    {
        sort_by: "name",
        sort_order: "asc",
    }
);
export const useWarehouse = makeDetailHook<Tables<"warehouses">>(
    "warehouse",
    "/api/entities/warehouses"
);
export const useCreateWarehouse = makeCreateHook<Tables<"warehouses">>(
    "warehouse",
    "/api/entities/warehouses"
);
export const useUpdateWarehouse = makeUpdateHook<Tables<"warehouses">>(
    "warehouse",
    "/api/entities/warehouses"
);
export const useDeleteWarehouse = makeDeleteHook("warehouse", "/api/entities/warehouses");

// ═══════════════════════════════════════════════════════════════
// RENTAL AGREEMENTS
// ═══════════════════════════════════════════════════════════════

export const useRentalAgreements = makeListHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/entities/rental-agreements",
    { sort_by: "start_date", sort_order: "desc" }
);
export const useRentalAgreement = makeDetailHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/entities/rental-agreements"
);
export const useCreateRentalAgreement = makeCreateHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/entities/rental-agreements"
);
export const useUpdateRentalAgreement = makeUpdateHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/entities/rental-agreements"
);
export const useDeleteRentalAgreement = makeDeleteHook(
    "rental_agreement",
    "/api/entities/rental-agreements"
);

// ═══════════════════════════════════════════════════════════════
// SPACE BOOKINGS
// ═══════════════════════════════════════════════════════════════

export const useSpaceBookings = makeListHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/entities/space-bookings",
    { sort_by: "start_time", sort_order: "desc" }
);
export const useSpaceBooking = makeDetailHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/entities/space-bookings"
);
export const useCreateSpaceBooking = makeCreateHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/entities/space-bookings"
);
export const useUpdateSpaceBooking = makeUpdateHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/entities/space-bookings"
);
export const useDeleteSpaceBooking = makeDeleteHook(
    "space_booking",
    "/api/entities/space-bookings"
);

// ═══════════════════════════════════════════════════════════════
// SHIPMENTS
// ═══════════════════════════════════════════════════════════════

export const useShipments = makeListHook<Tables<"shipments">>(
    "shipment",
    "/api/entities/shipments",
    {
        sort_by: "pickup_date",
        sort_order: "asc",
    }
);
export const useShipment = makeDetailHook<Tables<"shipments">>(
    "shipment",
    "/api/entities/shipments"
);
export const useCreateShipment = makeCreateHook<Tables<"shipments">>(
    "shipment",
    "/api/entities/shipments"
);
export const useUpdateShipment = makeUpdateHook<Tables<"shipments">>(
    "shipment",
    "/api/entities/shipments"
);
export const useDeleteShipment = makeDeleteHook("shipment", "/api/entities/shipments");

// ═══════════════════════════════════════════════════════════════
// CONSUMABLES
// ═══════════════════════════════════════════════════════════════

export const useConsumables = makeListHook<Tables<"consumables">>(
    "consumable",
    "/api/entities/consumables",
    { sort_by: "name", sort_order: "asc" }
);
export const useConsumable = makeDetailHook<Tables<"consumables">>(
    "consumable",
    "/api/entities/consumables"
);
export const useCreateConsumable = makeCreateHook<Tables<"consumables">>(
    "consumable",
    "/api/entities/consumables"
);
export const useUpdateConsumable = makeUpdateHook<Tables<"consumables">>(
    "consumable",
    "/api/entities/consumables"
);
export const useDeleteConsumable = makeDeleteHook("consumable", "/api/entities/consumables");

// ─── Consumable Usage ───
export const useConsumableUsage = makeListHook<Tables<"consumable_usage">>(
    "consumable_usage",
    "/api/entities/consumable-usage"
);

export function useCreateConsumableUsage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            apiCreate<Tables<"consumable_usage">>("/api/entities/consumable-usage", payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["consumable_usage"] });
            qc.invalidateQueries({ queryKey: ["consumable"] });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// MAINTENANCE RECORDS
// ═══════════════════════════════════════════════════════════════

export const useMaintenanceRecords = makeListHook<Tables<"maintenance_records">>(
    "maintenance_record",
    "/api/entities/maintenance-records",
    { sort_by: "scheduled_date", sort_order: "desc" }
);
export const useMaintenanceRecord = makeDetailHook<Tables<"maintenance_records">>(
    "maintenance_record",
    "/api/entities/maintenance-records"
);
export const useCreateMaintenanceRecord = makeCreateHook<Tables<"maintenance_records">>(
    "maintenance_record",
    "/api/entities/maintenance-records",
    ["asset"]
);
export const useUpdateMaintenanceRecord = makeUpdateHook<Tables<"maintenance_records">>(
    "maintenance_record",
    "/api/entities/maintenance-records"
);

// ═══════════════════════════════════════════════════════════════
// STORAGE OBJECTS
// ═══════════════════════════════════════════════════════════════

export const useStorageObjects = makeListHook<Tables<"storage_objects">>(
    "storage_object",
    "/api/entities/storage-objects",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useStorageObject = makeDetailHook<Tables<"storage_objects">>(
    "storage_object",
    "/api/entities/storage-objects"
);
export const useCreateStorageObject = makeCreateHook<Tables<"storage_objects">>(
    "storage_object",
    "/api/entities/storage-objects"
);
export const useDeleteStorageObject = makeDeleteHook(
    "storage_object",
    "/api/entities/storage-objects"
);

// TRANSFER ORDERS
// ═══════════════════════════════════════════════════════════════
export const useTransferOrders = makeListHook<Tables<"transfer_orders">>(
    "transfer_order",
    "/api/entities/transfer-orders",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useTransferOrder = makeDetailHook<Tables<"transfer_orders">>(
    "transfer_order",
    "/api/entities/transfer-orders"
);
export const useCreateTransferOrder = makeCreateHook<Tables<"transfer_orders">>(
    "transfer_order",
    "/api/entities/transfer-orders"
);
export const useUpdateTransferOrder = makeUpdateHook<Tables<"transfer_orders">>(
    "transfer_order",
    "/api/entities/transfer-orders"
);
export const useDeleteTransferOrder = makeDeleteHook(
    "transfer_order",
    "/api/entities/transfer-orders"
);
