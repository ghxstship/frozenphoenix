import { NextRequest, NextResponse } from "next/server";
import { BLUESKY_SCOPE, getBlueskyOAuthClient } from "@/lib/auth/bluesky-client";

export async function POST(request: NextRequest) {
    try {
        const { handle } = await request.json();

        if (!handle || typeof handle !== "string") {
            return NextResponse.json({ error: "Bluesky handle is required" }, { status: 400 });
        }

        // Normalize handle: strip leading @ if present
        const normalizedHandle = handle.replace(/^@/, "").trim();

        if (!normalizedHandle) {
            return NextResponse.json({ error: "Invalid handle format" }, { status: 400 });
        }

        const client = await getBlueskyOAuthClient();

        // Resolves the handle to their PDS, builds the authorization URL
        const authUrl = await client.authorize(normalizedHandle, {
            scope: BLUESKY_SCOPE,
        });

        return NextResponse.json({ redirectUrl: authUrl.toString() });
    } catch (error) {
        void error;
        const message = error instanceof Error ? error.message : "Failed to initiate Bluesky login";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
