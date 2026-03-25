"use client";

/**
 * Workforce entity hooks: crew_members, crew_shifts, crew_availability, time_entries,
 * time_off_requests, resource_bookings, worker_profiles, worker_classifications,
 * worker_compliance_docs, worker_onboarding/offboarding, worker_reviews,
 * active_timers, certifications, hr_certifications, user_certifications.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiDelete, apiList, apiUpdate } from "@/lib/api/client";
import { apiFetch } from "@/lib/api/client";
import type { Tables } from "@/types/generated/database.types";
import {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";
import type { UserCertification } from "./hook-types";

// ═══════════════════════════════════════════════════════════════
// CREW MEMBERS
// ═══════════════════════════════════════════════════════════════

export const useCrewMembers = makeListHook<Tables<"crew_members">>(
    "crew_member",
    "/api/entities/crew",
    { sort_by: "name", sort_order: "asc" },
    { staleTime: 5 * 60_000, gcTime: 10 * 60_000 }
);
export const useCrewMember = makeDetailHook<Tables<"crew_members">>(
    "crew_member",
    "/api/entities/crew"
);
export const useCreateCrewMember = makeCreateHook<Tables<"crew_members">>(
    "crew_member",
    "/api/entities/crew"
);
export const useUpdateCrewMember = makeUpdateHook<Tables<"crew_members">>(
    "crew_member",
    "/api/entities/crew"
);
export const useDeleteCrewMember = makeDeleteHook("crew_member", "/api/entities/crew");

// ═══════════════════════════════════════════════════════════════
// CREW SHIFTS
// ═══════════════════════════════════════════════════════════════

export const useCrewShifts = makeListHook<Tables<"crew_shifts">>(
    "crew_shift",
    "/api/entities/crew-shifts",
    {
        sort_by: "date",
        sort_order: "asc",
    }
);
export const useCrewShift = makeDetailHook<Tables<"crew_shifts">>(
    "crew_shift",
    "/api/entities/crew-shifts"
);
export const useCreateCrewShift = makeCreateHook<Tables<"crew_shifts">>(
    "crew_shift",
    "/api/entities/crew-shifts"
);
export const useUpdateCrewShift = makeUpdateHook<Tables<"crew_shifts">>(
    "crew_shift",
    "/api/entities/crew-shifts"
);
export const useDeleteCrewShift = makeDeleteHook("crew_shift", "/api/entities/crew-shifts");

// ═══════════════════════════════════════════════════════════════
// CREW AVAILABILITY
// ═══════════════════════════════════════════════════════════════

export const useCrewAvailability = makeListHook<Tables<"crew_availability">>(
    "crew_availability_entry",
    "/api/entities/crew-availability",
    { sort_by: "date", sort_order: "asc" }
);
export const useCreateCrewAvailability = makeCreateHook<Tables<"crew_availability">>(
    "crew_availability_entry",
    "/api/entities/crew-availability"
);
export const useUpdateCrewAvailability = makeUpdateHook<Tables<"crew_availability">>(
    "crew_availability_entry",
    "/api/entities/crew-availability"
);

// ═══════════════════════════════════════════════════════════════
// TIME ENTRIES
// ═══════════════════════════════════════════════════════════════

export const useTimeEntries = makeListHook<Tables<"time_entries">>(
    "time_entry",
    "/api/entities/time-entries",
    { sort_by: "date", sort_order: "desc" }
);
export const useTimeEntry = makeDetailHook<Tables<"time_entries">>(
    "time_entry",
    "/api/entities/time-entries"
);
export const useCreateTimeEntry = makeCreateHook<Tables<"time_entries">>(
    "time_entry",
    "/api/entities/time-entries"
);
export const useUpdateTimeEntry = makeUpdateHook<Tables<"time_entries">>(
    "time_entry",
    "/api/entities/time-entries"
);
export const useDeleteTimeEntry = makeDeleteHook("time_entry", "/api/entities/time-entries");

export function useSubmitTimeEntries() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (entryIds: string[]) =>
            apiFetch<{ data: unknown }>("/api/entities/time-entries/submit", {
                method: "POST",
                body: JSON.stringify({ entry_ids: entryIds, status: "submitted" }),
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["time_entry"] }),
    });
}

// ═══════════════════════════════════════════════════════════════
// TIME OFF REQUESTS
// ═══════════════════════════════════════════════════════════════

export const useTimeOffRequests = makeListHook<Tables<"time_off_requests">>(
    "time_off_request",
    "/api/entities/time-off-requests",
    { sort_by: "start_date", sort_order: "desc" }
);
export const useTimeOffRequest = makeDetailHook<Tables<"time_off_requests">>(
    "time_off_request",
    "/api/entities/time-off-requests"
);
export const useCreateTimeOffRequest = makeCreateHook<Tables<"time_off_requests">>(
    "time_off_request",
    "/api/entities/time-off-requests"
);
export const useApproveTimeOffRequest = makeUpdateHook<Tables<"time_off_requests">>(
    "time_off_request",
    "/api/entities/time-off-requests"
);
export const useRejectTimeOffRequest = makeUpdateHook<Tables<"time_off_requests">>(
    "time_off_request",
    "/api/entities/time-off-requests"
);

// ═══════════════════════════════════════════════════════════════
// RESOURCE BOOKINGS
// ═══════════════════════════════════════════════════════════════

export const useResourceBookings = makeListHook<Tables<"resource_bookings">>(
    "resource_booking",
    "/api/entities/resource-bookings",
    { sort_by: "start_date", sort_order: "asc" },
    { staleTime: 5 * 60_000, gcTime: 10 * 60_000 }
);
export const useResourceBooking = makeDetailHook<Tables<"resource_bookings">>(
    "resource_booking",
    "/api/entities/resource-bookings"
);
export const useCreateResourceBooking = makeCreateHook<Tables<"resource_bookings">>(
    "resource_booking",
    "/api/entities/resource-bookings"
);
export const useUpdateResourceBooking = makeUpdateHook<Tables<"resource_bookings">>(
    "resource_booking",
    "/api/entities/resource-bookings"
);
export const useDeleteResourceBooking = makeDeleteHook(
    "resource_booking",
    "/api/entities/resource-bookings"
);

// ═══════════════════════════════════════════════════════════════
// WORKER PROFILES
// ═══════════════════════════════════════════════════════════════

export const useWorkerProfiles = makeListHook<Tables<"worker_profiles">>(
    "worker_profile",
    "/api/entities/worker-profiles",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useWorkerProfile = makeDetailHook<Tables<"worker_profiles">>(
    "worker_profile",
    "/api/entities/worker-profiles"
);
export const useCreateWorkerProfile = makeCreateHook<Tables<"worker_profiles">>(
    "worker_profile",
    "/api/entities/worker-profiles"
);
export const useUpdateWorkerProfile = makeUpdateHook<Tables<"worker_profiles">>(
    "worker_profile",
    "/api/entities/worker-profiles"
);
export const useDeleteWorkerProfile = makeDeleteHook(
    "worker_profile",
    "/api/entities/worker-profiles"
);

// ═══════════════════════════════════════════════════════════════
// WORKER CLASSIFICATIONS
// ═══════════════════════════════════════════════════════════════

export const useWorkerClassifications = makeListHook<Tables<"worker_classifications">>(
    "worker_classification",
    "/api/entities/worker-classifications",
    { sort_by: "name", sort_order: "asc" }
);
export const useWorkerClassification = makeDetailHook<Tables<"worker_classifications">>(
    "worker_classification",
    "/api/entities/worker-classifications"
);
export const useCreateWorkerClassification = makeCreateHook<Tables<"worker_classifications">>(
    "worker_classification",
    "/api/entities/worker-classifications"
);
export const useUpdateWorkerClassification = makeUpdateHook<Tables<"worker_classifications">>(
    "worker_classification",
    "/api/entities/worker-classifications"
);

// ═══════════════════════════════════════════════════════════════
// WORKER COMPLIANCE DOCS
// ═══════════════════════════════════════════════════════════════

export const useWorkerComplianceDocs = makeListHook<Tables<"worker_compliance_docs">>(
    "worker_compliance_doc",
    "/api/entities/worker-compliance-docs",
    { sort_by: "expiry_date", sort_order: "asc" }
);
export const useWorkerComplianceDoc = makeDetailHook<Tables<"worker_compliance_docs">>(
    "worker_compliance_doc",
    "/api/entities/worker-compliance-docs"
);
export const useCreateWorkerComplianceDoc = makeCreateHook<Tables<"worker_compliance_docs">>(
    "worker_compliance_doc",
    "/api/entities/worker-compliance-docs"
);
export const useUpdateWorkerComplianceDoc = makeUpdateHook<Tables<"worker_compliance_docs">>(
    "worker_compliance_doc",
    "/api/entities/worker-compliance-docs"
);

// ─── Vendor Compliance Docs alias ───
export const useVendorComplianceDocuments = useWorkerComplianceDocs;
export const useCreateVendorComplianceDocument = useCreateWorkerComplianceDoc;

// ─── Vendor Onboarding alias ───
export const useVendorOnboarding = makeListHook<Tables<"worker_compliance_docs">>(
    "vendor_onboarding",
    "/api/entities/vendor-compliance-documents",
    { sort_by: "created_at", sort_order: "desc" }
);

// ═══════════════════════════════════════════════════════════════
// WORKER ONBOARDING / OFFBOARDING RUNS
// ═══════════════════════════════════════════════════════════════

export const useWorkerOnboardingRuns = makeListHook<Tables<"worker_onboarding_runs">>(
    "worker_onboarding_run",
    "/api/entities/worker-onboarding-runs",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useWorkerOffboardingRuns = makeListHook<Tables<"worker_offboarding_runs">>(
    "worker_offboarding_run",
    "/api/entities/worker-offboarding-runs",
    { sort_by: "created_at", sort_order: "desc" }
);

// ═══════════════════════════════════════════════════════════════
// WORKER REVIEWS
// ═══════════════════════════════════════════════════════════════

export const useWorkerReviewsList = makeListHook<Tables<"worker_reviews">>(
    "worker_review",
    "/api/entities/worker-reviews",
    { sort_by: "review_date", sort_order: "desc" }
);

// ─── Vendor Reviews alias ───
export const useVendorReviews = makeListHook<Tables<"worker_reviews">>(
    "vendor_review",
    "/api/entities/vendor-reviews",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useVendorReview = makeDetailHook<Tables<"worker_reviews">>(
    "vendor_review",
    "/api/entities/vendor-reviews"
);
export const useCreateVendorReview = makeCreateHook<Tables<"worker_reviews">>(
    "vendor_review",
    "/api/entities/vendor-reviews"
);
export const useUpdateVendorReview = makeUpdateHook<Tables<"worker_reviews">>(
    "vendor_review",
    "/api/entities/vendor-reviews"
);
export const useDeleteVendorReview = makeDeleteHook(
    "vendor_review",
    "/api/entities/vendor-reviews"
);

// ═══════════════════════════════════════════════════════════════
// ACTIVE TIMERS
// ═══════════════════════════════════════════════════════════════

export const useStartTimer = makeCreateHook<Tables<"active_timers">>(
    "active_timer",
    "/api/entities/active-timers"
);
export const useStopTimer = makeDeleteHook("active_timer", "/api/entities/active-timers");

export function useActiveTimer(userId: string) {
    return useQuery({
        queryKey: ["active_timer", { user_id: userId }],
        queryFn: async () => {
            const res = await apiList<Tables<"active_timers">>("/api/entities/active-timers", {
                user_id: userId,
            });
            return (res.data as Tables<"active_timers">[])?.[0] ?? null;
        },
        enabled: !!userId,
    });
}

// ═══════════════════════════════════════════════════════════════
// CERTIFICATIONS (asset_certifications)
// ═══════════════════════════════════════════════════════════════

export const useCertifications = makeListHook<Tables<"asset_certifications">>(
    "certification",
    "/api/entities/certifications",
    { sort_by: "expiry_date", sort_order: "asc" }
);
export const useCertification = makeDetailHook<Tables<"asset_certifications">>(
    "certification",
    "/api/entities/certifications"
);
export const useCreateCertification = makeCreateHook<Tables<"asset_certifications">>(
    "certification",
    "/api/entities/certifications"
);
export const useUpdateCertification = makeUpdateHook<Tables<"asset_certifications">>(
    "certification",
    "/api/entities/certifications"
);
export const useDeleteCertification = makeDeleteHook(
    "certification",
    "/api/entities/certifications"
);

// ═══════════════════════════════════════════════════════════════
// HR CERTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export const useHrCertifications = makeListHook<Tables<"certifications">>(
    "hr_certification",
    "/api/entities/hr-certifications",
    { sort_by: "expiry_date", sort_order: "asc" }
);
export const useHrCertification = makeDetailHook<Tables<"certifications">>(
    "hr_certification",
    "/api/entities/hr-certifications"
);
export const useCreateHrCertification = makeCreateHook<Tables<"certifications">>(
    "hr_certification",
    "/api/entities/hr-certifications"
);
export const useUpdateHrCertification = makeUpdateHook<Tables<"certifications">>(
    "hr_certification",
    "/api/entities/hr-certifications"
);

// ═══════════════════════════════════════════════════════════════
// USER CERTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export function useUserCertifications(userId: string | null) {
    return useQuery({
        queryKey: ["user_certification", { user_id: userId }],
        queryFn: () =>
            apiList<UserCertification>("/api/entities/user-certifications", {
                user_id: userId!,
            }),
        enabled: !!userId,
    });
}

export function useCreateUserCertification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Omit<UserCertification, "id" | "created_at" | "updated_at">) =>
            apiCreate<UserCertification>("/api/entities/user-certifications", payload),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["user_certification", { user_id: vars.user_id }] });
        },
    });
}

export function useUpdateUserCertification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...updates
        }: Partial<UserCertification> & { id: string; user_id: string }) =>
            apiUpdate<UserCertification>("/api/entities/user-certifications", id, updates),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["user_certification", { user_id: vars.user_id }] });
        },
    });
}

export function useDeleteUserCertification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string; user_id: string }) =>
            apiDelete("/api/entities/user-certifications", id),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["user_certification", { user_id: vars.user_id }] });
        },
    });
}
