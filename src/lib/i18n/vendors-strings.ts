/**
 * Vendors & Supply Chain — i18n string definitions
 * Covers: vendors, vendor-reviews, vendor-compliance, vendor-risk,
 *         shipments, dispatch, goods-receipts, fleet
 */

export const VENDORS_STRINGS = {
    // ─── Vendors ───────────────────────────────────────────────
    vendors_title: "Vendors",
    vendors_empty: "No vendors",
    vendors_search: "Search vendors...",
    vendors_create: "New Vendor",
    vendor_name: "Vendor Name",
    vendor_type: "Type",
    vendor_status: "Status",
    vendor_email: "Email",
    vendor_phone: "Phone",
    vendor_address: "Address",
    vendor_rating: "Rating",
    vendor_notes: "Notes",

    // ─── Vendor Reviews ────────────────────────────────────────
    vendor_reviews_title: "Vendor Reviews",
    vendor_reviews_empty: "No reviews",
    vendor_reviews_create: "New Review",
    review_vendor: "Vendor",
    review_rating: "Rating",
    review_quality: "Quality Score",
    review_delivery: "Delivery Score",
    review_communication: "Communication Score",
    review_comments: "Comments",

    // ─── Vendor Compliance ─────────────────────────────────────
    vendor_compliance_title: "Vendor Compliance",
    vendor_compliance_empty: "No compliance records",
    vendor_compliance_status: "Compliance Status",
    vendor_compliance_expiry: "Expiry Date",

    // ─── Vendor Risk ───────────────────────────────────────────
    vendor_risk_title: "Vendor Risk",
    vendor_risk_empty: "No risk assessments",
    vendor_risk_score: "Risk Score",
    vendor_risk_category: "Risk Category",
    vendor_risk_mitigation: "Mitigation Plan",

    // ─── Shipments ─────────────────────────────────────────────
    shipments_title: "Shipments",
    shipments_empty: "No shipments",
    shipments_create: "New Shipment",
    shipment_tracking: "Tracking Number",
    shipment_origin: "Origin",
    shipment_destination: "Destination",
    shipment_carrier: "Carrier",
    shipment_status: "Status",
    shipment_estimated_delivery: "Estimated Delivery",

    // ─── Dispatch ──────────────────────────────────────────────
    dispatch_title: "Dispatch",
    dispatch_empty: "No dispatches",
    dispatch_create: "New Dispatch",
    dispatch_vehicle: "Vehicle",
    dispatch_driver: "Driver",
    dispatch_route: "Route",
    dispatch_departure: "Departure",
    dispatch_arrival: "Arrival",

    // ─── Goods Receipts ────────────────────────────────────────
    goods_receipts_title: "Goods Receipts",
    goods_receipts_empty: "No goods receipts",
    goods_receipt_po: "Purchase Order",
    goods_receipt_received_by: "Received By",
    goods_receipt_date: "Receipt Date",
    goods_receipt_items: "Items Received",

    // ─── Fleet ─────────────────────────────────────────────────
    fleet_title: "Fleet Management",
    fleet_empty: "No fleet vehicles",
    fleet_vehicle: "Vehicle",
    fleet_plate: "License Plate",
    fleet_status: "Status",
    fleet_mileage: "Mileage",
    fleet_next_service: "Next Service",

    // ─── Vendor Statuses ───────────────────────────────────────
    status_prospect: "Prospect",
    status_application: "Application",
    status_review: "Review",
    status_onboarding: "Onboarding",
    status_active: "Active",
    status_probation: "Probation",
    status_suspended: "Suspended",
    status_inactive: "Inactive",
    status_blacklisted: "Blacklisted",

    // ─── Accessibility ─────────────────────────────────────────
    a11y_vendor_list: "Vendor list",
    a11y_shipment_list: "Shipment list",
    a11y_vendor_rating: "Vendor rating: {rating} out of 5",
} as const;

export type VendorsStringKey = keyof typeof VENDORS_STRINGS;
