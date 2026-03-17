"use client";

/**
 * Live-Ops entity hooks: live_event_instances, live_crew_assignments,
 * strike_sequences, environmental_readings, foh_zones, foh_zone_readings,
 * comm_channels, department_statuses, guest_incidents, readiness_gates,
 * ros_cues, vip_guests, equipment_check_ins, live_financial_snapshots,
 * post_event_reports, vip_service_requests, scan_events.
 *
 * REWRITTEN: All hooks now use factory pattern via API routes.
 */

import type { Tables } from "./database.types";
import {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";

// ═══════════════════════════════════════════════════════════════
// LIVE EVENT INSTANCES
// ═══════════════════════════════════════════════════════════════

export const useLiveEventInstances = makeListHook<Tables<"live_event_instances">>(
    "live_event_instance",
    "/api/live-event-instances",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useLiveEventInstance = makeDetailHook<Tables<"live_event_instances">>(
    "live_event_instance",
    "/api/live-event-instances"
);
export const useCreateLiveEventInstance = makeCreateHook<Tables<"live_event_instances">>(
    "live_event_instance",
    "/api/live-event-instances"
);
export const useUpdateLiveEventInstance = makeUpdateHook<Tables<"live_event_instances">>(
    "live_event_instance",
    "/api/live-event-instances"
);
export const useDeleteLiveEventInstance = makeDeleteHook(
    "live_event_instance",
    "/api/live-event-instances"
);

// ═══════════════════════════════════════════════════════════════
// LIVE CREW ASSIGNMENTS
// ═══════════════════════════════════════════════════════════════

export const useLiveCrewAssignments = makeListHook<Tables<"live_crew_assignments">>(
    "live_crew_assignment",
    "/api/live-crew-assignments",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useLiveCrewAssignment = makeDetailHook<Tables<"live_crew_assignments">>(
    "live_crew_assignment",
    "/api/live-crew-assignments"
);
export const useCreateLiveCrewAssignment = makeCreateHook<Tables<"live_crew_assignments">>(
    "live_crew_assignment",
    "/api/live-crew-assignments"
);
export const useUpdateLiveCrewAssignment = makeUpdateHook<Tables<"live_crew_assignments">>(
    "live_crew_assignment",
    "/api/live-crew-assignments"
);

// ═══════════════════════════════════════════════════════════════
// STRIKE SEQUENCES
// ═══════════════════════════════════════════════════════════════

export const useStrikeSequences = makeListHook<Tables<"strike_sequences">>(
    "strike_sequence",
    "/api/strike-sequences",
    { sort_by: "sequence", sort_order: "asc" }
);
export const useCreateStrikeSequence = makeCreateHook<Tables<"strike_sequences">>(
    "strike_sequence",
    "/api/strike-sequences"
);
export const useUpdateStrikeSequence = makeUpdateHook<Tables<"strike_sequences">>(
    "strike_sequence",
    "/api/strike-sequences"
);

// ═══════════════════════════════════════════════════════════════
// ENVIRONMENTAL READINGS
// ═══════════════════════════════════════════════════════════════

export const useEnvironmentalReadings = makeListHook<Tables<"environmental_readings">>(
    "environmental_reading",
    "/api/environmental-readings",
    { sort_by: "recorded_at", sort_order: "desc" }
);
export const useCreateEnvironmentalReading = makeCreateHook<Tables<"environmental_readings">>(
    "environmental_reading",
    "/api/environmental-readings"
);

// ═══════════════════════════════════════════════════════════════
// FOH ZONES
// ═══════════════════════════════════════════════════════════════

export const useFohZones = makeListHook<Tables<"foh_zones">>("foh_zone", "/api/foh-zones", {
    sort_by: "name",
    sort_order: "asc",
});
export const useFohZone = makeDetailHook<Tables<"foh_zones">>("foh_zone", "/api/foh-zones");
export const useCreateFohZone = makeCreateHook<Tables<"foh_zones">>("foh_zone", "/api/foh-zones");
export const useUpdateFohZone = makeUpdateHook<Tables<"foh_zones">>("foh_zone", "/api/foh-zones");

// ═══════════════════════════════════════════════════════════════
// FOH ZONE READINGS
// ═══════════════════════════════════════════════════════════════

export const useFohZoneReadings = makeListHook<Tables<"foh_zone_readings">>(
    "foh_zone_reading",
    "/api/foh-zone-readings",
    { sort_by: "recorded_at", sort_order: "desc" }
);
export const useCreateFohZoneReading = makeCreateHook<Tables<"foh_zone_readings">>(
    "foh_zone_reading",
    "/api/foh-zone-readings"
);

// ═══════════════════════════════════════════════════════════════
// COMM CHANNELS
// ═══════════════════════════════════════════════════════════════

export const useCommChannels = makeListHook<Tables<"comm_channels">>(
    "comm_channel",
    "/api/comm-channels",
    { sort_by: "channel_number", sort_order: "asc" }
);
export const useCreateCommChannel = makeCreateHook<Tables<"comm_channels">>(
    "comm_channel",
    "/api/comm-channels"
);
export const useUpdateCommChannel = makeUpdateHook<Tables<"comm_channels">>(
    "comm_channel",
    "/api/comm-channels"
);

// ═══════════════════════════════════════════════════════════════
// DEPARTMENT STATUSES
// ═══════════════════════════════════════════════════════════════

export const useDepartmentStatuses = makeListHook<Tables<"department_statuses">>(
    "department_status",
    "/api/department-statuses",
    { sort_by: "department", sort_order: "asc" }
);
export const useCreateDepartmentStatus = makeCreateHook<Tables<"department_statuses">>(
    "department_status",
    "/api/department-statuses"
);
export const useUpdateDepartmentStatus = makeUpdateHook<Tables<"department_statuses">>(
    "department_status",
    "/api/department-statuses"
);

// ═══════════════════════════════════════════════════════════════
// GUEST INCIDENTS
// ═══════════════════════════════════════════════════════════════

export const useGuestIncidents = makeListHook<Tables<"guest_incidents">>(
    "guest_incident",
    "/api/guest-incidents",
    { sort_by: "reported_at", sort_order: "desc" }
);
export const useGuestIncident = makeDetailHook<Tables<"guest_incidents">>(
    "guest_incident",
    "/api/guest-incidents"
);
export const useCreateGuestIncident = makeCreateHook<Tables<"guest_incidents">>(
    "guest_incident",
    "/api/guest-incidents"
);
export const useUpdateGuestIncident = makeUpdateHook<Tables<"guest_incidents">>(
    "guest_incident",
    "/api/guest-incidents"
);

// ═══════════════════════════════════════════════════════════════
// READINESS GATES
// ═══════════════════════════════════════════════════════════════

export const useReadinessGates = makeListHook<Tables<"readiness_gates">>(
    "readiness_gate",
    "/api/readiness-gates",
    { sort_by: "gate_number", sort_order: "asc" }
);
export const useReadinessGate = makeDetailHook<Tables<"readiness_gates">>(
    "readiness_gate",
    "/api/readiness-gates"
);
export const useCreateReadinessGate = makeCreateHook<Tables<"readiness_gates">>(
    "readiness_gate",
    "/api/readiness-gates"
);
export const useUpdateReadinessGate = makeUpdateHook<Tables<"readiness_gates">>(
    "readiness_gate",
    "/api/readiness-gates"
);

// ═══════════════════════════════════════════════════════════════
// ROS CUES
// ═══════════════════════════════════════════════════════════════

export const useRosCues = makeListHook<Tables<"ros_cues">>("ros_cue", "/api/ros-cues", {
    sort_by: "sequence",
    sort_order: "asc",
});
export const useRosCue = makeDetailHook<Tables<"ros_cues">>("ros_cue", "/api/ros-cues");
export const useCreateRosCue = makeCreateHook<Tables<"ros_cues">>("ros_cue", "/api/ros-cues");
export const useUpdateRosCue = makeUpdateHook<Tables<"ros_cues">>("ros_cue", "/api/ros-cues");
export const useDeleteRosCue = makeDeleteHook("ros_cue", "/api/ros-cues");

// ═══════════════════════════════════════════════════════════════
// VIP GUESTS
// ═══════════════════════════════════════════════════════════════

export const useVipGuests = makeListHook<Tables<"vip_guests">>("vip_guest", "/api/vip-guests", {
    sort_by: "name",
    sort_order: "asc",
});
export const useVipGuest = makeDetailHook<Tables<"vip_guests">>("vip_guest", "/api/vip-guests");
export const useCreateVipGuest = makeCreateHook<Tables<"vip_guests">>(
    "vip_guest",
    "/api/vip-guests"
);
export const useUpdateVipGuest = makeUpdateHook<Tables<"vip_guests">>(
    "vip_guest",
    "/api/vip-guests"
);

// ═══════════════════════════════════════════════════════════════
// EQUIPMENT CHECK-INS
// ═══════════════════════════════════════════════════════════════

export const useEquipmentCheckIns = makeListHook<Tables<"equipment_check_ins">>(
    "equipment_check_in",
    "/api/equipment-check-ins",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useCreateEquipmentCheckIn = makeCreateHook<Tables<"equipment_check_ins">>(
    "equipment_check_in",
    "/api/equipment-check-ins"
);

// ═══════════════════════════════════════════════════════════════
// LIVE FINANCIAL SNAPSHOTS
// ═══════════════════════════════════════════════════════════════

export const useLiveFinancialSnapshots = makeListHook<Tables<"live_financial_snapshots">>(
    "live_financial_snapshot",
    "/api/live-financial-snapshots",
    { sort_by: "snapshot_time", sort_order: "desc" }
);
export const useCreateLiveFinancialSnapshot = makeCreateHook<Tables<"live_financial_snapshots">>(
    "live_financial_snapshot",
    "/api/live-financial-snapshots"
);

// ═══════════════════════════════════════════════════════════════
// POST EVENT REPORTS
// ═══════════════════════════════════════════════════════════════

export const usePostEventReports = makeListHook<Tables<"post_event_reports">>(
    "post_event_report",
    "/api/post-event-reports",
    { sort_by: "compiled_at", sort_order: "desc" }
);
export const usePostEventReport = makeDetailHook<Tables<"post_event_reports">>(
    "post_event_report",
    "/api/post-event-reports"
);
export const useCreatePostEventReport = makeCreateHook<Tables<"post_event_reports">>(
    "post_event_report",
    "/api/post-event-reports"
);
export const useUpdatePostEventReport = makeUpdateHook<Tables<"post_event_reports">>(
    "post_event_report",
    "/api/post-event-reports"
);

// ═══════════════════════════════════════════════════════════════
// VIP SERVICE REQUESTS
// ═══════════════════════════════════════════════════════════════

export const useVipServiceRequests = makeListHook<Tables<"vip_service_requests">>(
    "vip_service_request",
    "/api/vip-service-requests",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useVipServiceRequest = makeDetailHook<Tables<"vip_service_requests">>(
    "vip_service_request",
    "/api/vip-service-requests"
);
export const useCreateVipServiceRequest = makeCreateHook<Tables<"vip_service_requests">>(
    "vip_service_request",
    "/api/vip-service-requests"
);
export const useUpdateVipServiceRequest = makeUpdateHook<Tables<"vip_service_requests">>(
    "vip_service_request",
    "/api/vip-service-requests"
);

// ═══════════════════════════════════════════════════════════════
// SCAN EVENTS
// ═══════════════════════════════════════════════════════════════

export const useScanEvents = makeListHook<Tables<"scan_events">>("scan_event", "/api/scan-events", {
    sort_by: "scanned_at",
    sort_order: "desc",
});
export const useCreateScanEvent = makeCreateHook<Tables<"scan_events">>(
    "scan_event",
    "/api/scan-events"
);
