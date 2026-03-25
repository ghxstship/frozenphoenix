"use client";

/* ═══════════════════════════════════════════════════════════════
   SUPPLIER DISCOVERY HOOKS — Marketplace Directory

   Hooks for searching, viewing, and inviting suppliers
   from a shared directory network.
   ═══════════════════════════════════════════════════════════════ */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiGet, apiList } from "@/lib/api/client";

// ─── Types ───────────────────────────────────────────────────

export interface SupplierListing {
    id: string;
    name: string;
    category: string;
    subcategory?: string | undefined;
    location: string;
    rating: number;
    review_count: number;
    verified: boolean;
    description: string;
    services: string[];
    certifications: string[];
    logo_url?: string | undefined;
    contact_email?: string | undefined;
    min_budget?: number | undefined;
    max_budget?: number | undefined;
}

export interface SupplierFilter {
    search?: string | undefined;
    category?: string | undefined;
    location?: string | undefined;
    min_rating?: number | undefined;
    verified_only?: boolean | undefined;
}

// ─── Hooks ───────────────────────────────────────────────────

export function useSupplierDirectory(filters?: SupplierFilter | undefined) {
    return useQuery({
        queryKey: ["supplier_directory", filters],
        queryFn: async () => {
            const res = await apiList<SupplierListing>("/api/supplier-directory", {
                ...filters,
                sort_by: "rating",
                sort_order: "desc",
                per_page: 50,
            });
            return res.data ?? [];
        },
    });
}

export function useSupplierProfile(id?: string | undefined) {
    return useQuery({
        queryKey: ["supplier_directory", "detail", id],
        queryFn: () => apiGet<SupplierListing>("/api/supplier-directory", id!),
        enabled: !!id,
    });
}

export function useSupplierInvite() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { email: string; company_name: string; category: string }) =>
            apiCreate<{ success: boolean }>("/api/supplier-directory/invite", payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier_directory"] }),
    });
}

/** Service categories for filter dropdowns */
export const SUPPLIER_CATEGORIES = [
    "Audio/Visual",
    "Catering",
    "Décor & Design",
    "Entertainment",
    "Fabrication",
    "Flooring",
    "Freight & Logistics",
    "Furniture Rental",
    "Generators & Power",
    "Lighting",
    "Photography",
    "Production",
    "Rigging",
    "Security",
    "Signage & Print",
    "Staffing",
    "Staging",
    "Sustainability",
    "Tenting & Structures",
    "Transportation",
    "Venue",
    "Videography",
    "Waste Management",
] as const;
