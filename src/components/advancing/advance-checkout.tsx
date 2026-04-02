"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/locale-provider";
import { AlertTriangle, ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdvanceCart } from "@/hooks/use-advance-cart";
import { useCreateAdvance } from "@/lib/supabase/hooks-advancing";
import { useEvents } from "@/lib/supabase";
import { ADVANCE_PRIORITIES, ADVANCE_TYPES, formatAdvanceCost } from "@/config/advancing-config";
import { Badge } from "@/components/ui/badge";
import type { AdvancePriority, AdvanceType } from "@/types";

interface AdvanceCheckoutProps {
    onBack: () => void;
    onSuccess: (advanceId: string) => void;
    className?: string | undefined;
}

export function AdvanceCheckout({ onBack, onSuccess, className }: AdvanceCheckoutProps) {
    const { t } = useTranslation("common");
    const items = useAdvanceCart((s) => s.items);
    const eventId = useAdvanceCart((s) => s.event_id);
    const projectId = useAdvanceCart((s) => s.project_id);
    const advanceType = useAdvanceCart((s) => s.advance_type);
    const priority = useAdvanceCart((s) => s.priority);
    const title = useAdvanceCart((s) => s.title);
    const description = useAdvanceCart((s) => s.description);
    const serviceStartDate = useAdvanceCart((s) => s.service_start_date);
    const serviceEndDate = useAdvanceCart((s) => s.service_end_date);
    const totalCost = useAdvanceCart((s) => s.total_estimated_cost);
    const totalItems = useAdvanceCart((s) => s.total_items);
    const sourceTemplateId = useAdvanceCart((s) => s.source_template_id);

    const setEventId = useAdvanceCart((s) => s.setEventId);
    const setAdvanceType = useAdvanceCart((s) => s.setAdvanceType);
    const setPriority = useAdvanceCart((s) => s.setPriority);
    const setTitle = useAdvanceCart((s) => s.setTitle);
    const setDescription = useAdvanceCart((s) => s.setDescription);
    const setServiceDates = useAdvanceCart((s) => s.setServiceDates);
    const clearCart = useAdvanceCart((s) => s.clearCart);

    const { data: events } = useEvents();
    const createAdvance = useCreateAdvance();

    const [internalNotes, setInternalNotes] = React.useState("");
    const [clientNotes, setClientNotes] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);

    const canSubmit =
        title.trim().length > 0 && eventId.trim().length > 0 && items.length > 0 && !isSubmitting;

    const hasCriticalItems = items.some((i) => i.is_critical_path);

    async function handleSubmit(asDraft: boolean) {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const result = await createAdvance.mutateAsync({
                event_id: eventId,
                project_id: projectId,
                title: title.trim(),
                description: description.trim() || undefined,
                advance_type: advanceType,
                priority,
                service_start_date: serviceStartDate,
                service_end_date: serviceEndDate,
                internal_notes: internalNotes.trim() || undefined,
                client_notes: clientNotes.trim() || undefined,
                source_template_id: sourceTemplateId,
                items: items.map((item) => ({
                    catalog_item_id: item.catalog_item_id,
                    category_id: item.category_id,
                    quantity_requested: item.quantity,
                    unit_cost: item.unit_cost,
                    selected_modifiers: item.selected_modifiers ?? [],
                    item_specifications: item.item_specifications ?? {},
                    vendor_id: item.vendor_id,
                    notes: item.notes ?? undefined,
                    is_critical_path: item.is_critical_path ?? false,
                    delivery_zone: item.delivery_zone,
                    delivery_location: item.delivery_location,
                    location_id: item.location_id,
                    scheduled_delivery: item.scheduled_delivery,
                    start_date: item.start_date,
                    end_date: item.end_date,
                    operational_purpose: item.operational_purpose,
                    special_requests: item.special_requests,
                })),
            });

            // If submitting (not just saving as draft), transition to submitted
            if (!asDraft && result) {
                await fetch(`/api/advancing/${(result as Record<string, unknown>).id}/submit`, {
                    method: "POST",
                });
            }

            clearCart();
            onSuccess((result as Record<string, unknown>).id as string);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Failed to create advance");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to catalog">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-xl font-semibold">Review & Submit</h2>
                    <p className="text-sm text-muted-foreground">
                        {totalItems} items &middot; {formatAdvanceCost(totalCost)} estimated
                    </p>
                </div>
            </div>

            {/* Error */}
            {submitError && (
                <div
                    className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    role="alert"
                >
                    {submitError}
                </div>
            )}

            {/* Form */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: Advance details */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Advance Details</h3>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="advance-title" className="text-sm font-medium">
                            Title <span className="text-destructive">*</span>
                        </label>
                        <input
                            id="advance-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Main Stage Production Advance"
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="advance-event" className="text-sm font-medium">
                            Event <span className="text-destructive">*</span>
                        </label>
                        <select
                            id="advance-event"
                            value={eventId}
                            onChange={(e) => setEventId(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            required
                        >
                            <option value="">Select event...</option>
                            {(events as Record<string, unknown>[] | undefined)?.map((event) => (
                                <option key={event.id as string} value={event.id as string}>
                                    {event.name as string}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="advance-type" className="text-sm font-medium">
                                Type
                            </label>
                            <select
                                id="advance-type"
                                value={advanceType}
                                onChange={(e) => setAdvanceType(e.target.value as AdvanceType)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {ADVANCE_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="advance-priority" className="text-sm font-medium">
                                Priority
                            </label>
                            <select
                                id="advance-priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as AdvancePriority)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {ADVANCE_PRIORITIES.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="advance-description" className="text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            id="advance-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this advance..."
                            rows={3}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="service-start" className="text-sm font-medium">
                                Service Start
                            </label>
                            <input
                                id="service-start"
                                type="date"
                                value={serviceStartDate ?? ""}
                                onChange={(e) => setServiceDates(e.target.value, serviceEndDate)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="service-end" className="text-sm font-medium">
                                Service End
                            </label>
                            <input
                                id="service-end"
                                type="date"
                                value={serviceEndDate ?? ""}
                                onChange={(e) => setServiceDates(serviceStartDate, e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="internal-notes" className="text-sm font-medium">
                            Internal Notes
                        </label>
                        <textarea
                            id="internal-notes"
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            placeholder="Notes visible to your team only..."
                            rows={2}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="client-notes" className="text-sm font-medium">
                            Client Notes
                        </label>
                        <textarea
                            id="client-notes"
                            value={clientNotes}
                            onChange={(e) => setClientNotes(e.target.value)}
                            placeholder="Notes visible to clients..."
                            rows={2}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                </div>

                {/* Right: Items review */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Items Summary</h3>

                    {hasCriticalItems && (
                        <div className="flex items-center gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm text-warning">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            This advance contains critical path items
                        </div>
                    )}

                    <div className="divide-y rounded-lg border">
                        {items.map((item) => (
                            <div
                                key={item.catalog_item_id}
                                className="flex items-center justify-between gap-3 px-4 py-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate text-sm font-medium">
                                            {item.name}
                                        </span>
                                        {item.is_critical_path && (
                                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>Qty: {item.quantity}</span>
                                        <span>&times;</span>
                                        <span>{formatAdvanceCost(item.unit_cost)}</span>
                                    </div>
                                    {item.selected_modifiers &&
                                        item.selected_modifiers.length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {item.selected_modifiers.map((mod) => (
                                                    <Badge
                                                        key={mod.modifier_id}
                                                        variant="outline"
                                                        className="density-caption"
                                                    >
                                                        {mod.option_label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    {(item.start_date || item.end_date) && (
                                        <span className="text-xs text-muted-foreground">
                                            {item.start_date}
                                            {item.start_date && item.end_date && " → "}
                                            {item.end_date}
                                        </span>
                                    )}
                                    {item.operational_purpose && (
                                        <span className="text-xs text-muted-foreground truncate">
                                            Purpose: {item.operational_purpose}
                                        </span>
                                    )}
                                    {item.special_requests && (
                                        <span className="text-xs text-muted-foreground truncate">
                                            Requests: {item.special_requests}
                                        </span>
                                    )}
                                </div>
                                <span className="shrink-0 text-sm font-semibold">
                                    {formatAdvanceCost(item.unit_cost * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                        <span className="font-medium">Estimated Total</span>
                        <span className="text-lg font-bold">{formatAdvanceCost(totalCost)}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => handleSubmit(true)} disabled={!canSubmit}>
                    <CheckCircle2 className="h-4 w-4" />
                    Save as Draft
                </Button>
                <Button onClick={() => handleSubmit(false)} disabled={!canSubmit}>
                    <Send className="h-4 w-4" />
                    {isSubmitting ? t("action_submitting") : "Submit for Review"}
                </Button>
            </div>
        </div>
    );
}
