import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/integrations/calendar-sync
 *
 * Gap #27: Calendar sync (Google Calendar / Outlook)
 * Syncs events and schedule entries bidirectionally with external calendars.
 *
 * Body: { action: "push" | "pull", provider: "google" | "outlook", entity_type?: string, entity_id?: string }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/integrations/calendar-sync",
        mutation: true,
        rbac: { resource: "calendar", action: "write" },
    },
    async (request, { supabase, user, orgId, log }) => {
        const body = await request.json();
        const { action, provider, entity_type, entity_id } = body;

        if (!action || !provider) {
            return NextResponse.json(
                { error: { message: "action and provider are required" } },
                { status: 400 }
            );
        }

        // Find active calendar provider connection
        const { data: connection } = await serverFromTable(supabase, "provider_connections")
            .select(
                "id, provider_type, access_token, refresh_token, api_base_url, is_active, metadata"
            )
            .eq("organization_id", orgId)
            .eq("provider_type", provider === "google" ? "google_calendar" : "outlook_calendar")
            .eq("is_active", true)
            .limit(1)
            .single();

        if (!connection) {
            return NextResponse.json(
                {
                    error: {
                        message: `No active ${provider} calendar integration. Connect in Settings > Integrations.`,
                    },
                },
                { status: 404 }
            );
        }

        const conn = connection as Record<string, unknown>;
        const accessToken = conn.access_token as string;

        if (!accessToken) {
            return NextResponse.json(
                { error: { message: `${provider} calendar connection needs re-authentication` } },
                { status: 422 }
            );
        }

        if (action === "push") {
            // Push FrozenPhoenix events to external calendar
            let events: Array<Record<string, unknown>> = [];

            if (entity_type === "event" && entity_id) {
                const { data } = await serverFromTable(supabase, "events")
                    .select("id, name, start_date, end_date, location_name, description")
                    .eq("id", entity_id)
                    .single();
                if (data) events = [data as Record<string, unknown>];
            } else {
                // Push all upcoming events
                const { data } = await serverFromTable(supabase, "events")
                    .select("id, name, start_date, end_date, location_name, description")
                    .eq("organization_id", orgId)
                    .gte("start_date", new Date().toISOString().split("T")[0])
                    .limit(50);
                events = (data ?? []) as Array<Record<string, unknown>>;
            }

            let synced = 0;
            for (const event of events) {
                try {
                    const calEvent =
                        provider === "google"
                            ? {
                                  summary: event.name,
                                  description: event.description ?? "",
                                  start: { dateTime: event.start_date, timeZone: "UTC" },
                                  end: {
                                      dateTime: event.end_date ?? event.start_date,
                                      timeZone: "UTC",
                                  },
                                  location: event.location_name ?? "",
                              }
                            : {
                                  subject: event.name,
                                  body: {
                                      contentType: "Text",
                                      content: (event.description as string) ?? "",
                                  },
                                  start: { dateTime: event.start_date, timeZone: "UTC" },
                                  end: {
                                      dateTime: event.end_date ?? event.start_date,
                                      timeZone: "UTC",
                                  },
                                  location: { displayName: event.location_name ?? "" },
                              };

                    const endpoint =
                        provider === "google"
                            ? "https://www.googleapis.com/calendar/v3/calendars/primary/events"
                            : "https://graph.microsoft.com/v1.0/me/events";

                    const response = await fetch(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(calEvent),
                    });

                    if (response.ok) synced++;
                } catch (err) {
                    log.error("Calendar push failed for event", {
                        eventId: event.id,
                        error: (err as Error).message,
                    });
                }
            }

            // Log sync event
            await serverFromTable(supabase, "sync_events").insert({
                provider_connection_id: conn.id,
                direction: "outbound",
                entity_type: "event",
                status: synced > 0 ? "success" : "failed",
                organization_id: orgId,
            });

            return NextResponse.json({ data: { synced, total: events.length, direction: "push" } });
        }

        if (action === "pull") {
            // Pull events from external calendar into schedule_entries
            const now = new Date();
            const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            let endpoint: string;
            if (provider === "google") {
                endpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${futureDate.toISOString()}&maxResults=50`;
            } else {
                endpoint = `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${now.toISOString()}&endDateTime=${futureDate.toISOString()}&$top=50`;
            }

            try {
                const response = await fetch(endpoint, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (!response.ok) {
                    return NextResponse.json(
                        {
                            error: {
                                message: `Failed to fetch from ${provider} (HTTP ${response.status})`,
                            },
                        },
                        { status: 502 }
                    );
                }

                const calData = await response.json();
                const externalEvents =
                    provider === "google"
                        ? ((calData.items ?? []) as Array<Record<string, unknown>>)
                        : ((calData.value ?? []) as Array<Record<string, unknown>>);

                let imported = 0;
                for (const ext of externalEvents) {
                    const title = (provider === "google" ? ext.summary : ext.subject) as string;
                    const startRaw =
                        provider === "google"
                            ? (ext.start as Record<string, unknown>)?.dateTime
                            : (ext.start as Record<string, unknown>)?.dateTime;

                    if (title && startRaw) {
                        await serverFromTable(supabase, "schedule_entries").insert({
                            title,
                            start_date: String(startRaw).split("T")[0],
                            user_id: user.id,
                            source: `${provider}_calendar`,
                            organization_id: orgId,
                        });
                        imported++;
                    }
                }

                await serverFromTable(supabase, "sync_events").insert({
                    provider_connection_id: conn.id,
                    direction: "inbound",
                    entity_type: "schedule_entry",
                    status: "success",
                    organization_id: orgId,
                });

                return NextResponse.json({ data: { imported, direction: "pull" } });
            } catch (err) {
                log.error("Calendar pull failed", { error: (err as Error).message });
                return NextResponse.json(
                    { error: { message: `Calendar pull failed: ${(err as Error).message}` } },
                    { status: 502 }
                );
            }
        }

        return NextResponse.json(
            { error: { message: "Invalid action. Use 'push' or 'pull'." } },
            { status: 400 }
        );
    }
);
