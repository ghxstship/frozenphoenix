"use client";

/**
 * Assets & Inventory entity hooks: assets, asset_assignments, asset_versions,
 * asset_tags, vehicles, kits, load_plans, inventory_audits, inventory_items (catalog),
 * warehouses, rental_agreements, space_bookings, shipments, consumables,
 * consumable_usage, maintenance_records, storage_objects.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCreate } from "@/lib/api/client";
import type { Tables } from "./database.types";
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

export const useAssets = makeListHook<Tables<"assets">>("asset", "/api/assets", {
    sort_by: "name",
    sort_order: "asc",
});
export const useAsset = makeDetailHook<Tables<"assets">>("asset", "/api/assets");
export const useCreateAsset = makeCreateHook<Tables<"assets">>("asset", "/api/assets");
export const useUpdateAsset = makeUpdateHook<Tables<"assets">>("asset", "/api/assets");
export const useDeleteAsset = makeDeleteHook("asset", "/api/assets");

// ═══════════════════════════════════════════════════════════════
// ASSET ASSIGNMENTS
// ═══════════════════════════════════════════════════════════════

export const useAssetAssignments = makeListHook<Tables<"asset_assignments">>(
    "asset_assignment",
    "/api/asset-assignments",
    { sort_by: "check_out_date", sort_order: "desc" }
);
export const useAssetAssignment = makeDetailHook<Tables<"asset_assignments">>(
    "asset_assignment",
    "/api/asset-assignments"
);
export const useCreateAssetAssignment = makeCreateHook<Tables<"asset_assignments">>(
    "asset_assignment",
    "/api/asset-assignments",
    ["asset"]
);
export const useUpdateAssetAssignment = makeUpdateHook<Tables<"asset_assignments">>(
    "asset_assignment",
    "/api/asset-assignments"
);
export const useDeleteAssetAssignment = makeDeleteHook(
    "asset_assignment",
    "/api/asset-assignments"
);

// ═══════════════════════════════════════════════════════════════
// ASSET VERSIONS
// ═══════════════════════════════════════════════════════════════

export const useAssetVersions = makeListHook<Tables<"asset_versions">>(
    "asset_version",
    "/api/asset-versions",
    { sort_by: "version_number", sort_order: "desc" }
);
export const useAssetVersion = makeDetailHook<Tables<"asset_versions">>(
    "asset_version",
    "/api/asset-versions"
);
export const useCreateAssetVersion = makeCreateHook<Tables<"asset_versions">>(
    "asset_version",
    "/api/asset-versions",
    ["asset"]
);

// ═══════════════════════════════════════════════════════════════
// ASSET TAGS
// ═══════════════════════════════════════════════════════════════

export const useAssetTags = makeListHook<Tables<"asset_tags">>("asset_tag", "/api/asset-tags", {
    sort_by: "tag_key",
    sort_order: "asc",
});
export const useCreateAssetTag = makeCreateHook<Tables<"asset_tags">>(
    "asset_tag",
    "/api/asset-tags",
    ["asset"]
);
export const useDeleteAssetTag = makeDeleteHook("asset_tag", "/api/asset-tags");

// ═══════════════════════════════════════════════════════════════
// VEHICLES
// ═══════════════════════════════════════════════════════════════

export const useVehicles = makeListHook<Tables<"vehicles">>("vehicle", "/api/fleet", {
    sort_by: "name",
    sort_order: "asc",
});
export const useVehicle = makeDetailHook<Tables<"vehicles">>("vehicle", "/api/fleet");
export const useCreateVehicle = makeCreateHook<Tables<"vehicles">>("vehicle", "/api/fleet");
export const useUpdateVehicle = makeUpdateHook<Tables<"vehicles">>("vehicle", "/api/fleet");
export const useDeleteVehicle = makeDeleteHook("vehicle", "/api/fleet");

// ─── Fleet aliases ───
export const useFleetVehicles = useVehicles;
export const useCreateFleetVehicle = useCreateVehicle;

// ═══════════════════════════════════════════════════════════════
// KITS
// ═══════════════════════════════════════════════════════════════

export const useKits = makeListHook<Tables<"kits">>("kit", "/api/kits", {
    sort_by: "name",
    sort_order: "asc",
});
export const useKit = makeDetailHook<Tables<"kits">>("kit", "/api/kits");
export const useCreateKit = makeCreateHook<Tables<"kits">>("kit", "/api/kits");
export const useUpdateKit = makeUpdateHook<Tables<"kits">>("kit", "/api/kits");
export const useDeleteKit = makeDeleteHook("kit", "/api/kits");

// ═══════════════════════════════════════════════════════════════
// LOAD PLANS
// ═══════════════════════════════════════════════════════════════

export const useLoadPlans = makeListHook<Tables<"load_plans">>("load_plan", "/api/load-plans", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useLoadPlan = makeDetailHook<Tables<"load_plans">>("load_plan", "/api/load-plans");
export const useCreateLoadPlan = makeCreateHook<Tables<"load_plans">>(
    "load_plan",
    "/api/load-plans"
);
export const useUpdateLoadPlan = makeUpdateHook<Tables<"load_plans">>(
    "load_plan",
    "/api/load-plans"
);

// ═══════════════════════════════════════════════════════════════
// INVENTORY AUDITS
// ═══════════════════════════════════════════════════════════════

export const useInventoryAudits = makeListHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/inventory-audits",
    { sort_by: "audit_date", sort_order: "desc" }
);
export const useInventoryAudit = makeDetailHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/inventory-audits"
);
export const useCreateInventoryAudit = makeCreateHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/inventory-audits"
);
export const useUpdateInventoryAudit = makeUpdateHook<Tables<"inventory_audits">>(
    "inventory_audit",
    "/api/inventory-audits"
);

// ═══════════════════════════════════════════════════════════════
// INVENTORY ITEMS (catalog)
// ═══════════════════════════════════════════════════════════════

export const useInventoryItems = makeListHook<Tables<"catalog_items">>("catalog", "/api/catalog", {
    sort_by: "name",
    sort_order: "asc",
});
export const useCreateInventoryItem = makeCreateHook<Tables<"catalog_items">>(
    "catalog",
    "/api/catalog"
);

// ═══════════════════════════════════════════════════════════════
// WAREHOUSES
// ═══════════════════════════════════════════════════════════════

export const useWarehouses = makeListHook<Tables<"warehouses">>("warehouse", "/api/warehouses", {
    sort_by: "name",
    sort_order: "asc",
});
export const useWarehouse = makeDetailHook<Tables<"warehouses">>("warehouse", "/api/warehouses");
export const useCreateWarehouse = makeCreateHook<Tables<"warehouses">>(
    "warehouse",
    "/api/warehouses"
);
export const useUpdateWarehouse = makeUpdateHook<Tables<"warehouses">>(
    "warehouse",
    "/api/warehouses"
);
export const useDeleteWarehouse = makeDeleteHook("warehouse", "/api/warehouses");

// ═══════════════════════════════════════════════════════════════
// RENTAL AGREEMENTS
// ═══════════════════════════════════════════════════════════════

export const useRentalAgreements = makeListHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/rental-agreements",
    { sort_by: "start_date", sort_order: "desc" }
);
export const useRentalAgreement = makeDetailHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/rental-agreements"
);
export const useCreateRentalAgreement = makeCreateHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/rental-agreements"
);
export const useUpdateRentalAgreement = makeUpdateHook<Tables<"rental_agreements">>(
    "rental_agreement",
    "/api/rental-agreements"
);
export const useDeleteRentalAgreement = makeDeleteHook(
    "rental_agreement",
    "/api/rental-agreements"
);

// ═══════════════════════════════════════════════════════════════
// SPACE BOOKINGS
// ═══════════════════════════════════════════════════════════════

export const useSpaceBookings = makeListHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/space-bookings",
    { sort_by: "start_time", sort_order: "desc" }
);
export const useSpaceBooking = makeDetailHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/space-bookings"
);
export const useCreateSpaceBooking = makeCreateHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/space-bookings"
);
export const useUpdateSpaceBooking = makeUpdateHook<Tables<"space_bookings">>(
    "space_booking",
    "/api/space-bookings"
);
export const useDeleteSpaceBooking = makeDeleteHook("space_booking", "/api/space-bookings");

// ═══════════════════════════════════════════════════════════════
// SHIPMENTS
// ═══════════════════════════════════════════════════════════════

export const useShipments = makeListHook<Tables<"shipments">>("shipment", "/api/shipments", {
    sort_by: "pickup_date",
    sort_order: "asc",
});
export const useShipment = makeDetailHook<Tables<"shipments">>("shipment", "/api/shipments");
export const useCreateShipment = makeCreateHook<Tables<"shipments">>("shipment", "/api/shipments");
export const useUpdateShipment = makeUpdateHook<Tables<"shipments">>("shipment", "/api/shipments");
export const useDeleteShipment = makeDeleteHook("shipment", "/api/shipments");

// ═══════════════════════════════════════════════════════════════
// CONSUMABLES
// ═══════════════════════════════════════════════════════════════

export const useConsumables = makeListHook<Tables<"consumables">>(
    "consumable",
    "/api/consumables",
    { sort_by: "name", sort_order: "asc" }
);
export const useConsumable = makeDetailHook<Tables<"consumables">>(
    "consumable",
    "/api/consumables"
);
export const useCreateConsumable = makeCreateHook<Tables<"consumables">>(
    "consumable",
    "/api/consumables"
);
export const useUpdateConsumable = makeUpdateHook<Tables<"consumables">>(
    "consumable",
    "/api/consumables"
);
export const useDeleteConsumable = makeDeleteHook("consumable", "/api/consumables");

// ─── Consumable Usage ───
export const useConsumableUsage = makeListHook<Tables<"consumable_usage">>(
    "consumable_usage",
    "/api/consumable-usage"
);

export function useCreateConsumableUsage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            apiCreate<Tables<"consumable_usage">>("/api/consumable-usage", payload),
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
    "/api/maintenance-records",
    { sort_by: "scheduled_date", sort_order: "desc" }
);
export const useMaintenanceRecord = makeDetailHook<Tables<"maintenance_records">>(
    "maintenance_record",
    "/api/maintenance-records"
);
export const useCreateMaintenanceRecord = makeCreateHook<Tables<"maintenance_records">>(
    "maintenance_record",
    "/api/maintenance-records",
    ["asset"]
);
export const useUpdateMaintenanceRecord = makeUpdateHook<Tables<"maintenance_records">>(
    "maintenance_record",
    "/api/maintenance-records"
);

// ═══════════════════════════════════════════════════════════════
// STORAGE OBJECTS
// ═══════════════════════════════════════════════════════════════

export const useStorageObjects = makeListHook<Tables<"storage_objects">>(
    "storage_object",
    "/api/storage-objects",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useStorageObject = makeDetailHook<Tables<"storage_objects">>(
    "storage_object",
    "/api/storage-objects"
);
export const useCreateStorageObject = makeCreateHook<Tables<"storage_objects">>(
    "storage_object",
    "/api/storage-objects"
);
export const useDeleteStorageObject = makeDeleteHook("storage_object", "/api/storage-objects");

// TRANSFER ORDERS
// ═══════════════════════════════════════════════════════════════
export const useTransferOrders = makeListHook<Tables<"transfer_orders">>(
    "transfer_order",
    "/api/transfer-orders",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useTransferOrder = makeDetailHook<Tables<"transfer_orders">>(
    "transfer_order",
    "/api/transfer-orders"
);
export const useCreateTransferOrder = makeCreateHook<Tables<"transfer_orders">>(
    "transfer_order",
    "/api/transfer-orders"
);
export const useUpdateTransferOrder = makeUpdateHook<Tables<"transfer_orders">>(
    "transfer_order",
    "/api/transfer-orders"
);
export const useDeleteTransferOrder = makeDeleteHook("transfer_order", "/api/transfer-orders");
