/**
 * H-015: Lightweight trace context propagation for edge functions.
 *
 * Extracts W3C Trace Context headers (traceparent/tracestate) from inbound
 * requests and generates a child span ID for the current function invocation.
 * Attaches trace metadata to all outbound Supabase calls and logs.
 *
 * Spec: https://www.w3.org/TR/trace-context/
 */

export interface TraceContext {
    traceId: string;
    parentSpanId: string;
    spanId: string;
    traceFlags: string;
    tracestate: string;
}

function randomHex(bytes: number): string {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Parse or generate a trace context from the incoming request headers.
 * If no `traceparent` header exists, creates a new root trace.
 */
export function extractTraceContext(headers: Headers): TraceContext {
    const traceparent = headers.get("traceparent");
    const tracestate = headers.get("tracestate") ?? "";
    const spanId = randomHex(8);

    if (traceparent) {
        // Format: version-traceId-parentId-flags  (e.g. 00-abc...-def...-01)
        const parts = traceparent.split("-");
        if (parts.length === 4) {
            return {
                traceId: parts[1]!,
                parentSpanId: parts[2]!,
                spanId,
                traceFlags: parts[3]!,
                tracestate,
            };
        }
    }

    // No valid traceparent — start a new trace
    return {
        traceId: randomHex(16),
        parentSpanId: "0000000000000000",
        spanId,
        traceFlags: "01",
        tracestate,
    };
}

/**
 * Build the outbound `traceparent` header for downstream calls.
 */
export function toTraceparent(ctx: TraceContext): string {
    return `00-${ctx.traceId}-${ctx.spanId}-${ctx.traceFlags}`;
}

/**
 * Attach trace context to a Headers object (for outbound fetch calls).
 */
export function injectTraceHeaders(headers: Headers, ctx: TraceContext): void {
    headers.set("traceparent", toTraceparent(ctx));
    if (ctx.tracestate) {
        headers.set("tracestate", ctx.tracestate);
    }
}

/**
 * Build structured log metadata from trace context.
 */
export function traceLogFields(ctx: TraceContext): Record<string, string> {
    return {
        traceId: ctx.traceId,
        spanId: ctx.spanId,
        parentSpanId: ctx.parentSpanId,
    };
}
