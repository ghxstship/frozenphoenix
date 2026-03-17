import { NextResponse } from "next/server";
import { BLUESKY_SCOPE, getBlueskyOAuthClient } from "@/lib/auth/bluesky-client";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { z } from "zod";

const blueskyLoginSchema = z.object({
    handle: z.string().min(1, "Bluesky handle is required").max(253),
});

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/auth/bluesky/login",
        authRoute: true,
        skipAuth: true,
    },
    async (request, { log }) => {
        const body = await request.json();
        const parsed = blueskyLoginSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 }
            );
        }

        // Normalize handle: strip leading @ if present
        const normalizedHandle = parsed.data.handle.replace(/^@/, "").trim();

        if (!normalizedHandle) {
            return NextResponse.json({ error: "Invalid handle format" }, { status: 400 });
        }

        try {
            const client = await getBlueskyOAuthClient();

            // Resolves the handle to their PDS, builds the authorization URL
            const authUrl = await client.authorize(normalizedHandle, {
                scope: BLUESKY_SCOPE,
            });

            return NextResponse.json({ redirectUrl: authUrl.toString() });
        } catch (error) {
            log.error("Bluesky login initiation failed", {
                error: error instanceof Error ? error.message : "unknown",
            });
            return NextResponse.json(
                { error: "Failed to initiate Bluesky login" },
                { status: 500 }
            );
        }
    }
);
